import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PackageSearch,
  PlusCircle,
  Search,
  Filter,
  MapPin,
  Calendar,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  LayoutGrid,
  List,
  AlertTriangle,
  Trash2,
  Edit3,
  FileCheck,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

// Standard 10 institutional categories (alphabetically sorted)
const CANONICAL_CATEGORIES = [
  'Bags and Wallets',
  'Books and Study Materials',
  'Clothing and Accessories',
  'Electronics',
  'ID Cards and Documents',
  'Keys',
  'Sports Equipment',
  'Stationery',
  'Water Bottles and Personal Items',
  'Other',
];

export function LostFoundListPage({ defaultTab }) {
  const { user, role } = useAuth();
  const isAdminOrStaff = role === 'ADMIN' || role === 'STAFF' || role === 'DEPARTMENT_HEAD';
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view tab: 'listings' | 'claims'
  const initialTab = defaultTab || (searchParams.get('tab') === 'claims' ? 'claims' : 'listings');
  const [activeTab, setActiveTab] = useState(initialTab);

  // Layout view: 'grid' | 'table'
  const [viewMode, setViewMode] = useState('table');

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);

  // Metrics summary counts
  const [summaryCounts, setSummaryCounts] = useState({
    activeLost: 0,
    activeFound: 0,
    pendingClaims: 0,
    resolvedOrReturned: 0,
  });

  // Filters for listings
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'ALL');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Claims tab state
  const [claimStatusFilter, setClaimStatusFilter] = useState(searchParams.get('claimStatus') || 'ALL');
  const [claimPage, setClaimPage] = useState(0);
  const [claimTotalPages, setClaimTotalPages] = useState(1);
  const [claimTotalElements, setClaimTotalElements] = useState(0);

  // Actions and Modals
  const [feedback, setFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusModal, setStatusModal] = useState({ open: false, item: null, targetStatus: 'OPEN' });
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
  const [claimReviewModal, setClaimReviewModal] = useState({ open: false, claim: null, decision: 'APPROVED', notes: '' });

  useEffect(() => {
    fetchSummaryMetrics();
  }, []);

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchItems();
    } else {
      fetchClaims();
    }
  }, [activeTab, typeFilter, categoryFilter, statusFilter, page, claimStatusFilter, claimPage]);

  const fetchSummaryMetrics = async () => {
    try {
      const res = await client.get('/analytics/overview');
      const data = res.data || {};
      setSummaryCounts({
        activeLost: data.activeLostItemsCount || 0,
        activeFound: data.activeFoundItemsCount || 0,
        pendingClaims: data.pendingClaimsCount || 0,
        resolvedOrReturned: data.resolvedLostFoundCount || 0,
      });
    } catch (err) {
      console.warn('Could not load overview metrics for Lost & Found:', err);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 15,
      };
      if (typeFilter !== 'ALL') params.itemType = typeFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await client.get('/lost-found', { params });
      // client.js already unwraps response.data, so res is ApiResponse: { data: { content: [...] } }
      const pagedData = res.data || {};
      const content = pagedData.content || (Array.isArray(pagedData) ? pagedData : []);

      setItems(content);
      setTotalPages(pagedData.totalPages || 1);
      setTotalElements(pagedData.totalElements || content.length);
    } catch (err) {
      console.error('Failed to load lost & found listings:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to retrieve listings from server.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = {
        page: claimPage,
        size: 15,
      };
      if (claimStatusFilter !== 'ALL') params.status = claimStatusFilter;

      const endpoint = isAdminOrStaff ? '/claims' : '/claims/my';
      const res = await client.get(endpoint, { params });
      const pagedData = res.data || {};
      const content = pagedData.content || (Array.isArray(pagedData) ? pagedData : []);

      setClaims(content);
      setClaimTotalPages(pagedData.totalPages || 1);
      setClaimTotalElements(pagedData.totalElements || content.length);
    } catch (err) {
      console.error('Failed to load item claims:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load claims queue.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchItems();
  };

  const handleClearFilters = () => {
    setTypeFilter('ALL');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setSearchQuery('');
    setPage(0);
    setSearchParams({});
  };

  // Change Listing Status
  const handleUpdateStatusConfirm = async () => {
    if (!statusModal.item) return;
    try {
      setActionLoading(true);
      await client.patch(`/lost-found/${statusModal.item.id}/status?status=${statusModal.targetStatus}`);
      setFeedback({
        type: 'success',
        message: `Listing status updated to ${statusModal.targetStatus} successfully!`,
      });
      setStatusModal({ open: false, item: null, targetStatus: 'OPEN' });
      fetchItems();
      fetchSummaryMetrics();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Status update failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Listing
  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    try {
      setActionLoading(true);
      await client.delete(`/lost-found/${deleteModal.item.id}`);
      setFeedback({ type: 'success', message: 'Item listing deleted and removed from directory.' });
      setDeleteModal({ open: false, item: null });
      fetchItems();
      fetchSummaryMetrics();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete listing.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Review Claim Decision Confirm
  const handleReviewClaimConfirm = async () => {
    if (!claimReviewModal.claim) return;
    try {
      setActionLoading(true);
      await client.patch(`/claims/${claimReviewModal.claim.id}/status`, {
        claimStatus: claimReviewModal.decision,
        reviewNotes: claimReviewModal.notes,
      });
      setFeedback({
        type: 'success',
        message: `Claim decision (${claimReviewModal.decision}) recorded successfully!`,
      });
      setClaimReviewModal({ open: false, claim: null, decision: 'APPROVED', notes: '' });
      fetchClaims();
      fetchSummaryMetrics();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update claim decision.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-1 border border-emerald-200/60 dark:border-emerald-900/60">
            <PackageSearch className="w-3.5 h-3.5" />
            <span>Campus Property Custody</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
            Lost & Found Management
          </h1>
          <p className="text-xs sm:text-sm text-unis-slate dark:text-unis-dark-muted">
            Review reported items, manage listing status, and oversee claims for recovered belongings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { fetchSummaryMetrics(); if (activeTab === 'listings') fetchItems(); else fetchClaims(); }}
            loading={loading}
            icon={RefreshCw}
            className="text-xs rounded-xl"
          >
            Refresh
          </Button>

          <Link to="/lost-found/new">
            <Button
              size="sm"
              icon={PlusCircle}
              className="bg-unis-brand hover:bg-unis-indigo text-white text-xs font-bold rounded-xl shadow-subtle"
            >
              Report Item
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Summary Metric Cards (All Clickable with Filters) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          onClick={() => { setActiveTab('listings'); setTypeFilter('LOST'); setStatusFilter('OPEN'); setPage(0); }}
          className="p-4 sm:p-5 border border-unis-border dark:border-unis-dark-border hover:border-amber-400/60 transition-all cursor-pointer rounded-2xl shadow-subtle group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                Active Lost Items
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {summaryCounts.activeLost}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <PackageSearch className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-unis-slate dark:text-unis-dark-muted mt-2 pt-2 border-t border-unis-border/60 flex items-center justify-between">
            <span>Filter lost items</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-amber-600" />
          </div>
        </Card>

        <Card
          onClick={() => { setActiveTab('listings'); setTypeFilter('FOUND'); setStatusFilter('OPEN'); setPage(0); }}
          className="p-4 sm:p-5 border border-unis-border dark:border-unis-dark-border hover:border-emerald-400/60 transition-all cursor-pointer rounded-2xl shadow-subtle group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                Active Found Items
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
                {summaryCounts.activeFound}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-unis-slate dark:text-unis-dark-muted mt-2 pt-2 border-t border-unis-border/60 flex items-center justify-between">
            <span>Filter found items</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-emerald-600" />
          </div>
        </Card>

        <Card
          onClick={() => { setActiveTab('claims'); setClaimStatusFilter('PENDING'); setClaimPage(0); }}
          className={`p-4 sm:p-5 border transition-all cursor-pointer rounded-2xl shadow-subtle group ${
            summaryCounts.pendingClaims > 0
              ? 'border-indigo-300 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/20'
              : 'border-unis-border dark:border-unis-dark-border hover:border-unis-brand/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                Pending Claims
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className={`text-2xl sm:text-3xl font-extrabold ${summaryCounts.pendingClaims > 0 ? 'text-unis-indigo' : 'text-unis-ink dark:text-unis-dark-text'}`}>
                  {summaryCounts.pendingClaims}
                </p>
                {summaryCounts.pendingClaims > 0 && <span className="w-2 h-2 rounded-full bg-unis-indigo animate-pulse" />}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-unis-violet-light dark:bg-unis-dark-elevated text-unis-indigo flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-unis-slate dark:text-unis-dark-muted mt-2 pt-2 border-t border-unis-border/60 flex items-center justify-between">
            <span>Review claims queue</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-unis-indigo" />
          </div>
        </Card>

        <Card
          onClick={() => { setActiveTab('listings'); setStatusFilter('RESOLVED'); setPage(0); }}
          className="p-4 sm:p-5 border border-unis-border dark:border-unis-dark-border hover:border-blue-400/60 transition-all cursor-pointer rounded-2xl shadow-subtle group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                Resolved / Returned
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-unis-brand mt-1">
                {summaryCounts.resolvedOrReturned}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-unis-blue-light dark:bg-unis-dark-highlight text-unis-brand flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-unis-slate dark:text-unis-dark-muted mt-2 pt-2 border-t border-unis-border/60 flex items-center justify-between">
            <span>Filter returned records</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-unis-brand" />
          </div>
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
      <div className="flex items-center justify-between border-b border-unis-border dark:border-unis-dark-border pb-px">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveTab('listings'); setSearchParams({ tab: 'listings' }); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'listings'
                ? 'border-unis-brand text-unis-brand dark:text-unis-dark-brand bg-unis-blue-light/30 dark:bg-unis-dark-highlight/40 rounded-t-xl'
                : 'border-transparent text-unis-slate dark:text-unis-dark-muted hover:text-unis-ink dark:hover:text-unis-dark-text'
            }`}
          >
            <PackageSearch className="w-4 h-4" />
            <span>All Property Listings ({totalElements})</span>
          </button>

          <button
            onClick={() => { setActiveTab('claims'); setSearchParams({ tab: 'claims' }); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'claims'
                ? 'border-unis-brand text-unis-brand dark:text-unis-dark-brand bg-unis-blue-light/30 dark:bg-unis-dark-highlight/40 rounded-t-xl'
                : 'border-transparent text-unis-slate dark:text-unis-dark-muted hover:text-unis-ink dark:hover:text-unis-dark-text'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Ownership Claims Queue</span>
            {summaryCounts.pendingClaims > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-unis-indigo text-white">
                {summaryCounts.pendingClaims}
              </span>
            )}
          </button>
        </div>

        {/* View Mode Switcher (Grid vs Table) for listings */}
        {activeTab === 'listings' && (
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-unis-dark-elevated border border-unis-border dark:border-unis-dark-border">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white dark:bg-unis-dark-card text-unis-brand shadow-xs' : 'text-unis-slate'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white dark:bg-unis-dark-card text-unis-brand shadow-xs' : 'text-unis-slate'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: LISTINGS MANAGEMENT */}
      {activeTab === 'listings' && (
        <Card className="p-0 border border-unis-border dark:border-unis-dark-border overflow-hidden rounded-2xl shadow-subtle space-y-0">
          {/* Filter Bar */}
          <div className="p-4 bg-stone-50/50 dark:bg-unis-dark-elevated/40 border-b border-unis-border dark:border-unis-dark-border flex flex-col md:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-unis-slate/60 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, description, color, location..."
                className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand"
              />
            </form>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
                className="px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand cursor-pointer"
              >
                <option value="ALL">All Types (Lost & Found)</option>
                <option value="LOST">Only Lost Items</option>
                <option value="FOUND">Only Found Items</option>
              </select>

              {/* 10 Standard Canonical Categories */}
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
                className="px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand cursor-pointer max-w-[180px]"
              >
                <option value="ALL">All Categories</option>
                {CANONICAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                className="px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="CLAIMED">CLAIMED</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="RETURNED">RETURNED</option>
                <option value="CLOSED">CLOSED</option>
              </select>

              {/* Reset Filters */}
              {(searchQuery || typeFilter !== 'ALL' || categoryFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <button
                  onClick={handleClearFilters}
                  className="p-2 text-xs text-unis-slate hover:text-unis-ink dark:text-unis-dark-muted dark:hover:text-white flex items-center gap-1 rounded-xl hover:bg-stone-100 dark:hover:bg-unis-dark-elevated"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Listings Body */}
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner message="Querying institutional lost & found database..." />
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-unis-dark-elevated text-unis-slate flex items-center justify-center mx-auto">
                <PackageSearch className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-unis-ink dark:text-unis-dark-text">No items found</h3>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted max-w-sm mx-auto">
                No lost or found listings match your selected search criteria. Listings will appear once students or campus staff report items.
              </p>
              <Link to="/lost-found/new">
                <Button size="sm" icon={PlusCircle} className="bg-unis-brand text-white text-xs font-bold rounded-xl mt-2">
                  Report Item Now
                </Button>
              </Link>
            </div>
          ) : viewMode === 'table' ? (
            /* TABLE VIEW */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-unis-dark-elevated text-unis-slate dark:text-unis-dark-muted font-bold uppercase tracking-wider text-[10px] border-b border-unis-border dark:border-unis-dark-border">
                  <tr>
                    <th className="p-3.5">Item Name & Details</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Date Occurred</th>
                    <th className="p-3.5">Reported By</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Claims</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-unis-border dark:divide-unis-dark-border">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-unis-dark-elevated/30 transition-colors">
                      <td className="p-3.5">
                        <Link to={`/lost-found/${item.id}`} className="font-bold text-unis-ink dark:text-unis-dark-text hover:text-unis-brand line-clamp-1">
                          {item.title}
                        </Link>
                        <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                        {item.color && (
                          <span className="text-[10px] text-unis-slate/70">Color: {item.color}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            item.itemType === 'FOUND'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          {item.itemType}
                        </span>
                      </td>
                      <td className="p-3.5 text-unis-ink dark:text-unis-dark-text font-medium">
                        {item.category}
                      </td>
                      <td className="p-3.5 text-unis-slate dark:text-unis-dark-muted">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-unis-slate/60 shrink-0" />
                          <span className="truncate max-w-[120px]">{item.locationName || item.locationDescription || 'Campus'}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-unis-slate dark:text-unis-dark-muted">
                        {item.dateOccurred || new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-unis-slate dark:text-unis-dark-muted">
                        <div>{item.reportedByName || 'Student'}</div>
                        {item.contactInfo && (
                          <div className="text-[10px] text-unis-slate/60 truncate max-w-[120px]">{item.contactInfo}</div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.status === 'RESOLVED' || item.status === 'RETURNED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                              : item.status === 'CLAIMED'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {item.claimsCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                            {item.claimsCount} claim(s)
                          </span>
                        ) : (
                          <span className="text-[10px] text-unis-slate/60">0</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/lost-found/${item.id}`}
                            className="p-1.5 rounded-lg text-unis-slate hover:text-unis-brand hover:bg-unis-blue-light dark:hover:bg-unis-dark-elevated transition-colors"
                            title="Inspect Listing"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {isAdminOrStaff && (
                            <>
                              <button
                                onClick={() => setStatusModal({ open: true, item, targetStatus: item.status })}
                                className="p-1.5 rounded-lg text-unis-slate hover:text-unis-indigo hover:bg-unis-violet-light dark:hover:bg-unis-dark-elevated transition-colors"
                                title="Update Status"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeleteModal({ open: true, item })}
                                className="p-1.5 rounded-lg text-unis-slate hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                title="Delete Listing"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* GRID VIEW */
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="p-5 flex flex-col justify-between border border-unis-border dark:border-unis-dark-border hover:border-unis-brand/40 transition-all rounded-2xl shadow-subtle group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          item.itemType === 'FOUND'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {item.itemType}
                      </span>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-unis-dark-elevated text-unis-slate">
                        {item.status}
                      </span>
                    </div>

                    <div>
                      <Link to={`/lost-found/${item.id}`} className="font-bold text-sm text-unis-ink dark:text-unis-dark-text group-hover:text-unis-brand transition-colors line-clamp-1">
                        {item.title}
                      </Link>
                      <p className="text-xs text-unis-slate dark:text-unis-dark-muted line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-unis-border dark:border-unis-dark-border mt-3 space-y-2 text-xs text-unis-slate dark:text-unis-dark-muted">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Tag className="w-3.5 h-3.5 text-unis-brand" />
                        {item.category} {item.color ? `• ${item.color}` : ''}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.dateOccurred || new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1 text-[11px] truncate max-w-[180px]">
                        <MapPin className="w-3 h-3 text-unis-brand shrink-0" />
                        {item.locationName || item.locationDescription || 'Campus Grounds'}
                      </span>
                      <Link to={`/lost-found/${item.id}`} className="text-xs font-bold text-unis-brand hover:underline flex items-center gap-0.5">
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3.5 border-t border-unis-border dark:border-unis-dark-border flex items-center justify-between text-xs text-unis-slate dark:text-unis-dark-muted">
              <span>Page {page + 1} of {totalPages} ({totalElements} total items)</span>
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

      {/* TAB 2: OWNERSHIP CLAIMS QUEUE */}
      {activeTab === 'claims' && (
        <Card className="p-0 border border-unis-border dark:border-unis-dark-border overflow-hidden rounded-2xl shadow-subtle space-y-0">
          {/* Claims Filter Bar */}
          <div className="p-4 bg-stone-50/50 dark:bg-unis-dark-elevated/40 border-b border-unis-border dark:border-unis-dark-border flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-unis-indigo" />
              <span className="text-xs font-bold text-unis-ink dark:text-unis-dark-text">
                {isAdminOrStaff ? 'Institutional Claims Review Queue' : 'My Filed Claims'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={claimStatusFilter}
                onChange={(e) => { setClaimStatusFilter(e.target.value); setClaimPage(0); }}
                className="px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand cursor-pointer"
              >
                <option value="ALL">All Claim Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="MORE_INFO_REQUIRED">MORE INFO REQUIRED</option>
              </select>
            </div>
          </div>

          {/* Claims Table */}
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner message="Loading ownership claims..." />
            </div>
          ) : claims.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-unis-dark-elevated text-unis-slate flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-unis-ink dark:text-unis-dark-text">No claims in this queue.</p>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
                {isAdminOrStaff
                  ? 'No students have filed unverified ownership claims matching filters.'
                  : 'You have not submitted any ownership claims yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-unis-dark-elevated text-unis-slate dark:text-unis-dark-muted font-bold uppercase tracking-wider text-[10px] border-b border-unis-border dark:border-unis-dark-border">
                  <tr>
                    <th className="p-3.5">Claim ID</th>
                    <th className="p-3.5">Related Discovered Item</th>
                    <th className="p-3.5">Claimant</th>
                    <th className="p-3.5">Proof Statement</th>
                    <th className="p-3.5">Filed On</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Review Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-unis-border dark:divide-unis-dark-border">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-stone-50/50 dark:hover:bg-unis-dark-elevated/30 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] font-bold text-unis-brand">
                        CLM-{claim.id}
                      </td>
                      <td className="p-3.5">
                        <Link to={`/lost-found/${claim.itemId}`} className="font-bold text-unis-ink dark:text-unis-dark-text hover:text-unis-brand">
                          {claim.itemTitle || `Item #${claim.itemId}`}
                        </Link>
                        <div className="text-[10px] text-unis-slate">{claim.itemType}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-unis-ink dark:text-unis-dark-text">{claim.claimantName}</div>
                        <div className="text-[10px] text-unis-slate">{claim.claimantEmail}</div>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <p className="text-[11px] text-unis-ink dark:text-unis-dark-text line-clamp-2">
                          {claim.proofDetails}
                        </p>
                        {claim.reviewNotes && (
                          <p className="text-[10px] text-unis-slate italic mt-0.5">
                            Note: {claim.reviewNotes}
                          </p>
                        )}
                      </td>
                      <td className="p-3.5 text-unis-slate dark:text-unis-dark-muted">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            claim.claimStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : claim.claimStatus === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}
                        >
                          {claim.claimStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {isAdminOrStaff && claim.claimStatus === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => setClaimReviewModal({ open: true, claim, decision: 'APPROVED', notes: '' })}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1 px-2 rounded-lg"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setClaimReviewModal({ open: true, claim, decision: 'REJECTED', notes: '' })}
                              className="border-rose-300 text-rose-600 hover:bg-rose-50 text-[11px] py-1 px-2 rounded-lg"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Link to={`/lost-found/${claim.itemId}`} className="text-xs font-bold text-unis-brand hover:underline">
                            Inspect
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* UPDATE STATUS MODAL */}
      {statusModal.open && statusModal.item && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-md p-6 space-y-4 border border-unis-border dark:border-unis-dark-border shadow-elevated">
            <h3 className="text-base font-extrabold text-unis-ink dark:text-unis-dark-text">
              Update Listing Status
            </h3>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
              Adjust operational state for <span className="font-bold text-unis-ink dark:text-unis-dark-text">{statusModal.item.title}</span>.
            </p>
            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Target Status *
              </label>
              <select
                value={statusModal.targetStatus}
                onChange={(e) => setStatusModal((prev) => ({ ...prev, targetStatus: e.target.value }))}
                className="w-full p-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand"
              >
                <option value="OPEN">OPEN (Active & Visible)</option>
                <option value="CLAIMED">CLAIMED (Verified Claimant)</option>
                <option value="RETURNED">RETURNED (Handed Over to Owner)</option>
                <option value="RESOLVED">RESOLVED (Case Complete)</option>
                <option value="CLOSED">CLOSED (Archived)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusModal({ open: false, item: null, targetStatus: 'OPEN' })}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUpdateStatusConfirm}
                loading={actionLoading}
                className="bg-unis-brand hover:bg-unis-indigo text-white font-bold rounded-xl"
              >
                Save Status
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.open && deleteModal.item && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-md p-6 space-y-4 border border-unis-border dark:border-unis-dark-border shadow-elevated">
            <h3 className="text-base font-extrabold text-unis-ink dark:text-unis-dark-text">
              Delete Property Listing
            </h3>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-unis-ink dark:text-unis-dark-text">"{deleteModal.item.title}"</span>?
              This will remove the listing and any pending claim records from public visibility.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModal({ open: false, item: null })}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteConfirm}
                loading={actionLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                Confirm Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* REVIEW CLAIM MODAL */}
      {claimReviewModal.open && claimReviewModal.claim && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-md p-6 space-y-4 border border-unis-border dark:border-unis-dark-border shadow-elevated">
            <h3 className="text-base font-extrabold text-unis-ink dark:text-unis-dark-text">
              Review Ownership Claim: {claimReviewModal.decision}
            </h3>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
              Claim for <span className="font-bold">{claimReviewModal.claim.itemTitle}</span> by{' '}
              <span className="font-bold">{claimReviewModal.claim.claimantName}</span> ({claimReviewModal.claim.claimantEmail}).
            </p>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-unis-dark-elevated text-xs border border-unis-border dark:border-unis-dark-border">
              <span className="text-[10px] font-bold text-unis-slate uppercase block">Submitted Proof</span>
              <p className="text-unis-ink dark:text-unis-dark-text mt-0.5">{claimReviewModal.claim.proofDetails}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Moderator Decision
              </label>
              <select
                value={claimReviewModal.decision}
                onChange={(e) => setClaimReviewModal((prev) => ({ ...prev, decision: e.target.value }))}
                className="w-full p-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand"
              >
                <option value="APPROVED">APPROVE (Verify Ownership & Release Item)</option>
                <option value="REJECTED">REJECT (Insufficient or False Proof)</option>
                <option value="MORE_INFO_REQUIRED">REQUEST MORE INFO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Review Notes / Collection Guidance
              </label>
              <textarea
                value={claimReviewModal.notes}
                onChange={(e) => setClaimReviewModal((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="e.g. Identity badge verified at security desk, student collected item."
                className="w-full p-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand h-20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClaimReviewModal({ open: false, claim: null, decision: 'APPROVED', notes: '' })}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReviewClaimConfirm}
                loading={actionLoading}
                className={`font-bold text-white rounded-xl ${
                  claimReviewModal.decision === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Submit Decision
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
