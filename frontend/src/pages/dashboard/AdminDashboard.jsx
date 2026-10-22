import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Ticket,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Building2,
  PackageSearch,
  UserCheck,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  FileText,
  Calendar,
  Tag,
  Check,
  X,
  PlusCircle,
  Layers,
  ShieldAlert,
  Inbox
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const BRAND_CHART_COLORS = ['#315FEA', '#5946D8', '#8465ED', '#7293FF', '#9281FF', '#21845A', '#E06A3B'];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);

  // Pending approval quick action state
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, student: null, reason: '' });
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, catRes, deptRes] = await Promise.all([
        client.get('/analytics/overview'),
        client.get('/analytics/categories').catch(() => ({ data: [] })),
        client.get('/analytics/departments').catch(() => ({ data: [] })),
      ]);

      setOverview(overviewRes.data || {});
      setCategoryData(catRes.data || []);
      setDepartmentData(deptRes.data || []);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      setError(err.message || 'Unable to load real-time administration telemetry. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (studentId) => {
    try {
      setActionLoadingId(studentId);
      await client.post(`/users/students/${studentId}/approve`);
      setFeedback({ type: 'success', message: 'Student registration approved successfully!' });
      fetchAdminAnalytics();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to approve student.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleQuickRejectConfirm = async () => {
    if (!rejectModal.student) return;
    try {
      setActionLoadingId(rejectModal.student.id);
      await client.post(
        `/users/students/${rejectModal.student.id}/reject?reason=${encodeURIComponent(rejectModal.reason)}`
      );
      setFeedback({ type: 'success', message: 'Student registration rejected.' });
      setRejectModal({ open: false, student: null, reason: '' });
      fetchAdminAnalytics();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to reject student.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[55vh]">
        <LoadingSpinner message="Querying live institutional databases for metrics and rosters..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 text-center space-y-4 bg-white dark:bg-unis-dark-card border border-rose-200 dark:border-rose-900/40 rounded-3xl shadow-subtle animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-unis-ink dark:text-unis-dark-text">Telemetry Retrieval Failed</h2>
        <p className="text-xs text-unis-slate dark:text-unis-dark-muted leading-relaxed">{error}</p>
        <Button onClick={fetchAdminAnalytics} icon={RefreshCw} className="bg-unis-brand text-white font-bold text-xs rounded-xl shadow-subtle">
          Retry Database Connection
        </Button>
      </div>
    );
  }

  // Data helpers
  const totalStudents = overview?.totalStudents || 0;
  const pendingStudents = overview?.pendingStudents || 0;
  const approvedStudents = overview?.approvedStudents || 0;
  const inactiveStudents = overview?.inactiveStudents || 0;

  const totalTickets = overview?.totalTickets || 0;
  const openOrInProgTickets = overview?.openOrInProgressTickets ?? ((overview?.openTickets || 0) + (overview?.inProgressTickets || 0));
  const openTickets = overview?.openTickets || 0;
  const inProgTickets = overview?.inProgressTickets || 0;
  const resolvedTickets = overview?.resolvedTickets || 0;
  const closedTickets = overview?.closedTickets || 0;

  const activeLost = overview?.activeLostItemsCount || 0;
  const activeFound = overview?.activeFoundItemsCount || 0;
  const totalActiveLostFound = overview?.totalActiveLostFoundCount ?? (activeLost + activeFound);
  const pendingClaims = overview?.pendingClaimsCount || 0;

  const recentPendingList = overview?.recentPendingStudents || [];
  const recentTicketsList = overview?.recentTickets || [];
  const recentLostFoundList = overview?.recentLostFound || [];

  // Ticket status chart data from real database counts
  const statusChartData = [
    { name: 'Submitted / Open', count: openTickets, color: '#315FEA' },
    { name: 'In Progress', count: inProgTickets, color: '#8465ED' },
    { name: 'Resolved', count: resolvedTickets, color: '#21845A' },
    { name: 'Closed', count: closedTickets, color: '#667085' },
  ].filter((d) => d.count > 0);

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold border flex items-center justify-between animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold underline ml-4 hover:opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Admin Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#18264B] via-[#315FEA] to-[#5946D8] text-white shadow-elevated border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-bold backdrop-blur-md border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            <span>Institution Administration Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Institutional Command & Service Governance
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Manage student access, monitor institutional services, and review outstanding requests from one place.
          </p>
        </div>

        {/* 4 Working Quick-Action Buttons */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link to="/admin/students?tab=pending">
            <Button className="bg-white text-unis-brand hover:bg-stone-50 font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-subtle">
              <Users className="w-4 h-4 mr-1.5" />
              Review Approvals
              {pendingStudents > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                  {pendingStudents}
                </span>
              )}
            </Button>
          </Link>

          <Link to="/tickets">
            <Button className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl border border-white/20 backdrop-blur-md">
              <Ticket className="w-4 h-4 mr-1.5" />
              View Tickets
            </Button>
          </Link>

          <Link to="/lost-found">
            <Button className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl border border-white/20 backdrop-blur-md">
              <PackageSearch className="w-4 h-4 mr-1.5" />
              Lost & Found
            </Button>
          </Link>

          <Link to="/admin/departments">
            <Button className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl border border-white/20 backdrop-blur-md">
              <Building2 className="w-4 h-4 mr-1.5" />
              Departments
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={fetchAdminAnalytics}
            icon={RefreshCw}
            className="border-white/30 text-white hover:bg-white/10 font-bold text-xs py-2.5 px-3 rounded-xl"
            title="Refresh database telemetry"
          />
        </div>
      </div>

      {/* 2. Key Metrics Cards (6 Real Database Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Total Students */}
        <Link to="/admin/students?tab=directory" className="block group">
          <Card className="p-4 sm:p-5 h-full border border-unis-border dark:border-unis-dark-border group-hover:border-unis-brand/40 transition-all hover:shadow-subtle rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                  Total Students
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-unis-ink dark:text-unis-dark-text mt-1 group-hover:text-unis-brand transition-colors">
                  {totalStudents}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-unis-blue-light dark:bg-unis-dark-highlight text-unis-brand flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-unis-slate dark:text-unis-dark-muted mt-3 pt-2 border-t border-unis-border/60 dark:border-unis-dark-border/60 flex items-center justify-between">
              <span>{approvedStudents} approved • {inactiveStudents} inactive</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-unis-brand" />
            </div>
          </Card>
        </Link>

        {/* Metric 2: Pending Student Approvals */}
        <Link to="/admin/students?tab=pending" className="block group">
          <Card className={`p-4 sm:p-5 h-full border transition-all hover:shadow-subtle rounded-2xl flex flex-col justify-between ${
            pendingStudents > 0
              ? 'border-amber-300 bg-amber-50/30 dark:border-amber-900/60 dark:bg-amber-950/20'
              : 'border-unis-border dark:border-unis-dark-border group-hover:border-unis-brand/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                  Pending Approvals
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-2xl sm:text-3xl font-extrabold ${pendingStudents > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-unis-ink dark:text-unis-dark-text'}`}>
                    {pendingStudents}
                  </p>
                  {pendingStudents > 0 && (
                    <span className="animate-pulse w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                pendingStudents > 0
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-stone-100 text-unis-slate dark:bg-unis-dark-elevated'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-unis-slate dark:text-unis-dark-muted mt-3 pt-2 border-t border-unis-border/60 dark:border-unis-dark-border/60 flex items-center justify-between">
              <span className={pendingStudents > 0 ? 'text-amber-700 dark:text-amber-300 font-bold' : ''}>
                {pendingStudents > 0 ? 'Requires verification' : 'Queue cleared'}
              </span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-unis-brand" />
            </div>
          </Card>
        </Link>

        {/* Metric 3: Total Helpdesk Tickets */}
        <Link to="/tickets" className="block group">
          <Card className="p-4 sm:p-5 h-full border border-unis-border dark:border-unis-dark-border group-hover:border-unis-brand/40 transition-all hover:shadow-subtle rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                  Total Tickets
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-unis-ink dark:text-unis-dark-text mt-1 group-hover:text-unis-brand transition-colors">
                  {totalTickets}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-unis-violet-light dark:bg-unis-dark-elevated text-unis-indigo flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-unis-slate dark:text-unis-dark-muted mt-3 pt-2 border-t border-unis-border/60 dark:border-unis-dark-border/60 flex items-center justify-between">
              <span>{resolvedTickets + closedTickets} resolved in total</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-unis-brand" />
            </div>
          </Card>
        </Link>

        {/* Metric 4: Open or In-Progress Tickets */}
        <Link to="/tickets" className="block group">
          <Card className={`p-4 sm:p-5 h-full border transition-all hover:shadow-subtle rounded-2xl flex flex-col justify-between ${
            openOrInProgTickets > 0
              ? 'border-unis-blue-light bg-unis-blue-light/10 dark:border-unis-dark-border'
              : 'border-unis-border dark:border-unis-dark-border group-hover:border-unis-brand/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                  Active Tickets
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-unis-brand mt-1">
                  {openOrInProgTickets}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-unis-blue-light dark:bg-unis-dark-highlight text-unis-brand flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-unis-slate dark:text-unis-dark-muted mt-3 pt-2 border-t border-unis-border/60 dark:border-unis-dark-border/60 flex items-center justify-between">
              <span>{openTickets} open • {inProgTickets} in progress</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-unis-brand" />
            </div>
          </Card>
        </Link>

        {/* Metric 5: Lost & Found Listings */}
        <Link to="/lost-found" className="block group">
          <Card className="p-4 sm:p-5 h-full border border-unis-border dark:border-unis-dark-border group-hover:border-unis-brand/40 transition-all hover:shadow-subtle rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                  Active Listings
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-unis-ink dark:text-unis-dark-text mt-1 group-hover:text-unis-brand transition-colors">
                  {totalActiveLostFound}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                <PackageSearch className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-unis-slate dark:text-unis-dark-muted mt-3 pt-2 border-t border-unis-border/60 dark:border-unis-dark-border/60 flex items-center justify-between">
              <span>{activeLost} lost • {activeFound} found</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-unis-brand" />
            </div>
          </Card>
        </Link>

        {/* Metric 6: Pending Item Claims */}
        <Link to="/lost-found?tab=claims" className="block group">
          <Card className={`p-4 sm:p-5 h-full border transition-all hover:shadow-subtle rounded-2xl flex flex-col justify-between ${
            pendingClaims > 0
              ? 'border-indigo-300 bg-indigo-50/30 dark:border-indigo-900/60 dark:bg-indigo-950/20'
              : 'border-unis-border dark:border-unis-dark-border group-hover:border-unis-brand/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                  Pending Claims
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-2xl sm:text-3xl font-extrabold ${pendingClaims > 0 ? 'text-unis-indigo' : 'text-unis-ink dark:text-unis-dark-text'}`}>
                    {pendingClaims}
                  </p>
                  {pendingClaims > 0 && (
                    <span className="w-2 h-2 rounded-full bg-unis-indigo animate-pulse" />
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-unis-violet-light dark:bg-unis-dark-elevated text-unis-indigo flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-unis-slate dark:text-unis-dark-muted mt-3 pt-2 border-t border-unis-border/60 dark:border-unis-dark-border/60 flex items-center justify-between">
              <span className={pendingClaims > 0 ? 'text-unis-indigo font-bold' : ''}>
                {pendingClaims > 0 ? 'Ownership review' : 'No claims waiting'}
              </span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-unis-brand" />
            </div>
          </Card>
        </Link>
      </div>

      {/* 3. Operational Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION A: Pending Student Approvals Preview (Col 7) */}
        <Card className="lg:col-span-7 p-5 sm:p-6 border border-unis-border dark:border-unis-dark-border rounded-2xl shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-unis-border dark:border-unis-dark-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-unis-ink dark:text-unis-dark-text">
                  Pending Student Registrations
                </h3>
                <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
                  New student applications requiring institutional access authorization
                </p>
              </div>
            </div>
            <Link
              to="/admin/students?tab=pending"
              className="text-xs font-bold text-unis-brand hover:underline flex items-center gap-1"
            >
              View all ({pendingStudents}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentPendingList.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-unis-ink dark:text-unis-dark-text">
                No student registrations waiting for approval.
              </p>
              <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted">
                All submitted registrations have been verified and processed.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-unis-border dark:divide-unis-dark-border">
              {recentPendingList.slice(0, 5).map((student) => (
                <div
                  key={student.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 dark:hover:bg-unis-dark-elevated/20 rounded-xl px-2 transition-colors"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-unis-ink dark:text-unis-dark-text truncate">
                        {student.fullName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        PENDING
                      </span>
                    </div>
                    <div className="text-[11px] text-unis-slate dark:text-unis-dark-muted flex items-center gap-2 flex-wrap">
                      <span>{student.email}</span>
                      <span>•</span>
                      <span>{student.departmentName || student.departmentRequested || 'General Enrollment'}</span>
                      <span>•</span>
                      <span>{new Date(student.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleQuickApprove(student.id)}
                      loading={actionLoadingId === student.id}
                      icon={Check}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-1 px-2.5 rounded-lg"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectModal({ open: true, student, reason: '' })}
                      icon={X}
                      className="border-rose-300 text-rose-600 hover:bg-rose-50 text-[11px] py-1 px-2 rounded-lg"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* SECTION D: Ticket Status Overview / Category Breakdown (Col 5) */}
        <Card className="lg:col-span-5 p-5 sm:p-6 border border-unis-border dark:border-unis-dark-border rounded-2xl shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-unis-border dark:border-unis-dark-border">
            <div>
              <h3 className="text-sm font-bold text-unis-ink dark:text-unis-dark-text">
                Ticket Status Overview
              </h3>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
                Live breakdown of helpdesk complaints by operational state
              </p>
            </div>
            <Link to="/tickets" className="text-xs font-bold text-unis-brand hover:underline">
              Tickets ({totalTickets})
            </Link>
          </div>

          {totalTickets === 0 ? (
            <div className="p-10 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-unis-dark-elevated text-unis-slate flex items-center justify-center mx-auto">
                <Ticket className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-unis-ink dark:text-unis-dark-text">
                No helpdesk tickets have been submitted yet.
              </p>
              <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted">
                Real status telemetry will populate here once issues are reported.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" fontSize={10} stroke="#667085" />
                    <YAxis allowDecimals={false} fontSize={10} stroke="#667085" />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {statusChartData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status Pills */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                  <span className="font-semibold text-blue-900 dark:text-blue-300">Open</span>
                  <span className="font-extrabold text-blue-700 dark:text-blue-200">{openTickets}</span>
                </div>
                <div className="p-2 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
                  <span className="font-semibold text-purple-900 dark:text-purple-300">In Progress</span>
                  <span className="font-extrabold text-purple-700 dark:text-purple-200">{inProgTickets}</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300">Resolved</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-200">{resolvedTickets}</span>
                </div>
                <div className="p-2 rounded-xl bg-stone-100 dark:bg-unis-dark-elevated border border-stone-200 dark:border-unis-dark-border flex items-center justify-between">
                  <span className="font-semibold text-stone-700 dark:text-unis-dark-text">Closed</span>
                  <span className="font-extrabold text-stone-900 dark:text-white">{closedTickets}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* SECTION B: Recent Helpdesk Activity (Col 7) */}
        <Card className="lg:col-span-7 p-5 sm:p-6 border border-unis-border dark:border-unis-dark-border rounded-2xl shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-unis-border dark:border-unis-dark-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-unis-blue-light dark:bg-unis-dark-highlight text-unis-brand flex items-center justify-center">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-unis-ink dark:text-unis-dark-text">
                  Recent Helpdesk Activity
                </h3>
                <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
                  Latest maintenance reports submitted by campus residents
                </p>
              </div>
            </div>
            <Link to="/tickets" className="text-xs font-bold text-unis-brand hover:underline flex items-center gap-1">
              All Tickets <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentTicketsList.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs font-bold text-unis-ink dark:text-unis-dark-text">
                No helpdesk tickets recorded in database.
              </p>
              <Link to="/tickets/new" className="inline-block text-xs font-bold text-unis-brand underline">
                Log first campus ticket
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-unis-border dark:divide-unis-dark-border">
              {recentTicketsList.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50/50 dark:hover:bg-unis-dark-elevated/20 rounded-xl px-2 transition-colors group block"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-unis-brand dark:text-unis-dark-brand">
                        {ticket.ticketReference}
                      </span>
                      <span className="font-bold text-xs text-unis-ink dark:text-unis-dark-text group-hover:text-unis-brand transition-colors truncate">
                        {ticket.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-unis-slate dark:text-unis-dark-muted flex items-center gap-2 flex-wrap">
                      <span>{ticket.departmentName || 'General Maintenance'}</span>
                      <span>•</span>
                      <span>Priority: {ticket.priority}</span>
                      <span>•</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : ticket.status === 'IN_PROGRESS'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                      }`}
                    >
                      {ticket.status}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-unis-slate group-hover:translate-x-1 group-hover:text-unis-brand transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* SECTION C: Lost & Found Overview (Col 5) */}
        <Card className="lg:col-span-5 p-5 sm:p-6 border border-unis-border dark:border-unis-dark-border rounded-2xl shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-unis-border dark:border-unis-dark-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <PackageSearch className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-unis-ink dark:text-unis-dark-text">
                  Lost & Found Overview
                </h3>
                <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
                  Campus property registry and ownership claims
                </p>
              </div>
            </div>
            <Link to="/lost-found" className="text-xs font-bold text-unis-brand hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
              <span className="block text-base font-extrabold text-amber-700 dark:text-amber-300">{activeLost}</span>
              <span className="text-[10px] font-bold text-unis-slate dark:text-unis-dark-muted">Lost Items</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <span className="block text-base font-extrabold text-emerald-700 dark:text-emerald-300">{activeFound}</span>
              <span className="text-[10px] font-bold text-unis-slate dark:text-unis-dark-muted">Found Items</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
              <span className="block text-base font-extrabold text-unis-indigo">{pendingClaims}</span>
              <span className="text-[10px] font-bold text-unis-slate dark:text-unis-dark-muted">Claims</span>
            </div>
          </div>

          {/* Recently Added Items */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-unis-slate dark:text-unis-dark-muted">
              Recently Reported Property
            </p>
            {recentLostFoundList.length === 0 ? (
              <div className="p-6 text-center text-xs text-unis-slate dark:text-unis-dark-muted">
                No lost-and-found listings have been reported yet.
              </div>
            ) : (
              <div className="divide-y divide-unis-border dark:divide-unis-dark-border">
                {recentLostFoundList.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    to={`/lost-found/${item.id}`}
                    className="py-2.5 flex items-center justify-between gap-2 hover:bg-stone-50/50 dark:hover:bg-unis-dark-elevated/20 rounded-xl px-1.5 transition-colors group block"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            item.itemType === 'FOUND'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          {item.itemType}
                        </span>
                        <span className="font-bold text-xs text-unis-ink dark:text-unis-dark-text group-hover:text-unis-brand truncate">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-unis-slate dark:text-unis-dark-muted truncate">
                        {item.category} • {item.locationName || item.locationDescription || 'Campus'} • {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-unis-slate group-hover:translate-x-1 group-hover:text-unis-brand transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* REJECTION REASON CONFIRMATION MODAL */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 border border-unis-border dark:border-unis-dark-border shadow-elevated">
            <h3 className="text-base font-extrabold text-unis-ink dark:text-unis-dark-text">
              Reject Student Registration
            </h3>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
              Rejecting <span className="font-bold">{rejectModal.student?.fullName}</span> will prevent access to institutional services.
            </p>
            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Reason for Rejection (Optional)
              </label>
              <textarea
                value={rejectModal.reason}
                onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g. Unverified enrollment or student ID mismatch"
                className="w-full p-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-rose-500 h-24"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModal({ open: false, student: null, reason: '' })}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleQuickRejectConfirm}
                loading={actionLoadingId === rejectModal.student?.id}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                Confirm Rejection
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
