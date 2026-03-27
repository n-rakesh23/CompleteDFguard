/**
 * lib/cognito.js
 * ──────────────
 * Complete AWS Amplify v6 authentication wrapper.
 * All Cognito operations go through this file.
 * Import individual functions wherever needed.
 *
 * Usage:
 *   import { loginUser, registerUser } from '../lib/cognito';
 */

import { Amplify } from 'aws-amplify';
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  updatePassword,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  updateUserAttributes,
  deleteUser
} from 'aws-amplify/auth';

// ─────────────────────────────────────────────────────────────
// 1. CONFIGURE AMPLIFY
//    Called once at app startup (also called in AuthContext.jsx
//    but kept here as the single source of truth)
// ─────────────────────────────────────────────────────────────
export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId:       import.meta.env.VITE_COGNITO_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
        region:           import.meta.env.VITE_AWS_REGION,

        // Sign-in options
        loginWith: {
          email: true
        }
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────
// 2. SIGN UP
//    Registers a new user in Cognito.
//    Sends a 6-digit verification code to their email.
// ─────────────────────────────────────────────────────────────
export async function registerUser(email, password, fullName) {
  try {
    const result = await signUp({
      username: email.trim().toLowerCase(),
      password,
      options: {
        userAttributes: {
          email: email.trim().toLowerCase(),
          name:  fullName.trim()
        },
        autoSignIn: false
      }
    });

    return {
      success:       true,
      userConfirmed: result.isSignUpComplete,
      nextStep:      result.nextStep?.signUpStep,
      userId:        result.userId
    };

  } catch (err) {
    throw normalizeCognitoError(err);
  }
}

// ─────────────────────────────────────────────────────────────
// 3. CONFIRM EMAIL
//    User enters the 6-digit code from their email.
// ─────────────────────────────────────────────────────────────
export async function confirmUserEmail(email, code) {
  try {
    const result = await confirmSignUp({
      username:         email.trim().toLowerCase(),
      confirmationCode: code.trim()
    });

    return {
      success:  true,
      complete: result.isSignUpComplete
    };

  } catch (err) {
    throw normalizeCognitoError(err);
  }
}

// ─────────────────────────────────────────────────────────────
// 4. RESEND VERIFICATION CODE
// ─────────────────────────────────────────────────────────────
export async function resendVerificationCode(email) {
  try {
    await resendSignUpCode({ username: email.trim().toLowerCase() });
    return { success: true };
  } catch (err) {
    throw normalizeCognitoError(err);
  }
}

// ─────────────────────────────────────────────────────────────
// 5. LOGIN
//    Authenticates the user using SRP (never sends plain password).
//    Tokens stored automatically by Amplify.
// ─────────────────────────────────────────────────────────────
export async function loginUser(email, password) {
  try {
    const result = await signIn({
      username: email.trim().toLowerCase(),
      password,
      options: {
        authFlowType: 'USER_SRP_AUTH'
      }
    });

    if (result.isSignedIn) {
      const user    = await getCurrentUser();
      const session = await fetchAuthSession();

      return {
        success:  true,
        user,
        idToken:  session.tokens?.idToken?.toString(),
        nextStep: null
      };
    }

    // Handle MFA or other challenge steps
    return {
      success:  false,
      nextStep: result.nextStep?.signInStep
    };

  } catch (err) {
    throw normalizeCognitoError(err);
  }
}

// ─────────────────────────────────────────────────────────────
// 6. LOGOUT
//    Signs out user and clears Amplify token storage.
// ─────────────────────────────────────────────────────────────
export async function logoutUser() {
  try {
    await signOut({ global: false });
    return { success: true };
  } catch (err) {
    throw normalizeCognitoError(err);
  }
}

// ─────────────────────────────────────────────────────────────
// 7. GET CURRENT USER
//    Returns the Cognito user object or null if not logged in.
// ─────────────────────────────────────────────────────────────
export async function getAuthenticatedUser() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// 8. GET ID TOKEN
//    Returns the JWT ID token for backend API Authorization header.
//    Amplify automatically refreshes it when expired.
//    Used by api.js request interceptor.
// ─────────────────────────────────────────────────────────────
export async function getIdToken() {
  try {
    const session = await fetchAuthSession({ forceRefresh: false });
    const token   = session.tokens?.idToken?.toString();

    if (!token) throw new Error('No token found');
    return token;

  } catch {
    throw new Error('Session expired. Please log in again.');
  }
}

