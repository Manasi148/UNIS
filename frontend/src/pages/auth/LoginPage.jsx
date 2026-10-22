import React, { useState } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  LogIn,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  Building2,
  Ticket,
  GraduationCap,
  Lock,
  Sun,
  Moon,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import logoImg from '../../assets/logo.png';

// Generic error message — matches backend constant to prevent account enumeration.
const GENERIC_AUTH_ERROR =
  'Unable to sign in with the provided credentials. Check your details and try again.';

export function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode is controlled via query param ?mode=admin; student mode is the strict default
  const isAdminMode = searchParams.get('mode') === 'admin';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin access request modal state
  const [showAdminRequestModal, setShowAdminRequestModal] = useState(false);
  const [adminRequestSubmitted, setAdminRequestSubmitted] = useState(false);
  const [adminRequestData, setAdminRequestData] = useState({
    fullName: '',
    email: '',
    department: '',
    reason: ''
  });
  const [adminRequestError, setAdminRequestError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const toggleLoginMode = () => {
    setError('');
    setIdentifier('');
    setPassword('');
    if (isAdminMode) {
      setSearchParams({});
    } else {
      setSearchParams({ mode: 'admin' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError(
        isAdminMode
          ? 'Please enter your administrator email and password.'
          : 'Please enter your student email or username along with your password.'
      );
      return;
    }

    try {
      setLoading(true);
      setError('');
      const loginMode = isAdminMode ? 'ADMIN' : 'STUDENT';
      const user = await login(identifier.trim(), password, loginMode);

      if (user?.role === 'STUDENT' && user?.approvalStatus === 'PENDING') {
        navigate('/pending-approval', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(GENERIC_AUTH_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRequestSubmit = (e) => {
    e.preventDefault();
    if (!adminRequestData.fullName.trim() || !adminRequestData.email.trim() || !adminRequestData.reason.trim()) {
      setAdminRequestError('Please fill out all required fields.');
      return;
    }
    setAdminRequestError('');
    setAdminRequestSubmitted(true);
  };

  const resetAdminRequestModal = () => {
    setShowAdminRequestModal(false);
    setAdminRequestSubmitted(false);
    setAdminRequestData({ fullName: '', email: '', department: '', reason: '' });
    setAdminRequestError('');
  };

  return (
    <div className="w-full min-h-[100dvh] grid grid-cols-1 lg:grid-cols-[44%_56%] bg-unis-card dark:bg-unis-dark-bg text-unis-ink dark:text-unis-dark-text animate-fade-in">

      {/* ── LEFT PANEL: Enterprise Brand Identity (Blue-Indigo-Violet) ──── */}
      <div className="brand-unselectable select-none relative bg-gradient-to-br from-[#18264B] via-[#315FEA] to-[#5946D8] p-8 sm:p-12 xl:p-16 text-white flex flex-col justify-between overflow-hidden min-h-[340px] lg:min-h-[100dvh]">
        {/* Background ambient accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8465ED]/20 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

        {/* Brand identity header: Logo + Product Name + Full Form directly beneath UNIS */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white p-2.5 shadow-lg flex items-center justify-center shrink-0">
              <img
                src={logoImg}
                alt="UNIS Official Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-3xl sm:text-4xl tracking-tight text-white block leading-none">
                UNIS
              </span>
              <span className="text-xs sm:text-sm text-blue-100 font-medium tracking-tight mt-1.5 block">
                Unified Network for Institutional Service
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h1 className="text-xl sm:text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-snug">
              {isAdminMode ? 'Institutional Governance & Access Control' : 'Campus Service Operations Platform'}
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed font-normal max-w-md">
              {isAdminMode
                ? 'Centralized administrative controls, multi-admin governance, and institutional facilities oversight.'
                : 'Connecting students, academic departments, and campus administration through a unified service operations network.'}
            </p>
          </div>
        </div>

        {/* Feature Highlights in Brand Panel */}
        <div className="relative z-10 my-8 space-y-3.5 max-w-md">
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-blue-50">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              {isAdminMode ? <Shield className="w-4 h-4 text-white" /> : <Ticket className="w-4 h-4 text-white" />}
            </div>
            <div>
              <p className="font-bold text-white text-xs">
                {isAdminMode ? 'Administrator Governance' : 'Intelligent Helpdesk'}
              </p>
              <p className="text-[11px] text-blue-100/80">
                {isAdminMode ? 'Strict 5-admin quota & unanimous removal approval' : 'Automated ticket routing and SLA escalation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-blue-50">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">Departmental Verification</p>
              <p className="text-[11px] text-blue-100/80">Scoped student approvals and departmental isolation</p>
            </div>
          </div>
        </div>

        {/* Bottom Panel Note */}
        <div className="relative z-10 pt-4 border-t border-white/15 text-[11px] text-blue-100/75 flex items-center justify-between">
          <span>Protected Institutional Network</span>
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <Lock className="w-3.5 h-3.5 text-blue-200" />
            {isAdminMode ? 'Role: ADMIN' : 'Role: STUDENT'}
          </span>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form & Top Navigation Controls ───────────── */}
      <div className="relative p-6 sm:p-10 xl:p-16 flex flex-col justify-between min-h-[100dvh] overflow-y-auto">

        {/* ── Upper-Right Aligned Controls (Theme Toggle & Login Mode) ─────── */}
        <div className="w-full flex items-center justify-end gap-2.5 mb-6 sm:mb-8 shrink-0">
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-unis-border dark:border-unis-dark-border bg-unis-card dark:bg-unis-dark-card text-unis-slate hover:text-unis-ink dark:text-unis-dark-muted dark:hover:text-unis-dark-text shadow-subtle transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-unis-brand/40"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 stroke-[2]" />
            ) : (
              <Moon className="w-4 h-4 text-unis-brand stroke-[2]" />
            )}
          </button>

          {/* Student Login / Administrator Login Toggle */}
          <button
            type="button"
            onClick={toggleLoginMode}
            className="h-9 px-3.5 inline-flex items-center gap-2 rounded-xl text-xs font-semibold border border-unis-border dark:border-unis-dark-border bg-unis-card dark:bg-unis-dark-card text-unis-slate hover:text-unis-brand dark:hover:text-unis-dark-brand shadow-subtle transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-unis-brand/40"
            title={isAdminMode ? 'Switch to Student Portal' : 'Switch to Administrator Access'}
            aria-label={isAdminMode ? 'Switch to Student Portal' : 'Switch to Administrator Access'}
          >
            {isAdminMode ? (
              <>
                <GraduationCap className="w-4 h-4 text-unis-brand shrink-0" />
                <span>Student Login</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-unis-indigo shrink-0" />
                <span>Admin Login</span>
              </>
            )}
          </button>
        </div>

        {/* ── Center: Login Form Content ─────────────────────────────────── */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">

          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-unis-brand dark:bg-unis-dark-highlight dark:text-unis-dark-brand">
              {isAdminMode ? 'Administrative Gateway' : 'Student Services Portal'}
            </div>
            <h2 className="text-2xl xl:text-3xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
              {isAdminMode ? 'Sign In to Administrator Access' : 'Sign in to Your Account'}
            </h2>
            <p className="text-sm text-unis-slate dark:text-unis-dark-muted">
              {isAdminMode
                ? 'Enter verified administrator credentials to access system governance'
                : 'Enter your account credentials to access UNIS student services'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1.5">
                {isAdminMode ? 'Administrator Email' : 'Email or Username'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 inset-y-0 flex items-center pointer-events-none text-unis-slate/60">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isAdminMode ? 'Enter administrator email' : 'e.g. rahul@example.com'}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand dark:focus:ring-unis-dark-brand focus:bg-white dark:focus:bg-unis-dark-card transition-all"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text">
                  Password <span className="text-rose-500">*</span>
                </label>
                <Link
                  to="/dev-reset-password"
                  className="text-[11px] font-semibold text-unis-brand dark:text-unis-dark-brand hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 inset-y-0 flex items-center pointer-events-none text-unis-slate/60">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand dark:focus:ring-unis-dark-brand focus:bg-white dark:focus:bg-unis-dark-card transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 inset-y-0 my-auto h-7 w-7 flex items-center justify-center rounded-lg text-unis-slate/60 hover:text-unis-ink dark:hover:text-unis-dark-text transition-colors focus:outline-none focus:ring-1 focus:ring-unis-brand"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-unis-brand to-unis-indigo hover:from-unis-brand/95 hover:to-unis-indigo/95 text-white font-bold rounded-xl shadow-elevated text-sm transition-all active:scale-[0.99]"
              icon={LogIn}
            >
              Sign in
            </Button>
          </form>

          {/* Bottom context links */}
          {isAdminMode ? (
            <div className="pt-4 border-t border-unis-border dark:border-unis-dark-border text-center text-xs text-unis-slate dark:text-unis-dark-muted">
              Need administrator access?{' '}
              <button
                type="button"
                onClick={() => setShowAdminRequestModal(true)}
                className="text-unis-brand dark:text-unis-dark-brand font-bold hover:underline"
              >
                Register as an administrator
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-unis-border dark:border-unis-dark-border text-center text-xs text-unis-slate dark:text-unis-dark-muted">
              New university student?{' '}
              <Link
                to="/register"
                className="text-unis-brand dark:text-unis-dark-brand font-bold hover:underline"
              >
                Register for Student Services
              </Link>
            </div>
          )}
        </div>

        {/* ── Footer note ─────────────────────────────────────────────────── */}
        <div className="pt-4 text-center text-[11px] text-unis-slate/70 dark:text-unis-dark-muted/70 shrink-0">
          UNIS Enterprise Operations &bull; Institutional Authentication Portal
        </div>
      </div>

      {/* ── Administrator Access Request Modal ──────────────────────────── */}
      {showAdminRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg rounded-2xl border border-unis-border dark:border-unis-dark-border bg-unis-card dark:bg-unis-dark-card shadow-elevated p-6 space-y-4 text-left relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
          >
            <button
              onClick={resetAdminRequestModal}
              className="absolute top-4 right-4 p-1 rounded-lg text-unis-slate hover:text-unis-ink dark:hover:text-unis-dark-text transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {!adminRequestSubmitted ? (
              <>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-unis-indigo dark:bg-unis-dark-highlight dark:text-unis-dark-brand">
                    <Shield className="w-3 h-3" />
                    Institutional Governance
                  </div>
                  <h3 id="admin-modal-title" className="text-xl font-bold text-unis-ink dark:text-unis-dark-text tracking-tight">
                    Request Administrator Access
                  </h3>
                  <p className="text-xs text-unis-slate dark:text-unis-dark-muted leading-relaxed">
                    Under UNIS governance rules, administrator accounts are restricted to institutional administrators (max 5 active quota). Self-registration is strictly prohibited; submitting this request records a pending access request for administrative review.
                  </p>
                </div>

                {adminRequestError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                    {adminRequestError}
                  </div>
                )}

                <form onSubmit={handleAdminRequestSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={adminRequestData.fullName}
                      onChange={(e) => setAdminRequestData({ ...adminRequestData, fullName: e.target.value })}
                      placeholder="e.g. Dr. Rajesh Sharma"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                      Official Institutional Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={adminRequestData.email}
                      onChange={(e) => setAdminRequestData({ ...adminRequestData, email: e.target.value })}
                      placeholder="e.g. rajesh.admin@unis.edu"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                      Department or Administrative Office
                    </label>
                    <input
                      type="text"
                      value={adminRequestData.department}
                      onChange={(e) => setAdminRequestData({ ...adminRequestData, department: e.target.value })}
                      placeholder="e.g. Central Campus Administration / IT Services"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                      Reason & Justification for Admin Privileges <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={adminRequestData.reason}
                      onChange={(e) => setAdminRequestData({ ...adminRequestData, reason: e.target.value })}
                      placeholder="Explain the administrative responsibilities requiring institutional privileges..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand"
                      required
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={resetAdminRequestModal}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-unis-border dark:border-unis-dark-border text-unis-slate hover:text-unis-ink dark:hover:text-unis-dark-text"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-unis-brand to-unis-indigo text-white shadow-subtle"
                      icon={FileText}
                    >
                      Submit Access Request
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="py-4 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-unis-ink dark:text-unis-dark-text">
                    Access Request Submitted
                  </h3>
                  <p className="text-xs text-unis-slate dark:text-unis-dark-muted max-w-sm mx-auto leading-relaxed">
                    Your request for administrator privileges has been recorded for review by the institutional administration. Authorized administrators will verify your credentials and provision access if approved.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-unis-dark-elevated border border-unis-border dark:border-unis-dark-border text-[11px] text-unis-slate dark:text-unis-dark-muted text-left">
                  <p><span className="font-semibold text-unis-ink dark:text-unis-dark-text">Applicant:</span> {adminRequestData.fullName}</p>
                  <p><span className="font-semibold text-unis-ink dark:text-unis-dark-text">Email:</span> {adminRequestData.email}</p>
                  <p><span className="font-semibold text-unis-ink dark:text-unis-dark-text">Status:</span> Pending Administrative Review</p>
                </div>
                <Button
                  onClick={resetAdminRequestModal}
                  className="w-full py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-unis-brand to-unis-indigo text-white shadow-subtle"
                >
                  Return to Administrator Login
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
