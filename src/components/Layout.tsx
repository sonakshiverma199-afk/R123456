import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { LayoutDashboard, Timer, Calendar, BookOpen, ListTodo, FileText, Brain, LogOut, Bell, Menu, X, GraduationCap } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { notifications, markNotificationRead, clearNotifications } = useData();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/timer', icon: Timer, label: 'Study Timer' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/subjects', icon: BookOpen, label: 'Subjects' },
    { to: '/todos', icon: ListTodo, label: 'To-Do List' },
    { to: '/assignments', icon: FileText, label: 'Assignments' },
    { to: '/theory', icon: Brain, label: 'Theory Tracker' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-700 flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-dark-700 flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-accent" />
          <div>
            <h1 className="text-lg font-bold text-dark-100">StudyHub</h1>
            <p className="text-xs text-dark-400">Academic Assistant</p>
          </div>
          <button className="lg:hidden ml-auto text-dark-400" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent/10 text-accent-light' : 'text-dark-400 hover:bg-dark-700 hover:text-dark-200'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-dark-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-sm font-medium text-accent-light">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-200 truncate">{user?.name}</p>
              <p className="text-xs text-dark-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-dark-400 hover:bg-dark-700 hover:text-danger w-full transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-dark-800 border-b border-dark-700 flex items-center px-4 gap-4 shrink-0">
          <button className="lg:hidden text-dark-400 hover:text-dark-200" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 text-dark-400 hover:text-dark-200 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-dark-700 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-dark-200">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={clearNotifications} className="text-xs text-accent hover:text-accent-light">Clear all</button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-dark-500 text-center">No notifications</p>
                ) : (
                  notifications.slice(0, 20).map(n => (
                    <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`p-3 border-b border-dark-700/50 cursor-pointer hover:bg-dark-700/50 ${!n.read ? 'bg-dark-700/30' : ''}`}>
                      <p className="text-sm text-dark-200">{n.message}</p>
                      <p className="text-xs text-dark-500 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
