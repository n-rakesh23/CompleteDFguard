import { createContext, useContext, useState, useEffect } from 'react';
import {
  configureAmplify,
  loginUser,
  logoutUser,
  registerUser,
  confirmUserEmail,
  resendVerificationCode,
  getAuthenticatedUser,
  getIdToken,
  refreshSession,
  getUserAttributes,
  updateDisplayName,
  forgotPassword,
  confirmNewPassword,
  changePassword,
  isSessionValid
} from '../lib/cognito';

// Configure Amplify once when this module loads
configureAmplify();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,       setUser]       = useState(null);
  const [attributes, setAttributes] = useState(null);
  const [loading,    setLoading]    = useState(true);

  // ── Check existing session on mount ─────────────────────
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const valid = await isSessionValid();

      if (valid) {
        const currentUser = await getAuthenticatedUser();
        const attrs       = await getUserAttributes();
        setUser(currentUser);
        setAttributes(attrs);
      } else {
        setUser(null);
        setAttributes(null);
      }
    } catch {
      setUser(null);
      setAttributes(null);
    } finally {
      setLoading(false);
    }
  };

  // ── LOGIN ────────────────────────────────────────────────
  const login = async (email, password) => {
    const result = await loginUser(email, password);

    if (result.success) {
      const attrs = await getUserAttributes();
      setUser(result.user);
      setAttributes(attrs);
    }

    return result;
  };

  // ── REGISTER ─────────────────────────────────────────────
  const register = async (email, password, fullName) => {
    return registerUser(email, password, fullName);
  };

  // ── CONFIRM EMAIL ─────────────────────────────────────────
  const confirmEmail = async (email, code) => {
    return confirmUserEmail(email, code);
  };

  // ── RESEND CODE ───────────────────────────────────────────
  const resendCode = async (email) => {
    return resendVerificationCode(email);
  };

  // ── LOGOUT ────────────────────────────────────────────────
  const logout = async () => {
    await logoutUser();
    setUser(null);
    setAttributes(null);
  };

  // ── GET TOKEN (for API calls) ─────────────────────────────
  const getToken = async () => {
    return getIdToken();
  };

  // ── REFRESH TOKEN ─────────────────────────────────────────
  const refreshToken = async () => {
    return refreshSession();
  };

  // ── UPDATE DISPLAY NAME ───────────────────────────────────
  const updateName = async (fullName) => {
    const result = await updateDisplayName(fullName);
    if (result.success) {
      setAttributes(prev => ({ ...prev, name: fullName }));
    }
    return result;
  };

  // ── FORGOT PASSWORD ───────────────────────────────────────
  const sendPasswordReset = async (email) => {
    return forgotPassword(email);
  };

  // ── CONFIRM NEW PASSWORD ──────────────────────────────────
  const resetPassword = async (email, code, newPassword) => {
    return confirmNewPassword(email, code, newPassword);
  };

  // ── CHANGE PASSWORD (logged in) ───────────────────────────
  const updatePassword = async (oldPassword, newPassword) => {
    return changePassword(oldPassword, newPassword);
  };

  // ── CONTEXT VALUE ─────────────────────────────────────────
  const value = {
    // State
    user,
    attributes,
    loading,
    isAuthenticated: !!user,

    // Convenient getters from attributes
    userEmail:   attributes?.email    || '',
    userName:    attributes?.name     || user?.username?.split('@')[0] || '',
    isVerified:  attributes?.emailVerified || false,
    cognitoId:   attributes?.sub      || '',

    // Auth methods
    login,
    logout,
    register,
    confirmEmail,
    resendCode,
    getToken,
    refreshToken,

    // Profile methods
    updateName,

    // Password methods
    sendPasswordReset,
    resetPassword,
    updatePassword,

    // Session refresh
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
