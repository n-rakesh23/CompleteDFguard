import { Link }                            from 'react-router-dom';
import { Upload, Zap, ShieldCheck, ArrowRight, Lock, Eye, Cpu } from 'lucide-react';
import Navbar  from '../components/layout/Navbar';
import Footer  from '../components/layout/Footer';
import Button  from '../components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-white overflow-x-hidden">

      {/* Background */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="glow-orb w-[400px] h-[400px] md:w-[700px] md:h-[700px] bg-cyan-500/[0.07] top-[-150px] left-[-100px] md:left-[-150px] z-0 animate-pulse-glow" />
      <div className="glow-orb w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-violet-600/[0.08] top-[40%] right-[-100px] md:right-[-200px] z-0 animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      <div className="glow-orb w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-pink-500/[0.06] bottom-[10%] left-[10%] z-0 animate-pulse-glow" style={{ animationDelay: '3s' }} />

      <Navbar />

      {/* ── Hero ── */}
      <main className="relative pt-32 sm:pt-40 md:pt-56 pb-16 md:pb-20 px-4 sm:px-6 text-center z-10">
        <div className="animate-fade-up max-w-4xl mx-auto">
          <div className="cyber-badge mb-6 md:mb-8 mx-auto w-fit text-[10px] sm:text-[11px]">
            <Zap className="w-3 h-3 text-brand-cyan" />
            AI Protection v2.0 — Active
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-5 md:mb-6 leading-[1.05] tracking-tight">
            YOUR FACE<br className="hidden sm:block" />
            <span className="shimmer-text">BELONGS TO YOU.</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base md:text-xl max-w-xl md:max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed px-2">
            Add an invisible layer of protection to your photos. Looks the same to you —
            <span className="text-brand-cyan font-medium"> blocks AI from recognizing your face.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 md:mb-16">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full px-8 md:px-12 gap-3 text-white w-full sm:w-auto">
                Start Protecting Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/features" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="rounded-full gap-2 w-full sm:w-auto">
                <Eye className="w-4 h-4" />
                How It Works
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-16 text-center max-w-lg md:max-w-none mx-auto">
            {[
              { value: '99.8%',   label: 'Success Rate'      },
              { value: '<0.1%',   label: 'Visual Change'    },
              { value: '40-step', label: 'Protection Steps' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-gradient-subtle">{s.value}</p>
                <p className="text-[9px] sm:text-xs text-slate-500 mt-1 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Process ── */}
      <section className="py-16 md:py-24 lg:py-32 px-4 sm:px-6 relative z-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10 md:mb-16">
          <p className="text-brand-cyan text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] mb-3 mono">// how it works</p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed px-4">
            Three simple steps to stop AI from scraping and using your photos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 relative">
          <div className="hidden sm:block absolute top-1/2 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-brand-cyan/20 via-brand-violet/30 to-brand-pink/20 -translate-y-8 z-0" />

          {[
            { icon: Upload,      iconClass: 'icon-glow-cyan',   iconColor: 'text-brand-cyan',   step: '01', title: 'Upload',   desc: 'Upload your photo securely. It goes directly to your private, encrypted storage.' },
            { icon: Zap,         iconClass: 'icon-glow-violet', iconColor: 'text-brand-violet', step: '02', title: 'Protect',  desc: 'Our AI engine adds an invisible shield to your photo, making your face unreadable to AI systems.', scan: true },
            { icon: ShieldCheck, iconClass: 'icon-glow-pink',   iconColor: 'text-brand-pink',   step: '03', title: 'Download', desc: 'Get your protected photo. It looks exactly the same, but AI cannot recognize your face in it.' },
          ].map((step, i) => (
            <div key={i} className="neon-card card-3d rounded-2xl sm:rounded-[28px] p-6 md:p-8 text-center relative overflow-hidden z-10">
              {step.scan && <div className="scan-line opacity-30" />}
              <p className="mono text-[10px] text-slate-600 font-bold mb-4 sm:mb-6 uppercase tracking-[0.2em]">Step {step.step}</p>
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${step.iconClass} flex items-center justify-center mx-auto mb-4 md:mb-5`}>
                <step.icon className={`${step.iconColor} w-5 h-5 md:w-6 md:h-6 ${i === 1 ? 'animate-pulse' : ''}`} />
              </div>
              <h3 className="font-display font-bold text-white text-lg md:text-xl mb-2 md:mb-3">{step.title}</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature strip ── */}
      <section className="py-8 md:py-16 px-4 sm:px-6 z-10 max-w-6xl mx-auto w-full">
        <div className="neon-card rounded-2xl md:rounded-[32px] p-6 md:p-10 lg:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {[
              { icon: Lock,  color: 'text-brand-cyan',   label: 'End-to-End Encrypted',      desc: 'Your photos never pass through an unencrypted server.' },
              { icon: Zap,   color: 'text-brand-violet', label: 'Fast GPU Processing',        desc: 'Runs on high-speed graphics cards — results in under 3 minutes.' },
              { icon: Cpu,   color: 'text-brand-pink',   label: 'Face Recognition Blocker',   desc: 'Built to stop the most widely used face recognition systems.' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-white/5 border border-white/10">
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm mb-1">{f.label}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-24 lg:py-28 px-4 sm:px-6 z-10 text-center max-w-3xl mx-auto">
        <div className="cyber-badge mb-5 md:mb-6 mx-auto w-fit text-[10px] sm:text-[11px]">
          <ShieldCheck className="w-3 h-3" />
          Free to start — no card required
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold mb-4 md:mb-5 leading-tight">
          Your identity deserves<br />
          <span className="text-gradient">real protection.</span>
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mb-8 md:mb-10 leading-relaxed px-4">
          30 free credits every day. Upgrade to Pro for unlimited protection with a one-time payment.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
          <Link to="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="rounded-full px-8 md:px-12 gap-2 w-full sm:w-auto">
              Start Protecting Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/pricing" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="rounded-full w-full sm:w-auto">
              View Pricing
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
