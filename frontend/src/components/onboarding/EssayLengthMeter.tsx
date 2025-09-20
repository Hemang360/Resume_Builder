import React from 'react'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle, Target } from 'lucide-react'

interface EssayLengthMeterProps {
  wordCount: number
  charCount: number
  minWords?: number
  maxWords?: number
  targetWords?: number
}

const EssayLengthMeter: React.FC<EssayLengthMeterProps> = ({
  wordCount,
  charCount: _charCount,
  minWords = 0,
  maxWords = 400,
  targetWords
}) => {
  const getStatus = () => {
    if (wordCount === 0) return 'empty'
    if (wordCount < minWords) return 'under'
    if (wordCount > maxWords) return 'over'
    if (targetWords && Math.abs(wordCount - targetWords) <= 25) return 'target'
    return 'good'
  }

  const getProgressValue = () => {
    if (maxWords === 0) return 0
    return Math.min((wordCount / maxWords) * 100, 100)
  }


  const getStatusIcon = () => {
    const status = getStatus()
    switch (status) {
      case 'over':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'target':
        return <Target className="w-5 h-5 text-green-500" />
      case 'good':
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusMessage = () => {
    const status = getStatus()
    switch (status) {
      case 'empty':
        return 'Start writing your response'
      case 'under':
        return `${minWords - wordCount} more words needed`
      case 'over':
        return `${wordCount - maxWords} words over limit`
      case 'target':
        return 'Perfect length! 🎯'
      case 'good':
        return 'Good length, keep going'
      default:
        return ''
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Essay Length
          </span>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {wordCount} / {maxWords} words
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="relative">
          <Progress 
            value={getProgressValue()} 
            className="h-2"
          />
          {/* Target marker */}
          {targetWords && (
            <div 
              className="absolute top-0 w-0.5 h-2 bg-green-600"
              style={{ left: `${Math.min((targetWords / maxWords) * 100, 100)}%` }}
            />
          )}
          {/* Minimum marker */}
          {minWords > 0 && (
            <div 
              className="absolute top-0 w-0.5 h-2 bg-amber-500"
              style={{ left: `${Math.min((minWords / maxWords) * 100, 100)}%` }}
            />
          )}
        </div>
      </div>

      {/* Status and Guidelines */}
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${
          getStatus() === 'over' ? 'text-red-600' :
          getStatus() === 'under' ? 'text-amber-600' :
          getStatus() === 'target' ? 'text-green-600' :
          'text-slate-600 dark:text-slate-400'
        }`}>
          {getStatusMessage()}
        </span>
        
        {targetWords && (
          <span className="text-slate-500 dark:text-slate-400">
            Target: {targetWords} words
          </span>
        )}
      </div>

      {/* Length Guidelines */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Minimum: {minWords}</span>
          {targetWords && <span>Target: {targetWords}</span>}
          <span>Maximum: {maxWords}</span>
        </div>
      </div>
    </div>
  )
}

export default EssayLengthMeter