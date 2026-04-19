import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './PassengerDetails.css';

export default function PassengerDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { trip, selectedSeats } = state || {};

  const [passengers, setPassengers] = useState(
    (selectedSeats || []).map((_, i) => ({ name: '', age: '', gender: 'M', id_type: '', id_number: '' }))
  );

  if (!trip || !selectedSeats) {
    navigate('/search'); return null;
  }

  const update = (index, field, value) => {
    setPassengers(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const validate = () => {
    for (const p of passengers) {
      if (!p.name.trim()) { toast.error('Please enter passenger name'); return false; }
      if (!p.age || p.age < 1) { toast.error('Please enter valid age'); return false; }
    }
    return true;
  };

  const proceed = () => {
    if (!validate()) return;
    navigate('/payment', { state: { trip, selectedSeats, passengers } });
  };

  return (
    <div className="passenger-page">
      <div className="container">
        {/* Progress */}
        <div className="booking-progress">
          <div className="progress-step progress-step--done">1. Seats</div>
          <div className="progress-line progress-line--done" />
          <div className="progress-step progress-step--active">2. Passengers</div>
          <div className="progress-line" />
          <div className="progress-step">3. Payment</div>
          <div className="progress-line" />
          <div className="progress-step">4. Confirm</div>
        </div>

        <h2 className="section-title" style={{ marginBottom: 32, textAlign: 'center' }}>Passenger Details</h2>

        <div className="passenger-layout">
          <div className="passenger-forms">
            {passengers.map((p, i) => (
              <div key={i} className="passenger-card card">
                <div className="passenger-card__header">
                  <div className="passenger-number"><FaUser /> Passenger {i + 1}</div>
                  <span className="badge badge-primary">Seat {selectedSeats[i].seat_number}</span>
                </div>
                <div className="passenger-form-grid">
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label>Full Name *</label>
                    <input className="form-input" placeholder="Enter full name"
                      value={p.name} onChange={e => update(i, 'name', e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Age *</label>
                    <input type="number" className="form-input" placeholder="Age"
                      value={p.age} onChange={e => update(i, 'age', e.target.value)} min="1" max="120" required />
                  </div>
                  <div className="input-group">
                    <label>Gender *</label>
                    <select className="form-input" value={p.gender} onChange={e => update(i, 'gender', e.target.value)}>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>ID Type</label>
                    <select className="form-input" value={p.id_type} onChange={e => update(i, 'id_type', e.target.value)}>
                      <option value="">Select (Optional)</option>
                      <option value="Aadhar">Aadhar Card</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Voter ID">Voter ID</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>ID Number</label>
                    <input className="form-input" placeholder="ID number (optional)"
                      value={p.id_number} onChange={e => update(i, 'id_number', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trip Summary */}
          <div className="trip-mini-summary card">
            <h3>Trip Summary</h3>
            <div className="mini-route">
              <strong>{trip.route.source}</strong>
              <FaArrowRight className="mini-arrow" />
              <strong>{trip.route.destination}</strong>
            </div>
            <div className="mini-details">
              <div><span>Date</span><strong>{new Date(trip.departure_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
              <div><span>Departure</span><strong>{new Date(trip.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</strong></div>
              <div><span>Seats</span><strong>{selectedSeats.map(s => s.seat_number).join(', ')}</strong></div>
              <div><span>Passengers</span><strong>{passengers.length}</strong></div>
            </div>
            <div className="mini-total">
              <span>Total Fare</span>
              <strong>₹{(passengers.length * parseFloat(trip.fare) * 1.02).toFixed(0)}</strong>
            </div>
          </div>
        </div>

        <div className="passenger-actions">
          <button className="btn btn-ghost" onClick={() => navigate(-1)}><FaArrowLeft /> Back</button>
          <button className="btn btn-primary btn-lg" onClick={proceed}>Proceed to Payment <FaArrowRight /></button>
        </div>
      </div>
    </div>
  );
}
