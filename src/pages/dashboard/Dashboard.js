import React, { useMemo, useId, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Cpu,
  Server,
  Activity,
  Calendar,
} from 'lucide-react';
import '../dashboard/dashboard.css';
import { Video } from 'lucide-react';
import UserManagement from '../../components/UserManagement/UserManagement';
import VideoManagement from '../../components/VideoManagement/VideoManagement';
import EventList from '../events/EventList';
import EventCreate from '../events/EventCreate';
import EventForm from '../../components/EventManagement/EventForm';
import RegistrationList from '../events/RegistrationList';
import DiscountCodeManager from '../events/DiscountCodeManager';

/* Small sparkline (no external libs) */
const Sparkline = ({ data = [], color = '#c6ff1a', fill = 'rgba(198,255,26,0.12)' }) => {
  const id = useId();
  const norm = useMemo(() => {
    if (!data.length) return [];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    return data.map((d) => ((d - min) / span) * 100);
  }, [data]);

  const path = useMemo(() => {
    if (!norm.length) return '';
    return norm
      .map((y, i) => `${i === 0 ? 'M' : 'L'} ${(i / (norm.length - 1)) * 100}, ${100 - y}`)
      .join(' ');
  }, [norm]);

  const area = `${path} L 100,100 L 0,100 Z`;

  return (
    <svg viewBox="0 0 100 100" className="sparkline" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={color} />
          <stop offset="60%" stopColor="#6ce7ff" />
        </linearGradient>
      </defs>
      <path d={area} fill={fill} stroke="none" />
      <path d={path} fill="none" stroke={`url(#g-${id})`} strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [currentSubView, setCurrentSubView] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const initials = (user?.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      delta: '+3.2%',
      trend: 'up',
      icon: <Users />,
      color: '#c6ff1a',
      data: [12, 14, 16, 12, 18, 20, 21, 24, 22, 26],
    },
    {
      title: 'Active Sessions',
      value: '89',
      delta: '+12%',
      trend: 'up',
      icon: <BarChart3 />,
      color: '#6ce7ff',
      data: [5, 8, 7, 9, 12, 10, 13, 14, 12, 15],
    },
    {
      title: 'New Signups Today',
      value: '12',
      delta: '-8%',
      trend: 'down',
      icon: <Activity />,
      color: '#a78bfa',
      data: [1, 3, 2, 4, 3, 6, 4, 5, 3, 2],
    },
    {
      title: 'System Uptime',
      value: '99.98%',
      delta: '+0.01%',
      trend: 'up',
      icon: <ShieldCheck />,
      color: '#22c55e',
      data: [99.9, 99.92, 99.95, 99.96, 99.98, 99.97, 99.98, 99.98, 99.99, 99.98],
    },
  ];

  const activities = [
    { dot: 'background:#22c55e', text: 'New user registered: john@example.com', time: '2m ago' },
    { dot: 'background:#60a5fa', text: 'User updated profile: jane@example.com', time: '5m ago' },
    { dot: 'background:#f59e0b', text: 'Password reset requested: bob@example.com', time: '10m ago' },
    { dot: 'background:#22c55e', text: 'New user registered: alice@example.com', time: '15m ago' },
  ];

  const handleNavigation = (view, subView = null, eventId = null) => {
    setCurrentView(view);
    setCurrentSubView(subView);
    setSelectedEventId(eventId);
  };

  const handleEventCreateSuccess = (eventData) => {
    console.log('Event created successfully:', eventData);
    // Go back to events list
    setCurrentSubView(null);
    setSelectedEventId(null);
  };

  const handleBackToEvents = () => {
    setCurrentSubView(null);
    setSelectedEventId(null);
  };

  const renderBreadcrumbs = () => {
    switch (currentView) {
      case 'users':
        return (
          <>
            <span>Dashboard</span>
            <span className="sep">/</span>
            <strong>User Management</strong>
          </>
        );
      case 'video':
        return (
          <>
            <span>Dashboard</span>
            <span className="sep">/</span>
            <strong>Video Management</strong>
          </>
        );
      case 'events':
        return (
          <>
            <span>Dashboard</span>
            <span className="sep">/</span>
            <span>Event Management</span>
            {currentSubView === 'create' && (
              <>
                <span className="sep">/</span>
                <strong>Create Event</strong>
              </>
            )}
            {currentSubView === 'edit' && (
              <>
                <span className="sep">/</span>
                <strong>Edit Event</strong>
              </>
            )}
            {currentSubView === 'registrations' && (
              <>
                <span className="sep">/</span>
                <strong>Registrations</strong>
              </>
            )}
            {currentSubView === 'discounts' && (
              <>
                <span className="sep">/</span>
                <strong>Discount Codes</strong>
              </>
            )}
            {!currentSubView && <strong style={{ marginLeft: 0 }}> (List)</strong>}
          </>
        );
      default:
        return (
          <>
            <span>Dashboard</span>
            <span className="sep">/</span>
            <strong>Overview</strong>
          </>
        );
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'users':
        return <UserManagement />;
      case 'video':
        return <VideoManagement />;
      case 'events':
        if (currentSubView === 'create') {
          return (
            <EventCreate 
              onBack={handleBackToEvents}
              onSuccess={handleEventCreateSuccess}
            />
          );
        } else if (currentSubView === 'edit') {
          return (
            <EventForm
              mode="edit"
              eventId={selectedEventId}
              onBack={handleBackToEvents}
              onSuccess={handleEventCreateSuccess}
            />
          );
        } else if (currentSubView === 'registrations') {
          return (
            <RegistrationList
              eventId={selectedEventId}
              onBack={handleBackToEvents}
            />
          );
        } else if (currentSubView === 'discounts') {
          return (
            <DiscountCodeManager
              onBack={handleBackToEvents}
            />
          );
        }
        return (
          <EventList 
            onCreateEvent={() => handleNavigation('events', 'create')}
            onEditEvent={(eventId) => handleNavigation('events', 'edit', eventId)}
            onViewRegistrations={(eventId) => handleNavigation('events', 'registrations', eventId)}
            onManageDiscounts={() => handleNavigation('events', 'discounts')}
          />
        );
      default:
        return (
          <>
            <div style={{ marginBottom: 16 }}>
              <div className="page-title">Welcome back, {user?.name || 'Admin'}</div>
              <div className="page-sub">Here's a quick snapshot of your application health and activity.</div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
              {stats.map((s, i) => (
                <div key={i} className="dashboard-card card-accent stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="icon-wrap" style={{ borderColor: `${s.color}40`, background: `${s.color}14` }}>
                        {React.cloneElement(s.icon, { size: 18, color: s.color })}
                      </div>
                      <div className="stat-title">{s.title}</div>
                    </div>
                    <span className={`delta ${s.trend === 'up' ? 'up' : 'down'}`}>
                      {s.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {s.delta}
                    </span>
                  </div>

                  <div className="stat-value mb-1">{s.value}</div>
                  <Sparkline data={s.data} color={s.color} />
                </div>
              ))}
            </div>

            {/* System health and quick actions */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
              {/* System health */}
              <div className="dashboard-card card-accent xl:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Cpu size={18} color="#6ce7ff" />
                    <h3 className="text-lg font-semibold">System Health</h3>
                  </div>
                  <span className="status-pill">
                    <span className="dot" />
                    Operational
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="info-label">API Latency</div>
                    <div className="info-value">124 ms</div>
                    <div className="progress mt-2"><span style={{ width: '62%' }} /></div>
                  </div>
                  <div>
                    <div className="info-label">CPU Usage</div>
                    <div className="info-value">41%</div>
                    <div className="progress mt-2"><span style={{ width: '41%' }} /></div>
                  </div>
                  <div>
                    <div className="info-label">DB Uptime</div>
                    <div className="info-value">72 days</div>
                    <div className="progress mt-2"><span style={{ width: '95%' }} /></div>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="dashboard-card card-accent">
                <div className="flex items-center gap-3 mb-3">
                  <Settings size={18} color="#c6ff1a" />
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                </div>
                <div className="quick-grid">
                  <button className="quick-action" onClick={() => handleNavigation('users')}>
                    <Users /> Manage Users
                  </button>
                  <button className="quick-action" onClick={() => handleNavigation('events')}>
                    <Calendar /> Manage Events
                  </button>
                  <button className="quick-action" onClick={() => handleNavigation('events', 'create')}>
                    <Calendar /> Create Event
                  </button>
                  <button className="quick-action" onClick={() => handleNavigation('events', 'discounts')}>
                    <Calendar /> Manage Discounts
                  </button>
                  <button className="quick-action" onClick={() => handleNavigation('video')}>
                    <Video /> Video Management
                  </button>
                </div>
              </div>
            </div>

            {/* Activity + Account information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="dashboard-card">
                <div className="flex items-center gap-3 mb-4">
                  <Activity size={18} color="#6ce7ff" />
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                </div>
                <div className="activity">
                  {activities.map((a, i) => (
                    <div key={i} className="activity-row">
                      <div className="flex items-center gap-3">
                        <span className="badge-dot" style={{ background: a.dot.replace('background:', '') }} />
                        <span>{a.text}</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--theme-muted)' }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-card">
                <h3 className="text-lg font-semibold mb-4">Your Account</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <p className="info-label">Name</p>
                    <p className="info-value">{user?.name || 'Admin'}</p>
                  </div>
                  <div>
                    <p className="info-label">Email</p>
                    <p className="info-value">{user?.email || 'admin@example.com'}</p>
                  </div>
                  <div>
                    <p className="info-label">Account Created</p>
                    <p className="info-value">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="info-label">User ID</p>
                    <p className="info-value font-mono">{user?._id || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard-app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">A</div>
          <div className="title">Admin Panel</div>
          <div className="version">v1.0</div>
        </div>

        <nav className="nav">
          <button 
            className={`nav-item ${currentView === 'overview' ? 'active' : ''}`}
            onClick={() => handleNavigation('overview')}
          >
            <LayoutDashboard /> Overview
          </button>
          <button 
            className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
            onClick={() => handleNavigation('users')}
          >
            <Users /> Users
          </button>
          <button 
            className={`nav-item ${currentView === 'events' ? 'active' : ''}`}
            onClick={() => handleNavigation('events')}
          >
            <Calendar /> Events
          </button>
          <button 
            className={`nav-item ${currentView === 'video' ? 'active' : ''}`}
            onClick={() => handleNavigation('video')}
          >
            <Video /> Video Management
          </button>
          <button 
            className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`}
            onClick={() => handleNavigation('analytics')}
          >
            <BarChart3 /> Analytics
          </button>
          <button 
            className={`nav-item ${currentView === 'systems' ? 'active' : ''}`}
            onClick={() => handleNavigation('systems')}
          >
            <Server /> Systems
          </button>
          <button 
            className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => handleNavigation('settings')}
          >
            <Settings /> Settings
          </button>
        </nav>

        <div className="sidebar-tip" style={{ marginTop: '16px' }}>
          Pro tip: Use Quick Actions to jump to your most-used tasks. Customize this from Settings.
        </div>
      </aside>

      {/* Content */}
      <section className="content">
        {/* Topbar */}
        <header className="topbar">
          <div className="breadcrumbs">
            {renderBreadcrumbs()}
          </div>

          <div className="searchbar">
            <div className="search">
              <Search />
              <input placeholder="Search users, logs, settings..." />
            </div>

            <button className="icon-btn" title="Notifications">
              <Bell />
              <span className="ping" />
            </button>

            <div className="userchip">
              <div className="avatar">{initials}</div>
              <div style={{ display: 'grid', lineHeight: 1.05 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{user?.name || 'Admin'}</span>
                <span style={{ fontSize: 11, color: 'var(--theme-muted)' }}>{user?.email || 'admin@example.com'}</span>
              </div>
              <button onClick={logout} className="button-dark" style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <LogOut style={{ width: 16, height: 16 }} />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Inner content */}
        <div className="content-inner">
          {renderContent()}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;