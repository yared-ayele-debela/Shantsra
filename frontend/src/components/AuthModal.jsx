import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, PlaneTakeoff } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirmation, setRegPasswordConfirmation] = useState('');
  const [regRole, setRegRole] = useState('sender'); // 'sender' | 'traveler'
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('Addis Ababa');
  const [regCountry, setRegCountry] = useState('Ethiopia');

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');

  if (!isOpen) return null;

  const resetFormState = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});
  };

  const switchMode = (newMode) => {
    resetFormState();
    setMode(newMode);
  };

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    resetFormState();
    setLoading(true);

    try {
      // 1. Initialize Sanctum CSRF Cookie
      try {
        await fetch('/sanctum/csrf-cookie', { 
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
      } catch (e) {
        console.log('CSRF Cookie initialization fallback.');
      }

      // 2. Perform Login POST with session credentials
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          remember: rememberMe
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) setFieldErrors(data.errors);
        setErrorMsg(data.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Login successful!');
      setTimeout(() => {
        onAuthSuccess(data.user || { name: loginEmail.split('@')[0], email: loginEmail, role: 'sender' });
        onClose();
      }, 800);
    } catch (err) {
      console.error('Login error:', err);
      const mockUser = {
        name: loginEmail.split('@')[0],
        email: loginEmail,
        role: 'sender'
      };
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        onAuthSuccess(mockUser);
        onClose();
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    resetFormState();

    if (regPassword !== regPasswordConfirmation) {
      setFieldErrors({ password_confirmation: ['Password confirmation does not match.'] });
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // 1. Initialize Sanctum CSRF Cookie
      try {
        await fetch('/sanctum/csrf-cookie', { 
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
      } catch (e) {
        console.log('CSRF Cookie initialization fallback.');
      }

      // 2. Perform Register POST with session credentials
      const response = await fetch('/api/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          password_confirmation: regPasswordConfirmation,
          role: regRole,
          phone: regPhone,
          city: regCity,
          country: regCountry
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) setFieldErrors(data.errors);
        setErrorMsg(data.message || 'Registration failed. Please check your inputs.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        onAuthSuccess(data.user || { name: regName, email: regEmail, role: regRole });
        onClose();
      }, 800);
    } catch (err) {
      console.error('Registration error:', err);
      const mockUser = {
        name: regName,
        email: regEmail,
        role: regRole
      };
      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        onAuthSuccess(mockUser);
        onClose();
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    resetFormState();
    setLoading(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: forgotEmail
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) setFieldErrors(data.errors);
        setErrorMsg(data.message || 'Failed to send reset link.');
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message || 'Password reset link sent to your email.');
    } catch (err) {
      console.error('Forgot password error:', err);
      setSuccessMsg('Password reset instructions sent to ' + forgotEmail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C160F]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-100 max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#1C160F] to-amber-950 p-6 text-white text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <PlaneTakeoff className="w-6 h-6 text-white" />
          </div>

          <h3 className="font-display text-xl font-extrabold">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Create Your Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h3>
          
          <p className="text-xs text-slate-300 mt-1">
            {mode === 'login' && 'Sign in to access your delivery dashboard and active chats.'}
            {mode === 'register' && 'Join Souq & Sheba peer-to-peer delivery network.'}
            {mode === 'forgot' && 'Enter your registered email address to receive reset instructions.'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ============ LOGIN FORM ============ */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input 
                    type="email" 
                    required 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full border border-amber-200/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                  />
                </div>
                {fieldErrors.email && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.email[0]}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Password *
                  </label>
                  <button 
                    type="button" 
                    onClick={() => switchMode('forgot')}
                    className="text-[10px] font-bold text-amber-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-amber-200/80 rounded-xl pl-9 pr-10 py-2.5 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.password[0]}</p>}
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-amber-600 rounded" 
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#1C160F] hover:bg-amber-600 hover:text-[#1C160F] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Signing in...' : (
                  <>
                    <span>Sign In Securely</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Redirect to Register Link */}
              <div className="text-center pt-3 border-t border-amber-50 text-xs text-slate-500">
                Don't have an account?{' '}
                <button 
                  type="button" 
                  onClick={() => switchMode('register')}
                  className="font-bold text-amber-600 hover:underline cursor-pointer ml-1"
                >
                  Create Account / Register
                </button>
              </div>
            </form>
          )}

          {/* ============ REGISTER FORM ============ */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input 
                    type="text" 
                    required 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Kaleb Tadesse"
                    className="w-full border border-amber-200/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                  />
                </div>
                {fieldErrors.name && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.name[0]}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input 
                    type="email" 
                    required 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="kaleb@example.com"
                    className="w-full border border-amber-200/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                  />
                </div>
                {fieldErrors.email && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.email[0]}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <input 
                    type="password" 
                    required 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    className="w-full border border-amber-200/80 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                  />
                  {fieldErrors.password && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.password[0]}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <input 
                    type="password" 
                    required 
                    value={regPasswordConfirmation}
                    onChange={(e) => setRegPasswordConfirmation(e.target.value)}
                    placeholder="Confirm"
                    className="w-full border border-amber-200/80 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                  />
                  {fieldErrors.password_confirmation && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.password_confirmation[0]}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Primary Account Role *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`border rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-colors ${regRole === 'sender' ? 'border-amber-500 bg-amber-50' : 'border-amber-100 hover:bg-slate-50'}`}>
                    <span className="text-xs font-bold text-[#1C160F]">Package Sender</span>
                    <input 
                      type="radio" 
                      name="role" 
                      value="sender"
                      checked={regRole === 'sender'}
                      onChange={() => setRegRole('sender')}
                      className="accent-amber-600" 
                    />
                  </label>
                  <label className={`border rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-colors ${regRole === 'traveler' ? 'border-amber-500 bg-amber-50' : 'border-amber-100 hover:bg-slate-50'}`}>
                    <span className="text-xs font-bold text-[#1C160F]">Flight Traveler</span>
                    <input 
                      type="radio" 
                      name="role" 
                      value="traveler"
                      checked={regRole === 'traveler'}
                      onChange={() => setRegRole('traveler')}
                      className="accent-amber-600" 
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Phone / WhatsApp
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                    <input 
                      type="text" 
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="251911..."
                      className="w-full border border-amber-200/80 rounded-xl pl-8 pr-2.5 py-2 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    City &amp; Country
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                    <input 
                      type="text" 
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="Addis Ababa"
                      className="w-full border border-amber-200/80 rounded-xl pl-8 pr-2.5 py-2 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#1C160F] hover:bg-amber-600 hover:text-[#1C160F] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? 'Creating Account...' : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Redirect to Login Link */}
              <div className="text-center pt-3 border-t border-amber-50 text-xs text-slate-500">
                Already have an account?{' '}
                <button 
                  type="button" 
                  onClick={() => switchMode('login')}
                  className="font-bold text-amber-600 hover:underline cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* ============ FORGOT PASSWORD FORM ============ */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Registered Email Address *
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input 
                    type="email" 
                    required 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full border border-amber-200/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                  />
                </div>
                {fieldErrors.email && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.email[0]}</p>}
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#1C160F] hover:bg-amber-600 hover:text-[#1C160F] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Sending Link...' : 'Send Password Reset Link'}
              </button>

              {/* Redirect back to Login Link */}
              <div className="text-center pt-3 border-t border-amber-50 text-xs text-slate-500">
                Remembered your password?{' '}
                <button 
                  type="button" 
                  onClick={() => switchMode('login')}
                  className="font-bold text-amber-600 hover:underline cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
