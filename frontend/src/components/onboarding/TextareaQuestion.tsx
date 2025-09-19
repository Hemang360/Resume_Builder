import React, { useEffect, useRef, useState } from 'react'
import { TextareaQuestion as TextareaQuestionType } from '@/types/questions'
import { Textarea } from '@/components/ui/textarea'

interface TextareaQuestionProps {
  question: TextareaQuestionType
  value: string
  onChange: (value: string) => void
  error?: string
  onEnter: () => void
}

const TextareaQuestion: React.FC<TextareaQuestionProps> = ({
  question,
  value,
  onChange,
  error,
  onEnter
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    // Auto-focus when question loads
    const timer = setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)

    return () => clearTimeout(timer)
  }, [question.id])

  useEffect(() => {
    // Update word count
    const words = value.trim() ? value.trim().split(/\s+/) : []
    setWordCount(words.length)
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault()
      onEnter()
    }
  }

  const isOverLimit = question.maxWords && wordCount > question.maxWords

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

      {/* Textarea Field */}
      <div className="space-y-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder}
          rows={question.rows || 6}
          className={`text-lg resize-none ${error || isOverLimit ? 'border-red-500 focus:border-red-500' : ''}`}
          aria-invalid={!!(error || isOverLimit)}
          aria-describedby={`${question.id}-help ${error ? `${question.id}-error` : ''}`}
        />

        {(error || isOverLimit) && (
          <p
            id={`${question.id}-error`}
            className="text-red-500 text-sm flex items-center gap-1"
            role="alert"
          >
            <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-xs">!</span>
            {error || `Exceeded word limit by ${wordCount - (question.maxWords || 0)} words`}
          </p>
        )}

        {/* Word Count */}
        <div
          id={`${question.id}-help`}
          className="flex justify-between text-sm text-slate-500 dark:text-slate-400"
        >
          <span>
            Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">⌘ + Enter</kbd> to continue
          </span>
          <span className={wordCount > (question.maxWords || Infinity) ? 'text-red-500' : ''}>
            {wordCount} {question.maxWords && `/ ${question.maxWords}`} words
          </span>
        </div>
      </div>
    </div>
  )
}

export default TextareaQuestion