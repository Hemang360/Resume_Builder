export interface BaseQuestion {
  id: string
  type: 'text' | 'textarea' | 'chip-multi-select' | 'number' | 'date'
  title: string
  subtitle?: string
  placeholder?: string
  required?: boolean
  validation?: ValidationRule[]
  jsonPath: string
  tooltip?: TooltipContent
}

export interface TextQuestion extends BaseQuestion {
  type: 'text'
  inputType?: 'text' | 'email' | 'number'
  format?: 'gpa' | 'sat' | 'act' | 'toefl' | 'ielts' | 'percentage'
}

export interface DateQuestion extends BaseQuestion {
  type: 'date'
  dateType?: 'graduation' | 'birth' | 'start' | 'end'
  minYear?: number
  maxYear?: number
}

export interface TextareaQuestion extends BaseQuestion {
  type: 'textarea'
  minWords?: number
  maxWords?: number
  targetWords?: number
  rows?: number
  showWordCount?: boolean
  essayType?: 'personal' | 'leadership' | 'challenge' | 'achievement'
}

export interface ChipMultiSelectQuestion extends BaseQuestion {
  type: 'chip-multi-select'
  options: string[]
  maxSelections?: number
  minSelections?: number
}

export type Question = TextQuestion | TextareaQuestion | ChipMultiSelectQuestion | DateQuestion

export interface ValidationRule {
  type: 'required' | 'email' | 'numeric' | 'minWords' | 'maxWords' | 'minValue' | 'maxValue' | 
        'satScore' | 'actScore' | 'toeflScore' | 'ieltsScore' | 'gpaFormat' | 'percentageFormat' | 'dateRange' | 'minSelections'
  value?: number | string
  message: string
}

export interface TooltipContent {
  title: string
  content: string
  tips?: string[]
  examples?: string[]
  admissionNote?: string
}

export interface QuestionState {
  currentQuestionIndex: number
  answers: Record<string, unknown>
  errors: Record<string, string>
  warnings: Record<string, string>
  isComplete: boolean
}