import { AlertTriangle, Newspaper, Globe2, ShieldOff, ExternalLink, Users, TrendingDown, Lock } from 'lucide-react';
import Navbar  from '../components/layout/Navbar';
import Footer  from '../components/layout/Footer';
import { Link } from 'react-router-dom';

const news = [
  {
    category: 'Celebrity Deepfake',
    date:     'January 2024',
    headline: 'Taylor Swift deepfake images flood X (Twitter), viewed 47 million times in 17 hours',
    summary:  'Sexually explicit AI-generated images of Taylor Swift went viral on X before being taken down. The incident forced the US Congress to propose the DEFIANCE Act, making non-consensual deepfake pornography a federal crime.',
    source:   'BBC News, The Guardian, Washington Post',
    severity: 'high',
  },
  {
    category: 'Bollywood Deepfake',
    date:     'November 2023',
    headline: 'Rashmika Mandanna deepfake video goes viral in India, sparks national outrage',
    summary:  'A deepfake video of Indian actress Rashmika Mandanna was shared widely across social media. India\'s IT Minister called it "extremely dangerous" and demanded emergency legislation. The incident triggered a national conversation about deepfake laws in India.',
    source:   'NDTV, The Hindu, Times of India',
    severity: 'high',
  },
  {
    category: 'Mass Exploitation',
    date:     'August 2024',
    headline: 'South Korea\'s deepfake sex crime crisis: Schools, universities and military groups targeted via Telegram',
    summary:  'Hundreds of Telegram group chats were used to create and share deepfake pornographic images of Korean women — including schoolgirls and university students — using photos scraped from social media. Over 500 victims were identified in a single investigation.',
    source:   'BBC News, Reuters, Al Jazeera',
    severity: 'critical',
  },
  {
    category: 'Everyday Users',
    date:     'September 2023',
    headline: 'AI "nudification" bots on Telegram have victimised over 100,000 women globally',
    summary:  'A Sensity AI investigation found Telegram bots capable of generating fake nude images from clothed photos had processed over 100,000 real women\'s images without their consent. Most victims were private individuals, not celebrities.',
    source:   'Sensity AI Report, Wired, MIT Technology Review',
    severity: 'critical',
  },
  {
    category: 'School Crisis',
    date:     'October 2023',
    headline: 'Deepfake nude images of schoolgirls discovered in New Jersey and Spain schools',
    summary:  'In Westfield, New Jersey and Almendralejo, Spain, AI-generated nude images of female students were created and shared by classmates. Students as young as 14 were targeted. Both incidents led to criminal investigations and emergency school policies.',
    source:   'CNN, The New York Times, El País',
    severity: 'critical',
  },
  {
    category: 'Legal Action',
    date:     'May 2024',
    headline: 'Georgia woman wins $500,000 lawsuit after ex-boyfriend used AI to create deepfake nudes',
    summary:  'A Georgia court awarded a woman $500,000 in damages after her ex-boyfriend used an AI app to generate explicit fake images of her and distributed them to her employer and family. It was one of the first major US civil judgments involving AI-generated NSFW imagery.',
    source:   'CNN, NBC News, Forbes',
    severity: 'high',
  },
  {
    category: 'Platform Exodus',
    date:     '2023–2024',
    headline: 'Millions of women reduce or quit social media activity citing fear of AI image abuse',
    summary:  'A Pew Research Center survey found that 1 in 3 women under 35 have reduced what they post publicly online due to fear of AI manipulation of their images. Many report deleting photos, setting accounts to private, or completely deactivating profiles.',
    source:   'Pew Research Center, Reuters',
    severity: 'high',
  },
  {
    category: 'Platform Response',
    date:     'February 2024',
    headline: 'Meta, Google and X face pressure to remove AI-generated NSFW content after failing to act',
    summary:  'Despite community guidelines, researchers found that AI-generated non-consensual intimate images continued to appear on major platforms for days before removal. Advocacy groups called the platforms\' response "completely inadequate."',
    source:   'The Verge, TechCrunch, CNET',
    severity: 'medium',
  },
];

