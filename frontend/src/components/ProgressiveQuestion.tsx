import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ProgressiveQuestion: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    summary: '',
    experience: '',
    skills: '',
  })

  const questions = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: "Let's start with your basic information",
      fields: [
        { key: 'name', label: 'Full Name', type: 'input', placeholder: 'John Doe' },
        { key: 'email', label: 'Email Address', type: 'input', placeholder: 'john@example.com' },
        { key: 'phone', label: 'Phone Number', type: 'input', placeholder: '+1 (555) 123-4567' },
      ]
    },
    {
      id: 'summary',
      title: 'Professional Summary',
      description: 'Tell us about yourself in a few sentences',
      fields: [
        { 
          key: 'summary', 
          label: 'Professional Summary', 
          type: 'textarea', 
          placeholder: 'Experienced software engineer with 5+ years developing web applications...' 
        },
      ]
    },
    {
      id: 'experience',
      title: 'Work Experience',
      description: 'Share your work experience and achievements',
      fields: [
        { 
          key: 'experience', 
          label: 'Work Experience', 
          type: 'textarea', 
          placeholder: 'Software Engineer at Tech Corp\n2020-2023\n• Developed web applications using React and Node.js\n• Led a team of 3 developers...' 
        },
      ]
    },
    {
      id: 'skills',
      title: 'Skills & Expertise',
      description: 'What are your key skills and technologies?',
      fields: [
        { 
          key: 'skills', 
          label: 'Skills', 
          type: 'textarea', 
          placeholder: 'JavaScript, React, Node.js, Python, SQL, Git...' 
        },
      ]
    }
  ]

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1
  const isFirstStep = currentStep === 0

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const nextStep = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const progress = ((currentStep + 1) / questions.length) * 100

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
          <span>Question {currentStep + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1">
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="px-0 pb-6">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {currentQuestion.title}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {currentQuestion.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-0 space-y-6">
            {currentQuestion.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label 
                  htmlFor={field.key}
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {field.label}
                </Label>
                {field.type === 'input' ? (
                  <Input
                    id={field.key}
                    type="text"
                    placeholder={field.placeholder}
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <Textarea
                    id={field.key}
                    placeholder={field.placeholder}
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="w-full min-h-[120px] resize-none"
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isFirstStep}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentStep 
                  ? 'bg-primary' 
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={nextStep}
          disabled={isLastStep}
          className="flex items-center gap-2"
        >
          {isLastStep ? 'Complete' : 'Next'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default ProgressiveQuestion