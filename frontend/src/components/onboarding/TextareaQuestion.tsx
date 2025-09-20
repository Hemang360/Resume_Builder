import React, { useEffect, useRef, useState } from 'react'
import { TextareaQuestion as TextareaQuestionType } from '@/types/questions'
import { Textarea } from '@/components/ui/textarea'
import EssayLengthMeter from './EssayLengthMeter'
import { AlertCircle, Info } from 'lucide-react'

interface TextareaQuestionProps {
  question: TextareaQuestionType
  value: string
  onChange: (value: string) => void
  error?: string
  warning?: string
  onEnter: () => void
}

const TextareaQuestion: React.FC<TextareaQuestionProps> = ({
  question,
  value,
  onChange,
  error,
  warning,
  onEnter
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    // Auto-focus when question loads
    const timer = setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)

    return () => clearTimeout(timer)
  }, [question.id])

  useEffect(() => {
    // Update counts
    const words = value.trim() ? value.trim().split(/\s+/) : []
    setWordCount(words.length)
    setCharCount(value.length)
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault()
      onEnter()
    }
  }

  const isOverLimit = question.maxWords && wordCount > question.maxWords
  const isUnderMin = question.minWords && wordCount < question.minWords

  const getEssayTips = () => {
    switch (question.essayType) {
      case 'personal':
        return [
          'Show, don\'t tell - use specific examples',
          'Focus on growth and self-reflection',
          'Avoid clichés and generic statements',
          'Connect experiences to your goals'
        ]
      case 'leadership':
        return []
      case 'challenge':
        return [
          'Describe the challenge clearly',
          'Focus on your problem-solving process',
          'Show resilience and adaptability',
          'Explain what you learned from the experience'
        ]
      case 'achievement':
        return [
          'Quantify your accomplishment when possible',
          'Explain the significance to you personally',
          'Describe the effort and dedication required',
          'Connect it to your future goals'
        ]
      default:
        return []
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

      {/* Essay Length Meter */}
      {question.showWordCount && (
        <EssayLengthMeter
          wordCount={wordCount}
          charCount={charCount}
          minWords={question.minWords}
          maxWords={question.maxWords}
          targetWords={question.targetWords}
        />
      )}

      {/* Textarea Field */}
      <div className="space-y-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder}
          rows={question.rows || 8}
          className={`text-lg resize-none transition-colors ${
            error || isOverLimit
              ? 'border-red-500 focus:border-red-500'
              : warning || isUnderMin
              ? 'border-amber-500 focus:border-amber-500'
              : ''
          }`}
          aria-invalid={!!(error || isOverLimit)}
          aria-describedby={`${question.id}-help ${error ? `${question.id}-error` : ''}`}
        />

        {/* Error Message */}
        {(error || isOverLimit) && (
          <p
            id={`${question.id}-error`}
            className="text-red-500 text-sm flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4" />
            {error || `Exceeded word limit by ${wordCount - (question.maxWords || 0)} words`}
          </p>
        )}

        {/* Warning Message */}
        {(warning || isUnderMin) && !error && !isOverLimit && (
          <p className="text-amber-600 text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            {warning || `Consider adding ${(question.minWords || 0) - wordCount} more words`}
          </p>
        )}

        {/* Essay Tips */}
        {getEssayTips().length > 0 && !error && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Writing Tips:
            </h4>
            <ul className="space-y-1">
              {getEssayTips().map((tip, index) => (
                <li key={index} className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  )
}

export default TextareaQuestion