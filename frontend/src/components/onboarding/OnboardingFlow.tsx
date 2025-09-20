import React, { useState, useEffect, useCallback } from 'react'
import { Question, QuestionState, TextQuestion as TextQuestionType, TextareaQuestion as TextareaQuestionType, ChipMultiSelectQuestion as ChipMultiSelectQuestionType, DateQuestion as DateQuestionType } from '@/types/questions'
import { useResumeContext } from '@/contexts/ResumeContext'
import QuestionWrapper from './QuestionWrapper'
import TextQuestion from './TextQuestion'
import TextareaQuestion from './TextareaQuestion'
import ChipMultiSelectQuestion from './ChipMultiSelectQuestion'
import DateQuestion from './DateQuestion'
import { validateAnswer } from '@/utils/validation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingFlowProps {
  questions: Question[]
  onComplete?: () => void
  startFromQuestionId?: string
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ 
  questions, 
  onComplete,
  startFromQuestionId
}) => {
  const { setField, resume } = useResumeContext()
  
  // Find the starting question index
  const getStartingIndex = () => {
    if (startFromQuestionId) {
      const index = questions.findIndex(q => q.id === startFromQuestionId)
      return index !== -1 ? index : 0
    }
    return 0
  }
  
  const [state, setState] = useState<QuestionState>({
    currentQuestionIndex: getStartingIndex(),
    answers: {},
    errors: {},
    warnings: {},
    isComplete: false
  })
  const [isAnimating, setIsAnimating] = useState(false)

  const currentQuestion = questions[state.currentQuestionIndex]
  const isLastQuestion = state.currentQuestionIndex === questions.length - 1
  const isFirstQuestion = state.currentQuestionIndex === 0
  const progress = ((state.currentQuestionIndex + 1) / questions.length) * 100

  // Get current answer from resume context or local state
  const getCurrentAnswer = useCallback(() => {
    const keys = currentQuestion.jsonPath.split('.')
    let value: unknown = resume.content
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key]
      } else {
        return state.answers[currentQuestion.id] || ''
      }
    }
    
    return value || state.answers[currentQuestion.id] || ''
  }, [currentQuestion, resume.content, state.answers])

  // Validate current answer
  const validateCurrentAnswer = useCallback((value: unknown) => {
    if (!currentQuestion.validation) return null
    
    for (const rule of currentQuestion.validation) {
      const error = validateAnswer(value, rule)
      if (error) return error
    }
    
    return null
  }, [currentQuestion])

  // Handle answer change
  const handleAnswerChange = useCallback((value: unknown) => {
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
  const goToNext = useCallback(async () => {
    const currentAnswer = getCurrentAnswer()
    const error = validateCurrentAnswer(currentAnswer)

    if (error) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [currentQuestion.id]: error }
      }))
      return
    }

    setIsAnimating(true)
    
    // Add a small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 150))

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
    
    setIsAnimating(false)
  }, [getCurrentAnswer, validateCurrentAnswer, currentQuestion, isLastQuestion, onComplete])

  // Move to previous question
  const goToPrevious = useCallback(async () => {
    if (isFirstQuestion) return

    setIsAnimating(true)
    
    // Add a small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 200))
    
    setState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex - 1
    }))
    
    // Reset animation after a brief delay
    setTimeout(() => setIsAnimating(false), 50)
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
    const currentAnswer = getCurrentAnswer()
    
    switch (currentQuestion.type) {
      case 'text':
        return (
          <TextQuestion 
            question={currentQuestion as TextQuestionType}
            value={typeof currentAnswer === 'string' ? currentAnswer : ''}
            onChange={handleAnswerChange}
            error={state.errors[currentQuestion.id]}
            onEnter={goToNext}
          />
        )
      case 'textarea':
        return (
          <TextareaQuestion 
            question={currentQuestion as TextareaQuestionType}
            value={typeof currentAnswer === 'string' ? currentAnswer : ''}
            onChange={handleAnswerChange}
            error={state.errors[currentQuestion.id]}
            onEnter={goToNext}
          />
        )
      case 'chip-multi-select':
        return (
          <ChipMultiSelectQuestion 
            question={currentQuestion as ChipMultiSelectQuestionType}
            value={Array.isArray(currentAnswer) ? currentAnswer : []}
            onChange={handleAnswerChange}
            error={state.errors[currentQuestion.id]}
            onEnter={goToNext}
          />
        )
      case 'date':
        return (
          <DateQuestion 
            question={currentQuestion as DateQuestionType}
            value={typeof currentAnswer === 'string' ? currentAnswer : ''}
            onChange={handleAnswerChange}
            error={state.errors[currentQuestion.id]}
            onEnter={goToNext}
          />
        )
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
        <div className={cn(
          "min-h-[300px] transition-all duration-300 ease-in-out",
          isAnimating ? "opacity-0 transform translate-x-8 scale-95" : "opacity-100 transform translate-x-0 scale-100"
        )}>
          {renderQuestion()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="ghost"
            onClick={goToPrevious}
            disabled={isFirstQuestion || isAnimating}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              isFirstQuestion || isAnimating
                ? "opacity-50 cursor-not-allowed text-slate-400 dark:text-slate-600" 
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:scale-105"
            )}
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
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              isAnimating
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-105"
            )}
            disabled={(!getCurrentAnswer() && currentQuestion.required) || isAnimating}
          >
            {isAnimating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                {isLastQuestion ? 'Complete' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </QuestionWrapper>
  )
}

export default OnboardingFlow