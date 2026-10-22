import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  FileText
} from 'lucide-react';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function AuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await client.get('/audit-logs?size=100');
      setLogs(res.data?.content || res.data?.data?.content || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.action?.toLowerCase().includes(q) ||
      l.actorName?.toLowerCase().includes(q) ||
      l.targetResource?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-unis-forest dark:text-unis-dark-forest" />
          Security & Operational Audit Ledger
        </h1>
        <p className="text-sm text-unis-slate dark:text-unis-dark-muted">
          Immutable, persistent audit trail recording administrative decisions, user provisioning, status transitions, and privileged resource mutations.
        </p>
      </div>

      {/* Search Filter */}
      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-unis-slate absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, resource, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:outline-none focus:ring-2 focus:ring-unis-forest"
          />
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <LoadingSpinner size="lg" message="Reading secure audit log ledger..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-unis-dark-elevated border-b border-unis-border dark:border-unis-dark-border text-unis-slate uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Context Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-unis-border dark:divide-unis-dark-border font-mono text-[11px]">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/50 dark:hover:bg-unis-dark-elevated/40 transition-colors">
                    <td className="py-3 px-4 text-unis-slate whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-unis-ink dark:text-unis-dark-text whitespace-nowrap">
                      {log.actorName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold px-2 py-0.5 rounded bg-unis-highlight dark:bg-unis-dark-elevated text-unis-forest dark:text-unis-dark-forest">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-unis-ink dark:text-unis-dark-text font-bold">
                      {log.targetResource || '—'}
                    </td>
                    <td className="py-3 px-4 text-unis-slate max-w-sm truncate font-sans">
                      {log.details || '—'}
                    </td>
                    <td className="py-3 px-4 text-unis-slate">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
