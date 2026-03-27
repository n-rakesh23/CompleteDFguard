import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  error,
  type      = 'text',
  className = '',
  ...props
}) {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mono">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          className={`
            w-full rounded-xl px-4 py-3
            text-white placeholder-slate-600 outline-none transition-all duration-200
            ${error
              ? 'border-red-500/40 bg-red-500/5'
              : 'border-white/8 bg-white/4 focus:border-brand-cyan/40 focus:bg-brand-cyan/5'
            }
            border
            ${isPassword ? 'pr-12' : ''}
            ${className}
          `}
          style={{ background: error ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)' }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(p => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-brand-cyan transition-colors"
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-red-400 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400" />
          {error}
        </p>
      )}
    </div>
  );
}
