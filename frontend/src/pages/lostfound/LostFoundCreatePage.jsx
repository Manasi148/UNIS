import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PackageSearch,
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Palette,
  Send,
  AlertTriangle
} from 'lucide-react';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

const CATEGORIES = [
  'Electronics',
  'Books and stationery',
  'Identity cards',
  'Bags',
  'Clothing',
  'Accessories',
  'Other',
];

export function LostFoundCreatePage() {
  const navigate = useNavigate();
  const [listingType, setListingType] = useState('FOUND');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [locationFound, setLocationFound] = useState('');
  const [dateFound, setDateFound] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationFound.trim()) {
      setError('Please provide a title, description, and campus location.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        color: color.trim() || null,
        itemType: listingType,
        listingType: listingType,
        locationDescription: locationFound.trim(),
        locationFound: locationFound.trim(),
        dateOccurred: dateFound,
        dateFound: dateFound,
      };

      const res = await client.post('/lost-found', payload);
      const created = res.data;
      if (created && created.id) {
        navigate(`/lost-found/${created.id}`);
      } else {
        navigate('/lost-found');
      }
    } catch (err) {
      console.error('Failed to create lost/found item:', err);
      setError(err.message || 'Could not post listing. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left animate-fade-in">
      <Link
        to="/lost-found"
        className="text-xs font-semibold text-unis-slate hover:text-unis-brand flex items-center gap-1 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Lost & Found Directory
      </Link>

      <Card className="p-6 sm:p-8 space-y-6 border border-unis-border dark:border-unis-dark-border rounded-3xl shadow-subtle">
        <div>
          <h1 className="text-2xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
            Register Lost or Discovered Item
          </h1>
          <p className="text-xs text-unis-slate dark:text-unis-dark-muted mt-1 leading-relaxed">
            Provide descriptive metadata to help UNIS’s matching engine link lost belongings with campus finders.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-900">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Listing Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-unis-slate dark:text-unis-dark-muted mb-2">
              Listing Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setListingType('FOUND')}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                  listingType === 'FOUND'
                    ? 'border-unis-brand bg-unis-blue-light dark:bg-unis-dark-highlight text-unis-brand dark:text-unis-dark-brand ring-2 ring-unis-brand shadow-xs'
                    : 'border-unis-border dark:border-unis-dark-border text-unis-slate hover:bg-stone-50 dark:hover:bg-unis-dark-elevated'
                }`}
              >
                I Discovered an Item (FOUND)
              </button>
              <button
                type="button"
                onClick={() => setListingType('LOST')}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                  listingType === 'LOST'
                    ? 'border-unis-indigo bg-unis-violet-light dark:bg-unis-dark-highlight text-unis-indigo dark:text-unis-dark-indigo ring-2 ring-unis-indigo shadow-xs'
                    : 'border-unis-border dark:border-unis-dark-border text-unis-slate hover:bg-stone-50 dark:hover:bg-unis-dark-elevated'
                }`}
              >
                I Lost a Personal Belonging (LOST)
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Item Title / Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blue Dell XPS 15 Laptop in neoprene case"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand transition-all"
              required
            />
          </div>

          {/* Category & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand transition-all cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Primary Color / Pattern
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Navy Blue / Silver"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand transition-all"
              />
            </div>
          </div>

          {/* Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Campus Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={locationFound}
                onChange={(e) => setLocationFound(e.target.value)}
                placeholder="e.g. Central Library 2nd floor reading hall"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Date Discovered / Lost <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dateFound}
                onChange={(e) => setDateFound(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand transition-all"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Distinguishing Features / Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe brand stickers, scratches, unique tags, or identifying accessories..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-brand transition-all"
              required
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              loading={loading}
              icon={Send}
              className="py-3 px-6 bg-unis-brand hover:bg-unis-indigo text-white font-bold rounded-xl shadow-elevated text-xs transition-all active:scale-95"
            >
              Publish Item Listing
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
