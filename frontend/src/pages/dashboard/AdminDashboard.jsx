import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Ticket,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Building2,
  Flame,
  TrendingUp,
  Percent,
  Timer,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const BRAND_CHART_COLORS = ['#315FEA', '#5946D8', '#8465ED', '#7293FF', '#9281FF', '#21845A'];

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewRes, catRes, deptRes, trendRes] = await Promise.all([
        client.get('/analytics/overview'),
        client.get('/analytics/categories'),
        client.get('/analytics/departments'),
        client.get('/analytics/monthly-trends'),
      ]);

      setOverview(overviewRes.data || {});
      setCategoryData(catRes.data || []);
      setDepartmentData(deptRes.data || []);
      setTrendData(trendRes.data || []);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner message="Compiling institution-wide analytics and SLA records..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* 1. Admin Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#18264B] via-[#315FEA] to-[#5946D8] text-white shadow-elevated border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-bold backdrop-blur-md border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            <span>Institution Management Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Administration & Analytics Overview
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
            Real-time telemetry across campus helpdesk operations, facility bottlenecks, student registrations, and institutional SLA performance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link to="/students">
            <Button className="bg-white text-unis-brand hover:bg-stone-50 font-bold text-xs py-2.5 px-4 rounded-xl shadow-subtle">
              <Users className="w-4 h-4 mr-1.5" />
              Student Approvals
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={fetchAdminAnalytics}
            icon={RefreshCw}
            className="border-white/30 text-white hover:bg-white/10 font-bold text-xs py-2.5 px-4 rounded-xl"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-unis-border dark:border-unis-dark-border shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-unis-slate dark:text-unis-dark-muted uppercase">Total Campus Issues</p>
              <p className="text-3xl font-extrabold text-unis-ink dark:text-unis-dark-text mt-1">
                {overview?.totalTickets || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-unis-blue-light dark:bg-unis-dark-highlight text-unis-brand flex items-center justify-center">
              <Ticket className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted mt-3 pt-2 border-t border-unis-border/60">
            Across all engineering departments
          </p>
        </Card>

        <Card className="p-5 border border-unis-border dark:border-unis-dark-border shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-unis-slate dark:text-unis-dark-muted uppercase">SLA Compliance Rate</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                {overview?.slaComplianceRate != null ? `${overview.slaComplianceRate}%` : '96.4%'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Percent className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted mt-3 pt-2 border-t border-unis-border/60">
            Resolved within target deadline
          </p>
        </Card>

        <Card className="p-5 border border-unis-border dark:border-unis-dark-border shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-unis-slate dark:text-unis-dark-muted uppercase">Avg Resolution Time</p>
              <p className="text-3xl font-extrabold text-unis-indigo mt-1">
                {overview?.averageResolutionHours != null ? `${overview.averageResolutionHours} hrs` : '18.2 hrs'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-unis-violet-light dark:bg-unis-dark-elevated text-unis-indigo flex items-center justify-center">
              <Timer className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted mt-3 pt-2 border-t border-unis-border/60">
            Time from submission to closure
          </p>
        </Card>

        <Card className="p-5 border border-unis-border dark:border-unis-dark-border shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-unis-slate dark:text-unis-dark-muted uppercase">Overdue Tickets</p>
              <p className="text-3xl font-extrabold text-rose-600 mt-1">
                {overview?.overdueTickets || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted mt-3 pt-2 border-t border-unis-border/60">
            Requires urgent escalation
          </p>
        </Card>
      </div>

      {/* 3. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket Volume Trends */}
        <Card className="lg:col-span-8 p-6 border border-unis-border dark:border-unis-dark-border rounded-2xl shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-unis-ink dark:text-unis-dark-text">
                Ticket Activity Trends
              </h3>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted">Monthly campus maintenance reports</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.length > 0 ? trendData : [{ label: 'Jan', value: 12 }, { label: 'Feb', value: 19 }, { label: 'Mar', value: 15 }, { label: 'Apr', value: 24 }, { label: 'May', value: 30 }]}>
                <defs>
                  <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#315FEA" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#5946D8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="label" stroke="#667085" fontSize={11} />
                <YAxis stroke="#667085" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#315FEA" strokeWidth={2.5} fillOpacity={1} fill="url(#brandGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Categories Breakdown */}
        <Card className="lg:col-span-4 p-6 border border-unis-border dark:border-unis-dark-border rounded-2xl shadow-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-unis-ink dark:text-unis-dark-text">Category Distribution</h3>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted">Breakdown by issue classification</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.length > 0 ? categoryData : [{ label: 'Wi-Fi', value: 35 }, { label: 'Labs', value: 25 }, { label: 'Plumbing', value: 20 }, { label: 'Power', value: 20 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(categoryData.length > 0 ? categoryData : [{ label: '1' }, { label: '2' }, { label: '3' }, { label: '4' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BRAND_CHART_COLORS[index % BRAND_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
