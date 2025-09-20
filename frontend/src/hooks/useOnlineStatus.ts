import { useState, useEffect } from 'react'

// Type for navigator connection (experimental API)
interface NavigatorConnection {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
}

// Extend Navigator interface to include connection
interface NavigatorWithConnection extends Navigator {
  connection?: NavigatorConnection
}

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow' | 'offline'>('fast')

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setConnectionSpeed('fast')
    }

    const handleOffline = () => {
      setIsOnline(false)
      setConnectionSpeed('offline')
    }

    // Check connection speed (experimental)
    const checkConnectionSpeed = () => {
      if ('connection' in navigator) {
        const connection = (navigator as NavigatorWithConnection).connection
        if (connection) {
          if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            setConnectionSpeed('slow')
          } else {
            setConnectionSpeed('fast')
          }
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      
      // Check initial connection
      checkConnectionSpeed()

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  return { isOnline, connectionSpeed }
}