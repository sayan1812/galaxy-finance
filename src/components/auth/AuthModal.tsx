import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Lock, 
  Mail, 
  Phone, 
  User as UserIcon, 
  KeyRound, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalMode, 
    setAuthModalMode,
    login,
    register,
    verifyEmail,
    sendVerificationEmail,
    verifyOtp,
    sendOtp,
    forgotPassword,
    resetPassword,
    user
  } = useAuth();

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Verification & OTP states
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  if (!isAuthModalOpen) return null;

  const resetFormState = () => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
    setLoading(true);
    try {
      await login(identifier, password, rememberMe);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name,
        email: identifier,
        phone: phone || undefined,
        password,
        confirmPassword
      });
      setSuccess('Account created! Please verify your email.');
      if (res.verificationToken) {
        setVerificationCode(res.verificationToken);
      }
      setAuthModalMode('verify-email');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
    setLoading(true);
    try {
      await verifyEmail(verificationCode);
      setSuccess('Email verified successfully! You have full access.');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmailCode = async () => {
    if (resendCooldown > 0) return;
    resetFormState();
    try {
      const res = await sendVerificationEmail();
      setSuccess('Verification code sent to your email.');
      if (res.verificationToken) setVerificationCode(res.verificationToken);
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(c => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
    setLoading(true);
    try {
      await verifyOtp(verificationCode);
      setSuccess('Phone number verified successfully!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (resendCooldown > 0) return;
    resetFormState();
    try {
      const res = await sendOtp(phone);
      setSuccess(res.message);
      if (res.otp) setVerificationCode(res.otp);
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(c => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
    setLoading(true);
    try {
      const res = await forgotPassword(identifier);
      setSuccess(res.message);
      if (res.otp) setVerificationCode(res.otp);
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        identifier,
        otp: verificationCode,
        newPassword,
        confirmPassword: confirmNewPassword
      });
      setSuccess('Password updated successfully! Please log in.');
      setTimeout(() => {
        setAuthModalMode('login');
        resetFormState();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md my-8 rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-slate-100 animate-micro-pop">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100">
              {authModalMode === 'login' && 'Sign In to RupeeWise'}
              {authModalMode === 'register' && 'Create Your Account'}
              {authModalMode === 'verify-email' && 'Verify Your Email'}
              {authModalMode === 'verify-phone' && 'Verify Phone OTP'}
              {authModalMode === 'forgot-password' && 'Reset Password'}
            </h2>
            <p className="text-xs text-slate-400">
              {authModalMode === 'login' && 'Access your 3D Galaxy vaults and balances'}
              {authModalMode === 'register' && 'Secure multi-vault personal finance management'}
              {authModalMode === 'verify-email' && `Activation code sent to ${user?.email || identifier}`}
              {authModalMode === 'verify-phone' && 'Enter the 6-digit OTP sent to your phone'}
              {authModalMode === 'forgot-password' && 'Enter email or phone to receive recovery OTP'}
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {authModalMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email or Phone Number</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="demo@rupeewise.com or phone"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    resetFormState();
                    setAuthModalMode('forgot-password');
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>

            <div className="text-center pt-2 text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  resetFormState();
                  setAuthModalMode('register');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium ml-1"
              >
                Register here
              </button>
            </div>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {authModalMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="aarav@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password (Min 8 chars with letter & number)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 mt-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>{loading ? 'Creating Account...' : 'Register'}</span>
            </button>

            <div className="text-center pt-2 text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  resetFormState();
                  setAuthModalMode('login');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium ml-1"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* 3. EMAIL VERIFICATION FORM */}
        {authModalMode === 'verify-email' && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Verification Token / Code</label>
              <input
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter activation token"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm font-mono focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{loading ? 'Verifying...' : 'Verify Email'}</span>
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={handleResendEmailCode}
                disabled={resendCooldown > 0}
                className="text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetFormState();
                  setAuthModalMode('verify-phone');
                }}
                className="text-purple-400 hover:text-purple-300"
              >
                Verify with Phone instead
              </button>
            </div>
          </form>
        )}

        {/* 4. PHONE OTP VERIFICATION FORM */}
        {authModalMode === 'verify-phone' && (
          <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">6-Digit Phone OTP</label>
              <input
                type="text"
                maxLength={6}
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-lg font-mono tracking-widest text-center focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{loading ? 'Verifying OTP...' : 'Verify Phone'}</span>
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={handleSendPhoneOtp}
                disabled={resendCooldown > 0}
                className="text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Request new OTP'}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetFormState();
                  setAuthModalMode('verify-email');
                }}
                className="text-cyan-400 hover:text-cyan-300"
              >
                Switch to Email
              </button>
            </div>
          </form>
        )}

        {/* 5. FORGOT & RESET PASSWORD FORM */}
        {authModalMode === 'forgot-password' && (
          <div className="space-y-4">
            {!success ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Registered Email or Phone</label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter email or phone"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>{loading ? 'Sending OTP...' : 'Send Recovery OTP'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Recovery OTP</label>
                  <input
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="6-digit OTP"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm font-mono focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                </button>
              </form>
            )}

            <div className="text-center pt-2 text-xs text-slate-400">
              Remember your credentials?{' '}
              <button
                type="button"
                onClick={() => {
                  resetFormState();
                  setAuthModalMode('login');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium ml-1"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
