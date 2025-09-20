import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react'
import { Resume, ResumeContent, ResumeState } from '@/types/resume'
import { useAutosave } from '@/hooks/useAutosave'

// Action types for reducer
type ResumeAction =
  | { type: 'SET_RESUME'; payload: Resume }
  | { type: 'SET_FIELD'; payload: { path: string; value: unknown } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_LAST_SAVED'; payload: Date }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'UNDO' }

interface ResumeContextType {
  // State
  resume: Resume
  isLoading: boolean
  isSaving: boolean
  lastSaved?: Date
  error?: string
  hasUnsavedChanges: boolean
  
  // Actions
  setField: (path: string, value: unknown) => void
  createResume: () => Promise<void>
  saveResume: () => Promise<void>
  undo: () => void
  exportToPDF: () => Promise<void>
  
  // Utility
  canUndo: boolean
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined)

// Helper function to set nested object values using dot notation
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split('.')
  const result = { ...obj }
  let current = result

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

// Initial state
const initialResumeContent: ResumeContent = {
  personalInfo: {
    name: '',
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
  references: []
}

const initialState: ResumeState = {
  resume: {
    content: initialResumeContent
  },
  isLoading: false,
  isSaving: false,
  hasUnsavedChanges: false
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

    case 'UNDO':
      // Undo logic will be handled by the history stack
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
  
  // History stack for undo functionality (max 20 entries)
  const historyStack = useRef<Resume[]>([])
  const historyIndex = useRef<number>(-1)
  
  // Push to history stack
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
  }, [])

  // Autosave hook
  const { saveToServer } = useAutosave({
    resumeId: state.resume.id,
    onSaveStart: () => dispatch({ type: 'SET_SAVING', payload: true }),
    onSaveComplete: (savedResume?: Resume) => {
      dispatch({ type: 'SET_SAVING', payload: false })
      if (savedResume) {
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date() })
        // Update resume ID if it was created
        if (!state.resume.id && savedResume.id) {
          dispatch({ type: 'SET_RESUME', payload: savedResume })
        }
      }
    },
    onSaveError: (error: string) => {
      dispatch({ type: 'SET_SAVING', payload: false })
      dispatch({ type: 'SET_ERROR', payload: error })
    }
  })

  // Set field with automatic history tracking and autosave
  const setField = useCallback((path: string, value: unknown) => {
    // Push current state to history before making changes
    pushToHistory(state.resume)
    
    // Update state
    dispatch({ type: 'SET_FIELD', payload: { path, value } })
    
    // Trigger autosave
    const updatedContent = setNestedValue(state.resume.content, path, value)
    const updatedResume = {
      ...state.resume,
      content: updatedContent
    }
    
    saveToServer(updatedResume)
  }, [state.resume, pushToHistory, saveToServer])

  // Create new resume
  const createResume = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: undefined })
    
    try {
      // Change this URL to match your backend
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      
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
      
      // Clear history when creating new resume
      historyStack.current = []
      historyIndex.current = -1
      
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
      
      // Trigger autosave with previous state
      saveToServer(previousResume)
    }
  }, [saveToServer])

  // Export to PDF
  const exportToPDF = useCallback(async () => {
  try {
    if (!state.resume.id) {
      throw new Error('Resume must be saved before exporting')
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    
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
    
    // Get filename from Content-Disposition header or use default
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

  // Load existing resume on mount
  useEffect(() => {
    if (resumeId) {
      const loadResume = async () => {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        try {
          // Change this URL to match your backend
          const API_BASE_URL = 'http://localhost:8000'
          
          const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}/`)
          
          if (!response.ok) {
            throw new Error(`Failed to load resume: ${response.statusText}`)
          }

          const resume: Resume = await response.json()
          dispatch({ type: 'SET_RESUME', payload: resume })
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
    }
  }, [resumeId])

  // Context value
  const contextValue: ResumeContextType = {
    // State
    resume: state.resume,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    lastSaved: state.lastSaved,
    error: state.error,
    hasUnsavedChanges: state.hasUnsavedChanges,
    
    // Actions
    setField,
    createResume,
    saveResume,
    undo,
    exportToPDF,
    
    // Utility
    canUndo: historyIndex.current > 0
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