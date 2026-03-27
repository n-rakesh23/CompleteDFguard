import { useState }    from 'react';
import { Check, Zap, Shield, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast           from 'react-hot-toast';
import Navbar          from '../components/layout/Navbar';
import Footer          from '../components/layout/Footer';
import Button          from '../components/ui/Button';
import { useAuth }     from '../hooks/useAuth';
import api             from '../lib/api';

const plans = [
  {
    key:      'free',
    icon:     Shield,
    iconClass:'icon-glow-cyan',
    iconColor:'text-brand-cyan',
    name:     'Free Plan',
    sub:      '30 free credits every day. Resets every 24 hours.',
    price:    '₹0',
    period:   '/ forever',
    btn:      'Get Started Free',
    features: ['30 Daily Credits', '3 Images Per Day', 'Standard Protection', 'Community Support'],
    checkColor: 'brand-cyan',
    featured: false,
  },
  {
    key:      'monthly',
    icon:     Zap,
    iconClass:'icon-glow-cyan',
    iconColor:'text-brand-cyan',
    name:     'Monthly Plan',
    sub:      'Full access for one month.',
    price:    '₹99',
    period:   '/ month',
    btn:      'Start Monthly',
    features: ['Unlimited Credits', 'Advanced Protection', 'Priority Processing', 'Email Support'],
    checkColor: 'brand-cyan',
    featured: false,
  },
  {
    key:      'sixMonths',
    icon:     Zap,
    iconClass:'icon-glow-violet',
    iconColor:'text-brand-violet',
    name:     '6 Month Plan',
    sub:      'Best value for regular users.',
    price:    '₹499',
    period:   '/ 6 months',
    btn:      'Start 6 Months',
    features: ['Unlimited Credits', 'Advanced Protection', 'Priority Processing', 'Email Support'],
    checkColor: 'brand-violet',
    featured: false,
  },
  {
    key:      'lifetime',
    icon:     Star,
    iconClass:'icon-glow-pink',
    iconColor:'text-brand-pink',
    name:     'Lifetime Plan',
    sub:      'Pay once, use forever. No renewals.',
    price:    '₹1,999',
    period:   '/ lifetime',
    btn:      'Unlock Lifetime Access',
    features: ['Unlimited Credits Forever', 'Advanced Protection', 'Priority Processing', 'Email Alerts on Breaches', 'Priority Support'],
    checkColor: 'brand-pink',
    featured: true,
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const navigate            = useNavigate();
  const [paying, setPaying] = useState(null);

  const handleFreePlan = () => {
    navigate(isAuthenticated ? '/dashboard' : '/signup');
  };

  const handlePaidPlan = async (planKey) => {
    if (!isAuthenticated) { navigate('/signup'); return; }
    if (paying) return;
    try {
      setPaying(planKey);
      const { data } = await api.post('/api/payments/create-order', { planType: planKey });
      const { orderId, amount, currency, keyId } = data;

      const planNames = { monthly: 'Monthly Plan', sixMonths: '6 Month Plan', lifetime: 'Lifetime Plan' };

      const options = {
        key:         keyId,
        amount,
        currency,
        name:        'DFGuard',
        description: planNames[planKey] || 'Pro Access',
        image:       'https://api.dicebear.com/7.x/shapes/svg?seed=Guard',
        order_id:    orderId,
        handler: async (response) => {
          try {
            await api.post('/api/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              planType:            planKey
            });
            toast.success('Access granted! Welcome to Pro.');
            navigate('/dashboard');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { email: '' },
        theme:   { color: '#22d3ee' },
        modal:   { ondismiss: () => { setPaying(null); toast('Payment cancelled.'); } }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Could not initiate payment.');
      setPaying(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white overflow-x-hidden" style={{ background: '#050814' }}>
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
          Simple pricing. No hidden fees.
        </p>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-24 z-10 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isFeatured = plan.featured;
            const isLoading  = paying === plan.key;

            return isFeatured ? (
              <div
                key={plan.key}
                className="rounded-[24px] p-[1.5px] transition-all duration-500 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,211,238,0.4) 0%, rgba(168,85,247,0.4) 50%, rgba(236,72,153,0.4) 100%)',
                  boxShadow:  '0 0 40px rgba(168,85,247,0.15)'
                }}
              >
                <div
                  className="rounded-[23px] p-6 sm:p-7 h-full relative overflow-hidden flex flex-col"
                  style={{ background: '#0a0f1e' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/15 blur-[60px] rounded-full pointer-events-none" />
                  <div className="flex items-center gap-2 mb-1 relative z-10">
                    <div className={`w-8 h-8 rounded-xl ${plan.iconClass} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${plan.iconColor}`} />
                    </div>
                    <h3 className="text-base font-display font-bold text-gradient">{plan.name}</h3>
                  </div>
                  <p className="text-slate-400 text-[11px] mb-4 ml-10 relative z-10">{plan.sub}</p>
                  <div className="mb-4 relative z-10">
                    <span className="text-2xl sm:text-3xl font-display font-bold text-white">{plan.price}</span>
                    <span className="text-slate-500 text-xs ml-1">{plan.period}</span>
                  </div>
                  <Button onClick={() => handlePaidPlan(plan.key)} loading={isLoading} className="mb-5 rounded-xl w-full relative z-10" size="md">
                    {plan.btn}
                  </Button>
                  <ul className="space-y-2.5 text-xs text-slate-300 relative z-10 mt-auto">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center flex-shrink-0">
                          <Check className="text-brand-violet w-2.5 h-2.5" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div
                key={plan.key}
                className="p-6 sm:p-7 rounded-[24px] flex flex-col card-3d transition-all duration-300"
                style={{
                  background:    'rgba(10,15,30,0.7)',
                  border:        '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-8 h-8 rounded-xl ${plan.iconClass} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${plan.iconColor}`} />
                  </div>
                  <h3 className="text-base font-display font-bold text-white">{plan.name}</h3>
                </div>
                <p className="text-slate-500 text-[11px] mb-4 ml-10">{plan.sub}</p>
                <div className="mb-4">
                  <span className="text-2xl sm:text-3xl font-display font-bold text-white">{plan.price}</span>
                  <span className="text-slate-500 text-xs ml-1">{plan.period}</span>
                </div>
                {plan.key === 'free' ? (
                  <Button variant="outline" onClick={handleFreePlan} className="mb-5 rounded-xl w-full" size="md">
                    {plan.btn}
                  </Button>
                ) : (
                  <Button onClick={() => handlePaidPlan(plan.key)} loading={isLoading} className="mb-5 rounded-xl w-full" size="md">
                    {plan.btn}
                  </Button>
                )}
                <ul className="space-y-2.5 text-xs text-slate-400 mt-auto">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full bg-${plan.checkColor}/10 border border-${plan.checkColor}/20 flex items-center justify-center flex-shrink-0`}>
                        <Check className={`text-${plan.checkColor} w-2.5 h-2.5`} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="text-center text-slate-600 text-xs mt-8 md:mt-10 px-4">
          All payments processed securely via Razorpay. No subscriptions on monthly/6-month plans — pay once per period.
        </p>
      </main>

      <Footer />
    </div>
  );
}
