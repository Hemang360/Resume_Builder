import { useEffect, useRef, useCallback, useState } from 'react'

export interface WebSocketMessage {
  type: string
  data?: any
  message?: string
}

export interface WebSocketHookOptions {
  resumeId?: string
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export interface WebSocketHookReturn {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  sendMessage: (message: any) => void
  disconnect: () => void
  reconnect: () => void
  checkConnection: () => void
}

export const useWebSocket = ({
  resumeId,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  reconnectInterval = 5000,
  maxReconnectAttempts = 10
}: WebSocketHookOptions): WebSocketHookReturn => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const shouldReconnectRef = useRef(true)
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastPongRef = useRef<number>(Date.now())

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const baseUrl = import.meta.env.VITE_WS_BASE_URL || `${protocol}//${host}`
    
    if (!resumeId) {
      throw new Error('Resume ID is required for WebSocket connection')
    }
    
    const wsUrl = `${baseUrl}/ws/resume/${resumeId}/`
    console.log('WebSocket URL:', wsUrl)
    return wsUrl
  }, [resumeId])

  const connect = useCallback(() => {
    if (!resumeId || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const wsUrl = getWebSocketUrl()
      console.log('Attempting WebSocket connection to:', wsUrl)
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setIsConnecting(false)
        setError(null)
        reconnectAttemptsRef.current = 0
        lastPongRef.current = Date.now()
        
        // Start heartbeat to keep connection alive
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, 30000) // Send ping every 30 seconds
        
        onConnect?.()
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          console.log('WebSocket message received:', message)
          
          // Handle pong response
          if (message.type === 'pong') {
            lastPongRef.current = Date.now()
            return
          }
          
          onMessage?.(message)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setIsConnecting(false)
        wsRef.current = null
        
        // Clear heartbeat interval
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
          heartbeatIntervalRef.current = null
        }
        
        onDisconnect?.()

        // Handle specific close codes
        if (event.code === 1006) {
          console.warn('WebSocket connection closed abnormally (1006) - likely Render free tier timeout')
          setError('Connection lost - Render free tier timeout')
        } else if (event.code === 1000) {
          console.log('WebSocket connection closed normally')
        } else if (event.code === 1011) {
          console.warn('WebSocket server error (1011) - service may be restarting')
          setError('Server error - service may be restarting')
        } else {
          console.warn(`WebSocket closed with code ${event.code}: ${event.reason}`)
          setError(`Connection closed: ${event.reason || 'Unknown reason'}`)
        }

        // Attempt to reconnect if not manually disconnected
        if (shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          // Exponential backoff with jitter for Render free tier
          const baseDelay = reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1)
          const jitter = Math.random() * 1000 // Add up to 1 second of jitter
          const delay = Math.min(baseDelay + jitter, 60000) // Max 60 seconds
          
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) in ${Math.round(delay)}ms...`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Failed to reconnect after maximum attempts. WebSocket features disabled.')
        }
      }

      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        setError('WebSocket connection error')
        onError?.(event)
      }

      wsRef.current = ws
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      setError('Failed to create WebSocket connection')
      setIsConnecting(false)
    }
  }, [resumeId, getWebSocketUrl, onMessage, onConnect, onDisconnect, onError, reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
    setIsConnecting(false)
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    shouldReconnectRef.current = true
    reconnectAttemptsRef.current = 0
    setError(null)
    connect()
  }, [disconnect, connect])

  const checkConnection = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'ping' }))
      } catch (err) {
        console.error('Failed to send ping:', err)
        reconnect()
      }
    } else {
      console.log('WebSocket not connected, attempting to reconnect...')
      reconnect()
    }
  }, [reconnect])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message))
      } catch (err) {
        console.error('Failed to send WebSocket message:', err)
        setError('Failed to send message')
      }
    } else {
      console.warn('WebSocket is not connected')
      setError('WebSocket is not connected')
    }
  }, [])

  // Connect on mount and when resumeId changes
  useEffect(() => {
    console.log('WebSocket useEffect triggered with resumeId:', resumeId)
    if (resumeId) {
      console.log('Attempting WebSocket connection for resumeId:', resumeId)
      connect()
    } else {
      console.log('No resumeId, disconnecting WebSocket')
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [resumeId, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    isConnected,
    isConnecting,
    error,
    sendMessage,
    disconnect,
    reconnect,
    checkConnection
  }
}
