import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  PackageSearch,
  MapPin,
  Calendar,
  Tag,
  Palette,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  User,
  Send,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function LostFoundDetailPage() {
  const { id } = useParams();
  const { user, role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [claims, setClaims] = useState([]);

  // Claim submission modal
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimDesc, setClaimDesc] = useState('');
  const [proofDetails, setProofDetails] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);

  // Review claim modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('APPROVED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [processingReview, setProcessingReview] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const [itemRes, matchRes] = await Promise.all([
        client.get(`/lost-found/${id}`),
        client.get(`/lost-found/${id}/matches`),
      ]);

      const itemData = itemRes.data.data;
      setItem(itemData);
      setMatches(matchRes.data.data || []);

      // If user is staff/admin/head or the creator, fetch claims
      if (role === 'STAFF' || role === 'ADMIN' || role === 'DEPARTMENT_HEAD' || user?.id === itemData.reporterId) {
        try {
          const claimsRes = await client.get(`/lost-found/${id}/claims`);
          setClaims(claimsRes.data.data || []);
        } catch (e) {
          console.warn('Could not load claims for item:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load item:', err);
      setError('Item listing not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!claimDesc.trim() || !proofDetails.trim()) return;

    try {
      setSubmittingClaim(true);
      await client.post(`/lost-found/${id}/claims`, {
        claimDescription: claimDesc,
        proofDetails,
      });

      setClaimModalOpen(false);
      setClaimDesc('');
      setProofDetails('');
      alert('Claim filed successfully! The campus moderation crew will review your proof.');
      fetchItemDetails();
    } catch (err) {
      console.error('Failed to file claim:', err);
      alert(err.response?.data?.message || 'Failed to file claim.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleReviewClaim = async () => {
    if (!selectedClaim) return;
    try {
      setProcessingReview(true);
      await client.patch(`/claims/${selectedClaim.id}/status`, {
        status: reviewDecision,
        reviewNotes,
      });

      setReviewModalOpen(false);
      setSelectedClaim(null);
      fetchItemDetails();
    } catch (err) {
      console.error('Failed to process claim review:', err);
      alert(err.response?.data?.message || 'Failed to process claim review.');
    } finally {
      setProcessingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <LoadingSpinner size="lg" message="Loading listing details and intelligent match scoring..." />
      </div>
    );
  }

  if (error || !item) {
    return (
      <Card className="p-8 text-center space-y-4 max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-unis-ink dark:text-unis-dark-text">Listing Not Found</h2>
        <p className="text-xs text-unis-slate">{error || 'Requested item does not exist.'}</p>
        <Link to="/lost-found">
          <Button variant="primary">Return to Directory</Button>
        </Link>
      </Card>
    );
  }

  const isReviewer = role === 'STAFF' || role === 'ADMIN' || role === 'DEPARTMENT_HEAD';
  const isCreator = user?.id === item.reporterId;
  const canFileClaim = item.listingType === 'FOUND' && item.status !== 'RETURNED' && !isCreator;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/lost-found"
          className="text-xs font-semibold text-unis-slate hover:text-unis-forest flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        {canFileClaim && (
          <Button variant="primary" size="sm" onClick={() => setClaimModalOpen(true)}>
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            File Ownership Claim
          </Button>
        )}
      </div>

      {/* Main Listing Card */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-unis-border dark:border-unis-dark-border">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  item.listingType === 'FOUND'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {item.listingType}
              </span>

              <span className="text-xs font-bold text-unis-slate px-2.5 py-0.5 rounded bg-stone-100 dark:bg-unis-dark-elevated">
                {item.category}
              </span>

              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                  item.status === 'RETURNED'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-stone-100 text-stone-700 dark:bg-unis-dark-card dark:text-stone-300'
                }`}
              >
                Status: {item.status}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
              {item.title}
            </h1>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-stone-50 dark:bg-unis-dark-elevated text-xs border border-unis-border dark:border-unis-dark-border">
          <div>
            <span className="text-unis-slate text-[11px] block font-medium">Location</span>
            <span className="font-bold text-unis-ink dark:text-unis-dark-text flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-unis-forest" />
              {item.locationFound || 'Campus Grounds'}
            </span>
          </div>

          <div>
            <span className="text-unis-slate text-[11px] block font-medium">Date</span>
            <span className="font-bold text-unis-ink dark:text-unis-dark-text flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-unis-forest" />
              {new Date(item.dateFound || item.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div>
            <span className="text-unis-slate text-[11px] block font-medium">Color / Finish</span>
            <span className="font-bold text-unis-ink dark:text-unis-dark-text flex items-center gap-1 mt-0.5">
              <Palette className="w-3.5 h-3.5 text-unis-forest" />
              {item.color || 'Unspecified'}
            </span>
          </div>

          <div>
            <span className="text-unis-slate text-[11px] block font-medium">Listed By</span>
            <span className="font-bold text-unis-ink dark:text-unis-dark-text flex items-center gap-1 mt-0.5">
              <User className="w-3.5 h-3.5 text-unis-forest" />
              {item.reporterName}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
            Item Description & Characteristics
          </h3>
          <p className="text-sm text-unis-ink dark:text-unis-dark-text leading-relaxed whitespace-pre-wrap">
            {item.description}
          </p>
        </div>
      </Card>

      {/* Intelligent Match Suggestions */}
      {matches.length > 0 && (
        <Card className="p-6 space-y-4 border-unis-forest/30 bg-unis-highlight/20 dark:bg-unis-dark-elevated/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-unis-forest dark:text-unis-dark-forest" />
            <div>
              <h3 className="text-base font-bold text-unis-ink dark:text-unis-dark-text">
                Intelligent Match Engine Recommendations ({matches.length})
              </h3>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
                Rule-based algorithmic similarity comparing category, color, location keywords, and dates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matches.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-white dark:bg-unis-dark-card rounded-xl border border-unis-border dark:border-unis-dark-border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      m.listingType === 'FOUND'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {m.listingType}
                  </span>
                  <span className="text-xs font-extrabold text-unis-forest dark:text-unis-dark-forest bg-unis-highlight dark:bg-unis-dark-elevated px-2 py-0.5 rounded-full">
                    {m.matchScore}% Match
                  </span>
                </div>

                <h4 className="text-xs font-bold text-unis-ink dark:text-unis-dark-text line-clamp-1">
                  {m.title}
                </h4>

                <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted leading-relaxed">
                  Reason: {m.matchExplanation}
                </p>

                <div className="pt-2 flex justify-end">
                  <Link to={`/lost-found/${m.id}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      Inspect Item Listing →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Claims Review Panel (for Authorized Staff/Admins or listing creator) */}
      {claims.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-unis-forest dark:text-unis-dark-forest" />
            <div>
              <h3 className="text-base font-bold text-unis-ink dark:text-unis-dark-text">
                Ownership Claims Queue ({claims.length})
              </h3>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
                Private verification claims submitted by claimants requesting item return.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {claims.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50 dark:bg-unis-dark-elevated space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-unis-ink dark:text-unis-dark-text">
                      Claimant: {c.claimantName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-unis-slate">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div>
                    <span className="font-semibold text-unis-slate text-[11px]">Identifying Statement: </span>
                    <span className="text-unis-ink dark:text-unis-dark-text">{c.claimDescription}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-unis-slate text-[11px]">Secret Verification Proof: </span>
                    <span className="text-unis-ink dark:text-unis-dark-text font-mono bg-white dark:bg-unis-dark-card px-2 py-0.5 rounded border border-unis-border">
                      {c.proofDetails}
                    </span>
                  </div>
                  {c.reviewNotes && (
                    <div>
                      <span className="font-semibold text-unis-slate text-[11px]">Moderator Decision Note: </span>
                      <span className="text-unis-slate italic">{c.reviewNotes}</span>
                    </div>
                  )}
                </div>

                {isReviewer && c.status === 'PENDING' && (
                  <div className="pt-2 flex justify-end gap-2 border-t border-unis-border dark:border-unis-dark-border">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600 border-rose-300"
                      onClick={() => {
                        setSelectedClaim(c);
                        setReviewDecision('REJECTED');
                        setReviewNotes('');
                        setReviewModalOpen(true);
                      }}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Reject Claim
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-emerald-700 hover:bg-emerald-800"
                      onClick={() => {
                        setSelectedClaim(c);
                        setReviewDecision('APPROVED');
                        setReviewNotes('');
                        setReviewModalOpen(true);
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Approve & Mark Returned
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMIT CLAIM MODAL */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="Submit Ownership Claim"
      >
        <form onSubmit={handleSubmitClaim} className="space-y-4">
          <p className="text-xs text-unis-slate">
            Provide details verifying this discovered item belongs to you. Claims are privately reviewed by institutional administrators.
          </p>

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Claim Statement *
            </label>
            <textarea
              rows={2}
              placeholder="e.g. I left my black calculator in the 2nd floor library study carrel on Tuesday afternoon."
              value={claimDesc}
              onChange={(e) => setClaimDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Secret Proof Details / Unique Markings *
            </label>
            <input
              type="text"
              placeholder="e.g. My initials 'S.K.' written inside battery cover / blue sticker on back"
              value={proofDetails}
              onChange={(e) => setProofDetails(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setClaimModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submittingClaim}>
              Submit Private Claim
            </Button>
          </div>
        </form>
      </Modal>

      {/* REVIEW CLAIM MODAL */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Review Claim: ${reviewDecision}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-unis-slate">
            You are setting claim decision to{' '}
            <strong className={reviewDecision === 'APPROVED' ? 'text-emerald-700' : 'text-rose-600'}>
              {reviewDecision}
            </strong>{' '}
            for claimant <strong>{selectedClaim?.claimantName}</strong>.
          </p>

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Reviewer Notes / Verification Reason
            </label>
            <textarea
              rows={3}
              placeholder="Record reason or collection instructions (e.g. Verified battery cover initials, claimant collected item at Student Services desk)..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={processingReview}
              onClick={handleReviewClaim}
            >
              Confirm Decision
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
