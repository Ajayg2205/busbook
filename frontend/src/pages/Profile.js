import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FaUser, FaLock, FaTicketAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await API.patch('/auth/profile/', form);
      updateUser(data);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    setSaving(false);
  };

  const changePassword = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await API.post('/auth/change-password/', passwords);
      toast.success('Password changed!');
      setPasswords({ old_password: '', new_password: '' });
    } catch { toast.error('Old password is incorrect'); }
    setSaving(false);
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: 32 }}>My Account</h1>
        <div className="profile-layout">
          {/* Sidebar */}
          <div className="card profile-card">
            <div className="profile-avatar">
              {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="profile-name">{user?.first_name} {user?.last_name}</div>
            <div className="profile-email">{user?.email}</div>
            <div className="profile-role">
              <span className="badge badge-primary">{user?.role}</span>
            </div>
            <nav className="profile-nav">
              <button className={`profile-nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
                <FaUser /> &nbsp; Edit Profile
              </button>
              <button className={`profile-nav-item ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
                <FaLock /> &nbsp; Change Password
              </button>
              <Link to="/my-bookings" className="profile-nav-item" style={{ textDecoration: 'none', display: 'block' }}>
                <FaTicketAlt /> &nbsp; My Bookings
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          {tab === 'profile' && (
            <div className="card profile-form-card">
              <h3>Personal Information</h3>
              <form onSubmit={saveProfile}>
                <div className="profile-form-grid">
                  <div className="input-group">
                    <label>First Name</label>
                    <input className="form-input" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Last Name</label>
                    <input className="form-input" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Email (read-only)</label>
                    <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label>Address</label>
                    <textarea className="form-input" rows={3} placeholder="Your address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {tab === 'password' && (
            <div className="card profile-form-card">
              <h3>Change Password</h3>
              <form onSubmit={changePassword} style={{ maxWidth: 400 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                  <div className="input-group">
                    <label>Current Password</label>
                    <input type="password" className="form-input" value={passwords.old_password}
                      onChange={e => setPasswords({ ...passwords, old_password: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label>New Password</label>
                    <input type="password" className="form-input" value={passwords.new_password}
                      onChange={e => setPasswords({ ...passwords, new_password: e.target.value })} required minLength={8} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
