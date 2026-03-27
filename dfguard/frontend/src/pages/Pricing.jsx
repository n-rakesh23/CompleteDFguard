import { useState }    from 'react';
import { Check, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast           from 'react-hot-toast';
import Navbar          from '../components/layout/Navbar';
import Footer          from '../components/layout/Footer';
import Button          from '../components/ui/Button';
import { useAuth }     from '../hooks/useAuth';
import api             from '../lib/api';

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const navigate            = useNavigate();
  const [paying, setPaying] = useState(false);

  const handleFreePlan = () => {
    navigate(isAuthenticated ? '/dashboard' : '/signup');
  };

  const handleProPlan = async () => {
    if (!isAuthenticated) { navigate('/signup'); return; }
    try {
      setPaying(true);
      const { data } = await api.post('/api/payments/create-order');
      const { orderId, amount, currency, keyId } = data;

      const options = {
        key:         keyId,
        amount,
        currency,
        name:        'DFGuard',
        description: 'Lifetime Pro Access',
        image:       'https://api.dicebear.com/7.x/shapes/svg?seed=Guard',
        order_id:    orderId,
        handler: async (response) => {
          try {
            await api.post('/api/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature
            });
            toast.success('Pro access granted!');
            navigate('/dashboard');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { email: '' },
        theme:   { color: '#22d3ee' },
        modal:   { ondismiss: () => { setPaying(false); toast('Payment cancelled.'); } }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Could not initiate payment.');
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white overflow-x-hidden" style={{ background: '#050814' }}>
      {/* BG */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="glow-orb w-[350px] h-[350px] md:w-[600px] md:h-[600px] bg-violet-600/[0.08] top-[-100px] right-[-100px]" />
      <div className="glow-orb w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-cyan-500/[0.07] bottom-[0] left-[-100px]" />

      <Navbar />
      <script src="https://checkout.razorpay.com/v1/checkout.js" />

      <header className="relative pt-28 sm:pt-36 md:pt-48 pb-8 md:pb-12 px-4 sm:px-6 text-center z-10 animate-fade-up">
        <p className="text-brand-violet text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] mb-3 mono">// choose your plan</p>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold mb-3 md:mb-4 tracking-tight">
          Choose Your <span className="text-gradient">Plan</span>
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
          Simple pricing. No hidden fees. Cancel anytime.
        </p>
      </header>

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 pb-16 md:pb-24 z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 max-w-2xl md:max-w-4xl mx-auto items-stretch">

          {/* Free Plan */}
          <div
            className="p-6 sm:p-8 md:p-10 rounded-[24px] md:rounded-[32px] flex flex-col transition-all duration-300 card-3d"
            style={{
              background: 'rgba(10,15,30,0.7)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl icon-glow-cyan flex items-center justify-center">
                <Shield className="w-4 h-4 text-brand-cyan" />
              </div>
              <h3 className="text-lg sm:text-xl font-display font-bold text-white">Free Plan</h3>
            </div>
            <p className="text-slate-500 text-xs mb-5 md:mb-6 ml-12">30 free credits every day. Resets every 24 hours.</p>

            <div className="mb-5 md:mb-6">
              <span className="text-3xl sm:text-4xl font-display font-bold text-white">₹0</span>
              <span className="text-slate-500 text-sm ml-2">/ forever</span>
            </div>

            <Button variant="outline" onClick={handleFreePlan} className="mb-6 md:mb-8 rounded-xl w-full" size="lg">
              Get Started Free
            </Button>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-400 mt-auto">
              {['30 Daily Credits', '3 Images Per Day', 'Standard Protection', 'Community Support'].map(f => (
                <li key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center flex-shrink-0">
                    <Check className="text-brand-cyan w-3 h-3" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div
            className="rounded-[24px] md:rounded-[32px] p-[1.5px] hover:scale-[1.01] md:hover:scale-[1.02] transition-all duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(34,211,238,0.4) 0%, rgba(168,85,247,0.4) 50%, rgba(236,72,153,0.4) 100%)',
              boxShadow: '0 0 40px rgba(168,85,247,0.15)'
            }}
          >
            <div
              className="rounded-[23px] md:rounded-[31px] p-6 sm:p-8 md:p-10 h-full relative overflow-hidden flex flex-col"
              style={{ background: '#0a0f1e' }}
            >
              {/* Glow accent */}
              <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-violet-600/15 blur-[60px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-3 mb-1 relative z-10">
                <div className="w-9 h-9 rounded-xl icon-glow-violet flex items-center justify-center">
                  <Zap className="w-4 h-4 text-brand-violet" />
                </div>
                <h3 className="text-lg sm:text-xl font-display font-bold text-gradient">Pro Plan</h3>
              </div>
              <p className="text-slate-400 text-xs mb-5 md:mb-6 ml-12 relative z-10">Unlimited protection. Pay once, use forever.</p>

              <div className="mb-5 md:mb-6 relative z-10">
                <span className="text-3xl sm:text-4xl font-display font-bold text-white">₹1,499</span>
                <span className="text-slate-500 text-sm ml-2">/ lifetime</span>
              </div>

              <Button
                onClick={handleProPlan}
                loading={paying}
                className="mb-6 md:mb-8 rounded-xl w-full relative z-10"
                size="lg"
              >
                Unlock Lifetime Access
              </Button>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300 relative z-10 mt-auto">
                {['Unlimited Credits Forever', 'Advanced Photo Protection', 'Priority Processing', 'Email Alerts on Breaches', 'Priority Support'].map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center flex-shrink-0">
                      <Check className="text-brand-violet w-3 h-3" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* FAQ note */}
        <p className="text-center text-slate-600 text-xs mt-8 md:mt-10 px-4">
          All payments are processed securely via Razorpay. No subscriptions — pay once, use forever.
        </p>
      </main>

      <Footer />
    </div>
  );
}
