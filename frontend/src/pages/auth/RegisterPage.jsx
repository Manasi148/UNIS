import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserPlus,
  Mail,
  Building,
  Check,
  Circle,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { CustomSelect } from '../../components/common/CustomSelect';
import logoImg from '../../assets/logo.png';

// Canonical approved university engineering departments, sorted alphabetically.
// Custom "Other" registration is strictly prohibited.
export const APPROVED_DEPARTMENTS = [
  'Artificial Intelligence and Data Science',
  'Civil Engineering',
  'Computer Engineering',
  'Computer Technology',
  'Electrical Engineering',
  'Electronics and Telecommunication Engineering',
  'Information Technology',
  'Mechanical Engineering'
];

export function RegisterPage() {
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    institutionalEmail: '',
    studentId: '',
    phone: '',
    department: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  // Live password validation checklist
  const passwordChecks = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    symbol: /[^a-zA-Z0-9\s]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleDepartmentChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      department: val,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError('Please provide your full name and account login email.');
      return;
    }

    if (!formData.department) {
      setError('Department selection is compulsory. Please select your academic department.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet the security policy requirements listed below.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify both password entries.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        institutionalEmail: formData.institutionalEmail.trim() ? formData.institutionalEmail.trim().toLowerCase() : null,
        studentId: formData.studentId.trim() || null,
        phone: formData.phone.trim() || null,
        department: formData.department,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const res = await register(payload);
      if (res.success && res.data) {
        setCreatedUser(res.data);
        setSuccessModalOpen(true);
      } else {
        throw new Error(res.message || 'Registration could not be completed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[100dvh] grid grid-cols-1 lg:grid-cols-[44%_56%] bg-unis-card dark:bg-unis-dark-bg text-unis-ink dark:text-unis-dark-text animate-fade-in">
      
      {/* ── LEFT PANEL: Enterprise Brand Information ─────────────────────── */}
      <div className="brand-unselectable select-none relative bg-gradient-to-br from-[#18264B] via-[#315FEA] to-[#5946D8] p-8 sm:p-12 xl:p-16 text-white flex flex-col justify-between overflow-hidden min-h-[340px] lg:min-h-[100dvh]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8465ED]/20 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

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
              Student Registration & Profile Setup
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed font-normal max-w-md">
              Register your student profile to connect with your academic department, submit campus maintenance tickets, and track facilities resolutions.
            </p>
          </div>
        </div>

        <div className="relative z-10 my-6 space-y-3.5 max-w-md">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-blue-50">
            <p className="font-bold text-white text-xs">Department Verification</p>
            <p className="text-[11px] text-blue-100/80 mt-0.5">
              Select your enrolled engineering department from the approved canonical list. Your department head will verify and approve your registration.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-blue-50">
            <p className="font-bold text-white text-xs">Flexible Login Identifier</p>
            <p className="text-[11px] text-blue-100/80 mt-0.5">
              Use your primary email address for sign-in. Institutional roll numbers and emails can be provided optionally.
            </p>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/15 text-[11px] text-blue-100/75 flex items-center justify-between">
          <span>Student Security Protocol</span>
          <span className="font-semibold text-white">Role: STUDENT</span>
        </div>
      </div>

      {/* ── RIGHT PANEL: Modern Registration Form ────────────────────────── */}
      <div className="relative p-6 sm:p-10 xl:p-14 flex flex-col justify-between min-h-[100dvh] overflow-y-auto">

        {/* Upper-Right Theme Toggle */}
        <div className="w-full flex items-center justify-end mb-4 shrink-0">
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
        </div>

        <div className="max-w-md w-full mx-auto my-auto space-y-4 text-left">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-unis-brand dark:bg-unis-dark-highlight dark:text-unis-dark-brand mb-1">
              New Student Onboarding
            </div>
            <h2 className="text-2xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
              Create Student Profile
            </h2>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
              Select your academic department and provide your university details below
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand dark:focus:ring-unis-dark-brand focus:bg-white dark:focus:bg-unis-dark-card transition-all"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Primary Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 inset-y-0 flex items-center pointer-events-none text-unis-slate/60">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. aarav.sharma@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand dark:focus:ring-unis-dark-brand focus:bg-white dark:focus:bg-unis-dark-card transition-all"
                  required
                />
              </div>
            </div>

            {/* Department Selection (Alphabetical, Only 8 Approved Departments) */}
            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Academic Department <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                name="department"
                value={formData.department}
                onChange={handleDepartmentChange}
                options={APPROVED_DEPARTMENTS}
                placeholder="Select your department"
                icon={Building}
              />
            </div>

            {/* Institutional Email (Optional) & Roll Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                  Institutional Email <span className="text-[10px] font-normal text-unis-slate">(Optional)</span>
                </label>
                <input
                  type="email"
                  name="institutionalEmail"
                  value={formData.institutionalEmail}
                  onChange={handleChange}
                  placeholder="e.g. aarav@student.unis.edu"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                  Student ID / Roll No <span className="text-[10px] font-normal text-unis-slate">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. STU-2026-0142"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand transition-all"
                />
              </div>
            </div>

            {/* Passwords with Centered Eye Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand transition-all"
                    required
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

              <div>
                <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 inset-y-0 my-auto h-7 w-7 flex items-center justify-center rounded-lg text-unis-slate/60 hover:text-unis-ink dark:hover:text-unis-dark-text transition-colors focus:outline-none focus:ring-1 focus:ring-unis-brand"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Password Requirements Checklist */}
            <div className="p-3 rounded-xl bg-stone-50/80 dark:bg-unis-dark-elevated/50 border border-unis-border dark:border-unis-dark-border space-y-1.5 text-[11px]">
              <span className="font-semibold text-unis-slate dark:text-unis-dark-muted block">
                Password Requirements:
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <div className={`flex items-center gap-1.5 ${passwordChecks.length ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-unis-slate/70 dark:text-unis-dark-muted/70'}`}>
                  {passwordChecks.length ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3 h-3 shrink-0" />}
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.upper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-unis-slate/70 dark:text-unis-dark-muted/70'}`}>
                  {passwordChecks.upper ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3 h-3 shrink-0" />}
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.lower ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-unis-slate/70 dark:text-unis-dark-muted/70'}`}>
                  {passwordChecks.lower ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3 h-3 shrink-0" />}
                  <span>One lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.number ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-unis-slate/70 dark:text-unis-dark-muted/70'}`}>
                  {passwordChecks.number ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3 h-3 shrink-0" />}
                  <span>One number</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.symbol ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-unis-slate/70 dark:text-unis-dark-muted/70'}`}>
                  {passwordChecks.symbol ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3 h-3 shrink-0" />}
                  <span>One symbol</span>
                </div>
                {formData.confirmPassword && (
                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-500 font-medium'}`}>
                    {passwordsMatch ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3 h-3 shrink-0" />}
                    <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-unis-brand to-unis-indigo hover:from-unis-brand/95 hover:to-unis-indigo/95 text-white font-bold rounded-xl shadow-elevated text-xs transition-all active:scale-[0.99]"
              icon={UserPlus}
            >
              {loading ? 'Creating account...' : 'Complete registration'}
            </Button>
          </form>

          <div className="pt-3 border-t border-unis-border dark:border-unis-dark-border text-center text-xs text-unis-slate dark:text-unis-dark-muted">
            Already registered?{' '}
            <Link
              to="/login"
              className="text-unis-brand dark:text-unis-dark-brand font-bold hover:underline"
            >
              Sign In to Your Workspace
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <div className="pt-4 text-center text-[11px] text-unis-slate/70 dark:text-unis-dark-muted/70 shrink-0">
          UNIS Enterprise Operations &bull; Student Onboarding
        </div>
      </div>

      {/* Registration Success Modal */}
      {successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl overflow-hidden border border-unis-border dark:border-unis-dark-border shadow-elevated dark:shadow-dark-elevated bg-unis-card dark:bg-unis-dark-card p-6 sm:p-8 text-center space-y-5 animate-scale-up">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-subtle">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
                Registration submitted successfully
              </h3>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted leading-relaxed">
                Your account has been created and is awaiting approval from your department head or an administrator. You'll be able to access student services once your account is approved.
              </p>
            </div>

            <div className="bg-stone-50 dark:bg-unis-dark-elevated/60 p-3.5 rounded-2xl border border-unis-border dark:border-unis-dark-border text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-unis-slate dark:text-unis-dark-muted">Student Name:</span>
                <span className="font-bold text-unis-ink dark:text-unis-dark-text">
                  {createdUser?.fullName || formData.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-unis-slate dark:text-unis-dark-muted">Login Identifier:</span>
                <span className="font-bold text-unis-ink dark:text-unis-dark-text">
                  {createdUser?.email || formData.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-unis-slate dark:text-unis-dark-muted">Department:</span>
                <span className="font-bold text-unis-ink dark:text-unis-dark-text">
                  {formData.department}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-unis-slate dark:text-unis-dark-muted">Status:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">PENDING APPROVAL</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-gradient-to-r from-unis-brand to-unis-indigo text-white font-bold text-xs shadow-elevated rounded-xl"
                icon={ArrowRight}
              >
                Go to login
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
