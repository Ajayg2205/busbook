import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBus, FaCalendar, FaMapMarkerAlt, FaTimes, FaTicketAlt } from 'react-icons/fa';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './MyBookings.css';

const STATUS_COLOR = {
  confirmed: 'badge-success', pending: 'badge-warning',
  cancelled: 'badge-danger', completed: 'badge-primary',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/bookings/')
      .then(r => setBookings(r.data.results || r.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await API.post(`/bookings/${id}/cancel/`, { reason: 'User requested cancellation' });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled. Refund will be processed.');
    } catch { toast.error('Cancellation failed'); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="mybookings-page">
      <div className="container">
        <div className="mybookings-header">
          <h1 className="section-title">My Bookings</h1>
          <p className="mybookings-subtitle">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="booking-filters">
          {['all', 'confirmed', 'completed', 'cancelled'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-trips">{[1,2,3].map(i => <div key={i} className="trip-skeleton" style={{ height: 160 }} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="no-bookings">
            <FaTicketAlt className="no-bookings__icon" />
            <h3>No bookings found</h3>
            <p>You haven't made any bookings yet</p>
            <button className="btn btn-primary" onClick={() => navigate('/search')}>Book a Bus</button>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map(booking => (
              <div key={booking.id} className="booking-card card">
                <div className="booking-card__header">
                  <div className="booking-ref">
                    <FaTicketAlt />
                    <span>#{String(booking.booking_id).substring(0, 8).toUpperCase()}</span>
                  </div>
                  <span className={`badge ${STATUS_COLOR[booking.status] || 'badge-primary'}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="booking-card__route">
                  <div className="bc-city">
                    <FaMapMarkerAlt className="city-icon city-icon--from" />
                    <div>
                      <span className="bc-cityname">{booking.trip?.route?.source}</span>
                      <span className="bc-time">
                        {new Date(booking.trip?.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  </div>
                  <div className="bc-arrow">→</div>
                  <div className="bc-city">
                    <FaMapMarkerAlt className="city-icon city-icon--to" />
                    <div>
                      <span className="bc-cityname">{booking.trip?.route?.destination}</span>
                      <span className="bc-time">
                        {new Date(booking.trip?.arrival_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="booking-card__meta">
                  <span><FaCalendar /> {new Date(booking.trip?.departure_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span><FaBus /> {booking.trip?.bus?.operator?.name}</span>
                  <span>Seats: {(booking.passengers || []).map(p => p.seat_number).join(', ')}</span>
                </div>

                <div className="booking-card__footer">
                  <div className="booking-fare">
                    <span>Total Paid</span>
                    {/* ✅ Fix: use final_amount directly instead of recalculating */}
                    <strong>₹{parseFloat(booking.final_amount || 0).toFixed(0)}</strong>
                  </div>
                  <div className="booking-actions">
                    {booking.status === 'confirmed' && (
                      <button className="btn btn-outline btn-sm"
                        style={{ color: '#dc2626', borderColor: '#dc2626' }}
                        onClick={() => cancelBooking(booking.id)}>
                        <FaTimes /> Cancel
                      </button>
                    )}
                    <button className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/booking-confirmation/${booking.id}`, { state: { booking } })}>
                      View Ticket
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}