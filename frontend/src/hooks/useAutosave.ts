import { useCallback, useRef, useEffect } from 'react'
import { Resume } from '@/types/resume'

interface UseAutosaveOptions {
  resumeId?: string
  onSaveStart?: () => void
  onSaveComplete?: (resume?: Resume) => void
  onSaveError?: (error: string) => void
  debounceMs?: number
}

interface QueuedRequest {
  id: string
  resume: Resume
  timestamp: number
  retries: number
}

export const useAutosave = ({
  resumeId: _resumeId,
  onSaveStart,
  onSaveComplete,
  onSaveError,
  debounceMs = 800
}: UseAutosaveOptions) => {
  const debounceTimer = useRef<NodeJS.Timeout>()
  const requestQueue = useRef<QueuedRequest[]>([])
  const isOnline = useRef(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const processingQueue = useRef(false)

  // Change this URL to match your backend
  const API_BASE_URL = 'http://localhost:8000'

  // Save resume to server
  const saveResumeToServer = useCallback(async (resume: Resume, isNew: boolean = false): Promise<Resume> => {
    const url = isNew 
      ? `${API_BASE_URL}/api/resumes/`
      : `${API_BASE_URL}/api/resumes/${resume.id}/`
    
    const method = isNew ? 'POST' : 'PATCH'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: resume.content
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }, [API_BASE_URL])

  // Process queued requests when coming back online
  const processQueue = useCallback(async () => {
    if (processingQueue.current || requestQueue.current.length === 0) {
      return
    }

    processingQueue.current = true

    while (requestQueue.current.length > 0) {
      const request = requestQueue.current[0]

      try {
        await saveResumeToServer(request.resume, request.id === 'new')
        // Remove successful request from queue
        requestQueue.current.shift()
      } catch (error) {
        // Handle failed request
        if (request.retries < 3) {
          // Retry up to 3 times
          request.retries++
          console.warn(`Retrying request ${request.id}, attempt ${request.retries}`)
          break // Try again later
        } else {
          // Remove failed request after max retries
          requestQueue.current.shift()
          console.error(`Failed to save request ${request.id} after 3 retries`)
          onSaveError?.(`Failed to save changes after multiple attempts`)
        }
        break
      }
    }

    processingQueue.current = false
  }, [onSaveError, saveResumeToServer])

  // Queue request for offline handling
  const queueRequest = useCallback((resume: Resume) => {
    const requestId = resume.id || 'new'
    
    // Remove any existing request with same ID
    requestQueue.current = requestQueue.current.filter(req => req.id !== requestId)
    
    // Add new request
    requestQueue.current.push({
      id: requestId,
      resume: { ...resume },
      timestamp: Date.now(),
      retries: 0
    })

    // Process queue if online
    if (isOnline.current) {
      processQueue()
    }
  }, [processQueue])

  // Main save function with debouncing
  const saveToServer = useCallback((resume: Resume) => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer
    debounceTimer.current = setTimeout(async () => {
      onSaveStart?.()

      if (!isOnline.current) {
        // Queue for later if offline
        queueRequest(resume)
        onSaveComplete?.()
        return
      }

      try {
        const isNewResume = !resume.id
        const savedResume = await saveResumeToServer(resume, isNewResume)
        onSaveComplete?.(savedResume)
      } catch (error) {
        console.error('Save error:', error)
        
        // Queue request if it's a network error
        if (error instanceof TypeError && error.message.includes('fetch')) {
          queueRequest(resume)
          onSaveComplete?.() // Don't show error for network issues, just queue
        } else {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save resume'
          onSaveError?.(errorMessage)
        }
      }
    }, debounceMs)
  }, [debounceMs, onSaveStart, onSaveComplete, onSaveError, queueRequest, saveResumeToServer])

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      isOnline.current = true
      processQueue() // Process queued requests when coming back online
    }

    const handleOffline = () => {
      isOnline.current = false
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [processQueue])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  // Periodic queue processing (every 30 seconds when online)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline.current && requestQueue.current.length > 0) {
        processQueue()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [processQueue])

  return {
    saveToServer,
    queueRequest,
    isOnline: isOnline.current,
    queueLength: requestQueue.current.length
  }
}