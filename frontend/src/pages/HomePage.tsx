import React, { useState } from 'react'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import ResumePreview from '@/components/ResumePreview'
import { highSchoolStudentQuestions } from '@/data/highSchoolQuestions'
import { useResumeContext } from '@/contexts/ResumeContext'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const HomePage: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { resume, createResume } = useResumeContext()

  const handleStartOnboarding = async () => {
    if (!resume.id) {
      await createResume()
    }
    setShowOnboarding(true)
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-200px)]">
        {/* Left Column - Onboarding or Welcome */}
        <div className="flex flex-col">
          {!showOnboarding ? (
            <div className="flex flex-col justify-center items-center text-center space-y-8 h-full">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Build Your Perfect Resume
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-md">
                  Answer a few questions and we'll create a professional resume 
                  tailored for your college applications
                </p>
              </div>
              
              <Button 
                size="lg" 
                onClick={handleStartOnboarding}
                className="flex items-center gap-2 text-lg px-8 py-6"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
              
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Takes about 5 minutes • Auto-saves as you go
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Let's Get Started
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  We'll ask you a series of questions to build your profile
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg border shadow-sm p-6">
                <OnboardingFlow 
                  questions={highSchoolStudentQuestions}
                  onComplete={handleOnboardingComplete}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Resume Preview */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Live Preview
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              See your resume update in real-time as you answer questions
            </p>
          </div>
          
          <div className="flex-1 sticky top-24">
            <ResumePreview />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage