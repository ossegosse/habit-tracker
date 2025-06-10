/**
 * Validation utilities for form inputs and user data.
 * Provides consistent validation logic across the application.
 */

/**
 * Validates email address format and presence.
 * @param email - Email string to validate
 * @returns Validation result with error message if invalid
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

/**
 * Validates password strength and length requirements.
 * @param password - Password string to validate
 * @returns Validation result with error message if invalid
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }
  
  return { isValid: true };
};

/**
 * Validates habit title for length and content requirements.
 * @param title - Habit title to validate
 * @returns Validation result with error message if invalid
 */
export const validateHabitTitle = (title: string): { isValid: boolean; error?: string } => {
  if (!title.trim()) {
    return { isValid: false, error: 'Habit title is required' };
  }
  
  if (title.trim().length < 3) {
    return { isValid: false, error: 'Habit title must be at least 3 characters long' };
  }
  
  if (title.length > 50) {
    return { isValid: false, error: 'Habit title must be less than 50 characters' };
  }
  
  return { isValid: true };
};

/**
 * Validates custom frequency values for habit scheduling.
 * @param frequency - Frequency number to validate
 * @returns Validation result with error message if invalid
 */
export const validateCustomFrequency = (frequency: number): { isValid: boolean; error?: string } => {
  if (!frequency || frequency < 1) {
    return { isValid: false, error: 'Frequency must be at least 1' };
  }
  
  if (frequency > 365) {
    return { isValid: false, error: 'Frequency cannot exceed 365' };
  }
  
  return { isValid: true };
};

/**
 * Validates target count values for habits with numerical goals.
 * @param count - Target count to validate (optional)
 * @returns Validation result with error message if invalid
 */
export const validateTargetCount = (count: number | undefined): { isValid: boolean; error?: string } => {
  if (count === undefined) {
    return { isValid: true };
  }
  
  if (count < 1) {
    return { isValid: false, error: 'Target count must be at least 1' };
  }
  
  if (count > 1000) {
    return { isValid: false, error: 'Target count cannot exceed 1000' };
  }
  
  return { isValid: true };
};
