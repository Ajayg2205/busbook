import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import {
  FaUsers, FaTicketAlt, FaBus, FaRoute, FaRupeeSign,
  FaChartLine, FaCalendarAlt, FaCheckCircle, FaTimesCircle,
  FaClock, FaShieldAlt
} from 'react-icons/fa';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied!');
      navigate('/');
    }
  }, [user]);

  useEffect(() => {
    loadStats();
    loadRecentBookings();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings') loadBookings();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'trips') loadTrips();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const res = await API.get('/admin-panel/stats/');
      setStats(res.data);
    } catch { toast.error('Failed to load stats'); }
    setLoading(false);
  };

  const loadRecentBookings = async () => {
    try {
      const res = await API.get('/admin-panel/recent-bookings/');
      setRecentBookings(res.data);
    } catch {}
  };

  const loadBookings = async () => {
    try {
      const res = await API.get('/admin-panel/bookings/');
      setBookings(res.data.results);
    } catch { toast.error('Failed to load bookings'); }
  };

  const loadUsers = async () => {
    try {
      const res = await API.get('/admin-panel/users/');
      setUsers(res.data.results);
    } catch { toast.error('Failed to load users'); }
  };

  const loadTrips = async () => {
    try {
      const res = await API.get('/admin-panel/trips/');
      setTrips(res.data.results);
    } catch { toast.error('Failed to load trips'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-sidebar__header">
          <FaShieldAlt />
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          {[
            { id: 'overview', icon: <FaChartLine />, label: 'Overview' },
            { id: 'bookings', icon: <FaTicketAlt />, label: 'Bookings' },
            { id: 'users', icon: <FaUsers />, label: 'Users' },
            { id: 'trips', icon: <FaBus />, label: 'Trips' },
          ].map(tab => (
            <button key={tab.id}
              className={`admin-nav__item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="admin-main">
        <div className="admin-header">
          <h1>
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'bookings' && 'All Bookings'}
            {activeTab === 'users' && 'All Users'}
            {activeTab === 'trips' && 'All Trips'}
          </h1>
          <div className="admin-header__user">
            <span>👋 {user?.first_name || 'Admin'}</span>
          </div>
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && stats && (
          <div className="admin-overview">
            {/* Stat Cards */}
            <div className="stat-cards">
              <div className="stat-card stat-card--blue">
                <div className="stat-card__icon"><FaTicketAlt /></div>
                <div className="stat-card__info">
                  <div className="stat-card__value">{stats.bookings.total}</div>
                  <div className="stat-card__label">Total Bookings</div>
                  <div className="stat-card__sub">+{stats.bookings.recent_7_days} this week</div>
                </div>
              </div>
              <div className="stat-card stat-card--green">
                <div className="stat-card__icon"><FaRupeeSign /></div>
                <div className="stat-card__info">
                  <div className="stat-card__value">₹{Math.round(stats.revenue.total).toLocaleString()}</div>
                  <div className="stat-card__label">Total Revenue</div>
                  <div className="stat-card__sub">₹{Math.round(stats.revenue.last_30_days).toLocaleString()} this month</div>
                </div>
              </div>
              <div className="stat-card stat-card--orange">
                <div className="stat-card__icon"><FaUsers /></div>
                <div className="stat-card__info">
                  <div className="stat-card__value">{stats.users.total}</div>
                  <div className="stat-card__label">Total Users</div>
                  <div className="stat-card__sub">+{stats.users.new_7_days} new this week</div>
                </div>
              </div>
              <div className="stat-card stat-card--purple">
                <div className="stat-card__icon"><FaBus /></div>
                <div className="stat-card__info">
                  <div className="stat-card__value">{stats.operations.active_trips}</div>
                  <div className="stat-card__label">Active Trips</div>
                  <div className="stat-card__sub">{stats.operations.total_routes} routes total</div>
                </div>
              </div>
            </div>

            {/* Booking Status */}
            <div className="admin-grid">
              <div className="card admin-card">
                <h3>Booking Status</h3>
                <div className="status-breakdown">
                  <div className="status-row">
                    <span className="status-dot status-dot--green" />
                    <span>Confirmed</span>
                    <strong>{stats.bookings.confirmed}</strong>
                  </div>
                  <div className="status-row">
                    <span className="status-dot status-dot--red" />
                    <span>Cancelled</span>
                    <strong>{stats.bookings.cancelled}</strong>
                  </div>
                  <div className="status-row">
                    <span className="status-dot status-dot--blue" />
                    <span>Total</span>
                    <strong>{stats.bookings.total}</strong>
                  </div>
                </div>
              </div>

              <div className="card admin-card">
                <h3>Operations</h3>
                <div className="status-breakdown">
                  <div className="status-row">
                    <FaRoute style={{ color: 'var(--primary)' }} />
                    <span>Total Routes</span>
                    <strong>{stats.operations.total_routes}</strong>
                  </div>
                  <div className="status-row">
                    <FaBus style={{ color: 'var(--primary)' }} />
                    <span>Total Buses</span>
                    <strong>{stats.operations.total_buses}</strong>
                  </div>
                  <div className="status-row">
                    <FaCalendarAlt style={{ color: 'var(--primary)' }} />
                    <span>Scheduled Trips</span>
                    <strong>{stats.operations.active_trips}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="card admin-card" style={{ marginTop: 24 }}>
              <h3>Recent Bookings</h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>User</th>
                      <th>Route</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map(b => (
                      <tr key={b.id}>
                        <td><code>#{b.booking_id}</code></td>
                        <td>{b.user}</td>
                        <td>{b.route}</td>
                        <td>₹{Math.round(b.amount)}</td>
                        <td><span className={`badge ${b.status === 'confirmed' ? 'badge-success' : 'badge-danger'}`}>{b.status}</span></td>
                        <td>{b.booked_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Bookings Tab ── */}
        {activeTab === 'bookings' && (
          <div className="card admin-card">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Route</th>
                    <th>Departure</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Booked</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td><code>#{b.booking_id}</code></td>
                      <td>
                        <div>{b.user_name}</div>
                        <small style={{ color: 'var(--text-muted)' }}>{b.user_email}</small>
                      </td>
                      <td>{b.route}</td>
                      <td>{b.departure}</td>
                      <td>{b.seats}</td>
                      <td>₹{Math.round(b.amount)}</td>
                      <td>
                        <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : b.status === 'cancelled' ? 'badge-danger' : 'badge-primary'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>{b.booked_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <div className="card admin-card">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Bookings</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || '-'}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>{u.role}</span></td>
                      <td>{u.bookings}</td>
                      <td>{u.joined}</td>
                      <td>
                        <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Trips Tab ── */}
        {activeTab === 'trips' && (
          <div className="card admin-card">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Operator</th>
                    <th>Bus Type</th>
                    <th>Departure</th>
                    <th>Fare</th>
                    <th>Seats Left</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map(t => (
                    <tr key={t.id}>
                      <td>{t.route}</td>
                      <td>{t.operator}</td>
                      <td>{t.bus_type}</td>
                      <td>{t.departure}</td>
                      <td>₹{Math.round(t.fare)}</td>
                      <td>{t.available_seats}/{t.total_seats}</td>
                      <td>
                        <span className={`badge ${t.status === 'scheduled' ? 'badge-success' : 'badge-danger'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}