import React from 'react'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
      className
    )}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Resume Builder
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a
              href="#"
              className="transition-colors hover:text-slate-900 text-slate-600 dark:text-slate-300 dark:hover:text-slate-100"
            >
              Templates
            </a>
            <a
              href="#"
              className="transition-colors hover:text-slate-900 text-slate-600 dark:text-slate-300 dark:hover:text-slate-100"
            >
              Examples
            </a>
            <a
              href="#"
              className="transition-colors hover:text-slate-900 text-slate-600 dark:text-slate-300 dark:hover:text-slate-100"
            >
              Help
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900">
        <div className="container px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2025 Resume Builder. Build your perfect resume.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout