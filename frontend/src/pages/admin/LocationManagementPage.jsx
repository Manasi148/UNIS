import React, { useState, useEffect } from 'react';
import {
  MapPin,
  PlusCircle,
  Building,
  AlertTriangle
} from 'lucide-react';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const LOCATION_TYPES = [
  'CLASSROOM',
  'LAB',
  'OFFICE',
  'LIBRARY',
  'HOSTEL',
  'CAFETERIA',
  'COMMON_AREA',
];

export function LocationManagementPage() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Location Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [buildingName, setBuildingName] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [locationType, setLocationType] = useState('CLASSROOM');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await client.get('/locations');
      setLocations(res.data.data || []);
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!buildingName.trim() || !roomNumber.trim()) {
      setError('Building name and room number are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await client.post('/locations', {
        buildingName,
        floorNumber,
        roomNumber,
        locationType,
        active: true,
      });

      setCreateModalOpen(false);
      setBuildingName('');
      setFloorNumber('');
      setRoomNumber('');
      fetchLocations();
    } catch (err) {
      console.error('Failed to create location:', err);
      setError(err.response?.data?.message || 'Failed to create location.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = locations.filter((loc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      loc.buildingName?.toLowerCase().includes(q) ||
      loc.roomNumber?.toLowerCase().includes(q) ||
      loc.locationType?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
            Canonical Campus Locations Directory
          </h1>
          <p className="text-sm text-unis-slate dark:text-unis-dark-muted">
            Manage official university facilities, laboratories, study halls, and residential blocks.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Campus Location
        </Button>
      </div>

      {/* Locations Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <LoadingSpinner size="lg" message="Loading campus locations..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-unis-dark-elevated border-b border-unis-border dark:border-unis-dark-border text-unis-slate uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Building</th>
                  <th className="py-3 px-4">Floor</th>
                  <th className="py-3 px-4">Room / Facility</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-unis-border dark:divide-unis-dark-border">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-stone-50/50 dark:hover:bg-unis-dark-elevated/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-unis-ink dark:text-unis-dark-text flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-unis-forest" />
                      {l.buildingName}
                    </td>
                    <td className="py-3 px-4 text-unis-slate">
                      {l.floorNumber || 'Ground'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-unis-forest dark:text-unis-dark-forest">
                      {l.roomNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-unis-dark-card text-unis-slate">
                        {l.locationType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ADD LOCATION MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Standard Campus Location"
      >
        <form onSubmit={handleCreateLocation} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Building Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Science Block 1"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Floor
              </label>
              <input
                type="text"
                placeholder="e.g. 2nd Floor"
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
                Room / Hall *
              </label>
              <input
                type="text"
                placeholder="e.g. Room 204"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-unis-ink dark:text-unis-dark-text mb-1">
              Location Facility Type *
            </label>
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-forest"
            >
              {LOCATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Save Location
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
