import { ValidationRule } from '@/types/questions'

export const validateAnswer = (value: unknown, rule: ValidationRule): string | null => {
  switch (rule.type) {
    case 'required':
      if (!value || (Array.isArray(value) && value.length === 0) || String(value).trim() === '') {
        return rule.message
      }
      break

    case 'email':
      if (value && typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return rule.message
      }
      break

    case 'numeric':
      if (value && !/^\d+(\.\d+)?$/.test(String(value))) {
        return rule.message
      }
      break

    case 'minWords':
      if (value && typeof value === 'string') {
        const wordCount = value.trim().split(/\s+/).length
        if (wordCount < (rule.value as number)) {
          return rule.message
        }
      }
      break

    case 'maxWords':
      if (value && typeof value === 'string') {
        const wordCount = value.trim().split(/\s+/).length
        if (wordCount > (rule.value as number)) {
          return rule.message
        }
      }
      break

    case 'minValue':
      if (value && typeof value === 'string' && parseFloat(value) < (rule.value as number)) {
        return rule.message
      }
      break

    case 'maxValue':
      if (value && typeof value === 'string' && parseFloat(value) > (rule.value as number)) {
        return rule.message
      }
      break

    default:
      break
  }

  return null
}