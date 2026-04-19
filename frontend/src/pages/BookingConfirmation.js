import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaBus, FaDownload, FaHome, FaTicketAlt } from 'react-icons/fa';
import './BookingConfirmation.css';

export default function BookingConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { booking } = state || {};

  if (!booking) { navigate('/my-bookings'); return null; }

  const handlePrint = () => window.print();

  return (
    <div className="confirmation-page">
      <div className="container">
        <div className="confirmation-card card">
          {/* Success Banner */}
          <div className="confirmation-banner">
            <div className="success-icon"><FaCheckCircle /></div>
            <h1>Booking Confirmed!</h1>
            <p>Your e-ticket has been sent to your registered email</p>
            <div className="booking-id-badge">
              Booking ID: <strong>{String(booking.booking_id).substring(0, 8).toUpperCase()}</strong>
            </div>
          </div>

          {/* E-Ticket */}
          <div className="eticket" id="eticket">
            <div className="eticket__header">
              <div className="eticket__logo"><FaBus /> BusBook</div>
              <div className="eticket__status"><span className="badge badge-success">✓ Confirmed</span></div>
            </div>

            <div className="eticket__route">
              <div className="eticket__city">
                <span className="city-name">{booking.trip?.route?.source}</span>
                <span className="city-time">
                  {new Date(booking.trip?.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              </div>
              <div className="eticket__travel-line">
                <div className="travel-dot" />
                <div className="travel-line-bar" />
                <FaBus className="travel-bus-icon" />
                <div className="travel-line-bar" />
                <div className="travel-dot travel-dot--end" />
              </div>
              <div className="eticket__city eticket__city--right">
                <span className="city-name">{booking.trip?.route?.destination}</span>
                <span className="city-time">
                  {new Date(booking.trip?.arrival_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              </div>
            </div>

            <div className="eticket__date-bar">
              <span>📅 {new Date(booking.trip?.departure_time).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>🚌 {booking.trip?.bus?.operator?.name}</span>
              <span>🎫 {booking.trip?.bus?.bus_type?.replace('_', ' ')}</span>
            </div>

            <div className="eticket__passengers">
              <h4>Passenger Details</h4>
              <table className="passenger-table">
                <thead>
                  <tr><th>#</th><th>Name</th><th>Age</th><th>Gender</th><th>Seat</th></tr>
                </thead>
                <tbody>
                  {(booking.passengers || []).map((p, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{p.name}</td>
                      <td>{p.age}</td>
                      <td>{p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</td>
                      <td><span className="seat-pill">{p.seat_number}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="eticket__footer">
              <div className="eticket__fare">
                <span>Total Paid</span>
                <strong>₹{(parseFloat(booking.total_fare || 0) + parseFloat(booking.convenience_fee || 0) - parseFloat(booking.discount || 0)).toFixed(0)}</strong>
              </div>
              <div className="eticket__payment">
                <span>Payment</span>
                <span className="badge badge-success">{booking.payment_status}</span>
              </div>
              <div className="eticket__qr">
                <div className="qr-placeholder">
                  <span>QR</span>
                  <small>Scan at boarding</small>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="confirmation-actions">
            <button className="btn btn-outline" onClick={handlePrint}><FaDownload /> Download Ticket</button>
            <button className="btn btn-secondary" onClick={() => navigate('/my-bookings')}><FaTicketAlt /> My Bookings</button>
            <button className="btn btn-primary" onClick={() => navigate('/')}><FaHome /> Book Another</button>
          </div>
        </div>
      </div>
    </div>
  );
}
