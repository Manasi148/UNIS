import React, { useState, useEffect } from 'react';
import {
  Building2,
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function DepartmentManagementPage() {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Department Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await client.get('/departments');
      setDepartments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Department name and code are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await client.post('/departments', {
        name,
        code: code.toUpperCase(),
        description,
        active: true,
      });

      setCreateModalOpen(false);
      setName('');
      setCode('');
      setDescription('');
      fetchDepartments();
    } catch (err) {
      console.error('Failed to create department:', err);
      setError(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = departments.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return d.name?.toLowerCase().includes(q) || d.code?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
            Institutional Department Units
          </h1>
          <p className="text-sm text-unis-slate dark:text-unis-dark-muted">
            Configure campus maintenance branches, operational units, and departmental scopes.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* List Card */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <LoadingSpinner size="lg" message="Loading campus departments..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-unis-dark-elevated border-b border-unis-border dark:border-unis-dark-border text-unis-slate uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-unis-border dark:divide-unis-dark-border">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-stone-50/50 dark:hover:bg-unis-dark-elevated/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-unis-forest dark:text-unis-dark-forest">
                      {d.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-unis-ink dark:text-unis-dark-text">
                      {d.name}
                    </td>
                    <td className="py-3 px-4 text-unis-slate max-w-xs truncate">
                      {d.description || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {d.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ADD DEPARTMENT MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Institutional Department"
      >
        <form onSubmit={handleCreateDepartment} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Department Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Campus Electrical Services"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Department Code *
            </label>
            <input
              type="text"
              placeholder="e.g. ELEC"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Mission / Responsibilities Description
            </label>
            <textarea
              rows={3}
              placeholder="Responsibilities and equipment coverage..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Save Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
