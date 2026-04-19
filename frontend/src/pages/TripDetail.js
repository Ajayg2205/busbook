import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBus, FaArrowRight, FaClock, FaMapMarkerAlt, FaStar, FaWifi, FaSnowflake, FaBolt } from 'react-icons/fa';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AMENITY_ICONS = {
  WiFi: <FaWifi />,
  AC: <FaSnowflake />,
  'Charging Port': <FaBolt />,
};

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/buses/trips/${id}/`)
      .then(r => setTrip(r.data))
      .catch(() => toast.error('Trip not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="loading-screen"><div className="spinner" /></div>
  );

  if (!trip) return (
    <div style={{ padding: '120px 20px', textAlign: 'center' }}>
      <h2>Trip not found</h2>
      <button className="btn btn-primary" onClick={() => navigate('/search')}>
        Back to Search
      </button>
    </div>
  );

  const durationMins = trip.duration_minutes;
  const hours = Math.floor(durationMins / 60);
  const mins = durationMins % 60;

  return (
    <div style={{ padding: '100px 0 60px', minHeight: '100vh' }}>
      <div className="container">
        {/* Header */}
        <div className="card" style={{ padding: 32, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, background: 'var(--secondary)',
              borderRadius: 14, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontSize: '1.5rem'
            }}>
              <FaBus />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem' }}>
                {trip.bus.operator.name}
              </h2>
              <span className="badge badge-primary">{trip.bus.bus_type.replace('_', ' ')}</span>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{trip.fare}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>per person</div>
            </div>
          </div>

          {/* Route */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: 24, background: 'var(--bg)', borderRadius: 16, marginBottom: 24
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>
                {new Date(trip.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{trip.route.source}</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 6 }}>
                <FaClock style={{ marginRight: 4 }} />{hours}h {mins}m
              </div>
              <div style={{ height: 2, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 2 }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>
                {new Date(trip.arrival_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{trip.route.destination}</div>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Date', value: new Date(trip.departure_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
              { label: 'Bus Number', value: trip.bus.bus_number },
              { label: 'Available Seats', value: trip.available_seats },
              { label: 'Distance', value: `${trip.route.distance_km} km` },
            ].map((item, i) => (
              <div key={i} style={{ padding: 16, background: 'var(--bg)', borderRadius: 12 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Amenities */}
          {trip.bus.amenities?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>Amenities</h4>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {trip.bus.amenities.map((a, i) => (
                  <span key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', background: 'rgba(255,107,53,0.08)',
                    borderRadius: 20, fontSize: '0.85rem', fontWeight: 600,
                    color: 'var(--primary)', border: '1px solid rgba(255,107,53,0.2)'
                  }}>
                    {AMENITY_ICONS[a] || null} {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Book Button */}
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => navigate(`/seat-selection/${trip.id}`)}
          >
            Select Seats & Book <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}