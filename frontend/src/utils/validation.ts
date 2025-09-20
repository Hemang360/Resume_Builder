import { ValidationRule } from '@/types/questions'

export const validateAnswer = (value: unknown, rule: ValidationRule): string | null => {
  switch (rule.type) {
    case 'required':
      if (!value || (Array.isArray(value) && value.length === 0) || value.toString().trim() === '') {
        return rule.message
      }
      break

    case 'email':
      if (value && typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return rule.message
      }
      break

    case 'numeric':
      if (value && !/^\d+(\.\d+)?$/.test(value.toString())) {
        return rule.message
      }
      break

    case 'satScore':
      if (value) {
        const score = parseInt(String(value))
        if (isNaN(score) || score < 400 || score > 1600) {
          return rule.message
        }
      }
      break

    case 'actScore':
      if (value) {
        const score = parseInt(String(value))
        if (isNaN(score) || score < 1 || score > 36) {
          return rule.message
        }
      }
      break

    case 'toeflScore':
      if (value) {
        const score = parseInt(String(value))
        if (isNaN(score) || score < 0 || score > 120) {
          return rule.message
        }
      }
      break

    case 'ieltsScore':
      if (value) {
        const score = parseFloat(String(value))
        if (isNaN(score) || score < 0 || score > 9 || (score * 2) % 1 !== 0) {
          return rule.message
        }
      }
      break

    case 'gpaFormat':
      if (value) {
        const valueStr = String(value)
        // Check if it's a percentage
        if (valueStr.includes('%')) {
          const num = parseFloat(valueStr.replace('%', ''))
          if (isNaN(num) || num < 0 || num > 100) {
            return rule.message
          }
        } else {
          // Check if it's a GPA (0.0-4.0)
          const num = parseFloat(valueStr)
          if (isNaN(num) || num < 0 || num > 4.0) {
            return rule.message
          }
        }
      }
      break

    case 'percentageFormat':
      if (value) {
        const match = String(value).match(/^(\d{1,3})%$/)
        if (!match || parseInt(match[1]) > 100) {
          return rule.message
        }
      }
      break

    case 'minWords':
      if (value) {
        const wordCount = String(value).trim().split(/\s+/).length
        if (wordCount < (rule.value as number)) {
          return rule.message
        }
      }
      break

    case 'maxWords':
      if (value) {
        const wordCount = String(value).trim().split(/\s+/).length
        if (wordCount > (rule.value as number)) {
          return rule.message
        }
      }
      break

    case 'minValue':
      if (value && parseFloat(String(value)) < (rule.value as number)) {
        return rule.message
      }
      break

    case 'maxValue':
      if (value && parseFloat(String(value)) > (rule.value as number)) {
        return rule.message
      }
      break

    case 'minSelections':
      if (Array.isArray(value) && value.length < (rule.value as number)) {
        return rule.message
      }
      break

    case 'dateRange':
      if (value) {
        const date = new Date(String(value))
        const currentYear = new Date().getFullYear()
        const year = date.getFullYear()
        
        if (year < currentYear - 10 || year > currentYear + 10) {
          return rule.message
        }
      }
      break

    default:
      break
  }

  return null
}

export const formatInput = (value: string, format: string): string => {
  switch (format) {
    case 'gpa': {
      // Allow 0.00-4.00 or percentage
      if (value.includes('%')) {
        const num = value.replace(/[^0-9]/g, '')
        return num ? Math.min(parseInt(num), 100) + '%' : ''
      }
      // Format as decimal
      const decimal = value.replace(/[^0-9.]/g, '')
      const parts = decimal.split('.')
      if (parts.length > 2) {
        return parts[0] + '.' + parts.slice(1).join('')
      }
      if (parts[1] && parts[1].length > 2) {
        parts[1] = parts[1].slice(0, 2)
      }
      const formatted = parts.join('.')
      const num = parseFloat(formatted)
      return !isNaN(num) ? Math.min(num, 4.0).toString() : formatted
    }

    case 'sat': {
      const sat = value.replace(/[^0-9]/g, '')
      return sat ? Math.min(parseInt(sat), 1600).toString() : ''
    }

    case 'act': {
      const act = value.replace(/[^0-9]/g, '')
      return act ? Math.min(parseInt(act), 36).toString() : ''
    }

    case 'toefl': {
      const toefl = value.replace(/[^0-9]/g, '')
      return toefl ? Math.min(parseInt(toefl), 120).toString() : ''
    }

    case 'ielts': {
      const ielts = value.replace(/[^0-9.]/g, '')
      const ieltsNum = parseFloat(ielts)
      if (!isNaN(ieltsNum)) {
        // Round to nearest 0.5
        const rounded = Math.round(ieltsNum * 2) / 2
        return Math.min(rounded, 9).toString()
      }
      return ielts
    }

    case 'percentage': {
      const percent = value.replace(/[^0-9]/g, '')
      return percent ? Math.min(parseInt(percent), 100) + '%' : ''
    }

    default:
      return value
  }
}

export const getWarning = (value: unknown, question: unknown): string | null => {
  // SAT Score warnings
  if (question && typeof question === 'object' && 'format' in question && question.format === 'sat' && value) {
    const score = parseInt(String(value))
    if (score < 1000) {
      return 'Consider retaking - most competitive universities prefer 1200+'
    }
    if (score < 1200) {
      return 'Good score! Top-tier universities typically prefer 1400+'
    }
  }

  // ACT Score warnings
  if (question && typeof question === 'object' && 'format' in question && question.format === 'act' && value) {
    const score = parseInt(String(value))
    if (score < 24) {
      return 'Consider retaking - most competitive universities prefer 28+'
    }
    if (score < 28) {
      return 'Good score! Top-tier universities typically prefer 32+'
    }
  }

  // TOEFL Score warnings
  if (question && typeof question === 'object' && 'format' in question && question.format === 'toefl' && value) {
    const score = parseInt(String(value))
    if (score < 80) {
      return 'Most universities require minimum 80-90 for admission'
    }
    if (score < 100) {
      return 'Consider retaking for top universities (typically require 100+)'
    }
  }

  // IELTS Score warnings
  if (question && typeof question === 'object' && 'format' in question && question.format === 'ielts' && value) {
    const score = parseFloat(String(value))
    if (score < 6.5) {
      return 'Most universities require minimum 6.5-7.0 for admission'
    }
    if (score < 7.5) {
      return 'Top universities typically require 7.5+ overall band score'
    }
  }

  // Essay word count warnings
  if (question && typeof question === 'object' && 'type' in question && question.type === 'textarea' && 'targetWords' in question && question.targetWords && value) {
    const wordCount = String(value).trim().split(/\s+/).length
    const target = Number(question.targetWords)
    const difference = Math.abs(wordCount - target)
    
    if (difference > target * 0.5) {
      return wordCount < target 
        ? `Consider expanding - aim for around ${target} words`
        : `Consider shortening - aim for around ${target} words`
    }
  }

  return null
}