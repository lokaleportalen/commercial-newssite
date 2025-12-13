/**
 * Password validation utilities
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Adgangskoden skal være mindst 8 tegn lang");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Adgangskoden skal indeholde mindst ét stort bogstav");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Adgangskoden skal indeholde mindst ét lille bogstav");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Adgangskoden skal indeholde mindst ét tal");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Adgangskoden skal indeholde mindst ét specialtegn (!@#$%^&* osv.)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get password strength indicator
 * Returns: weak, medium, strong
 */
export function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
  const validation = validatePassword(password);

  if (validation.errors.length > 2) {
    return "weak";
  }

  if (validation.errors.length > 0) {
    return "medium";
  }

  return "strong";
}

/**
 * Email validation
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
