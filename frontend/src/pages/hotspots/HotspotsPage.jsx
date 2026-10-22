import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Building,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Tag,
  Info,
  Clock,
  CheckCircle2
} from 'lucide-react';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export function HotspotsPage() {
  const [loading, setLoading] = useState(true);
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    fetchHotspots();
  }, []);

  const fetchHotspots = async () => {
    try {
      setLoading(true);
      const res = await client.get('/analytics/hotspots');
      setHotspots(res.data.data || []);
    } catch (err) {
      console.error('Failed to load campus hotspots:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <LoadingSpinner size="lg" message="Computing campus recurring issue hotspots..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950 via-stone-900 to-unis-forest text-white shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold backdrop-blur-sm">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>Infrastructure Health Intelligence</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Campus Problem Hotspots & Vulnerability Clusters
          </h1>
          <p className="text-sm text-white/80 max-w-2xl">
            Statistical aggregation identifying physical campus locations with recurring equipment failures, facility breakdowns, or high overdue resolution rates.
          </p>
        </div>
      </div>

      {/* Threshold Explanation Note */}
      <div className="p-4 rounded-xl bg-stone-50 dark:bg-unis-dark-card border border-unis-border dark:border-unis-dark-border text-xs text-unis-slate dark:text-unis-dark-muted flex items-start gap-3">
        <Info className="w-4 h-4 text-unis-forest shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-unis-ink dark:text-unis-dark-text">Algorithmic Definition & Thresholds:</strong>
          <p>
            A location is classified as a <em>Campus Hotspot</em> when it records <strong>2 or more independent complaints</strong> within the active reporting period. Severity rating evaluates complaint density and overdue percentage (<em>HIGH</em>: &ge; 4 complaints or overdue &gt; 30%; <em>MODERATE</em>: 2–3 complaints).
          </p>
        </div>
      </div>

      {/* Hotspots List */}
      {hotspots.length === 0 ? (
        <Card>
          <EmptyState
            icon={CheckCircle2}
            title="No Problem Hotspots Detected"
            description="All campus buildings and laboratories are currently within standard tolerance thresholds with no recurring complaint clusters."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hotspots.map((h, idx) => (
            <Card
              key={idx}
              className="p-5 space-y-4 hover:border-amber-500/40 transition-all hover:shadow-subtle"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        h.severity === 'HIGH'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : h.severity === 'ELEVATED'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {h.severity} SEVERITY
                    </span>
                    <span className="text-xs text-unis-slate">Rank #{idx + 1}</span>
                  </div>

                  <h3 className="text-base font-bold text-unis-ink dark:text-unis-dark-text flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-unis-forest" />
                    {h.buildingName} • Room {h.roomNumber}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-unis-forest dark:text-unis-dark-forest leading-none">
                    {h.complaintCount}
                  </div>
                  <div className="text-[10px] text-unis-slate font-medium mt-0.5">Complaints</div>
                </div>
              </div>

              {/* Top Categories */}
              <div className="space-y-1.5 pt-2 border-t border-unis-border dark:border-unis-dark-border">
                <div className="text-[11px] font-bold text-unis-slate">Frequent Complaint Domains:</div>
                <div className="flex flex-wrap gap-1.5">
                  {h.topCategories?.map((cat, cIdx) => (
                    <span
                      key={cIdx}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-unis-forest" />
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Overdue Metric */}
              <div className="flex items-center justify-between text-xs text-unis-slate pt-2 border-t border-unis-border dark:border-unis-dark-border">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Overdue Rate: <strong className="text-unis-ink dark:text-unis-dark-text">{h.overduePercentage}%</strong>
                </span>

                <Link
                  to={`/tickets?category=ALL`}
                  className="text-xs font-semibold text-unis-forest hover:underline flex items-center gap-1"
                >
                  Inspect Tickets <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
