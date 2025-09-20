import React, { useEffect, useState } from 'react'
import { ChipMultiSelectQuestion as ChipMultiSelectQuestionType } from '@/types/questions'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { X, Plus } from 'lucide-react'

interface ChipMultiSelectQuestionProps {
  question: ChipMultiSelectQuestionType
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  onEnter: () => void
}

const ChipMultiSelectQuestion: React.FC<ChipMultiSelectQuestionProps> = ({
  question,
  value = [],
  onChange,
  error,
  onEnter
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [customInput, setCustomInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const filteredOptions = question.options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !value.includes(option)
  )

  const canAddMore = !question.maxSelections || value.length < question.maxSelections

  useEffect(() => {
    // Auto-continue if max selections reached
    if (question.maxSelections && value.length === question.maxSelections) {
      const timer = setTimeout(() => {
        onEnter()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [value.length, question.maxSelections, onEnter])

  const handleSelect = (option: string) => {
    if (!value.includes(option) && canAddMore) {
      onChange([...value, option])
      setSearchTerm('')
    }
  }

  const handleRemove = (option: string) => {
    onChange(value.filter(item => item !== option))
  }

  const handleAddCustom = () => {
    if (customInput.trim() && !value.includes(customInput.trim()) && canAddMore) {
      onChange([...value, customInput.trim()])
      setCustomInput('')
      setShowCustomInput(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (showCustomInput && customInput.trim()) {
        handleAddCustom()
      } else if (filteredOptions.length > 0 && searchTerm) {
        handleSelect(filteredOptions[0])
      } else {
        onEnter()
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Question Title */}
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

      {/* Selected Items */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-sm py-1 px-3 flex items-center gap-1"
            >
              {item}
              <button
                onClick={() => handleRemove(item)}
                className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5"
                aria-label={`Remove ${item}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search/Add Interface */}
      {canAddMore && (
        <div className="space-y-4">
          {!showCustomInput ? (
            <div className="space-y-2">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={question.placeholder || "Type to search or add..."}
                className="text-lg py-6"
              />

              {/* Options */}
              {searchTerm && (
                <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                  {filteredOptions.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {filteredOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelect(option)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-slate-500 dark:text-slate-400 mb-2">
                        No matches found
                      </p>
                      <button
                        onClick={() => setShowCustomInput(true)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Add "{searchTerm}" as custom option
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustom()
                  } else if (e.key === 'Escape') {
                    setShowCustomInput(false)
                    setCustomInput('')
                  }
                }}
                placeholder="Enter custom option..."
                className="flex-1"
                autoFocus
              />
              <button
                onClick={handleAddCustom}
                disabled={!customInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false)
                  setCustomInput('')
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selection Limit Info */}
      {question.maxSelections && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {value.length} of {question.maxSelections} selected
          {value.length === question.maxSelections && " (maximum reached)"}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1" role="alert">
          <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-xs">!</span>
          {error}
        </p>
      )}
    </div>
  )
}

export default ChipMultiSelectQuestion