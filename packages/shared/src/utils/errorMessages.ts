export const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/user-not-found':
        case 'auth/invalid-login-credentials': // persistent generic error
            return 'No account found with this email, or incorrect password.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
            return 'This email is already registered. Try logging in instead.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/network-request-failed':
            return 'Connection error. Please check your internet connection.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/popup-closed-by-user':
            return 'Sign in was cancelled.';
        case 'auth/internal-error':
            return 'A Firebase internal error occurred. Please try again.';
        case 'auth/invalid-api-key':
            return 'Invalid Firebase API key. Please check your configuration.';
        case 'auth/unauthorized-domain':
            return 'This domain is not authorized for Firebase Authentication.';
        case 'auth/operation-not-allowed':
            return 'Google sign-in is not enabled in your Firebase console.';
        default:
            return `An unexpected error occurred (${errorCode}). Please try again.`;
    }
};
