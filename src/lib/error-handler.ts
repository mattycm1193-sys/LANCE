export class AppError extends Error {
  constructor(
    public message: string,
    public title: string = 'Error',
    public type: 'error' | 'warning' | 'info' = 'error'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function parseError(error: any): AppError {
  console.error('Original Error:', error);

  // Firebase Auth Errors
  if (error?.code?.startsWith('auth/')) {
    switch (error.code) {
      case 'auth/unauthorized-domain':
        return new AppError(
          'This domain is not authorized for sign-in. Please add it to your Firebase Console.',
          'Authentication Error'
        );
      case 'auth/popup-blocked':
        return new AppError(
          'The sign-in popup was blocked by your browser. Please allow popups for this site.',
          'Popup Blocked'
        );
      case 'auth/popup-closed-by-user':
        return new AppError(
          'Sign-in was cancelled. Please try again to access your account.',
          'Sign-in Cancelled',
          'warning'
        );
      case 'auth/network-request-failed':
        return new AppError(
          'Network error. Please check your internet connection and try again.',
          'Connection Error'
        );
      default:
        return new AppError(
          error.message || 'An unexpected authentication error occurred.',
          'Authentication Error'
        );
    }
  }

  // Gemini / AI Errors
  if (error?.message?.includes('quota') || error?.message?.includes('429')) {
    return new AppError(
      'AI quota exceeded. Please wait a moment before trying again.',
      'Rate Limit Reached'
    );
  }

  if (error?.message?.includes('safety')) {
    return new AppError(
      'The request was blocked by safety filters. Please try a different prompt.',
      'Content Blocked',
      'warning'
    );
  }

  // Generic API Errors
  if (error instanceof Response) {
    return new AppError(
      `Server responded with status ${error.status}. Please try again later.`,
      'Server Error'
    );
  }

  return new AppError(
    error?.message || 'Something went wrong. Please try again.',
    'Unexpected Error'
  );
}
