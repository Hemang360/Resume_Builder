import React from 'react'
import { useResumeContext } from '@/contexts/ResumeContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react'

export const WebSocketStatus: React.FC = () => {
  const { 
    isWebSocketConnected, 
    isWebSocketConnecting, 
    webSocketError, 
    reconnectWebSocket 
  } = useResumeContext()

  if (!isWebSocketConnected && !isWebSocketConnecting && !webSocketError) {
    return null // Don't show anything if WebSocket is not needed
  }

  const getStatusIcon = () => {
    if (isWebSocketConnecting) {
      return <RefreshCw className="h-3 w-3 animate-spin" />
    }
    if (isWebSocketConnected) {
      return <Wifi className="h-3 w-3" />
    }
    return <WifiOff className="h-3 w-3" />
  }

  const getStatusText = () => {
    if (isWebSocketConnecting) {
      return 'Connecting...'
    }
    if (isWebSocketConnected) {
      return 'Live sync'
    }
    if (webSocketError) {
      return 'Connection lost'
    }
    return 'Disconnected'
  }

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (isWebSocketConnected) {
      return 'default'
    }
    if (webSocketError) {
      return 'destructive'
    }
    return 'secondary'
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusVariant()} className="flex items-center gap-1">
        {getStatusIcon()}
        <span className="text-xs">{getStatusText()}</span>
      </Badge>
      
      {webSocketError && (
        <Button
          variant="outline"
          size="sm"
          onClick={reconnectWebSocket}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reconnect
        </Button>
      )}
      
      {webSocketError && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3" />
          <span>Auto-save may be delayed</span>
        </div>
      )}
    </div>
  )
}
