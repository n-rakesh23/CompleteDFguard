import { Coins, Zap } from 'lucide-react';
import { Link }       from 'react-router-dom';
import { useCredits } from '../../hooks/useCredits';

export default function CreditBadge() {
  const { displayBalance, credits } = useCredits();

  return (
    <Link to="/pricing" className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-full border-white/10 bg-white/5 hover:bg-white/10 transition-all">
      {credits?.isPro
        ? <Zap className="w-3.5 h-3.5 text-fuchsia-400" />
        : <Coins className="w-3.5 h-3.5 text-yellow-500" />
      }
      <span className="text-[11px] font-bold">{displayBalance}</span>
      {!credits?.isPro && (
        <span className="text-[9px] text-gray-500 uppercase tracking-widest">credits</span>
      )}
    </Link>
  );
}
