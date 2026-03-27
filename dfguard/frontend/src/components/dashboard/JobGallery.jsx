import { Download, Clock, CheckCircle, XCircle, Loader2, Trash2, ShieldCheck, X } from 'lucide-react';

const statusConfig = {
  queued:     { color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  border: 'border-yellow-400/20',  icon: Clock,        label: 'Queued'     },
  processing: { color: 'text-brand-cyan',  bg: 'bg-brand-cyan/10',  border: 'border-brand-cyan/20',  icon: Loader2,      label: 'Processing' },
  completed:  { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle,  label: 'Protected'  },
  failed:     { color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     icon: XCircle,      label: 'Failed'     }
};

function JobCard({ job, onDelete }) {
  const cfg          = statusConfig[job.status] || statusConfig.queued;
  const Icon         = cfg.icon;
  const isProcessing = job.status === 'processing' || job.status === 'queued';

  return (
    <div
      className="rounded-xl sm:rounded-2xl overflow-hidden group relative animate-fade-up transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'rgba(10,15,30,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}
    >
      {/* Image */}
      <div className="w-full aspect-square relative overflow-hidden bg-black/40">
        {job.downloadUrl ? (
          <img
            src={job.downloadUrl}
            alt="Protected"
            className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isProcessing
              ? <Loader2 className="w-7 h-7 text-brand-cyan animate-spin" />
              : <XCircle className="w-7 h-7 text-red-400" />
            }
          </div>
        )}

        {/* Hover overlay — larger touch targets */}
        {job.downloadUrl && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <a
              href={job.downloadUrl}
              download
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 sm:p-3 rounded-xl ai-gradient-bg hover:scale-110 transition-transform shadow-lg touch-manipulation"
              title="Download protected image"
            >
              <Download className="w-4 h-4 text-white" />
            </a>
            <button
              onClick={() => onDelete(job._id, job.status)}
              className="p-2.5 sm:p-3 rounded-xl bg-red-500/20 border border-red-500/30 hover:scale-110 transition-transform touch-manipulation"
              title="Delete job"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}

        {/* Remove from queue button — only for queued jobs */}
        {job.status === 'queued' && (
          <button
            onClick={() => onDelete(job._id, job.status)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 transition-all touch-manipulation"
            title="Remove from queue (refunds 10 credits)"
          >
            <X className="w-3 h-3 text-slate-400 hover:text-red-400" />
          </button>
        )}

        {/* Status pill overlay */}
        <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.border} border ${cfg.color}`}>
          <Icon className={`w-2.5 h-2.5 ${isProcessing ? 'animate-spin' : ''}`} />
          {cfg.label}
        </div>
      </div>

      {/* Footer */}
      <div className="px-2.5 sm:px-3 py-2 flex items-center justify-between border-t border-white/5">
        <span className="text-[9px] sm:text-[10px] text-slate-600 mono">
          {new Date(job.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
        </span>
        {job.status === 'completed' && (
          <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Ready</span>
        )}
      </div>
    </div>
  );
}

export default function JobGallery({ jobs, onDelete }) {
  if (jobs.length === 0) {
    return (
      <div
        className="rounded-[24px] p-8 sm:p-12 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px] text-center"
        style={{ background: 'rgba(10,15,30,0.5)', border: '1px solid rgba(34,211,238,0.06)' }}
      >
        <div className="w-14 h-14 rounded-2xl icon-glow-cyan flex items-center justify-center mb-4">
          <ShieldCheck className="w-7 h-7 text-brand-cyan" />
        </div>
        <h3 className="font-display font-bold text-slate-500 text-sm sm:text-base mb-1">
          No protected images yet
        </h3>
        <p className="text-[11px] sm:text-xs text-slate-600">Upload an image to begin neural protection</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[24px] p-4 sm:p-6"
      style={{ background: 'rgba(10,15,30,0.5)', border: '1px solid rgba(34,211,238,0.06)' }}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="font-bold text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-widest mono">
          // Secured Gallery
        </h3>
        <span className="text-[10px] text-slate-600 mono">
          {jobs.length} asset{jobs.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {jobs.map(job => (
          <JobCard key={job._id} job={job} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
