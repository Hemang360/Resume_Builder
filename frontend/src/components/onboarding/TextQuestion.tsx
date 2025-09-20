import React, { useEffect, useRef, useState } from 'react'
import { TextQuestion as TextQuestionType } from '@/types/questions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { validateAnswer, formatInput } from '@/utils/validation'
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
  const [selectedFormat, setSelectedFormat] = useState<'gpa' | 'percentage' | null>(null)

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

    // For GPA format, allow decimals and numbers only
    if (question.format === 'gpa') {
      if (selectedFormat === 'gpa') {
        // For GPA: allow numbers and decimal point only
        processedValue = rawValue.replace(/[^\d.]/g, '')
        // Ensure only one decimal point
        const parts = processedValue.split('.')
        if (parts.length > 2) {
          processedValue = parts[0] + '.' + parts.slice(1).join('')
        }
      } else if (selectedFormat === 'percentage') {
        // For percentage: allow numbers only, no % symbol
        processedValue = rawValue.replace(/[^\d.]/g, '')
        // Ensure only one decimal point
        const parts = processedValue.split('.')
        if (parts.length > 2) {
          processedValue = parts[0] + '.' + parts.slice(1).join('')
        }
      }
    } else if (question.format) {
      // Apply other formatting for non-GPA fields
      processedValue = formatInput(rawValue, question.format)
    }

    setFormattedValue(processedValue)
    
    // For percentage format, add % symbol when calling onChange
    if (question.format === 'gpa' && selectedFormat === 'percentage' && processedValue) {
      onChange(processedValue + '%')
    } else {
      onChange(processedValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      
      // The onChange in handleChange already handles the % symbol
      // Just proceed to next question
      onEnter()
    }
  }

  const handleFormatSelect = (format: 'gpa' | 'percentage') => {
    setSelectedFormat(format)
    // Don't clear the input - let user keep their value
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
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h1>
        {question.subtitle && (
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {question.subtitle}
          </p>
        )}
      </div>

      {/* Input Field */}
      <div className="space-y-2">
        {question.format === 'gpa' ? (
          <div className="flex items-center gap-4">
            {/* Input Field - On the left */}
            <div className="relative flex-1 max-w-xs">
              <Input
                ref={inputRef}
                type={question.inputType || 'text'}
                value={formattedValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={selectedFormat === 'gpa' ? '3.85' : '92'}
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
            
            {/* Format Selection Buttons - On the right, larger */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant={selectedFormat === 'gpa' ? 'default' : 'outline'}
                onClick={() => handleFormatSelect('gpa')}
                className="px-6 py-3 text-base font-medium"
              >
                GPA
              </Button>
              <Button
                type="button"
                variant={selectedFormat === 'percentage' ? 'default' : 'outline'}
                onClick={() => handleFormatSelect('percentage')}
                className="px-6 py-3 text-base font-medium"
              >
                Percentage
              </Button>
            </div>
          </div>
        ) : (
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
        )}

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

      </div>
    </div>
  )
}

export default TextQuestion