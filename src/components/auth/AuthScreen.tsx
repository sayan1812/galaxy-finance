import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthCanvasBackground } from './AuthCanvasBackground';

interface AuthScreenProps {
  onSuccessfulAuth?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccessfulAuth }) => {
  const { login, register, loginWithGoogle, authState } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [isExiting, setIsExiting] = useState(false);

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('demo@rupeewise.com');
  const [loginPassword, setLoginPassword] = useState('Password123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // UI & Feedback State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      setIsExiting(true);
      setTimeout(() => {
        onSuccessfulAuth?.();
      }, 350);
    } catch (err: any) {
      console.warn('[Google Sign-In Error]:', err?.code || '', err?.message || err);
      // Gracefully handle user-dismissed popup
      if (err?.message && (err.message.includes('popup was closed') || err.message.includes('popup-closed-by-user'))) {
        setErrorMessage('Google Sign-In popup was closed before completing.');
        return;
      }
      triggerError(err?.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!regPassword) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (regPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(regPassword)) score += 1;
    if (/[0-9]/.test(regPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(regPassword)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-600', text: 'text-rose-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-600', text: 'text-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-500', text: 'text-blue-400' };
      case 4:
        return { score: 4, label: 'High Security', color: 'bg-emerald-500', text: 'text-emerald-400' };
      default:
        return { score: 0, label: 'None', color: 'bg-slate-700', text: 'text-slate-500' };
    }
  }, [regPassword]);

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setShake(true);
    setTimeout(() => setShake(false), 450);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      triggerError('Please enter your email/username and security password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(loginIdentifier.trim(), loginPassword, rememberMe);
      setIsExiting(true);
      setTimeout(() => {
        onSuccessfulAuth?.();
      }, 350);
    } catch (err: any) {
      triggerError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      triggerError('All fields are required to initialize your account.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      triggerError('Please provide a valid corporate or personal email address.');
      return;
    }

    if (regPassword.length < 8) {
      triggerError('Password must contain at least 8 characters with letters and numbers.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      triggerError('Security password confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });
      setSuccessMessage('Account established. Initializing financial vault...');
      setIsExiting(true);
      setTimeout(() => {
        onSuccessfulAuth?.();
      }, 400);
    } catch (err: any) {
      triggerError(err.message || 'Registration failed. Please check details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setLoginIdentifier('demo@rupeewise.com');
    setLoginPassword('Password123!');
    setErrorMessage(null);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#0D0D11]">
      {/* Interactive 2D Security Mesh Canvas */}
      <AuthCanvasBackground />

      {/* Main Authentication Card */}
      <div 
        className={`relative z-10 w-full max-w-md transition-all duration-300 ease-out ${
          isExiting 
            ? 'opacity-0 scale-[0.97] pointer-events-none translate-y-2' 
            : 'opacity-100 scale-100 translate-y-0'
        } ${shake ? 'animate-shake' : ''}`}
      >
        <div className="fin-card bg-[#13131A] rounded-3xl border border-[rgba(74,18,26,0.45)] shadow-2xl shadow-black/80 backdrop-blur-xl p-6 sm:p-8">
          
          {/* Header Brand & Telemetry Badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[rgba(74,18,26,0.35)] border border-[rgba(229,57,53,0.35)] mb-3 shadow-lg shadow-[rgba(74,18,26,0.3)]">
              <ShieldCheck className="w-6 h-6 text-[#E53935]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#FBFBFB] flex items-center justify-center gap-2">
              GALAXY <span className="text-[#E53935]">FINANCE</span>
            </h1>
            <p className="text-xs text-[#8E929D] mt-1 font-mono tracking-wide uppercase">
              Quantum Financial Security Gate
            </p>
          </div>

          {/* Switcher Tab: Sign In / Create Account */}
          <div className="flex p-1 bg-[#0D0D11] rounded-xl border border-[rgba(255,255,255,0.06)] mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-[rgba(74,18,26,0.6)] text-[#FBFBFB] border border-[rgba(229,57,53,0.35)] shadow-sm'
                  : 'text-[#8E929D] hover:text-[#FBFBFB]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-[rgba(74,18,26,0.6)] text-[#FBFBFB] border border-[rgba(229,57,53,0.35)] shadow-sm'
                  : 'text-[#8E929D] hover:text-[#FBFBFB]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* In-line Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center gap-2.5 text-xs text-rose-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-300 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Firebase Google Single Sign-On */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 bg-[#0D0D11] hover:bg-[#181822] text-[#FBFBFB] border border-[rgba(74,18,26,0.5)] hover:border-[rgba(229,57,53,0.4)] transition-all cursor-pointer shadow-sm active:scale-[0.98] mb-4 disabled:opacity-50"
          >
            {isGoogleSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#E53935]" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.2 2.8-2.5 3.7l3.9 3c2.3-2.1 3.6-5.2 3.6-8.9z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-3.1z"/>
                  <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3 0-5.5-2-6.4-4.8L1.9 17C3.7 20.7 7.5 23.5 12 23.5z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center mb-4">
            <div className="border-t border-[rgba(255,255,255,0.06)] w-full" />
            <span className="bg-[#13131A] px-2 text-[10px] font-mono tracking-widest uppercase text-[#8E929D] shrink-0">
              Or Credentials
            </span>
            <div className="border-t border-[rgba(255,255,255,0.06)] w-full" />
          </div>

          {/* Form Content */}
          {activeTab === 'signin' ? (
            /* --- SIGN IN FORM --- */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E929D] mb-1.5">
                  Email or Identifier
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E929D]" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="username"
                    className="fin-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#0D0D11] text-[#FBFBFB] placeholder-[#8E929D]/50 border border-[rgba(142,146,157,0.25)] focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E929D]">
                    Security Password
                  </label>
                  <button
                    type="button"
                    onClick={() => triggerError('Please contact security admin or reset via demo recovery.')}
                    className="text-[11px] text-[#8E929D] hover:text-[#E53935] transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E929D]" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="fin-input w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-[#0D0D11] text-[#FBFBFB] placeholder-[#8E929D]/50 border border-[rgba(142,146,157,0.25)] focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/20 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E929D] hover:text-[#FBFBFB] transition-colors cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#0D0D11] border-[rgba(142,146,157,0.3)] text-[#D32F2F] focus:ring-0 cursor-pointer accent-[#D32F2F]"
                  />
                  <span className="text-xs text-[#8E929D]">Remember Session</span>
                </label>

                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-xs font-semibold text-[#8E929D] hover:text-[#FBFBFB] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Quick-fill verified demo credentials"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Fill Demo
                </button>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || authState === 'AUTHENTICATING'}
                className="btn-crimson w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white bg-[#D32F2F] hover:bg-[#B71C1C] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[rgba(211,47,47,0.25)] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing Telemetry...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Access Vault</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* --- SIGN UP FORM --- */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E929D] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E929D]" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Executive Name"
                    className="fin-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#0D0D11] text-[#FBFBFB] placeholder-[#8E929D]/50 border border-[rgba(142,146,157,0.25)] focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E929D] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E929D]" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@domain.com"
                    autoComplete="email"
                    className="fin-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#0D0D11] text-[#FBFBFB] placeholder-[#8E929D]/50 border border-[rgba(142,146,157,0.25)] focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E929D] mb-1.5">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E929D]" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 8 characters, letters & numbers"
                    autoComplete="new-password"
                    className="fin-input w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-[#0D0D11] text-[#FBFBFB] placeholder-[#8E929D]/50 border border-[rgba(142,146,157,0.25)] focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/20 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E929D] hover:text-[#FBFBFB] transition-colors cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {regPassword.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            step <= passwordStrength.score ? passwordStrength.color : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#8E929D]">Entropy: {passwordStrength.label}</span>
                      <span className={`font-mono font-semibold ${passwordStrength.text}`}>
                        {passwordStrength.score}/4 Security Score
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E929D] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E929D]" />
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    className="fin-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#0D0D11] text-[#FBFBFB] placeholder-[#8E929D]/50 border border-[rgba(142,146,157,0.25)] focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Submit Registration */}
              <button
                type="submit"
                disabled={isSubmitting || authState === 'AUTHENTICATING'}
                className="btn-crimson w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white bg-[#D32F2F] hover:bg-[#B71C1C] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[rgba(211,47,47,0.25)] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Provisioning Vault...</span>
                  </>
                ) : (
                  <>
                    <span>Create Secure Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Guarantee Telemetry Footer */}
          <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-center gap-2 text-[11px] text-[#8E929D]">
            <Lock className="w-3.5 h-3.5 text-[#E53935]" />
            <span>End-to-End Scrypt & SHA-256 Vault Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};
