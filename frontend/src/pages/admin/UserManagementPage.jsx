import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Crown,
  Lock,
  ThumbsUp,
  Ban,
  Clock,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  LogOut
} from 'lucide-react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { RoleBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const ROLES = ['ALL', 'STUDENT', 'DEPARTMENT_HEAD', 'ADMIN'];

export function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('governance'); // 'governance' | 'directory'

  // Governance State
  const [govLoading, setGovLoading] = useState(true);
  const [govData, setGovData] = useState({
    administrators: [],
    activeCount: 1,
    maxAllowed: 5,
    canProposeRemoval: false,
    ruleExplanation: '',
    pendingProposals: []
  });

  // Proposal Modals
  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [selectedTargetAdmin, setSelectedTargetAdmin] = useState(null);
  const [proposalReason, setProposalReason] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalError, setProposalError] = useState('');

  // Founder Succession Modal
  const [successionModalOpen, setSuccessionModalOpen] = useState(false);
  const [successorId, setSuccessorId] = useState('');
  const [successionNotes, setSuccessionNotes] = useState('');
  const [submittingSuccession, setSubmittingSuccession] = useState(false);
  const [successionError, setSuccessionError] = useState('');

  // Provisioning Modal State (for both Admin & Staff/HOD)
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [provisionRole, setProvisionRole] = useState('ADMIN');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [submittingProvision, setSubmittingProvision] = useState(false);
  const [provisionError, setProvisionError] = useState('');

  // Directory State
  const [dirLoading, setDirLoading] = useState(true);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGovernanceOverview();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (activeTab === 'directory') {
      fetchDirectoryUsers();
    }
  }, [activeTab, roleFilter]);

  const fetchGovernanceOverview = async () => {
    try {
      setGovLoading(true);
      const res = await client.get('/admin/governance/overview');
      setGovData(res.data || res);
    } catch (err) {
      console.error('Failed to load governance overview:', err);
    } finally {
      setGovLoading(false);
    }
  };

  const fetchDirectoryUsers = async () => {
    try {
      setDirLoading(true);
      const params = { size: 50 };
      if (roleFilter !== 'ALL') params.role = roleFilter;
      const res = await client.get('/users', { params });
      setDirectoryUsers(res.data?.content || res.data?.data?.content || []);
    } catch (err) {
      console.error('Failed to load directory users:', err);
    } finally {
      setDirLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await client.get('/departments');
      setDepartments(res.data || res.data?.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const handleOpenProposeModal = (admin) => {
    setSelectedTargetAdmin(admin);
    setProposalReason('');
    setProposalError('');
    setProposeModalOpen(true);
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!proposalReason.trim()) {
      setProposalError('Please state a reason for proposing administrator removal.');
      return;
    }

    try {
      setSubmittingProposal(true);
      setProposalError('');
      await client.post('/admin/governance/proposals', {
        targetAdminId: selectedTargetAdmin.id,
        reason: proposalReason.trim()
      });
      setProposeModalOpen(false);
      await fetchGovernanceOverview();
    } catch (err) {
      setProposalError(err.message || 'Failed to submit removal proposal.');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleApproveProposal = async (proposalId) => {
    if (!window.confirm('Confirm your approval for this administrator removal proposal? This action is recorded in the immutable audit ledger.')) {
      return;
    }

    try {
      await client.post(`/admin/governance/proposals/${proposalId}/approve`);
      await fetchGovernanceOverview();
    } catch (err) {
      alert(err.message || 'Failed to record approval.');
    }
  };

  const handleCancelProposal = async (proposalId) => {
    if (!window.confirm('Are you sure you want to cancel this pending removal proposal?')) {
      return;
    }

    try {
      await client.post(`/admin/governance/proposals/${proposalId}/cancel`);
      await fetchGovernanceOverview();
    } catch (err) {
      alert(err.message || 'Failed to cancel proposal.');
    }
  };

  const handleFounderSuccession = async (e) => {
    e.preventDefault();
    if (!successorId) {
      setSuccessionError('Please select a designated successor administrator.');
      return;
    }

    if (!window.confirm('WARNING: Stepping down as Founder is permanent. You will transfer Founder designation to the selected administrator and your access will be revoked. Proceed?')) {
      return;
    }

    try {
      setSubmittingSuccession(true);
      setSuccessionError('');
      await client.post('/admin/governance/founder-self-revoke', {
        successorAdminId: parseInt(successorId),
        notes: successionNotes.trim() || null
      });
      setSuccessionModalOpen(false);
      window.location.reload();
    } catch (err) {
      setSuccessionError(err.message || 'Failed to execute founder succession.');
    } finally {
      setSubmittingSuccession(false);
    }
  };

  const handleProvisionUser = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setProvisionError('Please fill in all required fields.');
      return;
    }

    if (provisionRole === 'DEPARTMENT_HEAD' && !departmentId) {
      setProvisionError('Department heads must be assigned to an institutional department.');
      return;
    }

    try {
      setSubmittingProvision(true);
      setProvisionError('');
      await client.post('/users/admin-create', {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: provisionRole,
        departmentId: departmentId ? parseInt(departmentId) : null,
      });

      setProvisionModalOpen(false);
      setFullName('');
      setEmail('');
      setPassword('');
      setDepartmentId('');
      fetchGovernanceOverview();
      if (activeTab === 'directory') fetchDirectoryUsers();
    } catch (err) {
      setProvisionError(err.message || 'Failed to provision account.');
    } finally {
      setSubmittingProvision(false);
    }
  };

  const handleToggleDirectoryStatus = async (userId, currentActive) => {
    try {
      await client.patch(`/users/${userId}/status?active=${!currentActive}`);
      setDirectoryUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, active: !currentActive } : u))
      );
    } catch (err) {
      alert(err.message || 'Failed to update account status.');
    }
  };

  const isCurrentFounder = govData.administrators?.some(
    (a) => a.id === currentUser?.id && a.founder
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-unis-brand dark:text-unis-dark-brand" />
            Administrator Governance & Access Control
          </h1>
          <p className="text-sm text-unis-slate dark:text-unis-dark-muted">
            Enforce the 5-administrator institutional quota, unanimous non-target removal approvals, founder protection, and user permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            onClick={() => {
              setProvisionRole('ADMIN');
              setProvisionModalOpen(true);
            }}
            disabled={govData.activeCount >= 5}
            title={govData.activeCount >= 5 ? '5-administrator quota reached' : 'Provision new administrator'}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Provision Admin ({govData.activeCount}/5)
          </Button>

          {isCurrentFounder && govData.activeCount >= 2 && (
            <Button
              variant="outline"
              className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-50"
              onClick={() => setSuccessionModalOpen(true)}
            >
              <Crown className="w-4 h-4 mr-1.5" />
              Founder Succession
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-unis-border dark:border-unis-dark-border space-x-6 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('governance')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'governance'
              ? 'border-unis-brand text-unis-brand dark:border-unis-dark-brand dark:text-unis-dark-brand font-bold'
              : 'border-transparent text-unis-slate hover:text-unis-ink dark:hover:text-unis-dark-text'
          }`}
        >
          <Shield className="w-4 h-4" />
          Administrator Governance ({govData.activeCount}/5 Active)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'directory'
              ? 'border-unis-brand text-unis-brand dark:border-unis-dark-brand dark:text-unis-dark-brand font-bold'
              : 'border-transparent text-unis-slate hover:text-unis-ink dark:hover:text-unis-dark-text'
          }`}
        >
          <Users className="w-4 h-4" />
          Institutional User Directory
        </button>
      </div>

      {/* TAB 1: ADMINISTRATOR GOVERNANCE */}
      {activeTab === 'governance' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* 5-ADMIN QUOTA STATUS BANNER */}
          <Card className="p-5 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-transparent dark:from-unis-dark-elevated dark:to-unis-dark-card border border-unis-border dark:border-unis-dark-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-unis-brand dark:text-unis-dark-brand">
                    Constitutional Governance Policy
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    govData.canProposeRemoval
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}>
                    {govData.canProposeRemoval ? 'Removal Governance Active (5/5 Admins)' : 'Protected Mode (< 5 Admins)'}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-unis-ink dark:text-unis-dark-text">
                  5-Administrator Institutional Quota & Removal Threshold
                </h3>
                <p className="text-xs text-unis-slate dark:text-unis-dark-muted leading-relaxed">
                  {govData.ruleExplanation}
                </p>
              </div>

              {/* Quota Progress Meter */}
              <div className="bg-white dark:bg-unis-dark-card p-3.5 rounded-2xl border border-unis-border dark:border-unis-dark-border shadow-subtle shrink-0 min-w-[220px]">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-unis-ink dark:text-unis-dark-text">Admin Quota Slots</span>
                  <span className="text-unis-brand font-extrabold">{govData.activeCount} / 5</span>
                </div>

                {/* 5 Pill Visualizer */}
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((slot) => {
                    const isFilled = slot <= govData.activeCount;
                    return (
                      <div
                        key={slot}
                        className={`h-2.5 rounded-full transition-all ${
                          isFilled
                            ? 'bg-gradient-to-r from-unis-brand to-unis-indigo'
                            : 'bg-stone-200 dark:bg-unis-dark-elevated border border-dashed border-unis-border'
                        }`}
                        title={isFilled ? `Slot ${slot}: Occupied` : `Slot ${slot}: Available`}
                      />
                    );
                  })}
                </div>

                <p className="text-[10px] text-unis-slate dark:text-unis-dark-muted text-center mt-2">
                  {5 - govData.activeCount > 0
                    ? `${5 - govData.activeCount} additional admin slot(s) available`
                    : 'Administrator capacity reached'}
                </p>
              </div>
            </div>
          </Card>

          {/* ACTIVE REMOVAL PROPOSALS (IF ANY) */}
          {govData.pendingProposals && govData.pendingProposals.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-extrabold text-unis-ink dark:text-unis-dark-text uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Active Administrator Removal Proposals ({govData.pendingProposals.length})
              </h2>

              {govData.pendingProposals.map((proposal) => (
                <Card
                  key={proposal.id}
                  className="p-5 border-l-4 border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-unis-ink dark:text-unis-dark-text">
                          Target: {proposal.targetAdminName}
                        </span>
                        <span className="text-xs text-unis-slate font-mono">({proposal.targetAdminEmail})</span>
                      </div>
                      <p className="text-xs text-unis-slate dark:text-unis-dark-muted mt-1">
                        Initiated by <span className="font-semibold">{proposal.proposerAdminName}</span> on {new Date(proposal.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-unis-dark-card border border-unis-border dark:border-unis-dark-border text-xs text-unis-ink dark:text-unis-dark-text">
                        <span className="font-bold text-unis-slate">Reason: </span>
                        {proposal.reason}
                      </div>
                    </div>

                    {/* Approval Counter Badge */}
                    <div className="bg-white dark:bg-unis-dark-card p-3 rounded-2xl border border-unis-border dark:border-unis-dark-border text-center shrink-0 min-w-[160px]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-unis-slate">
                        Approval Progress
                      </span>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                        {proposal.approvalRatio}
                      </p>
                      <p className="text-[10px] text-unis-slate">4 unanimous required</p>
                    </div>
                  </div>

                  {/* Approving Admins List */}
                  <div className="text-xs text-unis-slate dark:text-unis-dark-muted">
                    <span className="font-semibold">Recorded Approvals: </span>
                    {proposal.approvedAdminNames?.join(', ') || 'None yet'}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-unis-border dark:border-unis-dark-border">
                    {proposal.targetAdminId === currentUser?.id ? (
                      <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                        <Ban className="w-3.5 h-3.5" />
                        Target administrators cannot vote on their own removal
                      </span>
                    ) : proposal.hasUserApproved ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Your approval has been recorded (1 of 4)
                      </span>
                    ) : proposal.canUserApprove ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleApproveProposal(proposal.id)}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
                        Approve Removal ({proposal.currentApprovalsCount}/4)
                      </Button>
                    ) : null}

                    {(proposal.proposerAdminId === currentUser?.id || isCurrentFounder) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelProposal(proposal.id)}
                      >
                        Cancel Proposal
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ADMINISTRATORS ROSTER TABLE */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-unis-border dark:border-unis-dark-border flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-unis-ink dark:text-unis-dark-text">
                  Institutional Administrators Roster
                </h3>
                <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
                  System administrators with unrestricted institutional governance privileges.
                </p>
              </div>

              <div className="text-xs text-unis-slate">
                Showing {govData.administrators?.length || 0} administrator accounts
              </div>
            </div>

            {govLoading ? (
              <div className="p-10 flex justify-center">
                <LoadingSpinner size="md" message="Loading administrator roster..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-unis-dark-elevated border-b border-unis-border dark:border-unis-dark-border text-unis-slate uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Administrator</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Provisioned Date</th>
                      <th className="py-3 px-4">Provisioned By</th>
                      <th className="py-3 px-4 text-right">Removal Governance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-unis-border dark:divide-unis-dark-border">
                    {govData.administrators?.map((admin) => {
                      const isFounder = admin.founder;
                      const isSelf = admin.id === currentUser?.id;
                      const isPendingTarget = govData.pendingProposals?.some(
                        (p) => p.targetAdminId === admin.id && p.status === 'PENDING'
                      );

                      return (
                        <tr
                          key={admin.id}
                          className="hover:bg-stone-50/50 dark:hover:bg-unis-dark-elevated/40 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-unis-ink dark:text-unis-dark-text">
                                {admin.fullName}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-unis-slate font-mono">{admin.email}</div>
                          </td>

                          <td className="py-3 px-4">
                            {isFounder ? (
                              <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[10px] bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                <Crown className="w-3 h-3 text-amber-600" />
                                Founder / Primary Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[10px] bg-stone-100 dark:bg-unis-dark-elevated text-unis-slate">
                                <Shield className="w-3 h-3" />
                                Administrator
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                                admin.active
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {admin.active ? 'Active' : 'Deactivated'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-unis-slate">
                            {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Initial'}
                          </td>

                          <td className="py-3 px-4 text-unis-slate">
                            {admin.createdByName || (isFounder ? 'Institutional Provision' : 'System')}
                          </td>

                          <td className="py-3 px-4 text-right">
                            {isFounder ? (
                              <span
                                className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold inline-flex items-center gap-1"
                                title="Founder cannot be removed by proposals"
                              >
                                <Lock className="w-3 h-3" />
                                Founder Protected
                              </span>
                            ) : isPendingTarget ? (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                                Proposal Pending ({govData.pendingProposals.find((p) => p.targetAdminId === admin.id)?.approvalRatio})
                              </span>
                            ) : !govData.canProposeRemoval ? (
                              <button
                                type="button"
                                disabled
                                className="px-2.5 py-1 text-xs rounded-lg border border-unis-border dark:border-unis-dark-border text-unis-slate/50 dark:text-unis-dark-muted/50 cursor-not-allowed"
                                title="Disabled: Requires exactly 5 active administrators to initiate removal governance"
                              >
                                Disabled (&lt; 5 Admins)
                              </button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                                onClick={() => handleOpenProposeModal(admin)}
                                disabled={isSelf}
                                title={isSelf ? 'Cannot propose your own removal' : 'Propose removal'}
                              >
                                Propose Removal
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: INSTITUTIONAL USER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-fade-in">
          {/* Toolbar */}
          <Card className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-unis-slate absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search user by name, email, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:outline-none focus:ring-2 focus:ring-unis-brand"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-brand"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r === 'ALL' ? 'All Roles' : `Role: ${r}`}
                  </option>
                ))}
              </select>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setProvisionRole('DEPARTMENT_HEAD');
                  setProvisionModalOpen(true);
                }}
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Provision Department Head
              </Button>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="overflow-hidden">
            {dirLoading ? (
              <div className="p-12 flex justify-center">
                <LoadingSpinner size="lg" message="Loading users directory..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-unis-dark-elevated border-b border-unis-border dark:border-unis-dark-border text-unis-slate uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Joined</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-unis-border dark:divide-unis-dark-border">
                    {directoryUsers
                      .filter((u) => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return (
                          u.fullName?.toLowerCase().includes(q) ||
                          u.email?.toLowerCase().includes(q) ||
                          u.departmentName?.toLowerCase().includes(q)
                        );
                      })
                      .map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-stone-50/50 dark:hover:bg-unis-dark-elevated/40 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-unis-ink dark:text-unis-dark-text flex items-center gap-1.5">
                              {u.fullName}
                              {u.founder && (
                                <Crown className="w-3 h-3 text-amber-500" title="Founder Administrator" />
                              )}
                            </div>
                            <div className="text-[11px] text-unis-slate font-mono">{u.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <RoleBadge role={u.role} />
                          </td>
                          <td className="py-3 px-4 text-unis-slate">
                            {u.departmentName || u.departmentRequested || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                                u.active
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {u.active ? 'Active' : 'Deactivated'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-unis-slate">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {u.role === 'ADMIN' ? (
                              <span className="text-[11px] text-unis-slate italic">
                                Governed by Admin Tab
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className={`text-xs ${
                                  u.active
                                    ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                                    : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                                }`}
                                onClick={() => handleToggleDirectoryStatus(u.id, u.active)}
                              >
                                {u.active ? 'Deactivate' : 'Activate'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* PROPOSE REMOVAL MODAL */}
      <Modal
        isOpen={proposeModalOpen}
        onClose={() => setProposeModalOpen(false)}
        title="Propose Administrator Removal"
      >
        <form onSubmit={handleSubmitProposal} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-bold">Constitutional Removal Rule (5 Admins)</p>
            <p>
              Proposing removal against <span className="font-bold">{selectedTargetAdmin?.fullName}</span> requires unanimous approval from all 4 non-target administrators. Your proposal initiation counts as the 1st approval.
            </p>
          </div>

          {proposalError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{proposalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Target Administrator
            </label>
            <input
              type="text"
              readOnly
              value={`${selectedTargetAdmin?.fullName} (${selectedTargetAdmin?.email})`}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-100 dark:bg-unis-dark-elevated text-unis-slate"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Formal Reason for Proposed Removal *
            </label>
            <textarea
              rows={3}
              placeholder="State clear operational, integrity, or administrative grounds..."
              value={proposalReason}
              onChange={(e) => setProposalReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-brand"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setProposeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingProposal}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Initiate Proposal (1/4)
            </Button>
          </div>
        </form>
      </Modal>

      {/* FOUNDER SUCCESSION MODAL */}
      <Modal
        isOpen={successionModalOpen}
        onClose={() => setSuccessionModalOpen(false)}
        title="Founder Administrator Succession Workflow"
      >
        <form onSubmit={handleFounderSuccession} className="space-y-4">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-600" />
              Succession Safeguard Policy
            </p>
            <p>
              The founder cannot be removed by other administrators. However, you may voluntarily step down by designating an active administrator successor. At least one viable administrator will remain active.
            </p>
          </div>

          {successionError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{successionError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Select Successor Administrator *
            </label>
            <select
              value={successorId}
              onChange={(e) => setSuccessorId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-brand"
              required
            >
              <option value="">-- Choose eligible active administrator --</option>
              {govData.administrators
                ?.filter((a) => a.id !== currentUser?.id && a.active)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName} ({a.email})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Succession Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Planned retirement / term completion"
              value={successionNotes}
              onChange={(e) => setSuccessionNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-brand"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setSuccessionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingSuccession}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Confirm Transfer & Step Down
            </Button>
          </div>
        </form>
      </Modal>

      {/* PROVISION USER MODAL */}
      <Modal
        isOpen={provisionModalOpen}
        onClose={() => setProvisionModalOpen(false)}
        title={provisionRole === 'ADMIN' ? 'Provision Institutional Administrator' : 'Provision Department Head'}
      >
        <form onSubmit={handleProvisionUser} className="space-y-4">
          <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
            {provisionRole === 'ADMIN'
              ? 'Provision a verified administrator account. Maximum 5 active administrators enforced.'
              : 'Provision an authorized academic department head account with scoped departmental governance.'}
          </p>

          {provisionError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{provisionError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Authorized Role *
            </label>
            <select
              value={provisionRole}
              onChange={(e) => setProvisionRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-brand"
            >
              <option value="ADMIN">ADMIN (System Administrator - Max 5)</option>
              <option value="DEPARTMENT_HEAD">DEPARTMENT_HEAD (Department Head)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Ananya Mehta"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-brand"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Login Email *
            </label>
            <input
              type="email"
              placeholder="e.g. ananya.mehta@unis.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-brand"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Temporary Password * (Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol)
            </label>
            <input
              type="password"
              placeholder="e.g. Secure@123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-brand"
              required
            />
          </div>

          {provisionRole === 'DEPARTMENT_HEAD' && (
            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Assigned Department *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-brand"
                required
              >
                <option value="">-- Select Academic Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setProvisionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submittingProvision}>
              Provision Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
