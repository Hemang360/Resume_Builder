import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import TypeformOnboarding from '@/components/onboarding/TypeformOnboarding'
import OnboardingWithPreview from '@/components/onboarding/OnboardingWithPreview'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { highSchoolStudentQuestions } from '@/data/highSchoolQuestions'
import { useResumeContext } from '@/contexts/ResumeContext'

interface OnboardingData {
  name: string
  email: string
  mobile: string
  countryCode: string
}

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate()
  const { createResume, setField } = useResumeContext()
  const [currentStep, setCurrentStep] = useState<'typeform' | 'welcome' | 'questions'>('typeform')
  const [userData, setUserData] = useState<OnboardingData | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleTypeformComplete = async (data: OnboardingData) => {
    setIsTransitioning(true)
    setUserData(data)
    
    try {
      // Create the resume in the backend
      await createResume()
      
      // Pre-fill the resume with user data
      const [firstName, ...lastNameParts] = data.name.split(' ')
      const lastName = lastNameParts.join(' ')
      
      // Set all personal info at once to avoid race conditions
      const personalInfo = {
        firstName,
        lastName,
        email: data.email,
        phone: `${data.countryCode} ${data.mobile}`,
        name: data.name
      }
      setField('personalInfo', personalInfo)
      
      // Wait for transition animation
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Move to welcome page
      setCurrentStep('welcome')
      setIsTransitioning(false)
    } catch (error) {
      console.error('Failed to create resume:', error)
      setIsTransitioning(false)
    }
  }

  const handleWelcomeNext = async () => {
    setIsTransitioning(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    setCurrentStep('questions')
    setIsTransitioning(false)
  }

  const handleWelcomeBack = async () => {
    setIsTransitioning(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    setCurrentStep('typeform')
    setIsTransitioning(false)
  }

  const handleDetailedOnboardingComplete = () => {
    // Navigate to the main resume builder
    navigate({ to: '/builder' })
  }

  if (currentStep === 'typeform') {
    return <TypeformOnboarding onComplete={handleTypeformComplete} />
  }

  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative">
        {/* Dark Mode Toggle - Top Right */}
        <div className="absolute top-4 right-4 z-50">
          <DarkModeToggle />
        </div>
        
        <div className="w-full max-w-2xl">
          <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center transition-all duration-300 ease-in-out ${
            isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
          }`}>
            <div className="mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Great to meet you, {userData?.name.split(' ')[0]}!
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Let's build your professional profile. Your resume updates in real-time as you answer questions.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleWelcomeBack}
                className="flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <button
                onClick={handleWelcomeNext}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Let's Start
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <OnboardingWithPreview
      questions={highSchoolStudentQuestions}
      onComplete={handleDetailedOnboardingComplete}
      onBackToWelcome={() => setCurrentStep('welcome')}
      userName={userData?.name}
    />
  )
}

export default OnboardingPage