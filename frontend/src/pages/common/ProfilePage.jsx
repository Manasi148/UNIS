import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { RoleBadge } from '../../components/common/Badge';
import { User, Mail, Phone, Hash, Building, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await api.patch(`/api/users/${user.id}`, { fullName, phone });
      if (res.success && res.data) {
        updateUserProfile(res.data);
        setSuccess('Profile details successfully updated in institutional directory.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-unis-ink dark:text-unis-dark-text tracking-tight">
          User Profile & Institutional Details
        </h1>
        <p className="text-xs text-unis-slate dark:text-unis-dark-muted mt-1">
          Review your institutional role, identifiers, and contact details
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardHeader
          title="Account Overview"
          subtitle="Fixed institutional identity parameters"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-unis-border dark:border-unis-dark-border text-xs">
          <div>
            <span className="text-unis-slate dark:text-unis-dark-muted block">Role</span>
            <div className="mt-1">
              <RoleBadge role={user?.role} />
            </div>
          </div>

          <div>
            <span className="text-unis-slate dark:text-unis-dark-muted block">Institutional Email</span>
            <span className="font-semibold text-unis-ink dark:text-unis-dark-text mt-1 block">
              {user?.email}
            </span>
          </div>

          <div>
            <span className="text-unis-slate dark:text-unis-dark-muted block">Student / Staff ID</span>
            <span className="font-semibold text-unis-ink dark:text-unis-dark-text mt-1 block">
              {user?.studentOrStaffId || 'Not assigned'}
            </span>
          </div>

          <div>
            <span className="text-unis-slate dark:text-unis-dark-muted block">Department</span>
            <span className="font-semibold text-unis-ink dark:text-unis-dark-text mt-1 block">
              {user?.departmentName || 'Campus Wide (No Department Assigned)'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <h4 className="text-xs font-semibold text-unis-ink dark:text-unis-dark-text">
            Editable Contact Preferences
          </h4>

          <div>
            <label className="block text-xs font-semibold text-unis-ink dark:text-unis-dark-text mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-button border border-unis-border dark:border-unis-dark-border bg-transparent text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-forest dark:focus:ring-unis-dark-forest"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-unis-ink dark:text-unis-dark-text mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-555-XXXX"
              className="w-full px-3.5 py-2 text-xs rounded-button border border-unis-border dark:border-unis-dark-border bg-transparent text-unis-ink dark:text-unis-dark-text focus:outline-none focus:ring-2 focus:ring-unis-forest dark:focus:ring-unis-dark-forest"
            />
          </div>

          <Button type="submit" loading={loading} size="sm">
            Save Profile Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
