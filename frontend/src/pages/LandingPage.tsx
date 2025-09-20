import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
// Utility function for combining class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleGetStarted = async () => {
    setIsNavigating(true)
    
    // Add a delay for smoother transition
    await new Promise(resolve => setTimeout(resolve, 300))
    
    navigate({ to: '/onboarding' })
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 transition-all duration-300 ease-in-out relative",
      isNavigating && "opacity-0 scale-95 transform translate-y-4"
    )}>
      {/* Dark Mode Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
          Build Your Perfect
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Resume</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Create a professional resume that stands out to college admissions officers. 
          Our intelligent builder guides you through every step with real-time preview.
        </p>
        
        <div className="flex flex-col items-center gap-8 mb-16">
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            disabled={isNavigating}
            className={cn(
              "text-lg px-8 py-6 h-auto transition-all duration-300",
              isNavigating
                ? "opacity-75 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105"
            )}
          >
            {isNavigating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              No signup required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              Takes 5 minutes
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              Auto-saves progress
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
