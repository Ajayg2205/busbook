import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: '', last_name: '', username: '', email: '', phone: '', password: '', password2: '' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      const msg = Object.values(err.response?.data || {}).flat()[0] || 'Registration failed';
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon"><FaBus /></div>
          Bus<span style={{ color: 'var(--primary)' }}>Book</span>
        </div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join millions of happy travellers</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-row">
            <div className="input-group">
              <label>First Name *</label>
              <input className="form-input" placeholder="John" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Last Name *</label>
              <input className="form-input" placeholder="Doe" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
            </div>
          </div>
          <div className="input-group">
            <label>Username *</label>
            <input className="form-input" placeholder="johndoe123" value={form.username} onChange={e => set('username', e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Email Address *</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            <input className="form-input" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="auth-form-row">
            <div className="input-group">
              <label>Password *</label>
              <input className="form-input" type="password" placeholder="Min 8 chars" value={form.password} onChange={e => set('password', e.target.value)} required minLength={8} />
            </div>
            <div className="input-group">
              <label>Confirm Password *</label>
              <input className="form-input" type="password" placeholder="Repeat password" value={form.password2} onChange={e => set('password2', e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}
