import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'relative ai-gradient-bg text-white font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]',
  ghost:   'glass-panel text-white hover:border-brand-cyan/30 hover:text-brand-cyan',
  danger:  'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-400/40',
  outline: 'border border-white/15 text-white hover:border-brand-cyan/40 hover:text-brand-cyan hover:bg-brand-cyan/5'
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base'
};

export default function Button({
  children,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  disabled  = false,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-bold rounded-xl transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
