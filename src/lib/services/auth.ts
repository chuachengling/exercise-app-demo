import { User, SignupFormData, LoginFormData, AuthResponse, UserSession, ValidationErrors, PasswordRequirements } from '@/lib/types/auth';

// Mock user database (in production, this would be a real database)
const USERS_STORAGE_KEY = 'exercise_app_users';
const CURRENT_USER_KEY = 'exercise_app_current_user';
const SESSION_KEY = 'exercise_app_session';

// Utility functions for local storage
function getStoredUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function saveSession(session: UserSession): void {
  if (typeof window === 'undefined') return;
  
  // Helper function to safely convert dates to ISO strings
  const safeToISOString = (date: Date | string | undefined): string | undefined => {
    if (!date) return undefined;
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString();
    return undefined;
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    ...session,
    expiresAt: safeToISOString(session.expiresAt),
    lastActivity: safeToISOString(session.lastActivity),
    user: {
      ...session.user,
      createdAt: safeToISOString(session.user.createdAt),
      updatedAt: safeToISOString(session.user.updatedAt),
      dateOfBirth: safeToISOString(session.user.dateOfBirth)
    }
  }));
}

function getStoredSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    
    const session = JSON.parse(stored);
    
    // Helper function to safely parse dates
    const safeParseDate = (dateStr: string | undefined, fallback?: Date): Date => {
      if (!dateStr) return fallback || new Date();
      try {
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? (fallback || new Date()) : parsed;
      } catch {
        return fallback || new Date();
      }
    };
    
    return {
      ...session,
      expiresAt: safeParseDate(session.expiresAt),
      lastActivity: safeParseDate(session.lastActivity),
      user: {
        ...session.user,
        createdAt: safeParseDate(session.user.createdAt),
        updatedAt: safeParseDate(session.user.updatedAt),
        dateOfBirth: session.user.dateOfBirth ? safeParseDate(session.user.dateOfBirth) : undefined
      }
    };
  } catch (error) {
    console.error('Error parsing stored session:', error);
    // Clear corrupted session data
    clearSession();
    return null;
  }
}

function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Validation functions
export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
}

export function validatePassword(password: string): { isValid: boolean; errors: string[]; requirements: PasswordRequirements } {
  const requirements: PasswordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const errors: string[] = [];
  if (!requirements.minLength) errors.push('At least 8 characters');
  if (!requirements.hasUppercase) errors.push('One uppercase letter');
  if (!requirements.hasLowercase) errors.push('One lowercase letter');
  if (!requirements.hasNumber) errors.push('One number');
  if (!requirements.hasSpecialChar) errors.push('One special character');

  return {
    isValid: Object.values(requirements).every(Boolean),
    errors,
    requirements
  };
}

export function validateSignupForm(data: SignupFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  // Email validation
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  // Check if email already exists
  const existingUsers = getStoredUsers();
  if (existingUsers.some(user => user.email.toLowerCase() === data.email.toLowerCase())) {
    errors.email = 'An account with this email already exists';
  }

  // Password validation
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = 'Password must meet all requirements';
  }

  // Confirm password
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Name validation
  if (!data.firstName.trim()) errors.firstName = 'First name is required';
  if (!data.lastName.trim()) errors.lastName = 'Last name is required';

  // Date of birth validation (optional but if provided, must be valid)
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (isNaN(birthDate.getTime())) {
      errors.dateOfBirth = 'Please enter a valid date';
    } else if (age < 13) {
      errors.dateOfBirth = 'You must be at least 13 years old';
    } else if (age > 120) {
      errors.dateOfBirth = 'Please enter a valid birth date';
    }
  }

  return errors;
}

// Generate a simple token (in production, use proper JWT)
function generateToken(): string {
  return btoa(Date.now() + Math.random().toString()).replace(/[^a-zA-Z0-9]/g, '');
}

// Create default user preferences
function createDefaultPreferences(): User['preferences'] {
  return {
    notifications: {
      email: true,
      push: true,
      reminders: true
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false
    },
    units: {
      weight: 'kg',
      height: 'cm',
      distance: 'km'
    },
    theme: 'system'
  };
}

// Authentication service functions
export async function signupUser(formData: SignupFormData): Promise<AuthResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Validate form data
    const validationErrors = validateSignupForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      return {
        success: false,
        message: 'Please fix the validation errors',
        errors: validationErrors
      };
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: formData.email.toLowerCase(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      gender: formData.gender,
      healthGoals: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: createDefaultPreferences()
    };

    // Save user to storage
    const users = getStoredUsers();
    users.push(newUser);
    saveUsers(users);

    // Create session
    const token = generateToken();
    const session: UserSession = {
      user: newUser,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      lastActivity: new Date()
    };

    saveSession(session);

    return {
      success: true,
      user: newUser,
      token,
      message: 'Account created successfully!'
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}

export async function loginUser(credentials: LoginFormData): Promise<AuthResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    const { email, password } = credentials;

    // Basic validation
    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required'
      };
    }

    // Find user
    const users = getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // In a real app, you'd verify the password hash here
    // For this demo, we'll just check if password is not empty
    if (!password) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Update last activity
    user.updatedAt = new Date();
    saveUsers(users);

    // Create session
    const token = generateToken();
    const session: UserSession = {
      user,
      token,
      expiresAt: new Date(Date.now() + (credentials.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000),
      lastActivity: new Date()
    };

    saveSession(session);

    return {
      success: true,
      user,
      token,
      message: 'Login successful!'
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}

export async function logoutUser(): Promise<void> {
  clearSession();
}

export function getCurrentSession(): UserSession | null {
  const session = getStoredSession();
  if (!session) return null;

  // Check if session is expired
  if (new Date() > session.expiresAt) {
    clearSession();
    return null;
  }

  return session;
}

export function isSessionValid(): boolean {
  const session = getCurrentSession();
  return session !== null;
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<AuthResponse> {
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Update user
    const updatedUser = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date()
    };

    users[userIndex] = updatedUser;
    saveUsers(users);

    // Update session if it exists
    const session = getCurrentSession();
    if (session && session.user.id === userId) {
      const updatedSession = {
        ...session,
        user: updatedUser,
        lastActivity: new Date()
      };
      saveSession(updatedSession);
    }

    return {
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully!'
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      message: 'Failed to update profile. Please try again.'
    };
  }
}

export function refreshSession(): UserSession | null {
  const session = getCurrentSession();
  if (!session) return null;

  // Update last activity
  const updatedSession = {
    ...session,
    lastActivity: new Date()
  };
  saveSession(updatedSession);

  return updatedSession;
}