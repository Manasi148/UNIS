import React, { useState, useEffect } from 'react';
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
  Trash2,
  ShieldCheck,
  Plus,
  Mail,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export function StudentManagementPage() {
  const { user, role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'directory'
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filter & Pagination state
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState(isAdmin ? '' : user?.departmentId || '');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal / Feedback state
  const [feedback, setFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, student: null, reason: '' });
  const [bulkModal, setBulkModal] = useState({ open: false, action: 'approve' });
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
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingQueue();
    } else {
      fetchDirectory();
    }
    setSelectedIds([]);
  }, [activeTab, page, selectedDept, selectedStatus]);

  const fetchDepartments = async () => {
    try {
      const res = await client.get('/departments');
      const list = res.data?.content || res.data || [];
      setDepartments(list);
    } catch (e) {
      console.error('Failed to load departments', e);
    }
  };

  const fetchPendingQueue = async () => {
    try {
      setLoading(true);
      const res = await client.get('/users/pending-students');
      const list = res.data || [];
      setPendingStudents(list);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load pending queue' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', '15');
      if (search.trim()) params.append('search', search.trim());
      if (selectedDept) params.append('departmentId', selectedDept);
      if (selectedStatus) params.append('approvalStatus', selectedStatus);

      const res = await client.get(`/users/students?${params.toString()}`);
      const data = res.data;
      setStudents(data?.content || []);
      setTotalPages(data?.totalPages || 1);
      setTotalElements(data?.totalElements || 0);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load student directory' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    if (activeTab === 'directory') fetchDirectory();
  };

  // Single Approve
  const handleApprove = async (studentId) => {
    try {
      setActionLoading(true);
      await client.post(`/users/students/${studentId}/approve`);
      setFeedback({ type: 'success', message: 'Student account approved successfully!' });
      refreshCurrentTab();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Approval failed' });
    } finally {
      setActionLoading(false);
    }
  };

  // Single Reject
  const handleRejectConfirm = async () => {
    if (!rejectModal.student) return;
    try {
      setActionLoading(true);
      await client.post(`/users/students/${rejectModal.student.id}/reject?reason=${encodeURIComponent(rejectModal.reason)}`);
      setFeedback({ type: 'success', message: 'Student registration rejected.' });
      setRejectModal({ open: false, student: null, reason: '' });
      refreshCurrentTab();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Rejection failed' });
    } finally {
      setActionLoading(false);
    }
  };

  // Safe Deactivate / Remove
  const handleRemove = async (studentId) => {
    if (!window.confirm('Are you sure you want to deactivate and remove this student account?')) return;
    try {
      setActionLoading(true);
      await client.delete(`/users/students/${studentId}`);
      setFeedback({ type: 'success', message: 'Student account deactivated safely.' });
      refreshCurrentTab();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Deactivation failed' });
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Operations
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
      const endpoint = bulkModal.action === 'approve'
        ? '/users/students/bulk-approve'
        : '/users/students/bulk-reject';

      const res = await client.post(endpoint, { studentIds: selectedIds });
      const summary = res.data;
      setFeedback({
        type: 'success',
        message: `Bulk ${bulkModal.action} complete: ${summary.successCount} succeeded, ${summary.failureCount} failed.`
      });
      setBulkModal({ open: false, action: 'approve' });
      setSelectedIds([]);
      refreshCurrentTab();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Bulk operation failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const refreshCurrentTab = () => {
    if (activeTab === 'pending') fetchPendingQueue();
    else fetchDirectory();
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
      refreshCurrentTab();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Could not provision student account' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-unis-blue-light dark:bg-unis-dark-highlight text-unis-brand dark:text-unis-dark-brand text-xs font-bold mb-1">
            <Building className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Institution-Wide Management' : `${user?.departmentName || 'Department'} Queue`}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
            Student Account Verification & Roster
          </h1>
          <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
            Review registration requests, manage enrolled students, and govern departmental access.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshCurrentTab}
            loading={loading}
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

      {/* Global Action Feedback Alert */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between animate-fade-in ${
          feedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
            : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-unis-border dark:border-unis-dark-border pb-px">
        <button
          onClick={() => setActiveTab('pending')}
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
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'directory'
              ? 'border-unis-brand text-unis-brand dark:text-unis-dark-brand bg-unis-blue-light/30 dark:bg-unis-dark-highlight/40 rounded-t-xl'
              : 'border-transparent text-unis-slate dark:text-unis-dark-muted hover:text-unis-ink dark:hover:text-unis-dark-text'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Enrolled Students ({totalElements})</span>
        </button>
      </div>

      {/* Bulk Action Bar (when checkboxes are checked) */}
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
              Clear
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
              <LoadingSpinner message="Scanning pending student applications..." />
            </div>
          ) : pendingStudents.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-unis-ink dark:text-unis-dark-text">
                Pending Queue is Clean!
              </h3>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
                No unapproved student registrations pending for {isAdmin ? 'the institution' : user?.departmentName || 'your department'}.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-unis-border dark:divide-unis-dark-border">
              {pendingStudents.map((st) => (
                <div key={st.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/50 dark:hover:bg-unis-dark-elevated/30 transition-colors">
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
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          PENDING
                        </span>
                        {st.studentOrStaffId && (
                          <span className="text-[11px] text-unis-slate dark:text-unis-dark-muted font-mono">
                            ID: {st.studentOrStaffId}
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
                        <span>Program / Dept: {st.departmentName || st.departmentRequested || 'Other (Special Request)'}</span>
                        {st.departmentRequested && (
                          <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold">
                            Custom Request: "{st.departmentRequested}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
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

      {/* TAB 2: ALL REGISTERED STUDENTS DIRECTORY */}
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
                placeholder="Search name, email, roll no..."
                className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand"
              />
            </form>

            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
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

              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
                className="px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PENDING">PENDING</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              <button
                onClick={handleSelectAllCurrentPage}
                className="text-xs font-bold text-unis-brand dark:text-unis-dark-brand hover:underline px-2 py-1"
              >
                {selectedIds.length === students.length && students.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner message="Loading student records..." />
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-sm font-bold text-unis-ink dark:text-unis-dark-text">No students found matching filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-unis-dark-elevated text-unis-slate dark:text-unis-dark-muted font-bold uppercase tracking-wider text-[10px] border-b border-unis-border dark:border-unis-dark-border">
                  <tr>
                    <th className="p-3.5 w-10 text-center">#</th>
                    <th className="p-3.5">Student Profile</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Approval Status</th>
                    <th className="p-3.5">Enrolled Date</th>
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
                        <div className="text-[11px] text-unis-slate dark:text-unis-dark-muted">{st.email}</div>
                        {st.studentOrStaffId && (
                          <div className="text-[10px] font-mono text-unis-slate/80">ID: {st.studentOrStaffId}</div>
                        )}
                      </td>
                      <td className="p-3.5 font-medium text-unis-ink dark:text-unis-dark-text">
                        {st.departmentName || st.departmentRequested || 'Unassigned'}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.approvalStatus === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : st.approvalStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}>
                          {st.approvalStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-unis-slate dark:text-unis-dark-muted">
                        {new Date(st.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {st.approvalStatus === 'PENDING' && (
                            <button
                              onClick={() => handleApprove(st.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleRemove(st.id)}
                            className="p-1.5 rounded-lg text-unis-slate hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Safe Remove / Deactivate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
              <span>Page {page + 1} of {totalPages}</span>
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

      {/* REJECTION REASON MODAL */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 border border-unis-border dark:border-unis-dark-border shadow-elevated">
            <h3 className="text-base font-extrabold text-unis-ink dark:text-unis-dark-text">
              Reject Student Registration
            </h3>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
              Are you sure you want to reject <span className="font-bold">{rejectModal.student?.fullName}</span>? Please provide a reason to assist institutional records.
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

      {/* BULK ACTION CONFIRMATION MODAL */}
      {bulkModal.open && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 border border-unis-border dark:border-unis-dark-border shadow-elevated">
            <h3 className="text-base font-extrabold text-unis-ink dark:text-unis-dark-text">
              Confirm Bulk {bulkModal.action === 'approve' ? 'Approval' : 'Rejection'}
            </h3>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
              You are about to bulk {bulkModal.action} <span className="font-bold">{selectedIds.length}</span> selected student account(s). The backend will revalidate departmental authority for each account.
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
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
