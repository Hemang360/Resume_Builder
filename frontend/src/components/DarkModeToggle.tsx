import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import { Button } from '@/components/ui/button'

// Utility function for combining class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

export const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleDarkMode}
      className={cn(
        "relative h-9 w-9 p-0 border-slate-300 dark:border-slate-600",
        "hover:bg-slate-100 dark:hover:bg-slate-700",
        "transition-all duration-200"
      )}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="h-4 w-4 text-yellow-500" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      )}
    </Button>
  )
}
