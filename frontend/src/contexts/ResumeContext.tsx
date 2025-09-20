import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect, useState } from 'react'
import { Resume, ResumeContent, ResumeState, PendingEdit, LocalStorageData, DraftDialogData } from '@/types/resume'
import { useAutosave } from '@/hooks/useAutosave'
import { useWebSocket, WebSocketMessage } from '@/hooks/useWebSocket'
import { useToast } from '@/components/ui/toast'

// Action types for reducer
type ResumeAction =
  | { type: 'SET_RESUME'; payload: Resume }
  | { type: 'SET_FIELD'; payload: { path: string; value: unknown } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_LAST_SAVED'; payload: Date }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'SET_PENDING_DRAFT'; payload: boolean }
  | { type: 'SET_SHOW_DRAFT_DIALOG'; payload: boolean }
  | { type: 'UNDO' }
  | { type: 'APPLY_PENDING_EDITS'; payload: PendingEdit[] }

interface ResumeContextType {
  // State
  resume: Resume
  isLoading: boolean
  isSaving: boolean
  lastSaved?: Date
  error?: string
  hasUnsavedChanges: boolean
  hasPendingDraft: boolean
  showDraftDialog: boolean
  
  // WebSocket state
  isWebSocketConnected: boolean
  isWebSocketConnecting: boolean
  webSocketError?: string
  
  // Actions
  setField: (path: string, value: unknown) => void
  createResume: () => Promise<void>
  saveResume: () => Promise<void>
  undo: () => void
  exportToPDF: () => Promise<void>
  startOver: () => void
  
  // Draft management
  restoreDraft: () => void
  discardDraft: () => void
  getDraftPreview: () => DraftDialogData | null
  
  // WebSocket actions
  reconnectWebSocket: () => void
  checkWebSocketConnection: () => void
  
  // Onboarding progress management
  updateOnboardingProgress: (questionIndex: number, answers: Record<string, any>, completedQuestions: string[]) => void
  getOnboardingProgress: () => { questionIndex: number; answers: Record<string, any>; completedQuestions: string[] }
  
  // Utility
  canUndo: boolean
  canRedo: boolean
  redo: () => void
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined)

// localStorage keys
const STORAGE_KEYS = {
  RESUME_DRAFT: 'resume_draft_',
  HISTORY: 'resume_history_',
  PENDING_EDITS: 'resume_pending_edits_',
  LAST_SAVED: 'resume_last_saved_',
  CURRENT_RESUME_ID: 'current_resume_id',
} as const

// Storage utility class
class ResumeStorage {
  private static getStorageKey(baseKey: string, resumeId?: string): string {
    return resumeId ? `${baseKey}${resumeId}` : `${baseKey}current`
  }

  static savePendingEdits(resumeId: string | undefined, edits: PendingEdit[]): void {
    try {
      const key = this.getStorageKey(STORAGE_KEYS.PENDING_EDITS, resumeId)
      const data: LocalStorageData = {
        resumeId,
        pendingEdits: edits,
        historyStack: [],
        historyIndex: -1,
        lastModified: Date.now(),
        version: 1
      }
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save pending edits to localStorage:', error)
    }
  }

  static loadPendingEdits(resumeId?: string): PendingEdit[] {
    try {
      const key = this.getStorageKey(STORAGE_KEYS.PENDING_EDITS, resumeId)
      const stored = localStorage.getItem(key)
      if (!stored) return []

      const data: LocalStorageData = JSON.parse(stored)
      
      // Check if data is too old (older than 7 days)
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      if (data.lastModified < weekAgo) {
        this.clearPendingEdits(resumeId)
        return []
      }

      return data.pendingEdits || []
    } catch (error) {
      console.warn('Failed to load pending edits from localStorage:', error)
      return []
    }
  }

  static saveHistory(resumeId: string | undefined, historyStack: Resume[], historyIndex: number): void {
    try {
      const key = this.getStorageKey(STORAGE_KEYS.HISTORY, resumeId)
      const data = {
        historyStack: historyStack.slice(-20), // Keep only last 20 entries
        historyIndex: Math.min(historyIndex, 19),
        lastModified: Date.now(),
        version: 1
      }
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save history to localStorage:', error)
    }
  }

  static loadHistory(resumeId?: string): { historyStack: Resume[], historyIndex: number } {
    try {
      const key = this.getStorageKey(STORAGE_KEYS.HISTORY, resumeId)
      const stored = localStorage.getItem(key)
      if (!stored) return { historyStack: [], historyIndex: -1 }

      const data = JSON.parse(stored)
      
      // Check if data is too old (older than 7 days)
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      if (data.lastModified < weekAgo) {
        this.clearHistory(resumeId)
        return { historyStack: [], historyIndex: -1 }
      }

      return {
        historyStack: data.historyStack || [],
        historyIndex: data.historyIndex || -1
      }
    } catch (error) {
      console.warn('Failed to load history from localStorage:', error)
      return { historyStack: [], historyIndex: -1 }
    }
  }

  static clearPendingEdits(resumeId?: string): void {
    try {
      const key = this.getStorageKey(STORAGE_KEYS.PENDING_EDITS, resumeId)
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to clear pending edits:', error)
    }
  }

  static clearHistory(resumeId?: string): void {
    try {
      const key = this.getStorageKey(STORAGE_KEYS.HISTORY, resumeId)
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to clear history:', error)
    }
  }

  static clearAll(resumeId?: string): void {
    this.clearPendingEdits(resumeId)
    this.clearHistory(resumeId)
  }

  static saveCurrentResumeId(resumeId: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_RESUME_ID, resumeId)
    } catch (error) {
      console.warn('Failed to save current resume ID to localStorage:', error)
    }
  }

  static loadCurrentResumeId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_RESUME_ID)
    } catch (error) {
      console.warn('Failed to load current resume ID from localStorage:', error)
      return null
    }
  }

  static clearCurrentResumeId(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_RESUME_ID)
    } catch (error) {
      console.warn('Failed to clear current resume ID from localStorage:', error)
    }
  }
}

