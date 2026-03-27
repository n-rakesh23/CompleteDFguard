import { useRef, useState } from 'react';
import { ShieldPlus, Upload, ImagePlus } from 'lucide-react';
import Spinner from '../ui/Spinner';

export default function UploadZone({ onUpload, uploading }) {
  const inputRef        = useRef(null);
  const [drag, setDrag] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }
    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      className={`
        rounded-2xl md:rounded-[24px] border-2 border-dashed
        flex flex-col items-center justify-center text-center
        min-h-[200px] sm:min-h-[260px] md:min-h-[320px]
        p-6 sm:p-8
        cursor-pointer transition-all duration-300 touch-manipulation
        ${drag
          ? 'border-brand-cyan/60 bg-brand-cyan/5 scale-[1.01]'
          : 'border-white/10 hover:border-brand-cyan/30 hover:bg-brand-cyan/5'
        }
        ${uploading ? 'cursor-not-allowed opacity-70' : ''}
      `}
      style={{ background: drag ? undefined : 'rgba(10,15,30,0.6)' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <Spinner size="lg" />
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold animate-pulse mono">
            Uploading...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl ai-gradient-bg flex items-center justify-center shadow-glow-cyan transition-transform duration-300 ${drag ? 'scale-110' : ''}`}>
            <ShieldPlus className="text-white w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base sm:text-lg">Protect Your Photo</h3>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Click or drag &amp; drop an image
            </p>
            <p className="text-[10px] text-slate-600 mt-1">
              JPG, PNG up to 10MB · 10 credits
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 mt-1">
            <Upload className="w-3 h-3" />
            <span>Uploads to encrypted storage</span>
          </div>
        </div>
      )}
    </div>
  );
}
