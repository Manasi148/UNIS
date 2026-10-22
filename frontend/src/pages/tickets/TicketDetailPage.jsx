import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Building,
  User,
  Shield,
  Send,
  MessageSquare,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  UserPlus,
  Star,
  Bell,
  Calendar,
  Layers,
  History
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  // Comment input state
  const [commentText, setCommentText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Modals
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [transitioningStatus, setTransitioningStatus] = useState(false);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [staffUsers, setStaffUsers] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const [tktRes, histRes, commRes] = await Promise.all([
        client.get(`/tickets/${id}`),
        client.get(`/tickets/${id}/history`),
        client.get(`/tickets/${id}/comments`),
      ]);

      const tkt = tktRes.data.data;
      setTicket(tkt);
      setHistory(histRes.data.data || []);
      setComments(commRes.data.data || []);
      setIsFollowing(tkt.isFollowedByCurrentUser || false);
    } catch (err) {
      console.error('Failed to load ticket details:', err);
      setError('Failed to load ticket details or ticket not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      await client.post(`/tickets/${id}/comments`, {
        comment: commentText,
        internalOnly: isInternalNote,
      });

      setCommentText('');
      setIsInternalNote(false);
      // Refresh comments and history
      const [commRes, histRes] = await Promise.all([
        client.get(`/tickets/${id}/comments`),
        client.get(`/tickets/${id}/history`),
      ]);
      setComments(commRes.data.data || []);
      setHistory(histRes.data.data || []);
    } catch (err) {
      console.error('Failed to post comment:', err);
      alert(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleToggleFollow = async () => {
    try {
      if (isFollowing) {
        await client.delete(`/tickets/${id}/follow`);
        setIsFollowing(false);
      } else {
        await client.post(`/tickets/${id}/follow`);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Failed to toggle follow status:', err);
    }
  };

  const openStatusModal = (status) => {
    setSelectedStatus(status);
    setStatusReason('');
    setResolutionSummary('');
    setStatusModalOpen(true);
  };

  const handleStatusTransition = async () => {
    try {
      setTransitioningStatus(true);
      await client.patch(`/tickets/${id}/status`, {
        status: selectedStatus,
        statusReason,
        resolutionSummary: selectedStatus === 'RESOLVED' ? resolutionSummary : null,
      });

      setStatusModalOpen(false);
      fetchTicketDetails();
    } catch (err) {
      console.error('Failed to transition status:', err);
      alert(err.response?.data?.message || 'Failed to update ticket status.');
    } finally {
      setTransitioningStatus(false);
    }
  };

  const openAssignModal = async () => {
    try {
      const res = await client.get('/users?role=STAFF');
      setStaffUsers(res.data.data?.content || []);
      setAssignModalOpen(true);
    } catch (err) {
      console.error('Failed to load staff list:', err);
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedStaffId) return;
    try {
      setAssigning(true);
      await client.post(`/tickets/${id}/assign`, {
        staffId: parseInt(selectedStaffId),
      });

      setAssignModalOpen(false);
      fetchTicketDetails();
    } catch (err) {
      console.error('Failed to assign ticket:', err);
      alert(err.response?.data?.message || 'Failed to assign ticket.');
    } finally {
      setAssigning(false);
    }
  };

  const handleReopenTicket = async () => {
    if (!reopenReason.trim()) return;
    try {
      setReopening(true);
      await client.post(`/tickets/${id}/reopen`, {
        reason: reopenReason,
      });

      setReopenModalOpen(false);
      fetchTicketDetails();
    } catch (err) {
      console.error('Failed to reopen ticket:', err);
      alert(err.response?.data?.message || 'Failed to reopen ticket.');
    } finally {
      setReopening(false);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      setSubmittingFeedback(true);
      await client.post(`/tickets/${id}/feedback`, {
        rating,
        comments: feedbackText,
      });

      setFeedbackModalOpen(false);
      fetchTicketDetails();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      alert(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <LoadingSpinner size="lg" message="Loading ticket dossier and timeline..." />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <Card className="p-8 text-center space-y-4 max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-unis-ink dark:text-unis-dark-text">Ticket Not Found</h2>
        <p className="text-xs text-unis-slate">{error || 'Requested ticket does not exist or access was denied.'}</p>
        <Link to="/tickets">
          <Button variant="primary">Return to Ticket List</Button>
        </Link>
      </Card>
    );
  }

  const isStaffOrAdmin = role === 'STAFF' || role === 'DEPARTMENT_HEAD' || role === 'ADMIN';
  const isHeadOrAdmin = role === 'DEPARTMENT_HEAD' || role === 'ADMIN';
  const isAuthor = user?.id === ticket.studentId;
  const canReopen = isAuthor && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED');
  const canFeedback = isAuthor && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/tickets"
          className="text-xs font-semibold text-unis-slate hover:text-unis-forest flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets Queue
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Follow Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFollow}
            className={isFollowing ? 'text-unis-forest border-unis-forest bg-unis-highlight/50' : ''}
          >
            <Bell className={`w-3.5 h-3.5 mr-1.5 ${isFollowing ? 'fill-unis-forest' : ''}`} />
            {isFollowing ? 'Following Updates' : 'Follow Ticket'}
          </Button>

          {/* Department Head / Admin Reassignment */}
          {isHeadOrAdmin && (
            <Button variant="outline" size="sm" onClick={openAssignModal}>
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              {ticket.assignedStaffId ? 'Reassign Staff' : 'Assign Staff'}
            </Button>
          )}

          {/* Reopen Action for Student */}
          {canReopen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReopenModalOpen(true)}
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reopen Issue
            </Button>
          )}

          {/* Feedback Button for Student */}
          {canFeedback && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFeedbackModalOpen(true)}
              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              <Star className="w-3.5 h-3.5 mr-1.5" />
              Rate Resolution
            </Button>
          )}

          {/* Status Transitions for Staff / Admin */}
          {isStaffOrAdmin && (
            <div className="flex items-center gap-1.5">
              {ticket.status === 'ASSIGNED' && (
                <Button size="sm" variant="primary" onClick={() => openStatusModal('IN_PROGRESS')}>
                  Start Progress
                </Button>
              )}
              {ticket.status === 'IN_PROGRESS' && (
                <>
                  <Button size="sm" variant="outline" onClick={() => openStatusModal('WAITING_FOR_INFO')}>
                    Request Info
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => openStatusModal('RESOLVED')}>
                    Mark Resolved
                  </Button>
                </>
              )}
              {ticket.status === 'WAITING_FOR_INFO' && (
                <Button size="sm" variant="primary" onClick={() => openStatusModal('IN_PROGRESS')}>
                  Resume Work
                </Button>
              )}
              {ticket.status === 'RESOLVED' && isHeadOrAdmin && (
                <Button size="sm" variant="outline" onClick={() => openStatusModal('CLOSED')}>
                  Close Ticket
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overdue Banner if applicable */}
      {ticket.overdue && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3 text-rose-800 dark:text-rose-300 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <div>
              <span className="font-bold">SLA Target Escalation:</span> This ticket has exceeded its resolution deadline and is marked overdue for departmental review.
            </div>
          </div>
        </div>
      )}

      {/* Main Ticket Card */}
      <Card className="p-6 space-y-6">
        {/* Header Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-unis-border dark:border-unis-dark-border">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-unis-forest dark:text-unis-dark-forest bg-unis-highlight dark:bg-unis-dark-elevated px-2.5 py-1 rounded-lg">
                {ticket.ticketReference}
              </span>
              <span className="text-xs font-bold text-unis-slate dark:text-unis-dark-muted px-2 py-0.5 rounded bg-stone-100 dark:bg-unis-dark-card">
                {ticket.category}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
              {ticket.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-stone-50 dark:bg-unis-dark-elevated text-xs border border-unis-border dark:border-unis-dark-border">
          <div>
            <span className="text-unis-slate text-[11px] block font-medium">Location</span>
            <span className="font-bold text-unis-ink dark:text-unis-dark-text flex items-center gap-1 mt-0.5">
              <Building className="w-3.5 h-3.5 text-unis-forest" />
              {ticket.buildingName} • {ticket.roomNumber}
            </span>
          </div>

          <div>
            <span className="text-unis-slate text-[11px] block font-medium">Reported By</span>
            <span className="font-bold text-unis-ink dark:text-unis-dark-text flex items-center gap-1 mt-0.5">
              <User className="w-3.5 h-3.5 text-unis-forest" />
              {ticket.studentName}
            </span>
          </div>

          <div>
            <span className="text-unis-slate text-[11px] block font-medium">Assigned Crew</span>
            <span className="font-bold text-unis-ink dark:text-unis-dark-text flex items-center gap-1 mt-0.5">
              <Shield className="w-3.5 h-3.5 text-unis-forest" />
              {ticket.assignedStaffName || 'Unassigned Triage'}
            </span>
          </div>

          <div>
            <span className="text-unis-slate text-[11px] block font-medium">SLA Due Date</span>
            <span className="font-bold text-unis-ink dark:text-unis-dark-text flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-unis-forest" />
              {ticket.targetResolutionTime
                ? new Date(ticket.targetResolutionTime).toLocaleDateString()
                : 'Standard target'}
            </span>
          </div>
        </div>

        {/* Full Problem Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
            Problem Description
          </h3>
          <p className="text-sm text-unis-ink dark:text-unis-dark-text leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {/* Resolution Summary Banner if resolved */}
        {ticket.resolutionSummary && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Official Resolution Summary
            </div>
            <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
              {ticket.resolutionSummary}
            </p>
          </div>
        )}
      </Card>

      {/* Grid: Timeline History & Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Timeline History */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-unis-forest dark:text-unis-dark-forest" />
            <h3 className="text-base font-bold text-unis-ink dark:text-unis-dark-text">
              Status Lifecycle Timeline
            </h3>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-unis-border dark:before:bg-unis-dark-border">
            {history.map((h) => (
              <div key={h.id} className="relative group">
                <div className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-unis-dark-card bg-unis-forest" />
                <Card className="p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-unis-forest dark:text-unis-dark-forest">
                      {h.eventType}
                    </span>
                    <span className="text-unis-slate">
                      {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                      • {new Date(h.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-unis-ink dark:text-unis-dark-text font-medium">
                    {h.description}
                  </p>
                  <div className="text-[10px] text-unis-slate pt-0.5">
                    Actor: {h.actorName}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Comments & Internal Notes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-unis-forest dark:text-unis-dark-forest" />
              <h3 className="text-base font-bold text-unis-ink dark:text-unis-dark-text">
                Ticket Discussions & Updates
              </h3>
            </div>
            <span className="text-xs text-unis-slate font-medium">
              {comments.length} message{comments.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Comments Feed */}
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <Card className="p-6 text-center text-xs text-unis-slate">
                No discussion recorded yet. Add an update or note below.
              </Card>
            ) : (
              comments.map((c) => (
                <Card
                  key={c.id}
                  className={`p-4 space-y-1.5 ${
                    c.internalOnly
                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-unis-ink dark:text-unis-dark-text">
                        {c.authorName}
                      </span>
                      {c.internalOnly && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                          <Lock className="w-3 h-3" /> Internal Staff Note
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-unis-slate">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-unis-ink dark:text-unis-dark-text leading-relaxed">
                    {c.comment}
                  </p>
                </Card>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <Card className="p-4">
            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                rows={3}
                placeholder="Write a status update, question, or response..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:outline-none focus:ring-2 focus:ring-unis-forest"
              />

              <div className="flex items-center justify-between">
                {isStaffOrAdmin ? (
                  <label className="flex items-center gap-2 text-xs text-unis-slate cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-unis-border text-unis-forest focus:ring-unis-forest"
                    />
                    <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                      <Lock className="w-3 h-3" /> Internal staff only
                    </span>
                  </label>
                ) : (
                  <div />
                )}

                <Button type="submit" size="sm" variant="primary" loading={submittingComment}>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Post Update
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* STATUS TRANSITION MODAL */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Advance Ticket Status: ${selectedStatus}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-unis-slate">
            Transitioning status for ticket <strong>{ticket.ticketReference}</strong> to{' '}
            <strong className="text-unis-forest">{selectedStatus}</strong>.
          </p>

          {selectedStatus === 'RESOLVED' && (
            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Resolution Summary * (Explaining fix performed)
              </label>
              <textarea
                rows={3}
                placeholder="Detail what repair was conducted, parts replaced, or service restored..."
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Transition Reason / Operational Note
            </label>
            <input
              type="text"
              placeholder="Optional comment for ticket lifecycle audit"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={transitioningStatus}
              onClick={handleStatusTransition}
            >
              Confirm Transition
            </Button>
          </div>
        </div>
      </Modal>

      {/* ASSIGN STAFF MODAL */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Staff to Ticket"
      >
        <div className="space-y-4">
          <p className="text-xs text-unis-slate">
            Select a maintenance technician or department staff officer to take ownership of this ticket.
          </p>

          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
          >
            <option value="">-- Choose Staff Member --</option>
            {staffUsers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.departmentName || 'Staff'})
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={assigning}
              disabled={!selectedStaffId}
              onClick={handleAssignTicket}
            >
              Assign Staff
            </Button>
          </div>
        </div>
      </Modal>

      {/* REOPEN MODAL */}
      <Modal
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        title="Reopen Campus Issue"
      >
        <div className="space-y-4">
          <p className="text-xs text-unis-slate">
            If the problem recurred or the resolution was unsatisfactory, specify the reason to reopen the issue.
          </p>

          <textarea
            rows={3}
            placeholder="Explain why the problem requires further inspection..."
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setReopenModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={reopening}
              disabled={!reopenReason.trim()}
              onClick={handleReopenTicket}
            >
              Confirm Reopen
            </Button>
          </div>
        </div>
      </Modal>

      {/* FEEDBACK MODAL */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Service Resolution Rating & Feedback"
      >
        <div className="space-y-4">
          <p className="text-xs text-unis-slate">
            Please evaluate your satisfaction with how quickly and effectively this maintenance issue was resolved.
          </p>

          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 text-amber-400 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-7 h-7 ${
                    rating >= star ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            rows={3}
            placeholder="Optional comments regarding the speed and quality of work..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setFeedbackModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={submittingFeedback}
              onClick={handleSubmitFeedback}
            >
              Submit Rating
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
