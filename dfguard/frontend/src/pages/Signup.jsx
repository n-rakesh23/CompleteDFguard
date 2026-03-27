import { useState }             from 'react';
import { Link, useNavigate }    from 'react-router-dom';
import { Shield, ArrowRight, Mail } from 'lucide-react';
import toast                    from 'react-hot-toast';
import { useAuth }              from '../hooks/useAuth';
import Input                    from '../components/ui/Input';
import Button                   from '../components/ui/Button';
import Navbar                   from '../components/layout/Navbar';

export default function Signup() {
  const { register, confirmEmail, login } = useAuth();
  const navigate                          = useNavigate();

  const [step,    setStep]    = useState('register');
  const [form,    setForm]    = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [code,    setCode]    = useState('');
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())          e.fullName = 'Full name is required.';
    if (!form.email.trim())             e.email    = 'Email is required.';
    if (form.password.length < 8)       e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) e.confirm  = 'Passwords do not match.';
    return e;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    try {
      await register(form.email.trim(), form.password, form.fullName.trim());
      toast.success('Account created! Check your email for a verification code.');
      setStep('confirm');
    } catch (err) {
      const msg = err.message || 'Signup failed.';
      if (msg.includes('already exists')) {
        setErrors({ email: 'An account with this email already exists.' });
      } else if (msg.includes('password')) {
        setErrors({ password: 'Password must contain uppercase, numbers and be 8+ characters.' });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setErrors({ code: 'Verification code is required.' }); return; }
    setLoading(true);
    setErrors({});
    try {
      await confirmEmail(form.email.trim(), code.trim());
      try {
        await login(form.email.trim(), form.password);
        toast.success('Welcome! Your account is ready.');
        navigate('/dashboard');
      } catch {
        toast.success('Email verified! Please log in.');
        navigate('/login');
      }
    } catch {
      setErrors({ code: 'Invalid or expired code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative py-8 sm:py-12 text-white overflow-x-hidden"
      style={{ background: '#050814' }}
    >
      {/* BG */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="glow-orb w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-violet-600/[0.09] top-[-80px] right-[-80px]" />
      <div className="glow-orb w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-cyan-500/[0.07] bottom-[-80px] left-[-80px]" />

      <Navbar />

      <div className="w-full max-w-sm sm:max-w-md animate-fade-up z-10 mt-20 sm:mt-24 mb-8">

        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl ai-gradient-bg flex items-center justify-center mx-auto mb-4 md:mb-5 shadow-glow-violet">
            {step === 'confirm'
              ? <Mail className="text-white w-6 h-6 md:w-7 md:h-7" />
              : <Shield className="text-white w-6 h-6 md:w-7 md:h-7" />
            }
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
            {step === 'register' ? 'Create Account' : 'Verify Your Email'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm px-4">
            {step === 'register'
              ? 'Sign up free — no credit card required.'
              : `Enter the 6-digit code sent to ${form.email}`}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {['register', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                ${step === s || (s === 'register' && step === 'confirm')
                  ? 'ai-gradient-bg text-white'
                  : 'bg-white/5 border border-white/10 text-slate-600'}`}>
                {i + 1}
              </div>
              {i === 0 && (
                <div className={`w-8 h-px transition-all ${step === 'confirm' ? 'bg-brand-cyan/40' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          className="p-6 sm:p-7 md:p-9 rounded-[24px] sm:rounded-[28px]"
          style={{
            background: 'rgba(10,15,30,0.8)',
            border: '1px solid rgba(168,85,247,0.12)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.04)',
            backdropFilter: 'blur(24px)'
          }}
        >
          {errors.general && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              {errors.general}
            </div>
          )}

          {step === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                error={errors.fullName}
                autoComplete="name"
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                error={errors.email}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                error={errors.password}
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                error={errors.confirm}
                autoComplete="new-password"
              />
              <Button type="submit" loading={loading} className="w-full rounded-xl mt-2 gap-2" size="lg">
                Create Account
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleConfirm} className="space-y-4" noValidate>
              <div className="text-center py-2 mb-2">
                <div className="w-12 h-12 rounded-2xl icon-glow-cyan flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-brand-cyan" />
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  A 6-digit code was sent to<br />
                  <span className="text-brand-cyan font-medium">{form.email}</span>
                </p>
              </div>
              <Input
                label="Verification Code"
                placeholder="1 2 3 4 5 6"
                value={code}
                onChange={e => setCode(e.target.value)}
                error={errors.code}
                maxLength={6}
                autoComplete="one-time-code"
                className="text-center text-xl tracking-[0.5em] font-bold mono"
              />
              <Button type="submit" loading={loading} className="w-full rounded-xl mt-2" size="lg">
                Verify Email
              </Button>
              <button
                type="button"
                onClick={() => setStep('register')}
                className="w-full text-center text-xs text-slate-600 hover:text-slate-400 transition py-2 touch-manipulation"
              >
                ← Back to registration
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm mt-5 md:mt-6 text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-cyan font-bold hover:text-cyan-300 transition-colors">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
