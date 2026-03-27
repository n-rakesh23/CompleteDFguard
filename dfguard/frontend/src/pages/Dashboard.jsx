import { useEffect, useState } from 'react';
import { useNavigate }      from 'react-router-dom';
import { ShieldCheck, Coins, Zap, ArrowRight, Pencil, Check, X } from 'lucide-react';
import { Link }             from 'react-router-dom';
import toast                from 'react-hot-toast';
import Navbar               from '../components/layout/Navbar';
import UploadZone           from '../components/dashboard/UploadZone';
import JobGallery           from '../components/dashboard/JobGallery';
import { useAuth }          from '../hooks/useAuth';
import { useJobs }          from '../hooks/useJobs';
import { useCredits }       from '../hooks/useCredits';
import { FullPageSpinner }  from '../components/ui/Spinner';
import { updateProfile }    from '../lib/api';

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading, userName, updateName } = useAuth();
  const { jobs, loading: jobsLoading, uploading, uploadImage, deleteJob } = useJobs();
  const { credits, displayBalance, refetch: refetchCredits }              = useCredits();
  const navigate = useNavigate();

  const [editingName, setEditingName]   = useState(false);
  const [nameInput,   setNameInput]     = useState('');
  const [savingName,  setSavingName]    = useState(false);

  const handleEditName = () => {
    setNameInput(userName);
    setEditingName(true);
  };

  const handleCancelName = () => {
    setEditingName(false);
    setNameInput('');
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 2) {
      toast.error('Name must be at least 2 characters.');
      return;
    }
    setSavingName(true);
    try {
      await Promise.all([
        updateName(trimmed),
        updateProfile({ fullName: trimmed })
      ]);
      toast.success('Name updated!');
      setEditingName(false);
    } catch {
      toast.error('Could not update name. Try again.');
    } finally {
      setSavingName(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login');
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || (!isAuthenticated && authLoading)) return <FullPageSpinner />;

  const handleUpload = async (file) => {
    try {
      if (!credits?.isPro && credits?.balance < 10) {
        toast.error('Not enough credits. Upgrade to Pro!');
        navigate('/pricing');
        return;
      }
      await uploadImage(file);
      await refetchCredits();
      toast.success('Image queued for neural protection!');
    } catch (err) {
      if (err.status === 402) {
        toast.error('Insufficient credits.');
        navigate('/pricing');
      } else {
        toast.error(err.message || 'Upload failed. Try again.');
      }
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await deleteJob(jobId);
      toast.success('Job deleted.');
    } catch {
      toast.error('Could not delete job.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white overflow-x-hidden" style={{ background: '#050814' }}>
      {/* BG */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="glow-orb w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-cyan-500/[0.06] top-[-100px] right-[-100px] fixed" />
      <div className="glow-orb w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-violet-600/[0.06] bottom-0 left-[-100px] fixed" />

      <Navbar />

      <main className="flex-grow max-w-[1400px] mx-auto w-full px-4 sm:px-6 z-10 pt-24 sm:pt-28 md:pt-32 pb-8 md:pb-12">

        {/* Header */}
        <header className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-[10px] sm:text-[11px] text-emerald-400 font-bold uppercase tracking-[0.15em] mono truncate">
                Vault Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-1 md:mb-2">
              Welcome,{' '}
              {editingName ? (
                <span className="inline-flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelName(); }}
                    className="text-gradient bg-transparent border-b border-brand-cyan outline-none w-48 sm:w-64"
                    maxLength={50}
                  />
                  <button onClick={handleSaveName} disabled={savingName} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={handleCancelName} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span className="text-gradient">{userName}</span>
                  <button onClick={handleEditName} className="text-slate-600 hover:text-brand-cyan transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md leading-relaxed">
              Upload media to inject adversarial noise. Each protection costs 10 credits.
            </p>
          </div>

          {/* Credit card */}
          <div
            className="rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-4 flex-shrink-0 self-start sm:self-auto w-full sm:w-auto"
            style={{
              background: 'rgba(10,15,30,0.8)',
              border: '1px solid rgba(34,211,238,0.12)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl icon-glow-cyan flex items-center justify-center flex-shrink-0">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-brand-cyan" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Credits</p>
              <p className="text-2xl sm:text-3xl font-display font-bold text-white leading-none">{displayBalance}</p>
            </div>
            <div className="h-8 sm:h-10 w-px bg-white/8" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Plan</p>
              <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${credits?.isPro ? 'text-brand-violet' : 'text-brand-cyan'}`}>
                {credits?.isPro ? <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                {credits?.isPro ? 'Pro' : 'Free'}
              </div>
            </div>
            {!credits?.isPro && (
              <Link
                to="/pricing"
                className="ml-1 flex items-center gap-1 text-[10px] text-brand-violet font-bold uppercase tracking-wider hover:text-violet-300 transition-colors whitespace-nowrap"
              >
                Upgrade <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            )}
          </div>
        </header>

        {/* Main grid — stack on mobile, side-by-side on lg+ */}
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">

          {/* Upload + Tips */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <UploadZone onUpload={handleUpload} uploading={uploading} />

            <div
              className="rounded-xl p-4 text-xs text-slate-500 space-y-2"
              style={{ background: 'rgba(10,15,30,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <p className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mono mb-3">// Tips</p>
              {[
                'JPG or PNG, max 10 MB',
                'Faces should be clearly visible',
                'Processing takes 1–3 minutes',
                'Files auto-deleted after 7 days'
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-brand-cyan mt-0.5 flex-shrink-0">›</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery */}
          <div className="lg:col-span-3">
            {jobsLoading ? (
              <div
                className="rounded-[24px] p-8 flex items-center justify-center min-h-[200px] sm:min-h-[300px]"
                style={{ background: 'rgba(10,15,30,0.5)', border: '1px solid rgba(34,211,238,0.06)' }}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full animate-spin border-4 border-white/5 border-t-brand-cyan" />
              </div>
            ) : (
              <JobGallery jobs={jobs} onDelete={handleDelete} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
