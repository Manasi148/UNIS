import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Building,
  RefreshCw,
  Plus,
  Mail,
  ChevronLeft,
  ChevronRight,
  Info,
  Eye,
  ShieldCheck,
  Power,
  RotateCcw,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function StudentManagementPage() {
  const { user, role } = useAuth();
  const isAdmin = role === 'ADMIN';
  const [searchParams, setSearchParams] = useSearchParams();

  // Tabs: 'pending' | 'directory'
  const initialTab = searchParams.get('tab') === 'directory' ? 'directory' : 'pending';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Top Summary counts (from database)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejectedOrInactive: 0,
  });

  // Filter & Pagination state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedDept, setSelectedDept] = useState(isAdmin ? '' : user?.departmentId || '');
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState(searchParams.get('approvalStatus') || '');
  const [selectedAccountStatus, setSelectedAccountStatus] = useState(''); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals & Feedback
  const [feedback, setFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, student: null });
  const [rejectModal, setRejectModal] = useState({ open: false, student: null, reason: '' });
  const [deactivateModal, setDeactivateModal] = useState({ open: false, student: null, targetActive: false });
  const [bulkModal, setBulkModal] = useState({ open: false, action: 'approve' });
  const [bulkResult, setBulkResult] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    departmentId: '',
    studentOrStaffId: '',
    phone: '',
  });

  useEffect(() => {
    fetchDepartments();
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingQueue();
    } else {
      fetchDirectory();
    }
    setSelectedIds([]);
  }, [activeTab, page, selectedDept, selectedApprovalStatus, selectedAccountStatus, sortField, sortDir]);

  const fetchDepartments = async () => {
    try {
      const res = await client.get('/departments');
      const list = res.data?.content || res.data || [];
      setDepartments(list);
    } catch (e) {
      console.error('Failed to load departments', e);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await client.get('/analytics/overview');
      const data = res.data || {};
      setStats({
        total: data.totalStudents || 0,
        pending: data.pendingStudents || 0,
        approved: data.approvedStudents || 0,
        rejectedOrInactive: (data.rejectedStudents || 0) + (data.inactiveStudents || 0),
      });
    } catch (e) {
      console.warn('Failed to load student statistics from overview', e);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchPendingQueue = async () => {
    try {
      setLoading(true);
      const res = await client.get('/users/pending-students');
      const list = res.data || [];
      setPendingStudents(list);
      // Update pending count in stats
      setStats((prev) => ({ ...prev, pending: list.length }));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load pending queue.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', '12');
      if (search.trim()) params.append('search', search.trim());
      if (selectedDept) params.append('departmentId', selectedDept);
      if (selectedApprovalStatus) params.append('approvalStatus', selectedApprovalStatus);
      params.append('sort', `${sortField},${sortDir}`);

      const res = await client.get(`/users/students?${params.toString()}`);
      const data = res.data;
      let fetchedStudents = data?.content || [];

      // Client filter for account status (active/inactive) if selected
      if (selectedAccountStatus === 'ACTIVE') {
        fetchedStudents = fetchedStudents.filter((s) => s.active);
      } else if (selectedAccountStatus === 'INACTIVE') {
        fetchedStudents = fetchedStudents.filter((s) => !s.active);
      }

      setStudents(fetchedStudents);
      setTotalPages(data?.totalPages || 1);
      setTotalElements(data?.totalElements || fetchedStudents.length);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load student directory.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    if (activeTab === 'directory') fetchDirectory();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedDept(isAdmin ? '' : user?.departmentId || '');
    setSelectedApprovalStatus('');
    setSelectedAccountStatus('');
    setPage(0);
    setSearchParams({});
  };

  const refreshAll = () => {
    fetchStats();
    if (activeTab === 'pending') fetchPendingQueue();
    else fetchDirectory();
  };

  // Single Approve
  const handleApprove = async (studentId) => {
    try {
      setActionLoading(true);
      await client.post(`/users/students/${studentId}/approve`);
      setFeedback({ type: 'success', message: 'Student account approved successfully! Access granted.' });
      if (detailModal.open && detailModal.student?.id === studentId) {
        setDetailModal({ open: false, student: null });
      }
      refreshAll();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Approval failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Single Reject Confirm
  const handleRejectConfirm = async () => {
    if (!rejectModal.student) return;
    try {
      setActionLoading(true);
      await client.post(
        `/users/students/${rejectModal.student.id}/reject?reason=${encodeURIComponent(rejectModal.reason)}`
      );
      setFeedback({ type: 'success', message: 'Student registration rejected and recorded.' });
      setRejectModal({ open: false, student: null, reason: '' });
      if (detailModal.open && detailModal.student?.id === rejectModal.student.id) {
        setDetailModal({ open: false, student: null });
      }
      refreshAll();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Rejection failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Account Active/Inactive Status
  const handleToggleActiveConfirm = async () => {
    if (!deactivateModal.student) return;
    try {
      setActionLoading(true);
      const studentId = deactivateModal.student.id;
      const targetActive = deactivateModal.targetActive;
      await client.patch(`/users/${studentId}/status?active=${targetActive}`);
      setFeedback({
        type: 'success',
        message: `Student account ${targetActive ? 'activated' : 'deactivated'} successfully.`,
      });
      setDeactivateModal({ open: false, student: null, targetActive: false });
      if (detailModal.open && detailModal.student?.id === studentId) {
        setDetailModal((prev) => ({
          ...prev,
          student: { ...prev.student, active: targetActive },
        }));
      }
      refreshAll();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update account status.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Selection Handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllCurrentPage = () => {
    const currentList = activeTab === 'pending' ? pendingStudents : students;
    if (selectedIds.length === currentList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentList.map((s) => s.id));
    }
  };

  const handleBulkActionConfirm = async () => {
    if (selectedIds.length === 0) return;
    try {
      setActionLoading(true);
      const endpoint =
        bulkModal.action === 'approve'
          ? '/users/students/bulk-approve'
          : '/users/students/bulk-reject';

      const res = await client.post(endpoint, { studentIds: selectedIds });
      const summary = res.data || {};
      setBulkResult(summary);
      setFeedback({
        type: summary.failureCount === 0 ? 'success' : 'error',
        message: `Bulk ${bulkModal.action} complete: ${summary.successCount || 0} succeeded, ${summary.failureCount || 0} failed.`,
      });
      setBulkModal({ open: false, action: 'approve' });
      setSelectedIds([]);
      refreshAll();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Bulk operation failed.' });
      setBulkModal({ open: false, action: 'approve' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminCreateStudent = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await client.post('/users/admin-create', {
        ...createForm,
        role: 'STUDENT',
        departmentId: createForm.departmentId ? Number(createForm.departmentId) : null,
        approvalStatus: 'APPROVED',
      });
      setFeedback({ type: 'success', message: 'Student account created and approved successfully!' });
      setCreateModalOpen(false);
      setCreateForm({ fullName: '', email: '', password: '', departmentId: '', studentOrStaffId: '', phone: '' });
      refreshAll();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Could not provision student account.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-unis-blue-light dark:bg-unis-dark-highlight text-unis-brand dark:text-unis-dark-brand text-xs font-bold mb-1">
            <Building className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Institution-Wide Management' : `${user?.departmentName || 'Department'} Queue`}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
            Student Approvals & Roster
          </h1>
          <p className="text-xs sm:text-sm text-unis-slate dark:text-unis-dark-muted">
            Review student registrations, approve departmental membership, and manage student access.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            loading={loading || statsLoading}
            icon={RefreshCw}
            className="text-xs rounded-xl"
          >
            Refresh
          </Button>

          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              icon={Plus}
              className="bg-unis-brand hover:bg-unis-indigo text-white text-xs font-bold rounded-xl shadow-subtle"
            >
              Add Student
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Summary Cards (Database Powered) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          onClick={() => { setActiveTab('directory'); setSelectedApprovalStatus(''); }}
          className="p-4 sm:p-5 border border-unis-border dark:border-unis-dark-border hover:border-unis-brand/40 transition-all cursor-pointer rounded-2xl shadow-subtle"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                Total Students
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-unis-ink dark:text-unis-dark-text mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-unis-blue-light dark:bg-unis-dark-highlight text-unis-brand flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-unis-slate dark:text-unis-dark-muted mt-2 pt-2 border-t border-unis-border/60">
            Enrolled student accounts
          </p>
        </Card>

        <Card
          onClick={() => { setActiveTab('pending'); }}
          className={`p-4 sm:p-5 border transition-all cursor-pointer rounded-2xl shadow-subtle ${
            stats.pending > 0
              ? 'border-amber-300 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20'
              : 'border-unis-border dark:border-unis-dark-border hover:border-unis-brand/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                Pending Approval
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className={`text-2xl sm:text-3xl font-extrabold ${stats.pending > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-unis-ink dark:text-unis-dark-text'}`}>
                  {stats.pending}
                </p>
                {stats.pending > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              stats.pending > 0
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                : 'bg-stone-100 text-unis-slate dark:bg-unis-dark-elevated'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-unis-slate dark:text-unis-dark-muted mt-2 pt-2 border-t border-unis-border/60">
            {stats.pending > 0 ? 'Action required: click to view queue' : 'No pending registrations'}
          </p>
        </Card>

        <Card
          onClick={() => { setActiveTab('directory'); setSelectedApprovalStatus('APPROVED'); }}
          className="p-4 sm:p-5 border border-unis-border dark:border-unis-dark-border hover:border-unis-brand/40 transition-all cursor-pointer rounded-2xl shadow-subtle"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                Approved Students
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
                {stats.approved}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-unis-slate dark:text-unis-dark-muted mt-2 pt-2 border-t border-unis-border/60">
            Verified institutional members
          </p>
        </Card>

        <Card
          onClick={() => { setActiveTab('directory'); setSelectedApprovalStatus('REJECTED'); }}
          className="p-4 sm:p-5 border border-unis-border dark:border-unis-dark-border hover:border-unis-brand/40 transition-all cursor-pointer rounded-2xl shadow-subtle"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                Rejected / Inactive
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
                {stats.rejectedOrInactive}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-unis-slate dark:text-unis-dark-muted mt-2 pt-2 border-t border-unis-border/60">
            Restricted or disabled access
          </p>
        </Card>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold border flex items-center justify-between animate-fade-in ${
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
          <button onClick={() => setFeedback(null)} className="text-xs font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-unis-border dark:border-unis-dark-border pb-px">
        <button
          onClick={() => { setActiveTab('pending'); setSearchParams({ tab: 'pending' }); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'pending'
              ? 'border-unis-brand text-unis-brand dark:text-unis-dark-brand bg-unis-blue-light/30 dark:bg-unis-dark-highlight/40 rounded-t-xl'
              : 'border-transparent text-unis-slate dark:text-unis-dark-muted hover:text-unis-ink dark:hover:text-unis-dark-text'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Approvals Queue</span>
          {pendingStudents.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
              {pendingStudents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('directory'); setSearchParams({ tab: 'directory' }); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'directory'
              ? 'border-unis-brand text-unis-brand dark:text-unis-dark-brand bg-unis-blue-light/30 dark:bg-unis-dark-highlight/40 rounded-t-xl'
              : 'border-transparent text-unis-slate dark:text-unis-dark-muted hover:text-unis-ink dark:hover:text-unis-dark-text'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Students Roster ({totalElements})</span>
        </button>
      </div>

      {/* Bulk Action Bar (When eligible students are selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-unis-navy to-unis-indigo text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-elevated animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-[11px]">
              {selectedIds.length}
            </span>
            <span>student account(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setBulkModal({ open: true, action: 'approve' })}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl"
              icon={CheckCircle2}
            >
              Bulk Approve
            </Button>
            <Button
              size="sm"
              onClick={() => setBulkModal({ open: true, action: 'reject' })}
              className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl"
              icon={XCircle}
            >
              Bulk Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds([])}
              className="border-white/30 text-white hover:bg-white/10 text-xs rounded-xl"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* TAB 1: PENDING APPROVAL QUEUE */}
      {activeTab === 'pending' && (
        <Card className="p-0 border border-unis-border dark:border-unis-dark-border overflow-hidden rounded-2xl shadow-subtle">
          <div className="p-4 bg-stone-50/50 dark:bg-unis-dark-elevated/40 border-b border-unis-border dark:border-unis-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-unis-ink dark:text-unis-dark-text">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Awaiting Verification: {pendingStudents.length} Applications</span>
            </div>
            {pendingStudents.length > 0 && (
              <button
                onClick={handleSelectAllCurrentPage}
                className="text-xs font-bold text-unis-brand dark:text-unis-dark-brand hover:underline"
              >
                {selectedIds.length === pendingStudents.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner message="Querying pending student registrations..." />
            </div>
          ) : pendingStudents.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-unis-ink dark:text-unis-dark-text">
                No student registrations are waiting for approval.
              </h3>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
                All submitted registrations have been verified for {isAdmin ? 'the institution' : user?.departmentName || 'your department'}.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-unis-border dark:divide-unis-dark-border">
              {pendingStudents.map((st) => (
                <div
                  key={st.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/50 dark:hover:bg-unis-dark-elevated/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(st.id)}
                      onChange={() => handleToggleSelect(st.id)}
                      className="mt-1 w-4 h-4 rounded text-unis-brand focus:ring-unis-brand cursor-pointer"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-unis-ink dark:text-unis-dark-text">
                          {st.fullName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          PENDING
                        </span>
                        {st.studentOrStaffId && (
                          <span className="text-[11px] text-unis-slate dark:text-unis-dark-muted font-mono">
                            Roll: {st.studentOrStaffId}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-unis-slate dark:text-unis-dark-muted flex-wrap">
                        <span>📧 {st.email}</span>
                        {st.institutionalEmail && <span>🏛️ {st.institutionalEmail}</span>}
                        <span>📅 Registered: {new Date(st.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="text-xs font-semibold text-unis-brand dark:text-unis-dark-brand flex items-center gap-1.5 pt-0.5">
                        <Building className="w-3.5 h-3.5" />
                        <span>Department: {st.departmentName || st.departmentRequested || 'General Registration'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDetailModal({ open: true, student: st })}
                      icon={Eye}
                      className="text-xs rounded-xl"
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(st.id)}
                      loading={actionLoading}
                      icon={CheckCircle2}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectModal({ open: true, student: st, reason: '' })}
                      icon={XCircle}
                      className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/30 text-xs rounded-xl"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: ALL STUDENTS ROSTER TABLE */}
      {activeTab === 'directory' && (
        <Card className="p-0 border border-unis-border dark:border-unis-dark-border overflow-hidden rounded-2xl shadow-subtle space-y-0">
          {/* Filter Bar */}
          <div className="p-4 bg-stone-50/50 dark:bg-unis-dark-elevated/40 border-b border-unis-border dark:border-unis-dark-border flex flex-col md:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-unis-slate/60 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, roll no..."
                className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand"
              />
            </form>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              {isAdmin && (
                <select
                  value={selectedDept}
                  onChange={(e) => { setSelectedDept(e.target.value); setPage(0); }}
                  className="px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand cursor-pointer"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}

              {/* Approval Status Filter */}
              <select
                value={selectedApprovalStatus}
                onChange={(e) => { setSelectedApprovalStatus(e.target.value); setPage(0); }}
                className="px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand cursor-pointer"
              >
                <option value="">All Approvals</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PENDING">PENDING</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              {/* Account Status Filter */}
              <select
                value={selectedAccountStatus}
                onChange={(e) => { setSelectedAccountStatus(e.target.value); setPage(0); }}
                className="px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand cursor-pointer"
              >
                <option value="">All Accounts</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>

              {/* Clear Filters */}
              {(search || selectedDept || selectedApprovalStatus || selectedAccountStatus) && (
                <button
                  onClick={handleClearFilters}
                  className="p-2 text-xs text-unis-slate hover:text-unis-ink dark:text-unis-dark-muted dark:hover:text-white flex items-center gap-1 rounded-xl hover:bg-stone-100 dark:hover:bg-unis-dark-elevated"
                  title="Clear all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner message="Loading verified student roster..." />
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-unis-dark-elevated text-unis-slate flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-unis-ink dark:text-unis-dark-text">No students match current filters.</p>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted">Try adjusting your search criteria or resetting filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-unis-dark-elevated text-unis-slate dark:text-unis-dark-muted font-bold uppercase tracking-wider text-[10px] border-b border-unis-border dark:border-unis-dark-border">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === students.length && students.length > 0}
                        onChange={handleSelectAllCurrentPage}
                        className="w-4 h-4 rounded text-unis-brand focus:ring-unis-brand cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Login Email</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Registration Date</th>
                    <th className="p-3.5">Approval Status</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-unis-border dark:divide-unis-dark-border">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-stone-50/50 dark:hover:bg-unis-dark-elevated/30 transition-colors">
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(st.id)}
                          onChange={() => handleToggleSelect(st.id)}
                          className="w-4 h-4 rounded text-unis-brand focus:ring-unis-brand cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-unis-ink dark:text-unis-dark-text">{st.fullName}</div>
                        {st.studentOrStaffId && (
                          <div className="text-[10px] font-mono text-unis-slate/80">Roll: {st.studentOrStaffId}</div>
                        )}
                      </td>
                      <td className="p-3.5 text-unis-slate dark:text-unis-dark-muted">
                        <div>{st.email}</div>
                        {st.institutionalEmail && (
                          <div className="text-[10px] text-unis-slate/70">{st.institutionalEmail}</div>
                        )}
                      </td>
                      <td className="p-3.5 font-medium text-unis-ink dark:text-unis-dark-text">
                        {st.departmentName || st.departmentRequested || 'Unassigned'}
                      </td>
                      <td className="p-3.5 text-unis-slate dark:text-unis-dark-muted">
                        {new Date(st.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.approvalStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : st.approvalStatus === 'PENDING'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}
                        >
                          {st.approvalStatus}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.active
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                              : 'bg-stone-100 text-stone-600 dark:bg-unis-dark-elevated dark:text-stone-400'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${st.active ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                          {st.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailModal({ open: true, student: st })}
                            className="p-1.5 rounded-lg text-unis-slate hover:text-unis-brand hover:bg-unis-blue-light dark:hover:bg-unis-dark-elevated transition-colors"
                            title="View Student Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {st.approvalStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(st.id)}
                                className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectModal({ open: true, student: st, reason: '' })}
                                className="px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {isAdmin && st.approvalStatus === 'APPROVED' && (
                            <button
                              onClick={() => setDeactivateModal({ open: true, student: st, targetActive: !st.active })}
                              className={`p-1.5 rounded-lg transition-colors ${
                                st.active
                                  ? 'text-unis-slate hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                  : 'text-unis-slate hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                              }`}
                              title={st.active ? 'Deactivate Student Account' : 'Reactivate Student Account'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3.5 border-t border-unis-border dark:border-unis-dark-border flex items-center justify-between text-xs text-unis-slate dark:text-unis-dark-muted">
              <span>Page {page + 1} of {totalPages} ({totalElements} total)</span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  icon={ChevronLeft}
                  className="rounded-xl"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  icon={ChevronRight}
                  className="rounded-xl"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* STUDENT DETAIL MODAL */}
      {detailModal.open && detailModal.student && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-lg p-6 space-y-5 border border-unis-border dark:border-unis-dark-border shadow-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-unis-border dark:border-unis-dark-border">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-unis-blue-light dark:bg-unis-dark-highlight text-unis-brand flex items-center justify-center font-bold">
                  {detailModal.student.fullName?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-unis-ink dark:text-unis-dark-text">
                    {detailModal.student.fullName}
                  </h3>
                  <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
                    Student ID: {detailModal.student.studentOrStaffId || 'Not registered'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailModal({ open: false, student: null })}
                className="p-1 rounded-lg text-unis-slate hover:bg-stone-100 dark:hover:bg-unis-dark-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-unis-slate font-medium block">Login Email</span>
                <span className="font-bold text-unis-ink dark:text-unis-dark-text">{detailModal.student.email}</span>
              </div>
              <div>
                <span className="text-unis-slate font-medium block">Institutional Email</span>
                <span className="font-bold text-unis-ink dark:text-unis-dark-text">
                  {detailModal.student.institutionalEmail || 'None assigned'}
                </span>
              </div>
              <div>
                <span className="text-unis-slate font-medium block">Department / Program</span>
                <span className="font-bold text-unis-ink dark:text-unis-dark-text">
                  {detailModal.student.departmentName || detailModal.student.departmentRequested || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-unis-slate font-medium block">Registration Date</span>
                <span className="font-bold text-unis-ink dark:text-unis-dark-text">
                  {new Date(detailModal.student.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-unis-slate font-medium block">Approval Status</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                  detailModal.student.approvalStatus === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : detailModal.student.approvalStatus === 'PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {detailModal.student.approvalStatus}
                </span>
              </div>
              <div>
                <span className="text-unis-slate font-medium block">Account State</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                  detailModal.student.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                }`}>
                  {detailModal.student.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              {detailModal.student.approvedByName && (
                <div className="col-span-2 pt-2 border-t border-unis-border dark:border-unis-dark-border">
                  <span className="text-unis-slate text-[11px] block">Verified by</span>
                  <span className="font-semibold text-unis-ink dark:text-unis-dark-text">
                    {detailModal.student.approvedByName} on{' '}
                    {detailModal.student.approvedAt ? new Date(detailModal.student.approvedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-unis-border dark:border-unis-dark-border">
              {detailModal.student.approvalStatus === 'PENDING' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRejectModal({ open: true, student: detailModal.student, reason: '' });
                    }}
                    className="border-rose-300 text-rose-600 hover:bg-rose-50"
                  >
                    Reject Registration
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(detailModal.student.id)}
                    loading={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Approve Student Access
                  </Button>
                </>
              )}

              {isAdmin && detailModal.student.approvalStatus === 'APPROVED' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDeactivateModal({
                      open: true,
                      student: detailModal.student,
                      targetActive: !detailModal.student.active,
                    });
                  }}
                  className={detailModal.student.active ? 'text-amber-600 border-amber-300' : 'text-emerald-600 border-emerald-300'}
                >
                  {detailModal.student.active ? 'Deactivate Account' : 'Reactivate Account'}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailModal({ open: false, student: null })}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* REJECTION REASON CONFIRMATION MODAL */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-md p-6 space-y-4 border border-unis-border dark:border-unis-dark-border shadow-elevated">
            <h3 className="text-base font-extrabold text-unis-ink dark:text-unis-dark-text">
              Reject Student Registration
            </h3>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
              Are you sure you want to reject <span className="font-bold text-unis-ink dark:text-unis-dark-text">{rejectModal.student?.fullName}</span>?
              The student will not gain access to institutional services.
            </p>
            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectModal.reason}
                onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g. Invalid student roll number or incorrect department enrollment."
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
                onClick={handleRejectConfirm}
                loading={actionLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                Confirm Rejection
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* DEACTIVATE / REACTIVATE CONFIRMATION MODAL */}
      {deactivateModal.open && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-md p-6 space-y-4 border border-unis-border dark:border-unis-dark-border shadow-elevated">
            <h3 className="text-base font-extrabold text-unis-ink dark:text-unis-dark-text">
              Confirm Account {deactivateModal.targetActive ? 'Activation' : 'Deactivation'}
            </h3>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted leading-relaxed">
              {deactivateModal.targetActive
                ? `Reactivating this account will restore full student access for ${deactivateModal.student?.fullName}.`
                : `Deactivating this account will immediately revoke login sessions and prevent ${deactivateModal.student?.fullName} from submitting helpdesk complaints or lost & found claims.`}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeactivateModal({ open: false, student: null, targetActive: false })}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleToggleActiveConfirm}
                loading={actionLoading}
                className={`font-bold text-white rounded-xl ${
                  deactivateModal.targetActive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Confirm {deactivateModal.targetActive ? 'Activation' : 'Deactivation'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* BULK ACTION CONFIRMATION MODAL */}
      {bulkModal.open && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-md p-6 space-y-4 border border-unis-border dark:border-unis-dark-border shadow-elevated">
            <h3 className="text-base font-extrabold text-unis-ink dark:text-unis-dark-text">
              Confirm Bulk {bulkModal.action === 'approve' ? 'Approval' : 'Rejection'}
            </h3>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted leading-relaxed">
              You are about to bulk {bulkModal.action} <span className="font-bold text-unis-ink dark:text-unis-dark-text">{selectedIds.length}</span> selected student accounts.
              The backend will independently validate authorization for each record.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkModal({ open: false, action: 'approve' })}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleBulkActionConfirm}
                loading={actionLoading}
                className={`font-bold text-white rounded-xl ${
                  bulkModal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Execute Bulk {bulkModal.action === 'approve' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ADMIN CREATE STUDENT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-lg p-6 space-y-4 border border-unis-border dark:border-unis-dark-border shadow-elevated">
            <h3 className="text-base font-extrabold text-unis-ink dark:text-unis-dark-text">
              Provision Verified Student Account
            </h3>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
              Directly enroll and approve a student record into the institutional directory.
            </p>
            <form onSubmit={handleAdminCreateStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  className="w-full p-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">Email / Identifier *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">Department</label>
                  <select
                    value={createForm.departmentId}
                    onChange={(e) => setCreateForm({ ...createForm, departmentId: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">Student Roll No</label>
                  <input
                    type="text"
                    value={createForm.studentOrStaffId}
                    onChange={(e) => setCreateForm({ ...createForm, studentOrStaffId: e.target.value })}
                    placeholder="STU-2026-XXXX"
                    className="w-full p-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" loading={actionLoading} className="bg-unis-brand hover:bg-unis-indigo text-white font-bold rounded-xl">
                  Save & Approve
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
