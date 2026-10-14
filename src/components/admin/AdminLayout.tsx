import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Palette,
  Package as PackageIcon,
  Sparkles,
  CreditCard,
  Globe,
  Settings,
  Bell,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Check,
  Users,
} from 'lucide-react';
import { AdminNotification } from '../../types';
import { api } from '../../lib/api';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onGoPublic: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  onGoPublic,
  children,
}) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await api.getAdminNotifications();
      setNotifications(data);
    } catch (_) {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    fetchNotifications();
  };

  const handleClearAll = async () => {
    await api.clearNotifications();
    setNotifications([]);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Metrics', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'bookings', label: 'Booking Enquiries', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'templates', label: 'Design Templates', icon: <Palette className="w-4 h-4" /> },
    { id: 'packages', label: 'Packages & Pricing', icon: <PackageIcon className="w-4 h-4" /> },
    { id: 'ai-drafts', label: 'AI Drafts Atelier', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'payments', label: 'Payment Records', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'published', label: 'Published Websites', icon: <Globe className="w-4 h-4" /> },
    { id: 'rsvps', label: 'RSVP Responses', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings & Security', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#1A1615] text-[#F8F3EA] flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 bg-[#231C1A] border-r border-[#D4B477]/25 flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-[#D4B477]/20 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-widest text-[#D4B477]">
                  E-INVORA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4B477]"></span>
              </div>
              <span className="text-[10px] tracking-wider uppercase text-[#F8F3EA]/60 font-sans block">
                Owner Administration
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#6E2639] text-white shadow-sm border border-[#D4B477]/40'
                      : 'text-[#F8F3EA]/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={isActive ? 'text-[#D4B477]' : 'text-[#F8F3EA]/50'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#D4B477]/20 space-y-2">
          <button
            onClick={onGoPublic}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#D4B477] hover:bg-[#D4B477]/10 transition-colors cursor-pointer"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#231C1A]/95 backdrop-blur-md border-b border-[#D4B477]/20 px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-[#F8F3EA] hover:text-[#D4B477] focus:outline-none"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-sm font-serif font-bold text-white capitalize">
              {navItems.find((n) => n.id === currentTab)?.label || 'Administration'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Popover Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full text-[#F8F3EA]/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Admin Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#6E2639] text-[#D4B477] text-[10px] font-bold flex items-center justify-center border border-[#D4B477]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#231C1A] border border-[#D4B477]/40 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D4B477]/20 pb-2">
                    <span className="font-serif font-bold text-sm text-[#D4B477]">
                      Operational Notifications ({unreadCount} unread)
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-[10px] text-[#F8F3EA]/50 hover:text-rose-400"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-center py-4 text-[#F8F3EA]/40">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border transition-all ${
                            n.isRead
                              ? 'bg-black/20 border-white/5 text-[#F8F3EA]/60'
                              : 'bg-[#6E2639]/30 border-[#D4B477]/30 text-white font-medium'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-[#D4B477] text-[11px]">{n.title}</span>
                            {!n.isRead && (
                              <button
                                onClick={() => handleMarkRead(n.id)}
                                className="text-[10px] text-emerald-400 hover:underline"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] mt-0.5 text-[#F8F3EA]/80">{n.message}</p>
                          <span className="text-[9px] text-[#F8F3EA]/40 block mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Public Link */}
            <button
              onClick={onGoPublic}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#D4B477] bg-white/5 border border-[#D4B477]/30 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span>Public Store</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </header>

        {/* Mobile Sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/80 flex">
            <div className="w-64 bg-[#231C1A] border-r border-[#D4B477]/30 p-4 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-serif text-lg font-bold text-[#D4B477]">E-INVORA ADMIN</span>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                      currentTab === item.id ? 'bg-[#6E2639] text-white' : 'text-[#F8F3EA]/70'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="pt-4 border-t border-white/10 space-y-2">
                <button
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    onGoPublic();
                  }}
                  className="w-full text-left text-xs text-[#D4B477] py-2"
                >
                  View Public Website
                </button>
                <button
                  onClick={onLogout}
                  className="w-full text-left text-xs text-rose-400 py-2"
                >
                  Sign Out
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#1A1615]">
          {children}
        </main>
      </div>
    </div>
  );
};
