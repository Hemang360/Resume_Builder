import React, { useEffect, useCallback } from 'react'
import { useResumeContext } from '@/contexts/ResumeContext'
import { Button } from '@/components/ui/button'
import { WebSocketStatus } from '@/components/WebSocketStatus'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { 
  Save, 
  Undo, 
  Redo,
  Download, 
  Clock, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  RotateCcw
} from 'lucide-react'
// Utility function for combining class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

interface ControlsBarProps {
  className?: string
}

const ControlsBar: React.FC<ControlsBarProps> = ({ className }) => {
  const {
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    error,
    undo,
    canUndo,
    redo,
    canRedo,
    saveResume,
    exportToPDF,
    startOver
  } = useResumeContext()

  // Check if user is online
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  // Keyboard shortcuts
  const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    // Ctrl+S or Cmd+S for save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      if (hasUnsavedChanges && !isSaving) {
        saveResume()
      }
    }

    // Ctrl+Z or Cmd+Z for undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      if (canUndo && !isSaving) {
        undo()
      }
    }

    // Ctrl+Y or Cmd+Y for redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault()
      if (canRedo && !isSaving) {
        redo()
      }
    }

    // Ctrl+P or Cmd+P for export (we'll override default print)
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault()
      exportToPDF()
    }
  }, [hasUnsavedChanges, isSaving, saveResume, canUndo, undo, canRedo, redo, exportToPDF])

  // Register keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts)
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [handleKeyboardShortcuts])

  // Format last saved timestamp
  const formatLastSaved = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  // Get save status info
  const getSaveStatus = () => {
    if (error) {
      return {
        icon: AlertCircle,
        text: 'Error saving',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800'
      }
    }

    if (isSaving) {
      return {
        icon: Loader2,
        text: 'Saving...',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        animate: true
      }
    }

    if (!isOnline) {
      return {
        icon: WifiOff,
        text: 'Offline',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800'
      }
    }

    if (hasUnsavedChanges) {
      return {
        icon: Clock,
        text: 'Unsaved changes',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800'
      }
    }

    return {
      icon: CheckCircle,
      text: 'Saved',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    }
  }

  const saveStatus = getSaveStatus()
  const StatusIcon = saveStatus.icon

  return (
    <div className={cn(
      "controls-bar flex items-center justify-between p-4 border-b bg-white/95 backdrop-blur-sm dark:bg-slate-900/95 border-slate-200 dark:border-slate-700",
      className
    )}>
      {/* Left Section - Save Status */}
      <div className="flex items-center gap-4">
        {/* Save Status Indicator */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200",
          saveStatus.color,
          saveStatus.bgColor,
          saveStatus.borderColor
        )}>
          <StatusIcon 
            className={cn(
              "w-4 h-4",
              saveStatus.animate && "animate-spin"
            )} 
          />
          <span>{saveStatus.text}</span>
          {!isOnline && (
            <WifiOff className="w-4 h-4 ml-1" />
          )}
        </div>

        {/* Start Over Button */}
        <Button
          variant="default"
          size="sm"
          onClick={startOver}
          disabled={isSaving}
          className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          title="Start over with a new resume"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Start Over</span>
        </Button>

        {/* Dark Mode Toggle */}
        <DarkModeToggle />

        {/* Last Saved Timestamp */}
        {lastSaved && !hasUnsavedChanges && !isSaving && (
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3 h-3" />
            <span>Last saved {formatLastSaved(lastSaved)}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />
            <span className="max-w-xs truncate" title={error}>
              {error}
            </span>
          </div>
        )}

        {/* Connection Status */}
        <div className="flex items-center gap-1">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
        </div>

        {/* WebSocket Status */}
        <WebSocketStatus />
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Undo Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={!canUndo || isSaving}
          className="flex items-center gap-1.5 text-xs"
          title="Undo last change (Ctrl+Z)"
        >
          <Undo className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Undo</span>
          <kbd className="hidden lg:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <span className="text-xs">⌘</span>Z
          </kbd>
        </Button>

        {/* Redo Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={!canRedo || isSaving}
          className="flex items-center gap-1.5 text-xs"
          title="Redo last undone change (Ctrl+Y)"
        >
          <Redo className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Redo</span>
          <kbd className="hidden lg:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <span className="text-xs">⌘</span>Y
          </kbd>
        </Button>

        {/* Save Now Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={saveResume}
          disabled={!hasUnsavedChanges || isSaving}
          className="flex items-center gap-1.5 text-xs"
          title="Save now (Ctrl+S)"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {isSaving ? 'Saving...' : 'Save'}
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <span className="text-xs">⌘</span>S
          </kbd>
        </Button>

        {/* Export PDF Button */}
        <Button
          variant="default"
          size="sm"
          onClick={exportToPDF}
          disabled={isSaving}
          className="flex items-center gap-1.5 text-xs"
          title="Export as PDF (Ctrl+P)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export PDF</span>
          <kbd className="hidden lg:inline-flex items-center gap-1 rounded border bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-mono text-primary-foreground/70">
            <span className="text-xs">⌘</span>P
          </kbd>
        </Button>
      </div>

      {/* Mobile-only shortcuts info */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <div className="bg-slate-800 text-white p-2 rounded-lg text-xs opacity-0 hover:opacity-100 transition-opacity">
          <div>⌘S - Save</div>
          <div>⌘Z - Undo</div>
          <div>⌘Y - Redo</div>
          <div>⌘P - Export</div>
        </div>
      </div>
    </div>
  )
}

export default ControlsBar