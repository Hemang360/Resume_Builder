import React, { useEffect, useRef } from 'react'
import { TextQuestion as TextQuestionType } from '@/types/questions'
import { Input } from '@/components/ui/input'

interface TextQuestionProps {
  question: TextQuestionType
  value: string
  onChange: (value: string) => void
  error?: string
  onEnter: () => void
}

const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  value,
  onChange,
  error,
  onEnter
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus when question loads
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

  return (
    <div className="space-y-6">
      {/* Question Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
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
        <Input
          ref={inputRef}
          type={question.inputType || 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder}
          className={`text-lg py-6 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${question.id}-error` : undefined}
        />

        {error && (
          <p
            id={`${question.id}-error`}
            className="text-red-500 text-sm flex items-center gap-1"
            role="alert"
          >
            <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-xs">!</span>
            {error}
          </p>
        )}
      </div>

      {/* Helper Text */}
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {question.inputType === 'email' && (
          <p>We'll use this to send you updates about your application</p>
        )}
        {question.inputType === 'number' && (
          <p>Enter numbers only</p>
        )}
      </div>
    </div>
  )
}

export default TextQuestion