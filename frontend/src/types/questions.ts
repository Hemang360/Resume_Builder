export interface BaseQuestion {
  id: string
  type: 'text' | 'textarea' | 'chip-multi-select' | 'number'
  title: string
  subtitle?: string
  placeholder?: string
  required?: boolean
  validation?: ValidationRule[]
  jsonPath: string
}

export interface TextQuestion extends BaseQuestion {
  type: 'text'
  inputType?: 'text' | 'email' | 'number'
}

export interface TextareaQuestion extends BaseQuestion {
  type: 'textarea'
  maxWords?: number
  rows?: number
}

export interface ChipMultiSelectQuestion extends BaseQuestion {
  type: 'chip-multi-select'
  options: string[]
  maxSelections?: number
}

export type Question = TextQuestion | TextareaQuestion | ChipMultiSelectQuestion

export interface ValidationRule {
  type: 'required' | 'email' | 'numeric' | 'minWords' | 'maxWords' | 'minValue' | 'maxValue'
  value?: number | string
  message: string
}

export interface QuestionState {
  currentQuestionIndex: number
  answers: Record<string, unknown>
  errors: Record<string, string>
  isComplete: boolean
}