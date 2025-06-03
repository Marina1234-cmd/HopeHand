import DOMPurify from 'dompurify'

export interface ValidationResult {
  isValid: boolean
  sanitizedValue: string
  error?: string
}

export const sanitizeInput = (input: string): string => {
  // Remove any HTML tags and potentially dangerous content
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Don't allow any HTML tags
    ALLOWED_ATTR: [] // Don't allow any HTML attributes
  })

  // Additional sanitization for special characters
  return sanitized
    .replace(/[<>]/g, '') // Remove any remaining angle brackets
    .trim() // Remove leading/trailing whitespace
}

export const validateEmail = (email: string): ValidationResult => {
  const sanitizedEmail = sanitizeInput(email)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  return {
    isValid: emailRegex.test(sanitizedEmail),
    sanitizedValue: sanitizedEmail,
    error: emailRegex.test(sanitizedEmail) ? undefined : 'Invalid email format'
  }
}

export const validatePassword = (password: string): ValidationResult => {
  const sanitizedPassword = sanitizeInput(password)
  const hasMinLength = sanitizedPassword.length >= 8
  const hasUpperCase = /[A-Z]/.test(sanitizedPassword)
  const hasLowerCase = /[a-z]/.test(sanitizedPassword)
  const hasNumber = /\d/.test(sanitizedPassword)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(sanitizedPassword)

  const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar

  let error
  if (!isValid) {
    error = 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'
  }

  return {
    isValid,
    sanitizedValue: sanitizedPassword,
    error
  }
}

export const validateName = (name: string): ValidationResult => {
  const sanitizedName = sanitizeInput(name)
  const nameRegex = /^[a-zA-Z\s-']{2,50}$/

  return {
    isValid: nameRegex.test(sanitizedName),
    sanitizedValue: sanitizedName,
    error: nameRegex.test(sanitizedName) ? undefined : 'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes'
  }
}

export const validatePhone = (phone: string): ValidationResult => {
  const sanitizedPhone = sanitizeInput(phone)
  const phoneRegex = /^\+?[\d\s-()]{10,20}$/

  return {
    isValid: phoneRegex.test(sanitizedPhone),
    sanitizedValue: sanitizedPhone,
    error: phoneRegex.test(sanitizedPhone) ? undefined : 'Invalid phone number format'
  }
}

export const validateUrl = (url: string): ValidationResult => {
  const sanitizedUrl = sanitizeInput(url)
  try {
    new URL(sanitizedUrl)
    return {
      isValid: true,
      sanitizedValue: sanitizedUrl
    }
  } catch {
    return {
      isValid: false,
      sanitizedValue: sanitizedUrl,
      error: 'Invalid URL format'
    }
  }
}

export const validate2FAToken = (token: string): ValidationResult => {
  const sanitizedToken = sanitizeInput(token).replace(/\D/g, '').substring(0, 6)
  const isValid = /^\d{6}$/.test(sanitizedToken)

  return {
    isValid,
    sanitizedValue: sanitizedToken,
    error: isValid ? undefined : 'Token must be 6 digits'
  }
}

export const validateAmount = (amount: string): ValidationResult => {
  const sanitizedAmount = sanitizeInput(amount)
  const amountRegex = /^\d+(\.\d{0,2})?$/
  const isValid = amountRegex.test(sanitizedAmount) && parseFloat(sanitizedAmount) > 0

  return {
    isValid,
    sanitizedValue: sanitizedAmount,
    error: isValid ? undefined : 'Invalid amount format'
  }
}

export const validateTextArea = (text: string, maxLength: number = 1000): ValidationResult => {
  const sanitizedText = sanitizeInput(text)
  const isValid = sanitizedText.length > 0 && sanitizedText.length <= maxLength

  return {
    isValid,
    sanitizedValue: sanitizedText,
    error: isValid ? undefined : `Text must be between 1 and ${maxLength} characters`
  }
}

// Custom hook for form validation
export const useFormValidation = <T extends Record<string, string>>(
  initialState: T,
  validationRules: { [K in keyof T]: (value: string) => ValidationResult }
) => {
  const [values, setValues] = useState<T>(initialState)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isValid, setIsValid] = useState(false)

  const validateField = (name: keyof T, value: string) => {
    const validationResult = validationRules[name](value)
    setErrors(prev => ({
      ...prev,
      [name]: validationResult.error
    }))
    setValues(prev => ({
      ...prev,
      [name]: validationResult.sanitizedValue
    }))
    return validationResult.isValid
  }

  const validateForm = () => {
    const validationResults = Object.keys(values).map(key => {
      return validateField(key as keyof T, values[key as keyof T])
    })
    const formIsValid = validationResults.every(Boolean)
    setIsValid(formIsValid)
    return formIsValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    validateField(name as keyof T, value)
  }

  return {
    values,
    errors,
    isValid,
    handleChange,
    validateForm,
    validateField
  }
} 