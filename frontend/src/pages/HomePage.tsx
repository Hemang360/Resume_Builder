import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import ResumePreview from '@/components/ResumePreview'
import ControlsBar from '@/components/ControlsBar'
import { highSchoolStudentQuestions } from '@/data/highSchoolQuestions'
import { useResumeContext } from '@/contexts/ResumeContext'
import { Button } from '@/components/ui/button'
import { Printer, Home, ArrowLeft } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [startFromSkills, setStartFromSkills] = useState(false)
  const { resume } = useResumeContext()
  const resumeRef = useRef<HTMLDivElement>(null)


  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setStartFromSkills(false)
  }

  const handleBackToLanding = () => {
    navigate({ to: '/' })
  }

  const handleBackToOnboarding = () => {
    // Show onboarding starting from skills page
    setStartFromSkills(true)
    setShowOnboarding(true)
  }

  // Helper function to get full name for PDF title
  const getFullName = (content: Record<string, unknown>): string => {
    const personalInfo = content?.personalInfo as Record<string, unknown> || {}
    const firstName = personalInfo?.firstName as string || ''
    const lastName = personalInfo?.lastName as string || ''
    return `${firstName} ${lastName}`.trim() || 'Resume'
  }

  // Configure react-to-print
  const handlePrint = useReactToPrint({
    content: () => resumeRef.current,
    documentTitle: `${getFullName(resume.content)}-Resume`,
    onAfterPrint: () => console.log('PDF generation completed'),
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `
  })

  // Show controls bar only when editing
  const showControls = showOnboarding || !!resume.id

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Controls Bar - Only show when editing */}
      {showControls && (
        <ControlsBar className="flex-shrink-0" />
      )}

      {/* Main Content - 40/60 Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Half - Form (40%) */}
        <div className="w-2/5 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
          {!showOnboarding ? (
            <div className="h-full flex flex-col p-8">
              {/* Back Button - Top Left */}
              <div className="flex justify-start mb-8">
                <Button 
                  variant="ghost"
                  size="lg" 
                  onClick={handleBackToOnboarding}
                  className="flex items-center gap-2 text-lg px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Edit
                </Button>
              </div>
              
              {/* Main Content - Centered */}
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    🎉 Resume Completed Successfully!
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto text-center">
                    Congratulations! Your professional resume is ready. You can now print it or make additional edits as needed.
                  </p>
                </div>
              
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={handlePrint}
                    className="flex items-center gap-2 text-lg px-8 py-6"
                  >
                    <Printer className="w-5 h-5" />
                    Print Resume
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="lg" 
                    onClick={handleBackToLanding}
                    className="flex items-center gap-2 text-lg px-8 py-6"
                  >
                    <Home className="w-5 h-5" />
                    Home
                  </Button>
                </div>
                
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Your progress is automatically saved
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Let's Add More Details
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  We'll ask you a series of questions to build your complete profile
                </p>
              </div>
              
              <div className="h-[calc(100%-120px)] overflow-y-auto">
                <OnboardingFlow 
                  questions={highSchoolStudentQuestions}
                  onComplete={handleOnboardingComplete}
                  startFromQuestionId={startFromSkills ? 'skills' : undefined}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Half - Resume Preview (60%) */}
        <div className="w-3/5 bg-white dark:bg-slate-800 flex items-start justify-center p-8 overflow-y-auto">
          <div ref={resumeRef} className="w-full max-w-[210mm] bg-white shadow-lg border border-slate-200 dark:border-slate-700">
            <ResumePreview />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage