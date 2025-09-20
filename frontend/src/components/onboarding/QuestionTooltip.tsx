import React, { useState } from 'react'
import { TooltipContent } from '@/types/questions'
import {
  Tooltip,
  TooltipContent as UITooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { HelpCircle, GraduationCap, Target, Lightbulb } from 'lucide-react'

interface QuestionTooltipProps {
  tooltip: TooltipContent
}

const QuestionTooltip: React.FC<QuestionTooltipProps> = ({ tooltip }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors flex items-center justify-center"
            aria-label="Help information"
          >
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
        </TooltipTrigger>
        <UITooltipContent 
          side="left" 
          className="max-w-sm p-4 bg-white dark:bg-slate-800 border shadow-lg"
          sideOffset={8}
        >
          <div className="space-y-3">
            {/* Title */}
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {tooltip.title}
              </h4>
            </div>

            {/* Main Content */}
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {tooltip.content}
            </p>

            {/* Tips */}
            {tooltip.tips && tooltip.tips.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    Tips:
                  </span>
                </div>
                <ul className="space-y-1">
                  {tooltip.tips.map((tip, index) => (
                    <li key={index} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1">
                      <span className="text-amber-500 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Examples */}
            {tooltip.examples && tooltip.examples.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    Examples:
                  </span>
                </div>
                <div className="space-y-1">
                  {tooltip.examples.map((example, index) => (
                    <div key={index} className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 rounded px-2 py-1">
                      "{example}"
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admission Note */}
            {tooltip.admissionNote && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                <div className="flex items-start gap-2">
                  <GraduationCap className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                      What admissions officers look for:
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed">
                      {tooltip.admissionNote}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </UITooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default QuestionTooltip