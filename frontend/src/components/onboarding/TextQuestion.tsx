import React, { useEffect, useRef, useState } from 'react'
import { TextQuestion as TextQuestionType } from '@/types/questions'
import { Input } from '@/components/ui/input'
import { validateAnswer, formatInput } from '@/utils/validation'
import QuestionTooltip from './QuestionTooltip'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

interface TextQuestionProps {
  question: TextQuestionType
  value: string
  onChange: (value: string) => void
  error?: string
  warning?: string
  onEnter: () => void
}

const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  value,
  onChange,
  error,
  warning,
  onEnter
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [formattedValue, setFormattedValue] = useState(value)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    // Auto-focus when question loads
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    return () => clearTimeout(timer)
  }, [question.id])

  useEffect(() => {
    setFormattedValue(value)
    
    // Check validation status
    if (question.validation && value) {
      const hasErrors = question.validation.some(rule => 
        validateAnswer(value, rule) !== null
      )
      setIsValid(!hasErrors && value.trim().length > 0)
    }
  }, [value, question.validation])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    let processedValue = rawValue

    // Apply formatting based on field type
    if (question.format) {
      processedValue = formatInput(rawValue, question.format)
    }

    setFormattedValue(processedValue)
    onChange(processedValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onEnter()
    }
  }

  const getInputIcon = () => {
    if (error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    if (warning) {
      return <Info className="w-4 h-4 text-amber-500" />
    }
    if (isValid && value) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return null
  }

  const getHelpText = () => {
    switch (question.format) {
      case 'gpa':
        return 'Enter your GPA on a 4.0 scale (e.g., 3.75) or percentage (e.g., 92%)'
      case 'sat':
        return 'Total SAT score out of 1600 (e.g., 1450)'
      case 'toefl':
        return 'TOEFL iBT score out of 120 (e.g., 105)'
      case 'ielts':
        return 'IELTS overall band score (e.g., 7.5)'
      case 'percentage':
        return 'Enter percentage with % symbol (e.g., 92%)'
      default:
        return null
    }
  }

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

      {/* Input Field */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={inputRef}
            type={question.inputType || 'text'}
            value={formattedValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={question.placeholder}
            className={`text-lg py-6 pr-10 transition-colors ${
              error 
                ? 'border-red-500 focus:border-red-500' 
                : warning
                ? 'border-amber-500 focus:border-amber-500'
                : isValid
                ? 'border-green-500 focus:border-green-500'
                : ''
            }`}
            aria-invalid={!!error}
            aria-describedby={error ? `${question.id}-error` : undefined}
          />
          
          {/* Status Icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getInputIcon()}
          </div>
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

        {/* Warning Message */}
        {warning && !error && (
          <p className="text-amber-600 text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            {warning}
          </p>
        )}

        {/* Help Text */}
        {getHelpText() && !error && !warning && (
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {getHelpText()}
          </p>
        )}

        {/* Format Examples */}
        {question.format && !error && (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Expected Format:
            </p>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {question.format === 'gpa' && (
                <>
                  <span className="bg-white dark:bg-slate-700 px-2 py-1 rounded mr-2">3.85</span>
                  <span className="bg-white dark:bg-slate-700 px-2 py-1 rounded">92%</span>
                </>
              )}
              {question.format === 'sat' && (
                <span className="bg-white dark:bg-slate-700 px-2 py-1 rounded">1450</span>
              )}
              {question.format === 'toefl' && (
                <span className="bg-white dark:bg-slate-700 px-2 py-1 rounded">105</span>
              )}
              {question.format === 'ielts' && (
                <span className="bg-white dark:bg-slate-700 px-2 py-1 rounded">7.5</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TextQuestion