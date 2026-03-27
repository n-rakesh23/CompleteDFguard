export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`
      ${sizes[size]} rounded-full animate-spin
      border-4 border-white/8 border-t-brand-cyan
      ${className}
    `} />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#050814' }}>
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-slate-600 text-xs mono uppercase tracking-widest animate-pulse">Loading vault...</p>
      </div>
    </div>
  );
}
