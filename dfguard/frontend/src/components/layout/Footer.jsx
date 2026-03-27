import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-8 mt-auto z-10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg ai-gradient-bg flex items-center justify-center">
              <Shield className="text-white w-3.5 h-3.5" />
            </div>
            <span className="font-display font-bold text-sm text-white">
              DF<span className="text-brand-cyan">Guard</span>
            </span>
          </Link>

          <p className="text-[10px] sm:text-[11px] text-slate-600 mono text-center">
            © {new Date().getFullYear()} DFGuard — Neural Privacy Infrastructure
          </p>

          <div className="flex gap-4 sm:gap-6 text-[10px] sm:text-[11px] text-slate-500">
            <a href="#" className="hover:text-brand-cyan transition-colors touch-manipulation py-1">Privacy</a>
            <a href="#" className="hover:text-brand-cyan transition-colors touch-manipulation py-1">Terms</a>
            <Link to="/features" className="hover:text-brand-cyan transition-colors touch-manipulation py-1">Models</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
