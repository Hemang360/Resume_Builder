import React, { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, ArrowLeft, User, Mail, Phone, CheckCircle, Loader2 } from 'lucide-react'
// Utility function for combining class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

interface OnboardingData {
  name: string
  email: string
  mobile: string
  countryCode: string
}

interface TypeformOnboardingProps {
  onComplete: (data: OnboardingData) => void
}

const TypeformOnboarding: React.FC<TypeformOnboardingProps> = ({ onComplete }) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    name: '',
    email: '',
    mobile: '',
    countryCode: '+91'
  })
  const [isValid, setIsValid] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const countryCodes = [
    { code: '+1', country: 'US/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' }
  ]

  const steps = [
    {
      id: 'name',
      title: "What's your name?",
      placeholder: "Enter your full name",
      icon: User,
      validation: (value: string) => value.trim().length >= 2,
      type: 'text' as const
    },
    {
      id: 'email',
      title: "What's your email?",
      placeholder: "Enter your email address",
      icon: Mail,
      validation: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      type: 'email' as const
    },
    {
      id: 'mobile',
      title: "What's your mobile number?",
      placeholder: "Enter your mobile number",
      icon: Phone,
      validation: (value: string) => /^[0-9\s\-\(\)]{7,15}$/.test(value.replace(/\s/g, '')),
      type: 'tel' as const
    }
  ]

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  useEffect(() => {
    const value = data[currentStepData.id as keyof OnboardingData]
    setIsValid(currentStepData.validation(value))
  }, [data, currentStep, currentStepData])

  const handleInputChange = (value: string) => {
    setData(prev => ({
      ...prev,
      [currentStepData.id]: value
    }))
  }

  const handleCountryCodeChange = (code: string) => {
    setData(prev => ({
      ...prev,
      countryCode: code
    }))
  }

  const handleNext = async () => {
    if (!isValid) return

    setIsAnimating(true)
    
    // Add a small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 200))
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // All steps completed
      onComplete(data)
    }
    
    // Reset animation after a brief delay
    setTimeout(() => setIsAnimating(false), 50)
  }

  const handlePrevious = async () => {
    if (isAnimating) {
      return
    }

    if (currentStep === 0) {
      // On first step, navigate back to landing page
      navigate({ to: '/' })
      return
    }

    setIsAnimating(true)
    
    // Add a small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 200))
    
    setCurrentStep(prev => prev - 1)
    
    // Reset animation after a brief delay
    setTimeout(() => setIsAnimating(false), 50)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleNext()
    } else if (e.key === 'Escape') {
      handlePrevious()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Question Card */}
        <div className={cn(
          "bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 transition-all duration-300 ease-in-out",
          isAnimating ? "opacity-0 transform translate-x-8 scale-95" : "opacity-100 transform translate-x-0 scale-100"
        )}>
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 mx-auto">
            <Icon className="w-8 h-8 text-white" />
          </div>

          {/* Question */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center mb-8">
            {currentStepData.title}
          </h1>

          {/* Input */}
          <div className="mb-8">
            <Label htmlFor={currentStepData.id} className="sr-only">
              {currentStepData.title}
            </Label>
            
            {currentStepData.id === 'mobile' ? (
              <div className="flex gap-2 w-full">
                <Select value={data.countryCode} onValueChange={handleCountryCodeChange}>
                  <SelectTrigger className="w-[100px] h-14 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 text-lg flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code} className="py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{country.flag}</span>
                          <span className="font-medium">{country.code}</span>
                          <span className="text-slate-500 text-sm">{country.country}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id={currentStepData.id}
                  type={currentStepData.type}
                  placeholder={currentStepData.placeholder}
                  value={data[currentStepData.id as keyof OnboardingData]}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={cn(
                    "text-lg h-14 px-6 border-slate-300 dark:border-slate-600 transition-all duration-200 flex-1",
                    "focus:border-blue-500 dark:focus:border-blue-500",
                    "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
                    "hover:border-slate-400 dark:hover:border-slate-500"
                  )}
                  autoFocus
                />
              </div>
            ) : (
              <Input
                id={currentStepData.id}
                type={currentStepData.type}
                placeholder={currentStepData.placeholder}
                value={data[currentStepData.id as keyof OnboardingData]}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className={cn(
                  "text-lg h-14 px-6 border-slate-300 dark:border-slate-600 transition-all duration-200",
                  "focus:border-blue-500 dark:focus:border-blue-500",
                  "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
                  "hover:border-slate-400 dark:hover:border-slate-500"
                )}
                autoFocus
              />
            )}
            
            {/* Validation indicator */}
            {data[currentStepData.id as keyof OnboardingData] && (
              <div className="mt-2 flex items-center">
                {isValid ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Looks good!</span>
                  </div>
                ) : (
                  <div className="text-red-500 dark:text-red-400 text-sm">
                    Please enter a valid {currentStepData.id}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isAnimating}
              className={cn(
                "flex items-center gap-2 transition-all duration-200",
                isAnimating
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105"
              )}
              title={currentStep === 0 ? "Go back to landing page" : "Go to previous step"}
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 0 ? 'Back' : 'Previous'}
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isValid || isAnimating}
              className={cn(
                "flex items-center gap-2 px-8 py-3 text-lg h-auto transition-all duration-200",
                isValid && !isAnimating
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105" 
                  : "opacity-50 cursor-not-allowed"
              )}
            >
              {isAnimating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            Your information is secure and will only be used to personalize your resume
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">Enter</kbd> to continue
          </p>
        </div>
      </div>
    </div>
  )
}

export default TypeformOnboarding
