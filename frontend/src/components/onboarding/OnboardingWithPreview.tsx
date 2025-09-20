import React, { useState, useCallback, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Question } from '@/types/questions'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Loader2, Target, Lightbulb, GraduationCap, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useResumeContext } from '@/contexts/ResumeContext'
import ControlsBar from '../ControlsBar'
import TextQuestion from './TextQuestion'
import TextareaQuestion from './TextareaQuestion'
import ChipMultiSelectQuestion from './ChipMultiSelectQuestion'
import DateQuestion from './DateQuestion'
import ResumePreview from '../ResumePreview'

interface OnboardingWithPreviewProps {
  questions: Question[]
  onComplete?: () => void
  onBackToWelcome?: () => void
  userName?: string
  startFromQuestionId?: string
}

const OnboardingWithPreview: React.FC<OnboardingWithPreviewProps> = ({ 
  questions, 
  onComplete,
  onBackToWelcome,
  startFromQuestionId
}) => {
  const { setField, resume } = useResumeContext()
  
  // Find the starting question index
  const getStartingIndex = () => {
    if (startFromQuestionId) {
      const index = questions.findIndex(q => q.id === startFromQuestionId)
      return index !== -1 ? index : 0
    }
    return 0
  }
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(getStartingIndex())
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isAnimating, setIsAnimating] = useState(false)
  const resumeRef = useRef<HTMLDivElement>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const isFirstQuestion = currentQuestionIndex === 0
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  // Check if we should show the ControlsBar (starting from SAT question)
  const shouldShowControlsBar = () => {
    const satIndex = questions.findIndex(q => q.id === 'sat_score')
    return satIndex !== -1 && currentQuestionIndex >= satIndex
  }

  // Helper function to get full name for PDF title
  const getFullName = (content: Record<string, unknown>): string => {
    const personalInfo = content?.personalInfo as Record<string, unknown> || {}
    const firstName = personalInfo?.firstName as string || ''
    const lastName = personalInfo?.lastName as string || ''
    return `${firstName} ${lastName}`.trim() || 'Resume'
  }

  // Configure react-to-print
  const handlePrint = useReactToPrint({
    content: () => resumeRef.current,
    documentTitle: `${getFullName(resume.content)}-Resume`,
    onAfterPrint: () => console.log('PDF generation completed'),
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `
  })

  const getCurrentAnswer = useCallback(() => {
    return answers[currentQuestion.id] || ''
  }, [answers, currentQuestion.id])

  const validateCurrentAnswer = useCallback((answer: any) => {
    if (!currentQuestion.validation) return ''
    
    for (const rule of currentQuestion.validation) {
      if (rule.type === 'required' && (!answer || answer.toString().trim() === '')) {
        return rule.message
      }
      if (rule.type === 'email' && answer && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer)) {
        return rule.message
      }
    }
    return ''
  }, [currentQuestion])

  const handleAnswerChange = useCallback((value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
    
    // Clear error when user starts typing
    if (errors[currentQuestion.id]) {
      setErrors(prev => ({
        ...prev,
        [currentQuestion.id]: ''
      }))
    }

    // Update resume in real-time
    if (currentQuestion.jsonPath) {
      setField(currentQuestion.jsonPath, value)
    }
  }, [currentQuestion.id, currentQuestion.jsonPath, errors, setField])

  const goToNext = useCallback(async () => {
    const currentAnswer = getCurrentAnswer()
    const error = validateCurrentAnswer(currentAnswer)

    if (error) {
      setErrors(prev => ({
        ...prev,
        [currentQuestion.id]: error
      }))
      return
    }

    setIsAnimating(true)
    await new Promise(resolve => setTimeout(resolve, 200))

    if (isLastQuestion) {
      onComplete?.()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setErrors(prev => ({
        ...prev,
        [currentQuestion.id]: ''
      }))
    }
    
    setIsAnimating(false)
  }, [getCurrentAnswer, validateCurrentAnswer, currentQuestion, isLastQuestion, onComplete])

  const goToPrevious = useCallback(async () => {
    if (isFirstQuestion) {
      // Use the callback to go back to welcome page
      onBackToWelcome?.()
      return
    }

    setIsAnimating(true)
    await new Promise(resolve => setTimeout(resolve, 200))
    
    setCurrentQuestionIndex(prev => prev - 1)
    setTimeout(() => setIsAnimating(false), 50)
  }, [isFirstQuestion, onBackToWelcome])


  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'text':
        return (
          <TextQuestion
            question={currentQuestion}
            value={getCurrentAnswer()}
            onChange={handleAnswerChange}
            error={errors[currentQuestion.id]}
            onEnter={goToNext}
          />
        )
      case 'textarea':
        return (
          <TextareaQuestion
            question={currentQuestion}
            value={getCurrentAnswer()}
            onChange={handleAnswerChange}
            error={errors[currentQuestion.id]}
            onEnter={goToNext}
          />
        )
      case 'chip-multi-select':
        return (
          <ChipMultiSelectQuestion
            question={currentQuestion}
            value={getCurrentAnswer()}
            onChange={handleAnswerChange}
            error={errors[currentQuestion.id]}
            onEnter={goToNext}
          />
        )
      case 'date':
        return (
          <DateQuestion
            question={currentQuestion}
            value={getCurrentAnswer()}
            onChange={handleAnswerChange}
            error={errors[currentQuestion.id]}
            onEnter={goToNext}
          />
        )
      default:
        return null
    }
  }

  const renderTooltipInfo = () => {
    if (!currentQuestion.tooltip) return null

    const { tooltip } = currentQuestion

    return (
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Controls Bar - Show starting from SAT question */}
      {shouldShowControlsBar() && <ControlsBar />}
      <div className="w-full h-full flex">
        {/* Left Side - Question (40%) */}
        <div className="w-2/5 flex items-start justify-start">
          {/* Question Card */}
          <div className={cn(
            "w-full h-full bg-white dark:bg-slate-800 rounded-r-2xl shadow-xl border-r border-slate-200 dark:border-slate-700 p-8 transition-all duration-300 ease-in-out",
            isAnimating ? "opacity-0 transform translate-x-8 scale-95" : "opacity-100 transform translate-x-0 scale-100"
          )}>
                {/* Question Content */}
                <div className="min-h-[300px] transition-all duration-300 ease-in-out">
                  {renderQuestion()}
                </div>

                {/* Tooltip Information */}
                {renderTooltipInfo()}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={goToPrevious}
                    disabled={isAnimating}
                    className={cn(
                      "flex items-center gap-3 px-6 py-4 text-lg transition-all duration-200",
                      isAnimating
                        ? "opacity-50 cursor-not-allowed text-slate-400 dark:text-slate-600" 
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:scale-105"
                    )}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    {isFirstQuestion ? 'Back' : 'Previous'}
                  </Button>

                  <div className="text-center space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Press <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">Enter</kbd> to continue
                    </p>
                    
                    {/* Download PDF Button */}
                    <Button
                      onClick={handlePrint}
                      variant="outline"
                      className="flex items-center gap-2 w-full"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                  </div>

                  <Button
                    size="lg"
                    onClick={goToNext}
                    className={cn(
                      "flex items-center gap-3 px-8 py-4 text-lg transition-all duration-200",
                      isAnimating
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105"
                    )}
                    disabled={isAnimating}
                  >
                    {isAnimating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        {isLastQuestion ? 'Complete' : 'Next'}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
        </div>

          {/* Right Side - Resume Preview (60%) */}
         <div className="w-3/5 flex items-start justify-start">
           <div className="w-full h-full bg-white dark:bg-slate-800 rounded-l-2xl shadow-xl border-l border-slate-200 dark:border-slate-700 p-8 overflow-y-auto">
             <div className="mb-6 text-center">
               <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                 Live Resume Preview
               </h2>
               <p className="text-sm text-slate-600 dark:text-slate-400">
                 Your resume updates automatically as you answer questions
               </p>
             </div>
             <div ref={resumeRef}>
               <ResumePreview />
             </div>
           </div>
         </div>
      </div>
    </div>
  )
}

export default OnboardingWithPreview
