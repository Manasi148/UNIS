import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Search,
  PackageSearch,
  Bell,
  Megaphone,
  Users,
  Building2,
  MapPin,
  Flame,
  ShieldCheck,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationDropdown } from '../components/common/NotificationDropdown';
import { RoleBadge } from '../components/common/Badge';

export function AppLayout() {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Helpdesk Tickets', path: '/tickets', icon: Ticket },
    ...(role === 'STUDENT' ? [{ label: 'Report Problem', path: '/tickets/new', icon: PlusCircle }] : []),
    { label: 'Lost & Found', path: '/lost-found', icon: PackageSearch },
    { label: 'Announcements', path: '/announcements', icon: Megaphone },
  ];

  const adminNavItems = [
    { label: 'Student Approvals & Roster', path: '/students', icon: Users },
    { label: 'User Directory', path: '/admin/users', icon: Shield },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Campus Locations', path: '/admin/locations', icon: MapPin },
    { label: 'Campus Hotspots', path: '/hotspots', icon: Flame },
    { label: 'Security & Audit Logs', path: '/admin/audit', icon: ShieldCheck },
  ];

  const deptHeadNavItems = [
    { label: 'Student Approvals & Roster', path: '/students', icon: Users },
    { label: 'Campus Hotspots', path: '/hotspots', icon: Flame },
  ];

  return (
    <div className="min-h-screen bg-unis-bg dark:bg-unis-dark-bg text-unis-ink dark:text-unis-dark-text flex flex-col md:flex-row transition-colors duration-200">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-unis-navy/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-unis-card dark:bg-unis-dark-card border-r border-unis-border dark:border-unis-dark-border z-40 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Area */}
        <div className="p-4 flex items-center justify-between border-b border-unis-border dark:border-unis-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-unis-dark-elevated p-1 flex items-center justify-center shadow-subtle border border-unis-border dark:border-unis-dark-border">
              <img src="/logo.png" alt="UNIS Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-unis-brand via-unis-indigo to-unis-violet bg-clip-text text-transparent dark:from-unis-dark-brand dark:to-unis-dark-violet">
                UNIS
              </span>
              <p className="text-[10px] text-unis-slate dark:text-unis-dark-muted font-semibold leading-none tracking-wide">
                INSTITUTIONAL SERVICES
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-unis-slate hover:bg-unis-blue-light dark:hover:bg-unis-dark-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-unis-slate/70 dark:text-unis-dark-muted/70">
            Main Portal
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-unis-blue-light dark:bg-unis-dark-highlight text-unis-brand dark:text-unis-dark-brand font-semibold shadow-xs'
                    : 'text-unis-slate dark:text-unis-dark-muted hover:bg-unis-bg dark:hover:bg-unis-dark-elevated hover:text-unis-ink dark:hover:text-unis-dark-text'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Department Head Section */}
          {role === 'DEPARTMENT_HEAD' && (
            <>
              <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-unis-indigo dark:text-unis-dark-indigo">
                Department Management
              </div>
              {deptHeadNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-unis-violet-light dark:bg-unis-dark-highlight text-unis-indigo dark:text-unis-dark-indigo font-semibold shadow-xs'
                        : 'text-unis-slate dark:text-unis-dark-muted hover:bg-unis-bg dark:hover:bg-unis-dark-elevated hover:text-unis-ink dark:hover:text-unis-dark-text'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}

          {/* Admin Section */}
          {role === 'ADMIN' && (
            <>
              <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-unis-brand dark:text-unis-dark-brand">
                Institutional Administration
              </div>
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-unis-blue-light dark:bg-unis-dark-highlight text-unis-brand dark:text-unis-dark-brand font-semibold shadow-xs'
                        : 'text-unis-slate dark:text-unis-dark-muted hover:bg-unis-bg dark:hover:bg-unis-dark-elevated hover:text-unis-ink dark:hover:text-unis-dark-text'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="p-3 border-t border-unis-border dark:border-unis-dark-border bg-unis-bg/50 dark:bg-unis-dark-elevated/40">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-unis-brand to-unis-indigo text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-unis-ink dark:text-unis-dark-text truncate">
                {user?.fullName || 'User'}
              </p>
              <div className="mt-0.5">
                <RoleBadge role={user?.role} />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-unis-card/80 dark:bg-unis-dark-card/80 backdrop-blur-md border-b border-unis-border dark:border-unis-dark-border px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-unis-slate hover:bg-stone-100 dark:hover:bg-unis-dark-elevated"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center text-xs text-unis-slate dark:text-unis-dark-muted gap-1.5 font-medium">
              <span>UNIS</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="capitalize text-unis-ink dark:text-unis-dark-text">
                {location.pathname.split('/')[1] || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-unis-slate hover:text-unis-ink hover:bg-unis-highlight dark:text-unis-dark-muted dark:hover:text-unis-dark-text dark:hover:bg-unis-dark-elevated transition-colors"
              title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
              aria-label="Toggle institutional color theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 stroke-[1.8]" />
              ) : (
                <Moon className="w-5 h-5 text-unis-brand stroke-[1.8]" />
              )}
            </button>

            {/* In-App Notifications Dropdown */}
            <NotificationDropdown />

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-unis-blue-light dark:hover:bg-unis-dark-elevated transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-unis-brand to-unis-indigo text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-unis-card dark:bg-unis-dark-card border border-unis-border dark:border-unis-dark-border rounded-card shadow-elevated dark:shadow-dark-elevated py-1.5 z-50 animate-fade-in text-left"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-unis-border dark:border-unis-dark-border">
                    <p className="text-xs font-semibold text-unis-ink dark:text-unis-dark-text truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted truncate">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-unis-slate dark:text-unis-dark-muted hover:text-unis-ink dark:hover:text-unis-dark-text hover:bg-stone-50 dark:hover:bg-unis-dark-elevated transition-colors"
                  >
                    <User className="w-4 h-4" /> Profile & Settings
                  </button>

                  <div className="my-1 border-t border-unis-border dark:border-unis-dark-border" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
