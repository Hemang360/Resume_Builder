import { ValidationRule } from '@/types/questions'

export const validateAnswer = (value: any, rule: ValidationRule): string | null => {
  switch (rule.type) {
    case 'required':
      if (!value || (Array.isArray(value) && value.length === 0) || value.toString().trim() === '') {
        return rule.message
      }
      break

    case 'email':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return rule.message
      }
      break

    case 'numeric':
      if (value && !/^\d+(\.\d+)?$/.test(value.toString())) {
        return rule.message
      }
      break

    case 'minWords':
      if (value) {
        const wordCount = value.trim().split(/\s+/).length
        if (wordCount < (rule.value as number)) {
          return rule.message
        }
      }
      break

    case 'maxWords':
      if (value) {
        const wordCount = value.trim().split(/\s+/).length
        if (wordCount > (rule.value as number)) {
          return rule.message
        }
      }
      break

    case 'minValue':
      if (value && parseFloat(value) < (rule.value as number)) {
        return rule.message
      }
      break

    case 'maxValue':
      if (value && parseFloat(value) > (rule.value as number)) {
        return rule.message
      }
      break

    default:
      break
  }

  return null
}