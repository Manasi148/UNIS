import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowLeft, Sun, Moon } from 'lucide-react';
import api from '../../api/client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useTheme } from '../../context/ThemeContext';

export function DevResetPasswordPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !newPassword) {
      setError('Please provide your institutional email and new password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');
      const res = await api.post('/api/auth/dev-reset-password', {
        email: email.trim(),
        newPassword,
      });
      setMessage(res.message || 'Password updated successfully. You can now log in.');
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
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

      <div className="w-full max-w-md">
        <Card className="shadow-elevated dark:shadow-dark-elevated">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-unis-ink dark:text-unis-dark-text tracking-tight">
              Development Password Reset
            </h2>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted mt-1.5">
              Reset credentials instantly for offline viva demonstration
            </p>
          </div>

          {message && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span>{message}</span>
                <div className="mt-2">
                  <Link
                    to="/login"
                    className="font-semibold underline hover:text-emerald-800"
                  >
                    Proceed to Login →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-unis-ink dark:text-unis-dark-text mb-1">
                Registered Institutional Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 inset-y-0 flex items-center pointer-events-none text-unis-slate/60">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@unis.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand dark:focus:ring-unis-dark-brand transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-unis-ink dark:text-unis-dark-text mb-1">
                New Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 inset-y-0 flex items-center pointer-events-none text-unis-slate/60">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand dark:focus:ring-unis-dark-brand transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-unis-brand to-unis-indigo text-white font-bold rounded-xl"
              icon={KeyRound}
            >
              Reset Password
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-unis-slate dark:text-unis-dark-muted">
            <Link
              to="/login"
              className="text-unis-brand dark:text-unis-dark-brand font-semibold hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
