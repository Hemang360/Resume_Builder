import React, { useState, useEffect, useCallback } from 'react'
import { Question, QuestionState } from '@/types/questions'
import { useResumeContext } from '@/contexts/ResumeContext'
import QuestionWrapper from './QuestionWrapper'
import TextQuestion from './TextQuestion'
import TextareaQuestion from './TextareaQuestion'
import ChipMultiSelectQuestion from './ChipMultiSelectQuestion'
import { validateAnswer } from '@/utils/validation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

interface OnboardingFlowProps {
  questions: Question[]
  onComplete?: () => void
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ 
  questions, 
  onComplete 
}) => {
  const { setField, resume } = useResumeContext()
  
  const [state, setState] = useState<QuestionState>({
    currentQuestionIndex: 0,
    answers: {},
    errors: {},
    isComplete: false
  })

  const currentQuestion = questions[state.currentQuestionIndex]
  const isLastQuestion = state.currentQuestionIndex === questions.length - 1
  const isFirstQuestion = state.currentQuestionIndex === 0
  const progress = ((state.currentQuestionIndex + 1) / questions.length) * 100

  // Get current answer from resume context or local state
  const getCurrentAnswer = useCallback(() => {
    const keys = currentQuestion.jsonPath.split('.')
    let value: any = resume.content
    
    for (const key of keys) {
      value = value?.[key]
    }
    
    return value || state.answers[currentQuestion.id] || ''
  }, [currentQuestion, resume.content, state.answers])

  // Validate current answer
  const validateCurrentAnswer = useCallback((value: any) => {
    if (!currentQuestion.validation) return null
    
    for (const rule of currentQuestion.validation) {
      const error = validateAnswer(value, rule)
      if (error) return error
    }
    
    return null
  }, [currentQuestion])

  // Handle answer change
  const handleAnswerChange = useCallback((value: any) => {
    // Update local state
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: value },
      errors: { ...prev.errors, [currentQuestion.id]: '' }
    }))

    // Update resume context
    setField(currentQuestion.jsonPath, value)
  }, [currentQuestion, setField])

  // Move to next question
  const goToNext = useCallback(() => {
    const currentAnswer = getCurrentAnswer()
    const error = validateCurrentAnswer(currentAnswer)

    if (error) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [currentQuestion.id]: error }
      }))
      return
    }

    if (isLastQuestion) {
      setState(prev => ({ ...prev, isComplete: true }))
      onComplete?.()
    } else {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        errors: { ...prev.errors, [currentQuestion.id]: '' }
      }))
    }
  }, [getCurrentAnswer, validateCurrentAnswer, currentQuestion, isLastQuestion, onComplete])

  // Move to previous question
  const goToPrevious = useCallback(() => {
    if (!isFirstQuestion) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }))
    }
  }, [isFirstQuestion])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        goToNext()
      } else if (e.key === 'ArrowUp' && e.metaKey) {
        e.preventDefault()
        goToPrevious()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious])

  // Render question component based on type
  const renderQuestion = () => {
    const props = {
      question: currentQuestion,
      value: getCurrentAnswer(),
      onChange: handleAnswerChange,
      error: state.errors[currentQuestion.id],
      onEnter: goToNext
    }

    switch (currentQuestion.type) {
      case 'text':
        return <TextQuestion {...props} />
      case 'textarea':
        return <TextareaQuestion {...props} />
      case 'chip-multi-select':
        return <ChipMultiSelectQuestion {...props} />
      default:
        return null
    }
  }

  if (state.isComplete) {
    return (
      <QuestionWrapper
        progress={100}
        questionNumber={questions.length}
        totalQuestions={questions.length}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              All done! 🎉
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Your profile has been created successfully. Let's build your resume!
            </p>
          </div>
        </div>
      </QuestionWrapper>
    )
  }

  return (
    <QuestionWrapper
      progress={progress}
      questionNumber={state.currentQuestionIndex + 1}
      totalQuestions={questions.length}
    >
      <div className="space-y-8">
        {/* Question Content */}
        <div className="min-h-[300px]">
          {renderQuestion()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="ghost"
            onClick={goToPrevious}
            disabled={isFirstQuestion}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Press <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">Enter</kbd> to continue
            </p>
          </div>

          <Button
            onClick={goToNext}
            className="flex items-center gap-2"
            disabled={!getCurrentAnswer() && currentQuestion.required}
          >
            {isLastQuestion ? 'Complete' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </QuestionWrapper>
  )
}

export default OnboardingFlow