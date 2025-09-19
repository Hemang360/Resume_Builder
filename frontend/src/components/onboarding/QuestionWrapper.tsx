import React from 'react'

interface QuestionWrapperProps {
  children: React.ReactNode
  progress: number
  questionNumber: number
  totalQuestions: number
}

const QuestionWrapper: React.FC<QuestionWrapperProps> = ({
  children,
  progress,
  questionNumber,
  totalQuestions
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {Math.round(progress)}% complete
          </span>
        </div>
        
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

export default QuestionWrapper