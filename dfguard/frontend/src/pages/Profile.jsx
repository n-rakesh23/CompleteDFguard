import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Calendar, Lock, ChevronLeft, Pencil, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../hooks/useAuth';
import { useJobs } from '../hooks/useJobs';
import { useCredits } from '../hooks/useCredits';
import { updateProfile } from '../lib/api';

export default function Profile() {
  const { userName, userEmail, cognitoId, user, updateName, updatePassword } = useAuth();
  const { jobs } = useJobs();
  const { credits } = useCredits();
  const navigate = useNavigate();

  // Name edit
  const [editingName, setEditingName] = useState(false);
  const [nameInput,   setNameInput]   = useState('');
  const [savingName,  setSavingName]  = useState(false);

  // Password change
  const [pwForm,    setPwForm]    = useState({ old: '', newPw: '', confirm: '' });
  const [savingPw,  setSavingPw]  = useState(false);
  const [showPw,    setShowPw]    = useState(false);

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 2) { toast.error('Name must be at least 2 characters.'); return; }
    setSavingName(true);
    try {
      await Promise.all([updateName(trimmed), updateProfile({ fullName: trimmed })]);
      toast.success('Name updated!');
      setEditingName(false);
    } catch { toast.error('Could not update name.'); }
    finally { setSavingName(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match.'); return; }
    if (pwForm.newPw.length < 8)         { toast.error('Password must be at least 8 characters.'); return; }
    setSavingPw(true);
    try {
      await updatePassword(pwForm.old, pwForm.newPw);
      toast.success('Password changed!');
      setPwForm({ old: '', newPw: '', confirm: '' });
    } catch (err) { toast.error(err.message || 'Could not change password.'); }
    finally { setSavingPw(false); }
  };

  // Credit history derived from jobs
  const creditHistory = jobs.map(job => ({
    date:   job.createdAt,
    label:  job.status === 'queued' ? 'Removed from queue (refunded)' : `Image protection — ${job.status}`,
    amount: job.status === 'queued' ? '+10' : '-10',
    color:  job.status === 'queued' ? 'text-emerald-400' : 'text-red-400',
  })).slice(0, 20);

  const joinedDate = user?.username
    ? new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : '—';

  const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none
    bg-white/5 border border-white/10 focus:border-brand-cyan/50 transition-colors`;

  return (
    <div className="min-h-screen flex flex-col text-white overflow-x-hidden" style={{ background: '#050814' }}>
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="glow-orb w-[400px] h-[400px] bg-cyan-500/[0.06] top-[-100px] right-[-100px] fixed" />
      <div className="glow-orb w-[300px] h-[300px] bg-violet-600/[0.06] bottom-0 left-[-100px] fixed" />

      <Navbar />

      <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 z-10 pt-28 pb-12">

        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-brand-cyan text-xs mb-8 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>

        <h1 className="text-3xl font-display font-bold mb-8">
          My <span className="text-gradient">Profile</span>
        </h1>

        {/* ── User Info ── */}
        <section className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(34,211,238,0.1)' }}>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mono mb-5">// Account Info</h2>

          <div className="flex items-start gap-5 mb-6">
            <img
              src={`https://api.dicebear.com/7.x/shapes/svg?seed=${user?.username}`}
              className="w-16 h-16 rounded-2xl flex-shrink-0"
              style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }}
              alt="Avatar"
            />
            <div className="flex-1 min-w-0">
              {/* Name */}
              <div className="flex items-center gap-2 mb-1">
                {editingName ? (
                  <span className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                      className="bg-transparent border-b border-brand-cyan outline-none text-lg font-bold text-white w-48"
                      maxLength={50}
                    />
                    <button onClick={handleSaveName} disabled={savingName} className="text-emerald-400 hover:text-emerald-300"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingName(false)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="text-lg font-bold">{userName || 'Guardian'}</span>
                    <button onClick={() => { setNameInput(userName); setEditingName(true); }} className="text-slate-600 hover:text-brand-cyan transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${credits?.isPro ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
                {credits?.isPro ? 'Pro Guardian' : 'Free Tier'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Mail className="w-4 h-4 text-brand-cyan flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Email</p>
                <p className="text-xs text-white truncate">{userEmail || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Shield className="w-4 h-4 text-brand-violet flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Plan</p>
                <p className="text-xs text-white">{credits?.isPro ? 'Pro' : 'Free'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Member Since</p>
                <p className="text-xs text-white">{joinedDate}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Change Password ── */}
        <section className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(34,211,238,0.1)' }}>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mono mb-5">// Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Current Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.old}
                onChange={e => setPwForm(p => ({ ...p, old: e.target.value }))}
                className={inputCls}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">New Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.newPw}
                onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                className={inputCls}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Confirm New Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.confirm}
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                className={inputCls}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} className="rounded" />
                Show passwords
              </label>
              <button
                type="submit"
                disabled={savingPw}
                className="ai-gradient-bg px-5 py-2 rounded-full text-xs font-bold hover:brightness-110 transition-all disabled:opacity-50"
              >
                {savingPw ? 'Saving…' : 'Update Password'}
              </button>
            </div>
          </form>
        </section>

        {/* ── Credit History ── */}
        <section className="rounded-2xl p-6" style={{ background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(34,211,238,0.1)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mono">// Credit History</h2>
            <span className="text-xs text-slate-500">Balance: <span className="text-brand-cyan font-bold">{credits?.isPro ? '∞' : credits?.balance ?? 0}</span></span>
          </div>

          {creditHistory.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-6">No credit activity yet.</p>
          ) : (
            <div className="space-y-2">
              {creditHistory.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-xs text-slate-300">{item.label}</p>
                    <p className="text-[10px] text-slate-600 mono">
                      {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-sm font-bold mono ${item.color}`}>{item.amount}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
