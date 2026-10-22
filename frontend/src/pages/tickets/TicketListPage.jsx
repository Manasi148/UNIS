import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Ticket,
  PlusCircle,
  Search,
  Filter,
  Building,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

const CATEGORIES = [
  'ALL',
  'Wi-Fi and networking',
  'Classroom equipment',
  'Laboratory equipment',
  'Electricity',
  'Plumbing',
  'Cleanliness',
  'Furniture and facilities',
  'Security or safety concerns',
  'Other',
];

const STATUSES = [
  'ALL',
  'SUBMITTED',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_FOR_INFO',
  'RESOLVED',
  'CLOSED',
];

export function TicketListPage() {
  const { role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter, categoryFilter, priorityFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 10,
      };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;

      const res = await client.get('/tickets', { params });
      const paged = res.data.data;
      setTickets(paged?.content || []);
      setTotalPages(paged?.totalPages || 1);
      setTotalElements(paged?.totalElements || 0);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.ticketReference?.toLowerCase().includes(q) ||
      t.title?.toLowerCase().includes(q) ||
      t.buildingName?.toLowerCase().includes(q) ||
      t.roomNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
            Institutional Helpdesk Tickets
          </h1>
          <p className="text-sm text-unis-slate dark:text-unis-dark-muted">
            {role === 'STUDENT'
              ? 'View and monitor your campus maintenance reports and service requests.'
              : 'Supervise, triage, and fulfill campus maintenance complaints across service units.'}
          </p>
        </div>
        {role === 'STUDENT' && (
          <Link to="/tickets/new">
            <Button variant="primary">
              <PlusCircle className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-unis-slate absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket ref, title, or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:outline-none focus:ring-2 focus:ring-unis-forest"
            />
          </div>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:outline-none focus:ring-2 focus:ring-unis-forest"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>

          {/* Category selector */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:outline-none focus:ring-2 focus:ring-unis-forest"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Ticket List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner size="lg" message="Loading tickets..." />
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card>
          <EmptyState
            icon={Ticket}
            title="No tickets found"
            description="No service tickets match your selected filters. Adjust your search criteria or report a new problem."
            action={
              role === 'STUDENT' ? (
                <Link to="/tickets/new">
                  <Button variant="primary">Report Problem</Button>
                </Link>
              ) : null
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((t) => (
            <Link key={t.id} to={`/tickets/${t.id}`} className="block group">
              <Card className="p-4.5 hover:border-unis-forest/40 transition-all hover:shadow-subtle">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-unis-forest dark:text-unis-dark-forest bg-unis-highlight dark:bg-unis-dark-elevated px-2 py-0.5 rounded-md">
                        {t.ticketReference}
                      </span>
                      <span className="text-xs text-unis-slate dark:text-unis-dark-muted font-medium">
                        {t.category}
                      </span>
                      {t.overdue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Overdue
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-unis-ink dark:text-unis-dark-text group-hover:text-unis-forest dark:group-hover:text-unis-dark-forest transition-colors">
                      {t.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-unis-slate dark:text-unis-dark-muted">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" />
                        {t.buildingName} • Room {t.roomNumber}
                      </span>
                      <span>•</span>
                      <span>Dept: {t.departmentName || 'Unassigned'}</span>
                      <span>•</span>
                      <span>
                        Created: {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-xs text-unis-slate dark:text-unis-dark-muted">
                Showing page {page + 1} of {totalPages} ({totalElements} total tickets)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
