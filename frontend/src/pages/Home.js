import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaBus, FaExchangeAlt, FaCalendarAlt, FaSearch, FaWifi, FaSnowflake, FaBolt, FaShieldAlt, FaHeadset, FaTicketAlt, FaMapMarkerAlt, FaClock, FaUsers, FaStar, FaArrowRight } from 'react-icons/fa';
import API from '../utils/api';
import './Home.css';

// ✅ Fix: use local date to avoid UTC shifting in IST timezone
function localDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

const FEATURES = [
  { icon: <FaShieldAlt />, title: 'Secure Payments', desc: '256-bit SSL encryption for every transaction. Your data is always safe.' },
  { icon: <FaBolt />, title: 'Instant Confirmation', desc: 'Get your e-ticket in seconds. No waiting, no hassle.' },
  { icon: <FaHeadset />, title: '24/7 Support', desc: "Round-the-clock customer service. We're always here for you." },
  { icon: <FaTicketAlt />, title: 'Easy Cancellation', desc: 'Hassle-free cancellations with full refund tracking.' },
  { icon: <FaWifi />, title: 'Live Bus Tracking', desc: 'Track your bus in real-time and stay updated.' },
  { icon: <FaUsers />, title: 'Group Booking', desc: 'Book for groups with special discounts for 10+ passengers.' },
];

