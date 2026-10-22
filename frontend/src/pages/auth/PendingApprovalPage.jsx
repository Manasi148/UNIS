import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, LogOut, CheckCircle2, Building, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import logoImg from '../../assets/logo.png';

export function PendingApprovalPage() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleRefresh = async () => {
    try {
      setChecking(true);
      setStatusMessage('');
      const updated = await refreshUser();
      if (updated && updated.approvalStatus === 'APPROVED') {
        setStatusMessage('Your account has been approved! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1200);
      } else {
        setStatusMessage('Your application is still under review by your department administration.');
      }
    } catch (e) {
      setStatusMessage('Unable to check status right now. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const departmentDisplay = user?.departmentName || user?.departmentRequested || 'Department Pending Verification';

  return (
    <div className="min-h-screen bg-unis-bg dark:bg-unis-dark-bg text-unis-ink dark:text-unis-dark-text flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-3">
          <img src={logoImg} alt="UNIS Logo" className="w-10 h-10 object-contain shrink-0" />
          <div className="text-left">
            <h1 className="font-extrabold text-xl tracking-tight text-unis-navy dark:text-unis-dark-text">
              UNIS
            </h1>
            <p className="text-[10px] text-unis-slate dark:text-unis-dark-muted font-medium tracking-wide">
              Unified Network for Institutional Service
            </p>
          </div>
        </div>

        {/* Main Status Card */}
        <Card className="p-6 sm:p-8 space-y-6 border border-unis-border dark:border-unis-dark-border shadow-elevated dark:shadow-dark-elevated text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-subtle animate-pulse-subtle">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              Registration Status: PENDING
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-unis-ink dark:text-unis-dark-text">
              Account Pending Departmental Approval
            </h2>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted max-w-md mx-auto leading-relaxed">
              Welcome, <span className="font-semibold text-unis-ink dark:text-unis-dark-text">{user?.fullName || 'Student'}</span>! Your registration has been submitted and securely stored. Before accessing ticketing, claims, and institutional services, an authorized department head or administrator must verify your enrollment.
            </p>
          </div>

          {/* Student metadata review box */}
          <div className="bg-stone-50/80 dark:bg-unis-dark-elevated/50 rounded-xl p-4 border border-unis-border dark:border-unis-dark-border text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-unis-slate dark:text-unis-dark-muted flex items-center gap-1.5 font-medium">
                <Building className="w-3.5 h-3.5" /> Department:
              </span>
              <span className="font-semibold text-unis-ink dark:text-unis-dark-text">
                {departmentDisplay}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-unis-slate dark:text-unis-dark-muted flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5" /> Login Identifier:
              </span>
              <span className="font-semibold text-unis-ink dark:text-unis-dark-text">
                {user?.email}
              </span>
            </div>
            {user?.institutionalEmail && (
              <div className="flex items-center justify-between">
                <span className="text-unis-slate dark:text-unis-dark-muted flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5" /> Institutional Email:
                </span>
                <span className="font-semibold text-unis-ink dark:text-unis-dark-text">
                  {user?.institutionalEmail}
                </span>
              </div>
            )}
          </div>

          {/* Status Message Notification */}
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs font-medium border animate-fade-in ${
              statusMessage.includes('approved')
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
            }`}>
              {statusMessage}
            </div>
          )}

          {/* Institutional support & policy explanation */}
          <div className="p-3.5 rounded-xl bg-unis-blue-light/60 dark:bg-unis-dark-highlight border border-unis-border dark:border-unis-dark-border text-[11px] text-unis-slate dark:text-unis-dark-muted flex items-start gap-2.5 text-left">
            <ShieldAlert className="w-4 h-4 text-unis-brand shrink-0 mt-0.5" />
            <span>
              Restricted Mode Active: Students cannot create incident tickets, file property claims, or browse targeted institutional queues until their department head approves their account.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              onClick={handleRefresh}
              loading={checking}
              icon={RefreshCw}
              className="flex-1 py-2.5 bg-unis-brand hover:bg-unis-indigo text-white shadow-subtle text-xs"
            >
              Check Approval Status
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
              icon={LogOut}
              className="py-2.5 text-xs text-unis-slate hover:text-rose-600 dark:text-unis-dark-muted dark:hover:text-rose-400"
            >
              Sign Out
            </Button>
          </div>
        </Card>

        {/* Small footer */}
        <p className="text-center text-[11px] text-unis-slate/70 dark:text-unis-dark-muted/70">
          Need urgent assistance? Please reach out to your department coordinator or campus registrar.
        </p>
      </div>
    </div>
  );
}
