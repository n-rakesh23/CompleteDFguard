import { useState }            from 'react';
import { Link, useNavigate }   from 'react-router-dom';
import { Shield, Lock, ArrowRight } from 'lucide-react';
import toast                   from 'react-hot-toast';
import { useAuth }             from '../hooks/useAuth';
import Input                   from '../components/ui/Input';
import Button                  from '../components/ui/Button';
import Navbar                  from '../components/layout/Navbar';

export default function Login() {
  const { login }                     = useAuth();
  const navigate                      = useNavigate();
  const [form, setForm]               = useState({ email: '', password: '' });
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required.';
    if (!form.password) e.password = 'Password is required.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message || 'Login failed.';
      if (msg.includes('User does not exist') || msg.includes('Incorrect username')) {
        setErrors({ general: 'Invalid email or password.' });
      } else if (msg.includes('not confirmed')) {
        setErrors({ general: 'Please verify your email before logging in.' });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-x-hidden"
      style={{ background: '#050814' }}
    >
      {/* BG */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-100" />
      <div className="glow-orb w-[500px] h-[500px] bg-cyan-500/[0.08] top-[-100px] right-[-100px]" />
      <div className="glow-orb w-[400px] h-[400px] bg-violet-600/[0.08] bottom-[-100px] left-[-100px]" />

      <Navbar />

      <div className="w-full max-w-md animate-fade-up z-10 mt-16 md:mt-0">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl ai-gradient-bg flex items-center justify-center mx-auto mb-5 shadow-glow-cyan">
            <Shield className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">System Access</h1>
          <p className="text-slate-500 text-sm">Authenticate to enter your identity vault.</p>
        </div>

        {/* Card */}
        <div
          className="p-7 md:p-9 rounded-[28px]"
          style={{
            background: 'rgba(10,15,30,0.8)',
            border: '1px solid rgba(34,211,238,0.1)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,211,238,0.04)',
            backdropFilter: 'blur(24px)'
          }}
        >
          {errors.general && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              error={errors.password}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full rounded-xl mt-2 gap-2"
              size="lg"
            >
              <Lock className="w-4 h-4" />
              Authenticate
              {!loading && <ArrowRight className="w-4 h-4 ml-auto" />}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm mt-6 text-slate-500">
          No vault configured?{' '}
          <Link to="/signup" className="text-brand-cyan font-bold hover:text-cyan-300 transition-colors">
            Deploy one
          </Link>
        </p>
      </div>
    </div>
  );
}
