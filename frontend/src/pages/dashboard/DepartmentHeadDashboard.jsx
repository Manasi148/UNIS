import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Flame,
  ShieldCheck,
  BarChart2,
  Ticket,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function DepartmentHeadDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unassigned: 0,
    inProgress: 0,
    overdue: 0,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, workloadRes, pendingRes] = await Promise.all([
        client.get('/tickets?size=25'),
        client.get('/analytics/workload'),
        client.get('/users/pending-students'),
      ]);

      const deptTickets = ticketsRes.data?.content || (Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
      setTickets(deptTickets);
      setWorkload(workloadRes.data || []);
      setPendingStudents(pendingRes.data || []);

      let unassignedCount = 0;
      let inProgCount = 0;
      let overdueCount = 0;

      deptTickets.forEach((t) => {
        if (!t.assignedStaffId || t.status === 'SUBMITTED') unassignedCount++;
        if (t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED') inProgCount++;
        if (t.overdue) overdueCount++;
      });

      setStats({
        total: deptTickets.length,
        unassigned: unassignedCount,
        inProgress: inProgCount,
        overdue: overdueCount,
      });
    } catch (err) {
      console.error('Failed to load department head dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStudent = async (studentId) => {
    try {
      setActionLoading(true);
      await client.post(`/users/students/${studentId}/approve`);
      setFeedback({ type: 'success', message: 'Student account approved successfully!' });
      // Refresh pending
      const pendingRes = await client.get('/users/pending-students');
      setPendingStudents(pendingRes.data || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Approval failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectStudent = async (studentId) => {
    try {
      setActionLoading(true);
      await client.post(`/users/students/${studentId}/reject`);
      setFeedback({ type: 'success', message: 'Student registration rejected.' });
      const pendingRes = await client.get('/users/pending-students');
      setPendingStudents(pendingRes.data || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Rejection failed' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner message="Loading departmental oversight & SLA statistics..." />
      </div>
    );
  }

  const unassignedList = tickets.filter(
    (t) => !t.assignedStaffId || t.status === 'SUBMITTED'
  );

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* 1. Header Banner (Blue-Indigo-Violet) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#18264B] via-[#315FEA] to-[#5946D8] text-white shadow-elevated border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-bold backdrop-blur-md border border-white/20">
            <Building2 className="w-3.5 h-3.5 text-blue-200" />
            <span>Departmental Operations</span>
            <span>•</span>
            <span className="text-white">{user?.departmentName || 'Engineering Department'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Department Leadership Portal — {user?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl">
            Oversee departmental helpdesk queues, approve incoming student registrations, track operational SLAs, and assign institutional service work.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/students">
            <Button className="bg-white text-unis-brand hover:bg-stone-50 font-bold text-xs py-2.5 px-4 shadow-subtle rounded-xl">
              <Users className="w-4 h-4 mr-1.5" />
              Manage Students
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={fetchDepartmentData}
            icon={RefreshCw}
            className="border-white/30 text-white hover:bg-white/10 font-bold text-xs py-2.5 px-4 rounded-xl"
          >
            Refresh
          </Button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between ${
          feedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
            : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="underline font-bold">Dismiss</button>
        </div>
      )}

      {/* 2. Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 border border-unis-border dark:border-unis-dark-border shadow-subtle">
          <p className="text-xs font-bold text-unis-slate dark:text-unis-dark-muted uppercase">Department Tickets</p>
          <p className="text-3xl font-extrabold text-unis-ink dark:text-unis-dark-text mt-1">{stats.total}</p>
          <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted mt-2">Logged under this department</p>
        </Card>

        <Card className="p-5 border border-unis-border dark:border-unis-dark-border shadow-subtle">
          <p className="text-xs font-bold text-unis-slate dark:text-unis-dark-muted uppercase">Pending Verification</p>
          <p className="text-3xl font-extrabold text-amber-600 mt-1">{pendingStudents.length}</p>
          <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted mt-2">Awaiting student approval</p>
        </Card>

        <Card className="p-5 border border-unis-border dark:border-unis-dark-border shadow-subtle">
          <p className="text-xs font-bold text-unis-slate dark:text-unis-dark-muted uppercase">In Progress</p>
          <p className="text-3xl font-extrabold text-unis-brand mt-1">{stats.inProgress}</p>
          <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted mt-2">Active service operations</p>
        </Card>

        <Card className="p-5 border border-unis-border dark:border-unis-dark-border shadow-subtle">
          <p className="text-xs font-bold text-unis-slate dark:text-unis-dark-muted uppercase">Overdue Issues</p>
          <p className={`text-3xl font-extrabold mt-1 ${stats.overdue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {stats.overdue}
          </p>
          <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted mt-2">Exceeded resolution deadline</p>
        </Card>
      </div>

      {/* 3. Pending Student Registrations Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-unis-brand" />
              Pending Student Approvals ({pendingStudents.length})
            </h2>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
              Students registered under your department awaiting enrollment authorization
            </p>
          </div>
          <Link to="/students" className="text-xs font-bold text-unis-brand hover:underline flex items-center gap-1">
            Open Student Manager <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {pendingStudents.length === 0 ? (
          <Card className="p-6 text-center border border-dashed border-unis-border dark:border-unis-dark-border rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-unis-ink dark:text-unis-dark-text">No pending registrations for your department</p>
            <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted">All students in your scope are verified and approved.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingStudents.slice(0, 4).map((st) => (
              <Card key={st.id} className="p-4 border border-unis-border dark:border-unis-dark-border rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-unis-ink dark:text-unis-dark-text">{st.fullName}</h4>
                    <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted">{st.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    PENDING
                  </span>
                </div>
                <div className="text-[11px] text-unis-slate dark:text-unis-dark-muted flex items-center justify-between">
                  <span>Program: {st.departmentName || st.departmentRequested}</span>
                  <span>📅 {new Date(st.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-unis-border/60 dark:border-unis-dark-border/60">
                  <Button
                    size="sm"
                    onClick={() => handleApproveStudent(st.id)}
                    loading={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl py-1"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectStudent(st.id)}
                    className="text-rose-600 border-rose-300 hover:bg-rose-50 text-xs rounded-xl py-1"
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 4. Active Department Tickets Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight flex items-center gap-2">
              <Ticket className="w-5 h-5 text-unis-indigo" />
              Department Triage Queue
            </h2>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
              Tickets currently assigned or routed to your department
            </p>
          </div>
          <Link to="/tickets" className="text-xs font-bold text-unis-brand hover:underline flex items-center gap-1">
            View All Department Tickets <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {tickets.length === 0 ? (
          <Card className="p-8 text-center border border-dashed border-unis-border dark:border-unis-dark-border rounded-2xl">
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted">No open tickets in your department queue.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.slice(0, 6).map((t) => (
              <Card
                key={t.id}
                className="p-4 border border-unis-border dark:border-unis-dark-border hover:shadow-subtle rounded-2xl cursor-pointer hover:border-unis-brand/40 transition-all"
                onClick={() => navigate(`/tickets/${t.id}`)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-unis-brand bg-unis-blue-light dark:bg-unis-dark-highlight px-2 py-0.5 rounded">
                        {t.ticketReference}
                      </span>
                      <StatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <h4 className="text-xs font-bold text-unis-ink dark:text-unis-dark-text">{t.title}</h4>
                    <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted">
                      Reported by {t.createdByName || 'Student'} • {t.locationName || 'Campus'} • Filed {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs rounded-xl self-start sm:self-center">
                    Review Ticket &rarr;
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
