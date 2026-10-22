import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }
    setIsOpen(false);
    if (item.resourceType === 'TICKET' && item.resourceId) {
      navigate(`/tickets/${item.resourceId}`);
    } else if (item.resourceType === 'LOST_FOUND' && item.resourceId) {
      navigate(`/lost-found/${item.resourceId}`);
    } else if (item.resourceType === 'ANNOUNCEMENT') {
      navigate('/announcements');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-unis-slate hover:text-unis-ink hover:bg-unis-highlight dark:text-unis-dark-muted dark:hover:text-unis-dark-text dark:hover:bg-unis-dark-elevated transition-colors focus:outline-none"
        aria-label="View institutional notifications"
      >
        <Bell className="w-5 h-5 stroke-[1.8]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse-subtle">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-unis-card dark:bg-unis-dark-card border border-unis-border dark:border-unis-dark-border rounded-card shadow-elevated dark:shadow-dark-elevated z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-unis-border dark:border-unis-dark-border bg-stone-50/50 dark:bg-stone-900/30">
            <div>
              <h4 className="text-sm font-semibold text-unis-ink dark:text-unis-dark-text">
                Notifications
              </h4>
              <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted">
                {unreadCount} unread institutional alert{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-unis-brand dark:text-unis-dark-brand font-medium hover:underline flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-unis-border dark:divide-unis-dark-border">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-unis-slate dark:text-unis-dark-muted">
                No notifications right now. You're all caught up!
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 hover:bg-stone-50 dark:hover:bg-unis-dark-elevated cursor-pointer transition-colors text-left flex items-start gap-3 ${
                    !item.isRead ? 'bg-unis-blue-light/50 dark:bg-unis-dark-highlight/30' : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    !item.isRead ? 'bg-unis-brand dark:bg-unis-dark-brand' : 'bg-transparent'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${!item.isRead ? 'font-semibold text-unis-ink dark:text-unis-dark-text' : 'text-unis-slate dark:text-unis-dark-muted'}`}>
                      {item.title}
                    </p>
                    <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-unis-slate/70 dark:text-unis-dark-muted/70 mt-1 inline-block">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  {item.resourceId && (
                    <ExternalLink className="w-3.5 h-3.5 text-unis-slate/60 flex-shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