// Helper function to set nested object values using dot notation
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split('.')
  const result = { ...obj }
  let current: Record<string, unknown> = result

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    } else {
      current[key] = { ...current[key] }
    }
    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
  return result
}


// Apply pending edits to resume content
function applyPendingEdits(content: ResumeContent, edits: PendingEdit[]): ResumeContent {
  let result = { ...content }
  
  // Sort edits by timestamp to apply them in order
  const sortedEdits = [...edits].sort((a, b) => a.timestamp - b.timestamp)
  
  for (const edit of sortedEdits) {
    result = setNestedValue(result, edit.path, edit.value)
  }
  
  return result
}

// Initial state
const initialResumeContent: ResumeContent = {
  personalInfo: {
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  projects: [],
  references: [],
  essays: {},
  academics: {},
  extracurriculars: [],
  careerInterests: [],
  onboardingProgress: {
    currentQuestionIndex: 0,
    answers: {},
    completedQuestions: [],
    lastUpdated: new Date().toISOString()
  }
}

const initialState: ResumeState = {
  resume: {
    content: initialResumeContent
  },
  isLoading: false,
  isSaving: false,
  hasUnsavedChanges: false,
  hasPendingDraft: false,
  showDraftDialog: false
}

// Reducer function
function resumeReducer(state: ResumeState, action: ResumeAction): ResumeState {
  switch (action.type) {
    case 'SET_RESUME':
      return {
        ...state,
        resume: action.payload,
        hasUnsavedChanges: false,
        error: undefined
      }

    case 'SET_FIELD': {
      const { path, value } = action.payload
      const updatedContent = setNestedValue(state.resume.content, path, value)
      
      return {
        ...state,
        resume: {
          ...state.resume,
          content: updatedContent
        },
        hasUnsavedChanges: true,
        error: undefined
      }
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'SET_LAST_SAVED':
      return { 
        ...state, 
        lastSaved: action.payload,
        hasUnsavedChanges: false
      }

    case 'SET_UNSAVED_CHANGES':
      return { ...state, hasUnsavedChanges: action.payload }

    case 'SET_PENDING_DRAFT':
      return { ...state, hasPendingDraft: action.payload }

    case 'SET_SHOW_DRAFT_DIALOG':
      return { ...state, showDraftDialog: action.payload }

    case 'APPLY_PENDING_EDITS': {
      const updatedContent = applyPendingEdits(state.resume.content, action.payload)
      return {
        ...state,
        resume: {
          ...state.resume,
          content: updatedContent
        },
        hasUnsavedChanges: true,
        hasPendingDraft: false
      }
    }

    case 'UNDO':
      return state

    default:
      return state
  }
}

interface ResumeProviderProps {
  children: React.ReactNode
  resumeId?: string
}

export const ResumeProvider: React.FC<ResumeProviderProps> = ({ 
  children, 
  resumeId 
}) => {
  const [state, dispatch] = useReducer(resumeReducer, initialState)
  const { toast } = useToast()
  
  // History stack for undo functionality (max 20 entries)
  const historyStack = useRef<Resume[]>([])
  const historyIndex = useRef<number>(-1)
  
  // Pending edits for localStorage persistence
  const pendingEdits = useRef<PendingEdit[]>([])
  
  // Draft dialog state
  const [draftDialogData, setDraftDialogData] = useState<DraftDialogData | null>(null)

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'resume_update':
      case 'resume_created':
        if (message.data && message.data.id === resumeId) {
          // Update resume with server data
          const updatedResume: Resume = {
            id: message.data.id,
            content: message.data.content,
            created_at: message.data.created_at,
            updated_at: message.data.updated_at
          }
          dispatch({ type: 'SET_RESUME', payload: updatedResume })
          dispatch({ type: 'SET_LAST_SAVED', payload: new Date() })
          
          // Clear any pending edits since server has the latest
          pendingEdits.current = []
          ResumeStorage.clearPendingEdits(resumeId)
        }
        break
      case 'resume_deleted':
        if (message.data && message.data.id === resumeId) {
          dispatch({ type: 'SET_ERROR', payload: 'Resume was deleted by another user' })
        }
        break
      case 'pong':
        // Handle ping/pong for connection health
        break
      case 'error':
        console.error('WebSocket error:', message.message)
        break
      default:
        console.log('Unknown WebSocket message type:', message.type)
    }
  }, [resumeId])

  // WebSocket connection
  const {
    isConnected: isWebSocketConnected,
    isConnecting: isWebSocketConnecting,
    error: webSocketError,
    sendMessage,
    reconnect: reconnectWebSocket,
    checkConnection: checkWebSocketConnection
  } = useWebSocket({
    resumeId,
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      console.log('WebSocket connected for resume:', resumeId)
      // Send ping to test connection
      sendMessage({ type: 'ping' })
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected for resume:', resumeId)
    },
    onError: (error) => {
      console.error('WebSocket error for resume:', resumeId, error)
    }
  })

  // Load history from localStorage
  useEffect(() => {
    const { historyStack: savedHistory, historyIndex: savedIndex } = ResumeStorage.loadHistory(resumeId)
    historyStack.current = savedHistory
    historyIndex.current = savedIndex
  }, [resumeId])

  // Push to history stack and persist
  const pushToHistory = useCallback((resume: Resume) => {
    // Remove any entries after current index (when undoing and then making changes)
    historyStack.current = historyStack.current.slice(0, historyIndex.current + 1)
    
    // Add new entry
    historyStack.current.push(JSON.parse(JSON.stringify(resume))) // Deep clone
    
    // Limit to 20 entries
    if (historyStack.current.length > 20) {
      historyStack.current.shift()
    } else {
      historyIndex.current++
    }

    // Persist to localStorage
    ResumeStorage.saveHistory(resumeId, historyStack.current, historyIndex.current)
  }, [resumeId])

  // Autosave hook
  const { saveToServer } = useAutosave({
    resumeId: state.resume.id,
    onSaveStart: () => dispatch({ type: 'SET_SAVING', payload: true }),
    onSaveComplete: (savedResume?: Resume) => {
      dispatch({ type: 'SET_SAVING', payload: false })
      if (savedResume) {
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date() })
        // Clear pending edits on successful save
        pendingEdits.current = []
        ResumeStorage.clearPendingEdits(resumeId)
        
        // Update resume ID if it was created
        if (!state.resume.id && savedResume.id) {
          dispatch({ type: 'SET_RESUME', payload: savedResume })
        }
        
        // Show success toast
        toast({
          title: 'Resume saved',
          description: 'Your changes have been saved successfully',
          type: 'success'
        })
      }
    },
    onSaveError: (error: string) => {
      dispatch({ type: 'SET_SAVING', payload: false })
      dispatch({ type: 'SET_ERROR', payload: error })
      
      // Show error toast
      toast({
        title: 'Save failed',
        description: error,
        type: 'error'
      })
    }
  })

  // Set field with automatic history tracking, autosave, and localStorage persistence
  const setField = useCallback((path: string, value: unknown) => {
    // Push current state to history before making changes
    pushToHistory(state.resume)
    
    // Add to pending edits
    const edit: PendingEdit = {
      path,
      value,
      timestamp: Date.now()
    }
    
    pendingEdits.current.push(edit)
    ResumeStorage.savePendingEdits(resumeId, pendingEdits.current)
    
    // Update state
    dispatch({ type: 'SET_FIELD', payload: { path, value } })
    
    // Trigger autosave
    const updatedContent = setNestedValue(state.resume.content, path, value)
    const updatedResume = {
      ...state.resume,
      content: updatedContent
    }
    
    saveToServer(updatedResume)
  }, [state.resume, pushToHistory, saveToServer, resumeId])

  // Create new resume
  const createResume = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: undefined })
    
    try {
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
      
      const response = await fetch(`${API_BASE_URL}/api/resumes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: initialResumeContent
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create resume: ${response.statusText}`)
      }

      const newResume: Resume = await response.json()
      dispatch({ type: 'SET_RESUME', payload: newResume })
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() })
      
      // Save resume ID to localStorage for persistence across page refreshes
      if (newResume.id) {
        ResumeStorage.saveCurrentResumeId(newResume.id)
      }
      
      // Clear history and pending edits when creating new resume
      historyStack.current = []
      historyIndex.current = -1
      pendingEdits.current = []
      ResumeStorage.clearAll(newResume.id)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create resume'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      console.error('Error creating resume:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Manual save
  const saveResume = useCallback(async () => {
    if (!state.hasUnsavedChanges) return
    
    dispatch({ type: 'SET_SAVING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: undefined })
    
    try {
      await saveToServer(state.resume)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save resume'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    }
  }, [state.resume, state.hasUnsavedChanges, saveToServer])

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex.current > 0) {
      historyIndex.current--
      const previousResume = historyStack.current[historyIndex.current]
      dispatch({ type: 'SET_RESUME', payload: previousResume })
      
      // Update localStorage
      ResumeStorage.saveHistory(resumeId, historyStack.current, historyIndex.current)
      
      // Trigger autosave with previous state
      saveToServer(previousResume)
    }
  }, [saveToServer, resumeId])

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex.current < historyStack.current.length - 1) {
      historyIndex.current++
      const nextResume = historyStack.current[historyIndex.current]
      dispatch({ type: 'SET_RESUME', payload: nextResume })
      
      // Update localStorage
      ResumeStorage.saveHistory(resumeId, historyStack.current, historyIndex.current)
      
      // Trigger autosave with next state
      saveToServer(nextResume)
    }
  }, [saveToServer, resumeId])

  // Export to PDF
  const exportToPDF = useCallback(async () => {
    try {
      if (!state.resume.id) {
        throw new Error('Resume must be saved before exporting')
      }

      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
      
      const response = await fetch(`${API_BASE_URL}/api/resumes/${state.resume.id}/export_pdf/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.statusText}`)
      }

      // Handle PDF download
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `resume-${state.resume.id}.pdf`
      
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export PDF'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      console.error('Error exporting PDF:', error)
    }
  }, [state.resume])

  // Start over - clear all data and navigate to home
  const startOver = useCallback(() => {
    // Clear all localStorage data
    ResumeStorage.clearAll(resumeId)
    ResumeStorage.clearCurrentResumeId()
    
    // Reset state to initial
    dispatch({ type: 'SET_RESUME', payload: { content: initialResumeContent } })
    dispatch({ type: 'SET_LOADING', payload: false })
    dispatch({ type: 'SET_SAVING', payload: false })
    dispatch({ type: 'SET_ERROR', payload: undefined })
    // Don't set lastSaved when starting over
    dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false })
    dispatch({ type: 'SET_PENDING_DRAFT', payload: false })
    dispatch({ type: 'SET_SHOW_DRAFT_DIALOG', payload: false })
    
    // Clear history and pending edits
    historyStack.current = []
    historyIndex.current = -1
    pendingEdits.current = []
    
    // Navigate to home page
    window.location.href = '/'
  }, [resumeId])

  // Draft management functions
  const getDraftPreview = useCallback((): DraftDialogData | null => {
    return draftDialogData
  }, [draftDialogData])

  const restoreDraft = useCallback(() => {
    if (draftDialogData) {
      // Apply the merged content
      dispatch({ type: 'SET_RESUME', payload: { 
        ...state.resume, 
        content: draftDialogData.mergedContent 
      }})
      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: true })
      dispatch({ type: 'SET_SHOW_DRAFT_DIALOG', payload: false })
      
      // Clear the dialog data
      setDraftDialogData(null)
    }
  }, [draftDialogData, state.resume])

  const discardDraft = useCallback(() => {
    // Clear pending edits and close dialog
    pendingEdits.current = []
    ResumeStorage.clearPendingEdits(resumeId)
    dispatch({ type: 'SET_PENDING_DRAFT', payload: false })
    dispatch({ type: 'SET_SHOW_DRAFT_DIALOG', payload: false })
    setDraftDialogData(null)
  }, [resumeId])

  // Load existing resume and check for pending drafts
  useEffect(() => {
    if (resumeId) {
      const loadResume = async () => {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        try {
          const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
          const url = `${API_BASE_URL}/api/resumes/${resumeId}/`
          
          console.log('Loading resume from:', url)
          const response = await fetch(url)
          
          if (!response.ok) {
            console.error(`Failed to load resume: ${response.status} ${response.statusText}`)
            throw new Error(`Failed to load resume: ${response.statusText}`)
          }

          const serverResume: Resume = await response.json()
          
          // Check for pending edits
          const storedEdits = ResumeStorage.loadPendingEdits(resumeId)
          
          if (storedEdits.length > 0) {
            // Create merged content for preview
            const mergedContent = applyPendingEdits(serverResume.content, storedEdits)
            
            // Set up draft dialog
            const dialogData: DraftDialogData = {
              serverResume,
              localEdits: storedEdits,
              mergedContent
            }
            
            setDraftDialogData(dialogData)
            dispatch({ type: 'SET_PENDING_DRAFT', payload: true })
            dispatch({ type: 'SET_SHOW_DRAFT_DIALOG', payload: true })
          }
          
          // Check if the loaded resume has meaningful content
          // This should be more conservative - only consider it complete if there's substantial content
          const hasMeaningfulContent = (content: any) => {
            if (!content || typeof content !== 'object') return false
            
            // Don't consider it complete with just basic personal info
            // Check if there's substantial content beyond basic details
            const substantialFields = ['education', 'skills', 'experience', 'projects', 'essays', 'extracurriculars']
            for (const field of substantialFields) {
              if (content[field] && (
                (Array.isArray(content[field]) && content[field].length > 0) ||
                (typeof content[field] === 'object' && Object.keys(content[field]).length > 0)
              )) {
                return true
              }
            }
            
            return false
          }

          // If the resume has no meaningful content, clear the stored resume ID
          // BUT only if we're not in the onboarding process
          if (!hasMeaningfulContent(serverResume.content)) {
            const currentPath = window.location.pathname
            if (currentPath !== '/onboarding') {
              console.log('Loaded resume has no meaningful content, clearing stored resume ID')
              ResumeStorage.clearCurrentResumeId()
              // Don't set the resume, let the app start fresh
              return
            }
          }

          // Load the server version first
          dispatch({ type: 'SET_RESUME', payload: serverResume })
          dispatch({ type: 'SET_LAST_SAVED', payload: new Date() })
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load resume'
          dispatch({ type: 'SET_ERROR', payload: errorMessage })
          console.error('Error loading resume:', error)
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      }

      loadResume()
    } else {
      // Check for pending edits without resumeId (new resume)
      const storedEdits = ResumeStorage.loadPendingEdits()
      if (storedEdits.length > 0) {
        const mergedContent = applyPendingEdits(initialResumeContent, storedEdits)
        
        const dialogData: DraftDialogData = {
          serverResume: { content: initialResumeContent },
          localEdits: storedEdits,
          mergedContent
        }
        
        setDraftDialogData(dialogData)
        dispatch({ type: 'SET_PENDING_DRAFT', payload: true })
        dispatch({ type: 'SET_SHOW_DRAFT_DIALOG', payload: true })
      }
    }
  }, [resumeId])

  // Periodic WebSocket connection check
  useEffect(() => {
    if (!resumeId || !isWebSocketConnected) return

    const interval = setInterval(() => {
      checkWebSocketConnection()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [resumeId, isWebSocketConnected, checkWebSocketConnection])

  // Onboarding progress management functions
  const updateOnboardingProgress = useCallback((questionIndex: number, answers: Record<string, any>, completedQuestions: string[]) => {
    const progress = {
      currentQuestionIndex: questionIndex,
      answers,
      completedQuestions,
      lastUpdated: new Date().toISOString()
    }
    setField('onboardingProgress', progress)
  }, [setField])

  const getOnboardingProgress = useCallback(() => {
    const progress = state.resume.content.onboardingProgress
    if (!progress) {
      return {
        questionIndex: 0,
        answers: {},
        completedQuestions: []
      }
    }
    return {
      questionIndex: progress.currentQuestionIndex || 0,
      answers: progress.answers || {},
      completedQuestions: progress.completedQuestions || []
    }
  }, [state.resume.content.onboardingProgress])

  // Context value
  const contextValue: ResumeContextType = {
    // State
    resume: state.resume,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    lastSaved: state.lastSaved,
    error: state.error,
    hasUnsavedChanges: state.hasUnsavedChanges,
    hasPendingDraft: state.hasPendingDraft,
    showDraftDialog: state.showDraftDialog,
    
    // WebSocket state
    isWebSocketConnected,
    isWebSocketConnecting,
    webSocketError: webSocketError || undefined,
    
    // Actions
    setField,
    createResume,
    saveResume,
    undo,
    exportToPDF,
    startOver,
    
    // Draft management
    restoreDraft,
    discardDraft,
    getDraftPreview,
    
    // WebSocket actions
    reconnectWebSocket,
    checkWebSocketConnection,
    
    // Onboarding progress management
    updateOnboardingProgress,
    getOnboardingProgress,
    
    // Utility
    canUndo: historyIndex.current > 0,
    canRedo: historyIndex.current < historyStack.current.length - 1,
    redo
  }

  return (
    <ResumeContext.Provider value={contextValue}>
      {children}
    </ResumeContext.Provider>
  )
}

// Hook to use the resume context
export const useResumeContext = (): ResumeContextType => {
  const context = useContext(ResumeContext)
  if (context === undefined) {
    throw new Error('useResumeContext must be used within a ResumeProvider')
  }
  return context
}