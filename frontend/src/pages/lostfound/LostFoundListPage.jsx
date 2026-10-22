import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PackageSearch,
  PlusCircle,
  Search,
  Filter,
  MapPin,
  Calendar,
  Tag,
  ArrowRight
} from 'lucide-react';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

const CATEGORIES = [
  'ALL',
  'Electronics',
  'Books and stationery',
  'Identity cards',
  'Bags',
  'Clothing',
  'Accessories',
  'Other',
];

export function LostFoundListPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchItems();
  }, [typeFilter, categoryFilter, statusFilter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = { size: 30 };
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await client.get('/lost-found', { params });
      setItems(res.data.data?.content || []);
    } catch (err) {
      console.error('Failed to load lost & found listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.locationFound?.toLowerCase().includes(q) ||
      item.color?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
            Campus Lost & Found Directory
          </h1>
          <p className="text-sm text-unis-slate dark:text-unis-dark-muted">
            Report misplaced belongings, browse discovered institutional items, and file verified return claims.
          </p>
        </div>
        <Link to="/lost-found/new">
          <Button variant="primary">
            <PlusCircle className="w-4 h-4 mr-2" />
            Report Item
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-unis-slate absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, description, color, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:outline-none focus:ring-2 focus:ring-unis-forest"
            />
          </div>

          {/* Type Selector */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:outline-none focus:ring-2 focus:ring-unis-forest"
          >
            <option value="ALL">All Listings (Lost & Found)</option>
            <option value="LOST">Only Lost Items</option>
            <option value="FOUND">Only Found Items</option>
          </select>

          {/* Category Selector */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:outline-none focus:ring-2 focus:ring-unis-forest"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:outline-none focus:ring-2 focus:ring-unis-forest"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="CLAIM_PENDING">Claim Pending</option>
            <option value="RETURNED">Returned</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </Card>

      {/* Grid of Listings */}
      {loading ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner size="lg" message="Loading campus lost & found listings..." />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <EmptyState
            icon={PackageSearch}
            title="No items found"
            description="No listings match your search criteria. Report an item if you have lost or discovered something on campus."
            action={
              <Link to="/lost-found/new">
                <Button variant="primary">Report Item</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Link key={item.id} to={`/lost-found/${item.id}`} className="block group">
              <Card className="p-5 h-full flex flex-col justify-between hover:border-unis-forest/40 transition-all hover:shadow-subtle">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        item.listingType === 'FOUND'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.listingType}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.status === 'RETURNED'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : item.status === 'CLAIM_PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-800 dark:bg-unis-dark-elevated dark:text-stone-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-unis-ink dark:text-unis-dark-text group-hover:text-unis-forest dark:group-hover:text-unis-dark-forest transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-unis-slate dark:text-unis-dark-muted line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-unis-border dark:border-unis-dark-border mt-3 space-y-1.5 text-xs text-unis-slate dark:text-unis-dark-muted">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-unis-forest" />
                      {item.category} {item.color ? `• ${item.color}` : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.dateFound || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1 text-[11px] truncate max-w-[200px]">
                      <MapPin className="w-3 h-3 text-unis-forest shrink-0" />
                      {item.locationFound || 'Campus Grounds'}
                    </span>
                    <span className="text-xs font-semibold text-unis-forest dark:text-unis-dark-forest flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