const exodusReasons = [
  { stat: '1 in 3', desc: 'women under 35 have reduced what they post online due to AI image fears', source: 'Pew Research, 2024' },
  { stat: '58%',    desc: 'of Gen Z women say they self-censor photos on social media', source: 'Girlguiding UK Survey, 2023' },
  { stat: '72%',    desc: 'increase in deepfake pornography reported between 2022 and 2023', source: 'Sensity AI, 2023' },
  { stat: '96%',    desc: 'of all deepfake videos online are non-consensual pornography', source: 'Deeptrace / Sensity AI' },
];

const tools = [
  {
    type:    'Taken Down (Illegal)',
    color:   'text-red-400',
    bg:      'bg-red-400/10',
    border:  'border-red-400/20',
    items: [
      { name: 'DeepNude', detail: 'App that generated nude images from clothed photos. Taken down in 2019 after viral backlash, but clones appeared within days.' },
      { name: 'Nudify.online clones', detail: 'Multiple clone sites emerged after DeepNude. Most have been delisted from app stores but still operate as web apps.' },
      { name: 'MrDeepFakes forum', detail: 'Dedicated deepfake pornography forum. De-platformed by payment processors and hosting providers but resurfaced on alternative hosts.' },
    ]
  },
  {
    type:    'Telegram Bots (Active Threat)',
    color:   'text-orange-400',
    bg:      'bg-orange-400/10',
    border:  'border-orange-400/20',
    items: [
      { name: 'Bot-based nudification services', detail: 'Hundreds of Telegram bots allow users to submit photos and receive AI-generated nude versions. Sensity AI identified 104,852 victims from one bot cluster alone.' },
      { name: 'Group-based targeting', detail: 'Private Telegram groups operate as marketplaces where users share victim photos and request deepfakes. South Korea\'s 2024 crisis originated entirely in Telegram groups.' },
    ]
  },
  {
    type:    'Open Source Tools (Misused)',
    color:   'text-yellow-400',
    bg:      'bg-yellow-400/10',
    border:  'border-yellow-400/20',
    items: [
      { name: 'DeepFaceLab', detail: 'Legitimate open-source face-swap tool used by filmmakers. Heavily misused for creating non-consensual deepfake content. Freely available on GitHub.' },
      { name: 'Stable Diffusion + LoRA models', detail: 'Open-source image generation AI fine-tuned with a person\'s photos can generate photorealistic images of that person in any situation, including explicit content.' },
      { name: 'FaceSwap (open source)', detail: 'Another legitimate research tool routinely misused to swap faces onto explicit content.' },
    ]
  },
  {
    type:    'Commercial Platforms Exploited',
    color:   'text-purple-400',
    bg:      'bg-purple-400/10',
    border:  'border-purple-400/20',
    items: [
      { name: 'Undress AI apps', detail: 'Multiple websites openly marketed as "AI clothes remover" tools. Several were removed from Google Play and App Store but continue to operate via browser.' },
      { name: 'Face swap apps', detail: 'Apps like Reface and similar tools, when combined with explicit source content, are used to create targeted non-consensual imagery.' },
      { name: 'AI image generators', detail: 'General-purpose AI generators can be prompted to generate explicit content of specific individuals when combined with reference photos scraped from social media.' },
    ]
  },
];

