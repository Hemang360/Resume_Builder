import React, { useEffect, useRef } from 'react'
import { DateQuestion as DateQuestionType } from '@/types/questions'
import { Input } from '@/components/ui/input'
import QuestionTooltip from './QuestionTooltip'
import { Calendar, AlertCircle } from 'lucide-react'

interface DateQuestionProps {
  question: DateQuestionType
  value: string
  onChange: (value: string) => void
  error?: string
  onEnter: () => void
}

const DateQuestion: React.FC<DateQuestionProps> = ({
  question,
  value,
  onChange,
  error,
  onEnter
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [question.id])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onEnter()
    }
  }

  const getDateConstraints = () => {
    const currentYear = new Date().getFullYear()
    const minYear = question.minYear || (currentYear - 10)
    const maxYear = question.maxYear || (currentYear + 10)
    
    return {
      min: `${minYear}-01-01`,
      max: `${maxYear}-12-31`
    }
  }

  const getHelpText = () => {
    switch (question.dateType) {
      case 'graduation':
        return 'Expected or actual graduation date'
      case 'birth':
        return 'Your date of birth'
      case 'start':
        return 'Start date of the activity or position'
      case 'end':
        return 'End date of the activity or position'
      default:
        return null
    }
  }

  const constraints = getDateConstraints()

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div>
        <div className="flex items-start gap-3 mb-2">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {question.title}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h1>
          </div>
          {question.tooltip && (
            <QuestionTooltip tooltip={question.tooltip} />
          )}
        </div>
        {question.subtitle && (
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {question.subtitle}
          </p>
        )}
      </div>

      {/* Date Input */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={inputRef}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            min={constraints.min}
            max={constraints.max}
            className={`text-lg py-6 pr-10 ${
              error ? 'border-red-500 focus:border-red-500' : ''
            }`}
            aria-invalid={!!error}
            aria-describedby={error ? `${question.id}-error` : undefined}
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={`${question.id}-error`}
            className="text-red-500 text-sm flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}

        {/* Help Text */}
        {getHelpText() && !error && (
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {getHelpText()}
          </p>
        )}
      </div>
    </div>
  )
}

export default DateQuestion