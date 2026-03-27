import { Fingerprint, Globe2, ShieldCheck, Cpu, Eye, Lock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Card   from '../components/ui/Card';

const features = [
  {
    icon:       Fingerprint,
    iconClass:  'icon-glow-cyan',
    color:      'text-brand-cyan',
    title:      'Invisible Photo Shield',
    desc:       'We add an invisible protection layer to your photo. You cannot see any difference, but AI systems can no longer recognize your face.'
  },
  {
    icon:       Globe2,
    iconClass:  'icon-glow-violet',
    color:      'text-brand-violet',
    title:      'Web Monitoring',
    desc:       'We scan known AI training datasets around the clock. If your photo is found being used without permission, you get an email alert right away.'
  },
  {
    icon:       ShieldCheck,
    iconClass:  'icon-glow-pink',
    color:      'text-brand-pink',
    title:      'Smart Protection Engine',
    desc:       'Uses a powerful step-by-step method to ensure your photo is protected against all major face recognition systems currently in use.'
  },
  {
    icon:       Cpu,
    iconClass:  'icon-glow-cyan',
    color:      'text-brand-cyan',
    title:      'Fast Processing',
    desc:       'Runs on high-speed graphics cards, so your photos are processed quickly without any drop in the quality of protection.'
  },
  {
    icon:       Eye,
    iconClass:  'icon-glow-violet',
    color:      'text-brand-violet',
    title:      'Invisible to Human Eyes',
    desc:       'The changes made to your photo are so tiny they are completely invisible to you, yet they are enough to fully confuse AI face recognition systems.'
  },
  {
    icon:       Lock,
    iconClass:  'icon-glow-pink',
    color:      'text-brand-pink',
    title:      'End-to-End Encrypted',
    desc:       'Your photos are uploaded directly to encrypted cloud storage. They are never stored on our servers and are automatically deleted after 7 days.'
  }
];

export default function Features() {
  return (
    <div className="min-h-screen flex flex-col text-white overflow-x-hidden" style={{ background: '#050814' }}>
      {/* BG */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="glow-orb w-[400px] h-[400px] md:w-[700px] md:h-[700px] bg-violet-600/[0.08] top-[-150px] right-[-100px]" />
      <div className="glow-orb w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-cyan-500/[0.07] bottom-[10%] left-[-100px]" />

      <Navbar />

      <header className="relative pt-28 sm:pt-36 md:pt-48 pb-10 md:pb-12 px-4 sm:px-6 text-center z-10 animate-fade-up">
        <p className="text-brand-violet text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] mb-3 mono">// how we protect you</p>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold mb-4 md:mb-6 tracking-tight">
          Advanced <span className="text-gradient">Protection</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-lg max-w-xl md:max-w-2xl mx-auto leading-relaxed px-4">
          Our technology makes your face unrecognizable to AI — without changing how your photo looks.
        </p>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-24 z-10 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {features.map((f, i) => (
            <Card key={i} className="p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-[32px] card-3d">
              <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${f.iconClass} flex items-center justify-center mb-5 md:mb-6`}>
                <f.icon className={`${f.color} w-5 h-5 md:w-6 md:h-6`} />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold mb-2 md:mb-3 text-white">
                {f.title}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
