import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Pin,
  Bookmark,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  User,
  Building,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

const CATEGORIES = [
  'ALL',
  'Academic notices',
  'Events',
  'Examination updates',
  'Deadlines',
  'General announcements',
  'Urgent notices',
];

export function AnnouncementsPage() {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Creation modal state (for Dept Head / Admin)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General announcements');
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, [categoryFilter, showBookmarkedOnly]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = { size: 30 };
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (showBookmarkedOnly) params.bookmarkedOnly = true;

      const res = await client.get('/announcements', { params });
      setAnnouncements(res.data.data?.content || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (id, currentBookmarked) => {
    try {
      if (currentBookmarked) {
        await client.delete(`/announcements/${id}/bookmark`);
      } else {
        await client.post(`/announcements/${id}/bookmark`);
      }
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, bookmarked: !currentBookmarked } : a))
      );
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Please provide title and announcement text.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await client.post('/announcements', {
        title,
        body,
        category,
        targetAudience,
        pinned,
        status: 'PUBLISHED',
      });

      setCreateModalOpen(false);
      setTitle('');
      setBody('');
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to publish announcement:', err);
      setError(err.response?.data?.message || 'Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = announcements.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return a.title?.toLowerCase().includes(q) || a.body?.toLowerCase().includes(q);
  });

  const canPublish = role === 'ADMIN' || role === 'DEPARTMENT_HEAD';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
            Institutional Notices & Advisories
          </h1>
          <p className="text-sm text-unis-slate dark:text-unis-dark-muted">
            Official university bulletins, examination dates, maintenance advisories, and campus schedules.
          </p>
        </div>
        {canPublish && (
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Publish Advisory
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-unis-slate absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search announcements by headline or body keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:outline-none focus:ring-2 focus:ring-unis-forest"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Announcement Categories' : c}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
            className={showBookmarkedOnly ? 'bg-unis-forest text-white' : ''}
          >
            <Bookmark className="w-4 h-4 mr-1.5" />
            {showBookmarkedOnly ? 'Bookmarked Only' : 'Saved Notices'}
          </Button>
        </div>
      </Card>

      {/* Announcements Feed */}
      {loading ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner size="lg" message="Loading campus announcements..." />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Megaphone}
            title="No notices found"
            description="There are currently no advisories published matching your selected criteria."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className={`p-6 transition-all ${
                item.pinned
                  ? 'border-unis-forest/40 bg-unis-highlight/20 dark:bg-unis-dark-elevated shadow-subtle'
                  : 'hover:border-unis-forest/30'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.pinned && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <Pin className="w-3 h-3 fill-amber-700" /> Pinned Bulletin
                      </span>
                    )}

                    <span className="text-xs font-bold text-unis-forest dark:text-unis-dark-forest px-2.5 py-0.5 rounded-full bg-unis-highlight dark:bg-unis-dark-elevated">
                      {item.category}
                    </span>

                    {item.targetAudience !== 'ALL' && (
                      <span className="text-[10px] font-semibold text-unis-slate px-2 py-0.5 rounded bg-stone-100 dark:bg-unis-dark-card">
                        Audience: {item.targetAudience}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleBookmark(item.id, item.bookmarked)}
                    className="p-1.5 rounded-lg text-unis-slate hover:text-unis-forest hover:bg-stone-100 dark:hover:bg-unis-dark-elevated transition-colors"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        item.bookmarked ? 'fill-unis-forest text-unis-forest' : ''
                      }`}
                    />
                  </button>
                </div>

                <h2 className="text-lg font-bold text-unis-ink dark:text-unis-dark-text tracking-tight">
                  {item.title}
                </h2>

                <p className="text-xs md:text-sm text-unis-slate dark:text-unis-dark-muted leading-relaxed whitespace-pre-wrap">
                  {item.body}
                </p>

                <div className="pt-3 border-t border-unis-border dark:border-unis-dark-border flex flex-wrap items-center justify-between gap-2 text-xs text-unis-slate dark:text-unis-dark-muted">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-unis-forest" />
                      Author: {item.authorName}
                    </span>
                    {item.departmentName && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {item.departmentName}
                        </span>
                      </>
                    )}
                  </div>

                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Published: {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE ANNOUNCEMENT MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Publish Institutional Advisory"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Headline Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Scheduled Network Downtime for Server Maintenance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
              >
                {CATEGORIES.filter((c) => c !== 'ALL').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Target Audience *
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
              >
                <option value="ALL">Entire Campus Community (All)</option>
                <option value="STUDENTS_ONLY">Students Only</option>
                <option value="STAFF_ONLY">Staff Officers & Faculty Only</option>
                <option value="DEPARTMENT_ONLY">Department Internal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Notice Body Text *
            </label>
            <textarea
              rows={4}
              placeholder="Detailed notification announcement..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-unis-slate cursor-pointer">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="rounded border-unis-border text-unis-forest focus:ring-unis-forest"
            />
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              Pin to top of campus dashboard
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Publish Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