const STATS = [
  { value: '2M+', label: 'Happy Passengers' },
  { value: '500+', label: 'Bus Operators' },
  { value: '1000+', label: 'Routes Covered' },
  { value: '50+', label: 'Cities Connected' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', city: 'Chennai', rating: 5, text: 'Booked Chennai to Bangalore in under 2 minutes. Smooth experience and great seat selection!' },
  { name: 'Rahul M.', city: 'Mumbai', rating: 5, text: 'Finally a bus booking app that works perfectly. Razorpay payment was instant and secure.' },
  { name: 'Ananya K.', city: 'Hyderabad', rating: 4, text: 'Love the seat selection UI. Could see exactly which seats were available. Will use again!' },
];

const FALLBACK_ROUTES = [
  { source: 'Chennai', destination: 'Bangalore', distance_km: 350, estimated_duration: '06:00:00' },
  { source: 'Mumbai', destination: 'Pune', distance_km: 150, estimated_duration: '03:00:00' },
  { source: 'Delhi', destination: 'Jaipur', distance_km: 280, estimated_duration: '05:00:00' },
  { source: 'Hyderabad', destination: 'Vizag', distance_km: 620, estimated_duration: '09:00:00' },
  { source: 'Madurai', destination: 'Coimbatore', distance_km: 210, estimated_duration: '04:00:00' },
  { source: 'Kolkata', destination: 'Bhubaneswar', distance_km: 440, estimated_duration: '07:00:00' },
];

function durationLabel(dur) {
  if (!dur) return '';
  const parts = dur.split(':');
  const h = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function Home() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date());
  const [cities, setCities] = useState([]);
  const [popularRoutes, setPopularRoutes] = useState(FALLBACK_ROUTES);
  const [fromSugg, setFromSugg] = useState([]);
  const [toSugg, setToSugg] = useState([]);

  useEffect(() => {
    API.get('/buses/cities/').then(r => setCities(r.data.cities || [])).catch(() => {});
    API.get('/buses/routes/popular/').then(r => {
      const results = r.data.results || r.data;
      if (results && results.length > 0) setPopularRoutes(results.slice(0, 6));
    }).catch(() => {});
  }, []);

  const filterCities = (val) => cities.filter(c => c.toLowerCase().includes(val.toLowerCase())).slice(0, 6);
  const swap = () => { setFrom(to); setTo(from); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!from || !to) return;
    const d = localDateStr(date);
    navigate(`/search?source=${from}&destination=${to}&date=${d}`);
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__blob hero__blob--1" />
          <div className="hero__blob hero__blob--2" />
          <div className="hero__dots" />
        </div>
        <div className="hero__content container">
          <div className="hero__text animate-fadeInUp">
            <div className="hero__badge"><FaBus /> India's #1 Bus Booking Platform</div>
            <h1 className="hero__title">
              Travel Smart,<br />
              <span className="hero__title-accent">Travel Comfortable</span>
            </h1>
            <p className="hero__subtitle">
              Book bus tickets to 1000+ destinations across India.<br />
              Best prices, instant confirmation, hassle-free travel.
            </p>
            <div className="hero__stats">
              {STATS.map((s, i) => (
                <div key={i} className="hero__stat">
                  <span className="hero__stat-value">{s.value}</span>
                  <span className="hero__stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="search-box card animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
            <h2 className="search-box__title">Find Your Bus</h2>
            <form onSubmit={handleSearch}>
              <div className="search-row">
                <div className="search-field" style={{ position: 'relative' }}>
                  <label><FaMapMarkerAlt /> From</label>
                  <input className="form-input" placeholder="Departure city" value={from}
                    onChange={e => { setFrom(e.target.value); setFromSugg(filterCities(e.target.value)); }}
                    onBlur={() => setTimeout(() => setFromSugg([]), 200)} required />
                  {fromSugg.length > 0 && (
                    <ul className="suggestions">
                      {fromSugg.map(c => <li key={c} onMouseDown={() => { setFrom(c); setFromSugg([]); }}>{c}</li>)}
                    </ul>
                  )}
                </div>
                <button type="button" className="swap-btn" onClick={swap}><FaExchangeAlt /></button>
                <div className="search-field" style={{ position: 'relative' }}>
                  <label><FaMapMarkerAlt /> To</label>
                  <input className="form-input" placeholder="Destination city" value={to}
                    onChange={e => { setTo(e.target.value); setToSugg(filterCities(e.target.value)); }}
                    onBlur={() => setTimeout(() => setToSugg([]), 200)} required />
                  {toSugg.length > 0 && (
                    <ul className="suggestions">
                      {toSugg.map(c => <li key={c} onMouseDown={() => { setTo(c); setToSugg([]); }}>{c}</li>)}
                    </ul>
                  )}
                </div>
                <div className="search-field">
                  <label><FaCalendarAlt /> Date</label>
                  <DatePicker selected={date} onChange={setDate} minDate={new Date()}
                    dateFormat="dd MMM yyyy" className="form-input" placeholderText="Select date" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg search-submit">
                <FaSearch /> Search Buses
              </button>
            </form>
            <div className="search-tags">
              {['Chennai → Bangalore', 'Mumbai → Pune', 'Delhi → Jaipur'].map(r => (
                <button key={r} type="button" className="search-tag"
                  onClick={() => { setFrom(r.split(' → ')[0]); setTo(r.split(' → ')[1]); }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="popular-routes">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Top Routes</span>
            <h2 className="section-title">Popular Destinations</h2>
            <p className="section-subtitle">Most booked routes by millions of travellers every day</p>
          </div>
          <div className="routes-grid">
            {popularRoutes.map((r, i) => (
              <div key={i} className="route-card card"
                onClick={() => navigate(`/search?source=${r.source}&destination=${r.destination}&date=${localDateStr(new Date())}`)}>
                <div className="route-card__map">
                  <div className="route-card__city route-card__city--from">
                    <span className="dot" /><strong>{r.source}</strong>
                  </div>
                  <div className="route-card__line">
                    <span className="route-card__duration"><FaClock /> {durationLabel(r.estimated_duration)}</span>
                  </div>
                  <div className="route-card__city route-card__city--to">
                    <span className="dot dot--to" /><strong>{r.destination}</strong>
                  </div>
                </div>
                <div className="route-card__footer">
                  <div>
                    <span className="route-card__price">{r.distance_km} km</span>
                    <span className="route-card__label"> distance</span>
                  </div>
                  <span className="route-card__cta">Book Now <FaArrowRight /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why BusBook</span>
            <h2 className="section-title" style={{ color: 'white' }}>Everything You Need</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Built for modern travellers who value time, comfort and reliability
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Reviews</span>
            <h2 className="section-title">What Travellers Say</h2>
            <p className="section-subtitle">Trusted by millions of passengers across India</p>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card card">
                <div className="testimonial-stars">
                  {[...Array(t.rating)].map((_, j) => <FaStar key={j} />)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-city">{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="amenities-banner card">
            <div className="amenities-banner__text">
              <h3>Premium buses with world-class amenities</h3>
              <p>Select your comfort level and enjoy the journey</p>
            </div>
            <div className="amenities-list">
              {[
                { icon: <FaWifi />, label: 'Free WiFi' },
                { icon: <FaSnowflake />, label: 'AC Cooling' },
                { icon: <FaBolt />, label: 'USB Charging' },
                { icon: <FaShieldAlt />, label: 'CCTV Safety' },
              ].map((a, i) => (
                <div key={i} className="amenity-chip">{a.icon} {a.label}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-card__content">
              <h2>Ready to Book Your Next Journey?</h2>
              <p>Join 2 million+ travellers who trust BusBook for safe, affordable travel.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={() => navigate('/search')} className="btn btn-primary btn-lg">
                  Book Now <FaBus />
                </button>
                <button onClick={() => navigate('/register')} className="btn btn-outline btn-lg"
                  style={{ borderColor: 'white', color: 'white' }}>
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}