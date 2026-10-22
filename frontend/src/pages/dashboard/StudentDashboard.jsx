import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  PlusCircle,
  PackageSearch,
  Megaphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Building,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [lostFound, setLostFound] = useState([]);
  const [stats, setStats] = useState({
    submitted: 0,
    inProgress: 0,
    resolved: 0,
    total: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, annRes, lfRes] = await Promise.all([
        client.get('/tickets?size=10'),
        client.get('/announcements?size=4'),
        client.get('/lost-found?size=4'),
      ]);

      const myTickets = ticketsRes.data?.content || (Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
      setTickets(myTickets);

      let sub = 0;
      let prog = 0;
      let res = 0;
      myTickets.forEach((t) => {
        if (t.status === 'SUBMITTED' || t.status === 'ASSIGNED') sub++;
        else if (t.status === 'IN_PROGRESS' || t.status === 'WAITING_FOR_INFO') prog++;
        else if (t.status === 'RESOLVED' || t.status === 'CLOSED') res++;
      });
      setStats({
        submitted: sub,
        inProgress: prog,
        resolved: res,
        total: myTickets.length,
      });

      setAnnouncements(annRes.data?.content || (Array.isArray(annRes.data) ? annRes.data : []));
      setLostFound(lfRes.data?.content || (Array.isArray(lfRes.data) ? lfRes.data : []));
    } catch (err) {
      console.error('Failed to load student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner message="Loading your student workspace..." />
      </div>
    );
  }

  const deptLabel = user?.departmentName || user?.departmentRequested || 'Department of Engineering';

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* 1. Hero Welcome Panel with Blue-Indigo-Violet Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18264B] via-[#315FEA] to-[#5946D8] text-white p-6 sm:p-8 shadow-elevated border border-white/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-md border border-white/20">
            <Building className="w-3.5 h-3.5 text-blue-200" />
            <span>{deptLabel}</span>
            <span>•</span>
            <span className="text-white">Active Student Workspace</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {user?.fullName || 'Student'}! 👋
          </h1>

          <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed max-w-xl">
            Track your open service tickets, discover discovered campus belongings, and stay informed on official notices across the institution.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/tickets/new">
              <Button className="bg-white text-unis-brand hover:bg-stone-50 font-bold text-xs py-2.5 px-4 shadow-subtle rounded-xl active:scale-95 transition-all">
                <PlusCircle className="w-4 h-4 mr-2" />
                Report Campus Issue
              </Button>
            </Link>
            <Link to="/lost-found">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold text-xs py-2.5 px-4 rounded-xl">
                <PackageSearch className="w-4 h-4 mr-2" />
                Browse Lost & Found
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative backdrop elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#8465ED]/25 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Real Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Submitted/Pending Tickets */}
        <Card className="p-5 border border-unis-border dark:border-unis-dark-border hover:border-amber-400/50 transition-all shadow-subtle group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                Submitted / Pending
              </p>
              <p className="text-3xl font-extrabold text-unis-ink dark:text-unis-dark-text mt-1 group-hover:text-amber-600 transition-colors">
                {stats.submitted}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-unis-border/60 dark:border-unis-dark-border/60 flex items-center justify-between text-[11px] text-unis-slate dark:text-unis-dark-muted">
            <span>Awaiting technician triage</span>
            <Link to="/tickets?status=SUBMITTED" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline">
              View &rarr;
            </Link>
          </div>
        </Card>

        {/* In-Progress Tickets */}
        <Card className="p-5 border border-unis-border dark:border-unis-dark-border hover:border-unis-brand/50 transition-all shadow-subtle group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                In Resolution
              </p>
              <p className="text-3xl font-extrabold text-unis-ink dark:text-unis-dark-text mt-1 group-hover:text-unis-brand transition-colors">
                {stats.inProgress}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-unis-blue-light dark:bg-unis-dark-highlight text-unis-brand dark:text-unis-dark-brand flex items-center justify-center shadow-xs">
              <Ticket className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-unis-border/60 dark:border-unis-dark-border/60 flex items-center justify-between text-[11px] text-unis-slate dark:text-unis-dark-muted">
            <span>Actively being resolved</span>
            <Link to="/tickets?status=IN_PROGRESS" className="font-semibold text-unis-brand dark:text-unis-dark-brand hover:underline">
              Track &rarr;
            </Link>
          </div>
        </Card>

        {/* Resolved / Closed */}
        <Card className="p-5 border border-unis-border dark:border-unis-dark-border hover:border-emerald-400/50 transition-all shadow-subtle group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-unis-slate dark:text-unis-dark-muted uppercase tracking-wider">
                Resolved / Closed
              </p>
              <p className="text-3xl font-extrabold text-unis-ink dark:text-unis-dark-text mt-1 group-hover:text-emerald-600 transition-colors">
                {stats.resolved}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-unis-border/60 dark:border-unis-dark-border/60 flex items-center justify-between text-[11px] text-unis-slate dark:text-unis-dark-muted">
            <span>Successfully completed</span>
            <Link to="/tickets?status=RESOLVED" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              History &rarr;
            </Link>
          </div>
        </Card>
      </div>

      {/* 3. Main Dashboard Grid (Recent Reports + Announcements / Lost & Found) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Reports (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
                My Recent Reports
              </h2>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
                Live status and updates for your submitted campus maintenance tickets
              </p>
            </div>
            <Link
              to="/tickets"
              className="text-xs font-bold text-unis-brand dark:text-unis-dark-brand hover:underline flex items-center gap-1"
            >
              View All ({stats.total})
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {tickets.length === 0 ? (
            <Card className="p-8 text-center border border-dashed border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-unis-dark-elevated/40 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-unis-blue-light dark:bg-unis-dark-highlight text-unis-brand flex items-center justify-center mx-auto">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-unis-ink dark:text-unis-dark-text">
                No active tickets filed yet
              </h3>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted max-w-sm mx-auto">
                Encountered broken equipment, Wi-Fi issues, or maintenance hazards on campus? File a report and track it until resolved.
              </p>
              <div className="pt-2">
                <Link to="/tickets/new">
                  <Button className="bg-unis-brand hover:bg-unis-indigo text-white text-xs font-bold py-2 px-4 rounded-xl shadow-subtle">
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Submit Your First Report
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {tickets.slice(0, 5).map((ticket) => (
                <Card
                  key={ticket.id}
                  className="p-4 border border-unis-border dark:border-unis-dark-border hover:shadow-subtle transition-all hover:border-unis-brand/40 group cursor-pointer"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-unis-brand dark:text-unis-dark-brand bg-unis-blue-light dark:bg-unis-dark-highlight px-2 py-0.5 rounded-md">
                          {ticket.ticketReference}
                        </span>
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      <h4 className="text-sm font-bold text-unis-ink dark:text-unis-dark-text truncate group-hover:text-unis-brand transition-colors">
                        {ticket.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-unis-slate dark:text-unis-dark-muted">
                        <span>Category: {ticket.category}</span>
                        <span>•</span>
                        <span>Filed: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        {ticket.targetResolutionAt && (
                          <>
                            <span>•</span>
                            <span>Target: {new Date(ticket.targetResolutionAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-unis-brand border-unis-border dark:border-unis-dark-border group-hover:bg-unis-brand group-hover:text-white transition-all rounded-xl"
                      >
                        Details &rarr;
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Institutional Announcements & Lost-and-Found (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Announcements Widget */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-unis-ink dark:text-unis-dark-text flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-unis-indigo" />
                Campus Notices
              </h3>
              <Link to="/announcements" className="text-xs font-semibold text-unis-brand dark:text-unis-dark-brand hover:underline">
                View All
              </Link>
            </div>

            {announcements.length === 0 ? (
              <Card className="p-4 text-center border border-unis-border dark:border-unis-dark-border text-xs text-unis-slate dark:text-unis-dark-muted rounded-2xl">
                No active announcements for your department right now.
              </Card>
            ) : (
              <div className="space-y-2.5">
                {announcements.slice(0, 3).map((ann) => (
                  <Card key={ann.id} className="p-3.5 border border-unis-border dark:border-unis-dark-border hover:border-unis-indigo/40 transition-all rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-unis-violet-light dark:bg-unis-dark-elevated text-unis-indigo dark:text-unis-dark-indigo">
                        {ann.category}
                      </span>
                      <span className="text-[10px] text-unis-slate dark:text-unis-dark-muted">
                        {new Date(ann.publishedAt || ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-unis-ink dark:text-unis-dark-text line-clamp-1">
                      {ann.title}
                    </h5>
                    <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Lost & Found Widget */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-unis-ink dark:text-unis-dark-text flex items-center gap-2">
                <PackageSearch className="w-4 h-4 text-unis-brand" />
                Lost & Found Feed
              </h3>
              <Link to="/lost-found" className="text-xs font-semibold text-unis-brand dark:text-unis-dark-brand hover:underline">
                Browse
              </Link>
            </div>

            {lostFound.length === 0 ? (
              <Card className="p-4 text-center border border-unis-border dark:border-unis-dark-border text-xs text-unis-slate dark:text-unis-dark-muted rounded-2xl">
                No open listings reported recently.
              </Card>
            ) : (
              <div className="space-y-2.5">
                {lostFound.slice(0, 3).map((item) => (
                  <Card
                    key={item.id}
                    className="p-3.5 border border-unis-border dark:border-unis-dark-border hover:border-unis-brand/40 transition-all rounded-2xl cursor-pointer"
                    onClick={() => navigate(`/lost-found/${item.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.itemType === 'FOUND'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}>
                        {item.itemType}
                      </span>
                      <span className="text-[10px] text-unis-slate dark:text-unis-dark-muted">
                        {item.dateOccurred || item.dateFound}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-unis-ink dark:text-unis-dark-text mt-1.5 line-clamp-1">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted truncate mt-0.5">
                      📍 {item.locationDescription || item.locationName || 'Campus'}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