// ─────────────────────────────────────────────────────────────
// 9. FORCE REFRESH SESSION
//    Call this after getting a 401 from the backend.
//    Uses the refresh token to obtain fresh ID + access tokens.
// ─────────────────────────────────────────────────────────────
export async function refreshSession() {
  try {
    const session = await fetchAuthSession({ forceRefresh: true });
    return session.tokens?.idToken?.toString();
  } catch {
    throw new Error('Session could not be refreshed. Please log in again.');
  }
}

// ─────────────────────────────────────────────────────────────
// 10. CHECK IF SESSION IS VALID
//     Returns true/false — useful for silent auth checks.
// ─────────────────────────────────────────────────────────────
export async function isSessionValid() {
  try {
    const session = await fetchAuthSession({ forceRefresh: false });
    return !!session.tokens?.idToken;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// 11. GET USER ATTRIBUTES
//     Fetches Cognito profile: email, name, email_verified, sub
// ─────────────────────────────────────────────────────────────
export async function getUserAttributes() {
  try {
    const attrs = await fetchUserAttributes();
    return {
      email:         attrs.email,
      name:          attrs.name         || '',
      emailVerified: attrs.email_verified === 'true',
      sub:           attrs.sub
    };
  } catch (err) {
    throw normalizeCognitoError(err);
  }
}

// ─────────────────────────────────────────────────────────────
// 12. UPDATE DISPLAY NAME
// ─────────────────────────────────────────────────────────────
export async function updateDisplayName(fullName) {
  try {
    await updateUserAttributes({
      userAttributes: { name: fullName.trim() }
    });
    return { success: true };
  } catch (err) {
    throw normalizeCognitoError(err);
  }
}

// ─────────────────────────────────────────────────────────────
// 13. FORGOT PASSWORD
//     Triggers a password reset code to user's email.
// ─────────────────────────────────────────────────────────────
export async function forgotPassword(email) {
  try {
    await resetPassword({ username: email.trim().toLowerCase() });
    return { success: true };
  } catch (err) {
    throw normalizeCognitoError(err);
  }
}

// ─────────────────────────────────────────────────────────────
// 14. CONFIRM NEW PASSWORD (from reset flow)
// ─────────────────────────────────────────────────────────────
export async function confirmNewPassword(email, code, newPassword) {
  try {
    await confirmResetPassword({
      username:         email.trim().toLowerCase(),
      confirmationCode: code.trim(),
      newPassword
    });
    return { success: true };
  } catch (err) {
    throw normalizeCognitoError(err);
  }
}

// ─────────────────────────────────────────────────────────────
// 15. CHANGE PASSWORD (logged-in user only)
// ─────────────────────────────────────────────────────────────
export async function changePassword(oldPassword, newPassword) {
  try {
    await updatePassword({ oldPassword, newPassword });
    return { success: true };
  } catch (err) {
    throw normalizeCognitoError(err);
  }
}

// ─────────────────────────────────────────────────────────────
// 16. DELETE ACCOUNT
//     Permanently deletes the Cognito user.
//     ⚠️  Always call your backend first to delete MongoDB data.
// ─────────────────────────────────────────────────────────────
export async function deleteCognitoAccount() {
  try {
    await deleteUser();
    return { success: true };
  } catch (err) {
    throw normalizeCognitoError(err);
  }
}

// ─────────────────────────────────────────────────────────────
// INTERNAL HELPER: Map Cognito error codes → clean UI messages
// ─────────────────────────────────────────────────────────────
function normalizeCognitoError(err) {
  const code    = err.name || err.code || '';
  const message = err.message || 'An unexpected error occurred.';

  const errorMap = {
    UserNotFoundException:          'No account found with this email.',
    NotAuthorizedException:         'Incorrect email or password.',
    UsernameExistsException:        'An account with this email already exists.',
    UserNotConfirmedException:      'Please verify your email before logging in.',
    CodeMismatchException:          'Invalid verification code. Please try again.',
    ExpiredCodeException:           'Verification code expired. Request a new one.',
    InvalidPasswordException:       'Password must be 8+ characters with uppercase letters and numbers.',
    LimitExceededException:         'Too many attempts. Please wait a few minutes.',
    TooManyRequestsException:       'Too many requests. Please slow down.',
    InvalidParameterException:      'Invalid input. Please check your details.',
    PasswordResetRequiredException: 'A password reset is required. Check your email.',
    NetworkError:                   'Network error. Check your internet connection.'
  };

  const cleanMessage = errorMap[code] || message;
  const cleanError   = new Error(cleanMessage);
  cleanError.code    = code;
  return cleanError;
}