const laws = [
  { country: '🇬🇧 United Kingdom', law: 'Online Safety Act 2023', detail: 'Making non-consensual intimate deepfakes illegal with up to 2 years imprisonment.' },
  { country: '🇺🇸 United States', law: 'DEFIANCE Act 2024', detail: 'Federal bill creating civil liability for non-consensual AI-generated intimate images, passed after Taylor Swift incident.' },
  { country: '🇰🇷 South Korea',   law: 'Sexual Violence Prevention Act', detail: 'Amended in 2024 to include AI-generated deepfake pornography with penalties up to 5 years in prison.' },
  { country: '🇮🇳 India',         law: 'IT Act + IPC Sections', detail: 'India\'s IT Ministry issued emergency advisories in 2023. Deepfake creation can attract charges under Section 66E (privacy violation) and Section 67A (obscene material).' },
  { country: '🇪🇺 European Union', law: 'AI Act 2024', detail: 'Mandates labelling of AI-generated content and prohibits certain high-risk AI applications including non-consensual deepfakes.' },
];

const severityColor = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/25',
  high:     'text-orange-400 bg-orange-400/10 border-orange-400/25',
  medium:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/25',
};

export default function WhyDFGuard() {
  return (
    <div className="min-h-screen flex flex-col text-white overflow-x-hidden" style={{ background: '#050814' }}>
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="glow-orb w-[500px] h-[500px] bg-red-600/[0.06] top-[-100px] right-[-100px]" />
      <div className="glow-orb w-[400px] h-[400px] bg-cyan-500/[0.06] bottom-[10%] left-[-100px]" />

      <Navbar />

      {/* Hero */}
      <header className="relative pt-28 sm:pt-36 md:pt-48 pb-10 md:pb-14 px-4 sm:px-6 text-center z-10 animate-fade-up max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 border"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
          <AlertTriangle className="w-3 h-3" /> Awareness & Safety Report
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight">
          Why Your Photos Are <br /><span className="text-gradient">Not Safe Online</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
          Real incidents, verified statistics, and the tools being used right now to exploit people's photos without their consent. This page exists to inform — not to alarm.
        </p>
      </header>

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 pb-16 md:pb-24 z-10 w-full space-y-16 md:space-y-24">

        {/* Stats */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {exodusReasons.map((e, i) => (
              <div key={i} className="rounded-2xl p-5 text-center"
                style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-2xl sm:text-3xl font-display font-bold text-gradient mb-2">{e.stat}</p>
                <p className="text-slate-400 text-[11px] leading-relaxed mb-2">{e.desc}</p>
                <p className="text-slate-600 text-[10px] mono">{e.source}</p>
              </div>
            ))}
          </div>
        </section>

        {/* News */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl icon-glow-cyan flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <p className="text-brand-cyan text-[10px] font-bold uppercase tracking-widest mono">// documented incidents</p>
              <h2 className="text-xl sm:text-2xl font-display font-bold">Real News. Real Victims.</h2>
            </div>
          </div>

          <div className="space-y-4">
            {news.map((item, i) => (
              <div key={i} className="rounded-2xl p-5 sm:p-6"
                style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityColor[item.severity]}`}>
                    {item.severity}
                  </span>
                  <span className="text-[10px] text-slate-500 mono">{item.date}</span>
                  <span className="text-[10px] text-brand-violet font-bold uppercase tracking-wider">{item.category}</span>
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base mb-2 leading-snug">{item.headline}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-3">{item.summary}</p>
                <p className="text-[11px] text-slate-600 mono flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Sources: {item.source}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why people leaving social media */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl icon-glow-violet flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-brand-violet" />
            </div>
            <div>
              <p className="text-brand-violet text-[10px] font-bold uppercase tracking-widest mono">// social media impact</p>
              <h2 className="text-xl sm:text-2xl font-display font-bold">Why People Are Leaving Social Media</h2>
            </div>
          </div>

          <div className="rounded-2xl p-6 sm:p-8 space-y-5"
            style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(168,85,247,0.12)' }}>
            {[
              {
                title: 'Fear of AI face scraping',
                body: 'Every public photo you post is permanently accessible to AI models that can scrape, store, and use it to train face recognition systems or generate fake images. Once indexed, there is no way to delete it from AI training datasets.'
              },
              {
                title: 'Profile photos used without consent',
                body: 'A simple profile photo — even from a private account accessed by a mutual — is enough for AI tools to generate convincing fake nude images. Researchers at Stanford demonstrated this could be done in under 2 minutes with publicly available tools.'
              },
              {
                title: 'No takedown guarantees',
                body: 'Even when platforms remove deepfake content, it is typically already downloaded and reshared across Telegram, Discord, and dark web forums within hours. Once content spreads, removal is effectively impossible.'
              },
              {
                title: 'Emotional and professional damage',
                body: 'Victims report severe psychological trauma, loss of employment, destroyed relationships, and in some cases suicide attempts. A 2024 UK study found 78% of deepfake victims experienced symptoms of PTSD.'
              },
              {
                title: 'Law enforcement is too slow',
                body: 'Most countries had no specific laws against AI-generated non-consensual intimate images until 2024. Even now, cross-border enforcement is nearly impossible as perpetrators use anonymous services across jurisdictions.'
              }
            ].map((p, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-1.5 rounded-full bg-gradient-to-b from-brand-violet to-brand-pink flex-shrink-0 mt-1" style={{ minHeight: '40px' }} />
                <div>
                  <p className="font-bold text-white text-sm mb-1">{p.title}</p>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tools used */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl icon-glow-pink flex items-center justify-center">
              <ShieldOff className="w-5 h-5 text-brand-pink" />
            </div>
            <div>
              <p className="text-brand-pink text-[10px] font-bold uppercase tracking-widest mono">// threat landscape</p>
              <h2 className="text-xl sm:text-2xl font-display font-bold">Tools Used to Exploit Photos</h2>
            </div>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mb-8 leading-relaxed">
            This information is shared purely for awareness. Understanding what tools exist helps you understand why protection matters.
          </p>

          <div className="space-y-4">
            {tools.map((group, i) => (
              <div key={i} className="rounded-2xl p-5 sm:p-6"
                style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className={`text-[11px] font-bold uppercase tracking-widest mb-4 px-2 py-1 rounded-full border w-fit ${group.color} ${group.bg} ${group.border}`}>
                  {group.type}
                </p>
                <div className="space-y-4">
                  {group.items.map((item, j) => (
                    <div key={j}>
                      <p className="font-bold text-white text-sm mb-1">{item.name}</p>
                      <p className="text-slate-400 text-xs leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Laws */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl icon-glow-cyan flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <p className="text-brand-cyan text-[10px] font-bold uppercase tracking-widest mono">// legal landscape</p>
              <h2 className="text-xl sm:text-2xl font-display font-bold">Laws Being Passed Worldwide</h2>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(34,211,238,0.1)' }}>
            {laws.map((law, i) => (
              <div key={i} className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-3 ${i !== laws.length - 1 ? 'border-b border-white/5' : ''}`}
                style={{ background: i % 2 === 0 ? 'rgba(10,15,30,0.7)' : 'rgba(10,15,30,0.4)' }}>
                <div className="sm:w-48 flex-shrink-0">
                  <p className="font-bold text-white text-sm">{law.country}</p>
                  <p className="text-brand-cyan text-[11px] font-bold mono mt-0.5">{law.law}</p>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{law.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="rounded-[28px] p-8 sm:p-12"
            style={{ background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(34,211,238,0.12)' }}>
            <div className="w-14 h-14 rounded-2xl ai-gradient-bg flex items-center justify-center mx-auto mb-5 shadow-glow-cyan">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3">
              Don't wait to become a statistic.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto mb-7 leading-relaxed">
              DFGuard adds an invisible protection layer to your photos before you post them — making your face unreadable to AI systems, even if your photo is scraped.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                className="ai-gradient-bg px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-cyan-500/20"
              >
                Start Protecting Free
              </Link>
              <Link
                to="/features"
                className="px-8 py-3 rounded-full font-bold text-sm border border-white/10 text-slate-300 hover:text-white transition-colors"
              >
                How It Works
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
