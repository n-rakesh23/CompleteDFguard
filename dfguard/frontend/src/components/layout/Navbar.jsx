import { useState }                        from 'react';
import { Link, useNavigate, useLocation }  from 'react-router-dom';
import { Shield, Menu, X, Coins, LogOut, LayoutDashboard, UserCircle, Sun, Moon } from 'lucide-react';
import { useAuth }    from '../../hooks/useAuth';
import { useCredits } from '../../hooks/useCredits';
import { useTheme }   from '../../context/ThemeContext';
import toast          from 'react-hot-toast';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { displayBalance }                = useCredits();
  const { theme, toggleTheme }            = useTheme();
  const [mobileOpen,  setMobileOpen]      = useState(false);
  const [profileOpen, setProfileOpen]     = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const navLinks = [
    { to: '/',         label: 'Platform' },
    { to: '/features', label: 'Models'   },
    { to: '/pricing',  label: 'Pricing'  }
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <nav className="fixed w-full top-0 md:top-5 z-50 flex justify-center px-0 md:px-6">
      <div
        className="w-full max-w-6xl py-3 px-6 md:px-8 flex justify-between items-center md:rounded-full"
        style={{
          background: 'rgba(5, 8, 20, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(34,211,238,0.1)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(34,211,238,0.04)'
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 z-[60]">
          <div className="w-8 h-8 rounded-xl ai-gradient-bg flex items-center justify-center shadow-glow-cyan">
            <Shield className="text-white w-4 h-4" />
          </div>
          <span className="font-display font-bold text-lg tracking-wide">
            DF<span className="text-brand-cyan">Guard</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-slate-400">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative hover:text-white transition-colors group ${isActive(link.to) ? 'text-white' : ''}`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-px bg-gradient-to-r from-brand-cyan to-brand-violet transition-all duration-300
                ${isActive(link.to) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Credits badge */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(34,211,238,0.07)',
                  border: '1px solid rgba(34,211,238,0.18)'
                }}
              >
                <Coins className="w-3.5 h-3.5 text-brand-cyan" />
                <span className="text-[11px] font-bold text-brand-cyan mono">{displayBalance}</span>
              </div>

              {/* Profile button */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="w-9 h-9 rounded-full p-0.5 overflow-hidden"
                  style={{ border: '1.5px solid rgba(34,211,238,0.35)', boxShadow: '0 0 12px rgba(34,211,238,0.15)' }}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=${user?.username}`}
                    className="rounded-full w-full h-full"
                    style={{ background: 'rgba(34,211,238,0.1)' }}
                    alt="Profile"
                  />
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 top-12 w-56 p-5 rounded-2xl z-[60] animate-fade-up"
                    style={{
                      background: 'rgba(10,15,30,0.95)',
                      border: '1px solid rgba(34,211,238,0.12)',
                      backdropFilter: 'blur(24px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,211,238,0.06)'
                    }}
                  >
                    <p className="font-bold text-white text-sm truncate">
                      {user?.username?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-[10px] text-brand-cyan font-bold uppercase tracking-widest mt-1 mono">
                      {user?.plan === 'pro' ? 'Pro Guardian' : 'Free Tier'}
                    </p>
                    <hr className="border-white/5 my-3" />
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 text-xs text-slate-300 hover:text-brand-cyan transition-colors mb-3"
                      onClick={() => setProfileOpen(false)}
                    >
                      <LayoutDashboard className="w-3 h-3" /> Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 text-xs text-slate-300 hover:text-brand-cyan transition-colors mb-3"
                      onClick={() => setProfileOpen(false)}
                    >
                      <UserCircle className="w-3 h-3" /> Profile
                    </Link>
                    <button
                      onClick={() => { toggleTheme(); setProfileOpen(false); }}
                      className="w-full text-left text-xs text-slate-300 hover:text-brand-cyan flex items-center gap-2 transition-colors mb-3"
                    >
                      {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-xs text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3 h-3" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-medium px-4 py-2 text-slate-300 hover:text-brand-cyan transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="ai-gradient-bg px-5 py-2 rounded-full text-xs font-bold hover:scale-105 hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20"
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="md:hidden z-[60] text-white p-2"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`
        fixed inset-0 z-50 flex flex-col items-center justify-center gap-8
        transition-transform duration-500 md:hidden bg-grid
        ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
        style={{ background: 'rgba(5,8,20,0.97)' }}
      >
        <div className="glow-orb w-[400px] h-[400px] bg-cyan-500/10 top-[-50px] left-[-100px]" />

        <div className="flex flex-col items-center gap-7 text-2xl font-display font-bold relative z-10">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`transition-colors ${isActive(link.to) ? 'text-gradient' : 'text-slate-400 hover:text-white'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="h-px w-24 bg-gradient-to-r from-brand-cyan/30 to-brand-violet/30" />

        <div className="flex flex-col items-center gap-4 w-full px-12 relative z-10">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="ai-gradient-bg w-full text-center py-3 rounded-full font-bold text-sm"
              >
                Enter Vault
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-3 rounded-full text-sm border border-brand-cyan/20 text-brand-cyan flex items-center justify-center gap-2"
              >
                <UserCircle className="w-4 h-4" /> Profile
              </Link>
              <button
                onClick={() => { toggleTheme(); setMobileOpen(false); }}
                className="w-full text-center py-3 rounded-full text-sm border border-white/10 text-slate-300 flex items-center justify-center gap-2"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={handleLogout} className="text-red-400 text-xs mt-2">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="ai-gradient-bg w-full text-center py-3 rounded-full font-bold text-sm shadow-lg shadow-cyan-500/20"
              >
                Sign Up Free
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-3 rounded-full text-sm border border-brand-cyan/20 text-brand-cyan"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
