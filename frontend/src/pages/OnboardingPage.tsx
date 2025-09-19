import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import { highSchoolStudentQuestions } from '@/data/highSchoolQuestions'
import { useResumeContext } from '@/contexts/ResumeContext'

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate()
  const { createResume } = useResumeContext()

  const handleComplete = async () => {
    try {
      // Create the resume in the backend
      await createResume()
      
      // Navigate to the main resume builder
      navigate({ to: '/builder' })
    } catch (error) {
      console.error('Failed to create resume:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <OnboardingFlow 
            questions={highSchoolStudentQuestions}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage