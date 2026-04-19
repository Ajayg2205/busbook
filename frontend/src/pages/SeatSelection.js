import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBus, FaArrowRight } from 'react-icons/fa';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './SeatSelection.css';

export default function SeatSelection() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [trip, setTrip] = useState(null);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seatsRes, tripRes] = await Promise.all([
          API.get(`/buses/trips/${tripId}/seats/`),
          API.get(`/buses/trips/${tripId}/`),
        ]);
        setSeats(seatsRes.data);
        setTrip(tripRes.data);
      } catch { toast.error('Failed to load seat data'); }
      setLoading(false);
    };
    fetchData();
  }, [tripId]);

  const toggleSeat = (seat) => {
    if (seat.is_booked) return;
    setSelected(prev =>
      prev.find(s => s.id === seat.id)
        ? prev.filter(s => s.id !== seat.id)
        : prev.length < 6 ? [...prev, seat] : (toast.error('Max 6 seats per booking'), prev)
    );
  };

  const proceed = () => {
    if (selected.length === 0) { toast.error('Please select at least one seat'); return; }
    navigate('/passenger-details', { state: { trip, selectedSeats: selected } });
  };

  // Build seat grid rows
  const seatMap = {};
  seats.forEach(s => {
    const row = s.seat_number.replace(/[A-Z]/g, '');
    if (!seatMap[row]) seatMap[row] = [];
    seatMap[row].push(s);
  });

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="seat-page">
      <div className="container">
        <div className="seat-page__header">
          <h1 className="section-title" style={{ marginBottom: 4 }}>Select Your Seats</h1>
          {trip && (
            <p className="route-info">
              <FaBus /> {trip.route.source} <FaArrowRight /> {trip.route.destination} &nbsp;·&nbsp;
              ₹{trip.fare}/seat
            </p>
          )}
        </div>

        <div className="seat-layout">
          {/* Bus Diagram */}
          <div className="bus-diagram card">
            <div className="bus-front">
              <div className="steering">🚌</div>
              <span>Front</span>
            </div>
            <div className="seat-grid">
              {Object.entries(seatMap).map(([row, rowSeats]) => (
                <div key={row} className="seat-row">
                  {rowSeats.map(seat => {
                    const isSelected = selected.find(s => s.id === seat.id);
                    return (
                      <button
                        key={seat.id}
                        className={`seat-btn ${seat.is_booked ? 'seat--booked' : isSelected ? 'seat--selected' : 'seat--available'}`}
                        onClick={() => toggleSeat(seat)}
                        disabled={seat.is_booked}
                        title={`Seat ${seat.seat_number} - ${seat.seat_type}`}
                      >
                        <span className="seat-number">{seat.seat_number}</span>
                      </button>
                    );
                  })}
                  {/* Aisle gap */}
                  {rowSeats.length === 2 && <div className="aisle" />}
                </div>
              ))}
            </div>
            <div className="bus-back"><span>Rear</span></div>

            {/* Legend */}
            <div className="seat-legend">
              <div className="legend-item"><div className="legend-box legend--available" /> Available</div>
              <div className="legend-item"><div className="legend-box legend--selected" /> Selected</div>
              <div className="legend-item"><div className="legend-box legend--booked" /> Booked</div>
            </div>
          </div>

          {/* Summary */}
          <div className="seat-summary card">
            <h3>Booking Summary</h3>
            {selected.length === 0 ? (
              <p className="no-seats-msg">No seats selected yet</p>
            ) : (
              <>
                <div className="selected-seats">
                  {selected.map(s => (
                    <div key={s.id} className="selected-seat-chip">
                      <span>Seat {s.seat_number}</span>
                      <span className="chip-type">{s.seat_type}</span>
                      <button onClick={() => toggleSeat(s)} className="chip-remove">×</button>
                    </div>
                  ))}
                </div>
                <div className="fare-breakdown">
                  <div className="fare-row">
                    <span>Base Fare ({selected.length} × ₹{trip?.fare})</span>
                    <span>₹{(selected.length * parseFloat(trip?.fare || 0)).toFixed(0)}</span>
                  </div>
                  <div className="fare-row">
                    <span>Convenience Fee (2%)</span>
                    <span>₹{(selected.length * parseFloat(trip?.fare || 0) * 0.02).toFixed(0)}</span>
                  </div>
                  <div className="fare-row fare-total">
                    <strong>Total</strong>
                    <strong>₹{(selected.length * parseFloat(trip?.fare || 0) * 1.02).toFixed(0)}</strong>
                  </div>
                </div>
              </>
            )}
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={proceed}>
              Continue <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
