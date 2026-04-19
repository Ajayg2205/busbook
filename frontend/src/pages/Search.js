import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaBus, FaWifi, FaSnowflake, FaBolt, FaFilter, FaChevronDown, FaArrowRight } from 'react-icons/fa';
import API from '../utils/api';
import './Search.css';

const BUS_TYPES = ['All', 'sleeper', 'semi_sleeper', 'ac_sleeper', 'ac_seater', 'seater', 'volvo', 'luxury'];
const SORT_OPTIONS = [
  { value: 'departure_time', label: 'Departure' },
  { value: 'fare', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'duration', label: 'Duration' },
];

// ✅ Fix: use local date instead of UTC to avoid date shifting in IST
function localDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function formatTime(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
function minutesToHours(min) {
  const h = Math.floor(min / 60); const m = min % 60;
  return `${h}h ${m > 0 ? m + 'm' : ''}`;
}

const AMENITY_ICONS = { WiFi: <FaWifi />, AC: <FaSnowflake />, 'Charging Port': <FaBolt /> };

export default function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(params.get('source') || '');
  const [destination, setDestination] = useState(params.get('destination') || '');
  // ✅ Fix: append T00:00:00 to avoid UTC date shifting
  const [date, setDate] = useState(
    params.get('date') ? new Date(params.get('date') + 'T00:00:00') : new Date()
  );
  const [busType, setBusType] = useState('All');
  const [sortBy, setSortBy] = useState('departure_time');
  const [maxFare, setMaxFare] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const d = localDateStr(date);
      const res = await API.get('/buses/search/', {
        params: {
          source, destination, date: d,
          bus_type: busType === 'All' ? '' : busType,
          max_fare: maxFare, sort_by: sortBy,
        },
      });
      setTrips(res.data.results || []);
    } catch { setTrips([]); }
    setLoading(false);
  };

  useEffect(() => { fetchTrips(); }, [source, destination, date, busType, sortBy, maxFare]);

  const handleSearch = (e) => { e.preventDefault(); fetchTrips(); };

  return (
    <div className="search-page">
      <div className="search-bar-top">
        <div className="container">
          <form className="compact-search" onSubmit={handleSearch}>
            <input className="form-input compact-input" value={source}
              onChange={e => setSource(e.target.value)} placeholder="From" />
            <span className="arrow-sep"><FaArrowRight /></span>
            <input className="form-input compact-input" value={destination}
              onChange={e => setDestination(e.target.value)} placeholder="To" />
            <DatePicker selected={date} onChange={setDate} minDate={new Date()}
              dateFormat="dd MMM yyyy" className="form-input compact-input" />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="container search-layout">
        <aside className={`filters-sidebar ${showFilters ? 'filters-sidebar--open' : ''}`}>
          <div className="filters-header">
            <h3><FaFilter /> Filters</h3>
            <button className="btn btn-ghost btn-sm"
              onClick={() => { setBusType('All'); setMaxFare(''); setSortBy('departure_time'); }}>
              Reset
            </button>
          </div>
          <div className="filter-group">
            <h4>Bus Type</h4>
            <div className="filter-chips">
              {BUS_TYPES.map(t => (
                <button key={t} className={`filter-chip ${busType === t ? 'active' : ''}`}
                  onClick={() => setBusType(t)}>
                  {t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <h4>Max Price (₹)</h4>
            <input type="number" className="form-input" placeholder="e.g. 800"
              value={maxFare} onChange={e => setMaxFare(e.target.value)} />
          </div>
          <div className="filter-group">
            <h4>Sort By</h4>
            <div className="filter-chips">
              {SORT_OPTIONS.map(s => (
                <button key={s.value} className={`filter-chip ${sortBy === s.value ? 'active' : ''}`}
                  onClick={() => setSortBy(s.value)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="results-area">
          <div className="results-header">
            <div>
              <h2 className="results-title">
                {source} <FaArrowRight style={{ color: 'var(--primary)', fontSize: '0.9rem' }} /> {destination}
              </h2>
              <p className="results-meta">
                {date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                &nbsp;·&nbsp;{loading ? '...' : trips.length} buses found
              </p>
            </div>
            <button className="btn btn-outline btn-sm filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}>
              <FaFilter /> Filters
            </button>
          </div>

          {loading ? (
            <div className="loading-trips">{[1,2,3].map(i => <div key={i} className="trip-skeleton" />)}</div>
          ) : trips.length === 0 ? (
            <div className="no-results">
              <FaBus className="no-results__icon" />
              <h3>No buses found</h3>
              <p>Try changing the date or route</p>
            </div>
          ) : (
            <div className="trips-list">
              {trips.map(trip => (
                <TripCard key={trip.id} trip={trip}
                  onSelect={() => navigate(`/seat-selection/${trip.id}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TripCard({ trip, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="trip-card card">
      <div className="trip-card__main">
        <div className="trip-card__operator">
          <div className="operator-logo">{trip.bus.operator.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <div className="operator-name">{trip.bus.operator.name}</div>
            <div className="bus-type-badge">{trip.bus.bus_type.replace(/_/g, ' ')}</div>
          </div>
        </div>
        <div className="trip-card__times">
          <div className="trip-time">
            <span className="time">{formatTime(trip.departure_time)}</span>
            <span className="city">{trip.route.source}</span>
          </div>
          <div className="trip-duration">
            <span>{minutesToHours(trip.duration_minutes)}</span>
            <div className="duration-line"><div className="duration-dot" /></div>
            <span className="trip-date">{formatDate(trip.departure_time)}</span>
          </div>
          <div className="trip-time trip-time--right">
            <span className="time">{formatTime(trip.arrival_time)}</span>
            <span className="city">{trip.route.destination}</span>
          </div>
        </div>
        <div className="trip-card__info">
          <div className="seats-available">
            <span className={trip.available_seats < 5 ? 'seats-low' : 'seats-ok'}>
              {trip.available_seats} seats left
            </span>
          </div>
          <div className="trip-fare">
            <span className="fare-amount">₹{trip.fare}</span>
            <span className="fare-per">/ person</span>
          </div>
          <button className="btn btn-primary" onClick={onSelect}>Select Seats</button>
        </div>
      </div>
      <div className="trip-card__footer">
        <div className="amenity-tags">
          {(trip.bus.amenities || []).slice(0, 4).map((a, i) => (
            <span key={i} className="amenity-tag">{AMENITY_ICONS[a] || null} {a}</span>
          ))}
        </div>
        <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
          Details <FaChevronDown className={expanded ? 'rotated' : ''} />
        </button>
      </div>
      {expanded && (
        <div className="trip-card__expanded">
          <div className="expanded-grid">
            <div><strong>Bus Number:</strong> {trip.bus.bus_number}</div>
            <div><strong>Distance:</strong> {trip.route.distance_km} km</div>
            <div><strong>Total Seats:</strong> {trip.bus.total_seats}</div>
            <div><strong>Rating:</strong> ⭐ {trip.bus.operator.rating}</div>
          </div>
          <div className="boarding-points">
            <div className="bp-item"><strong>Boarding:</strong> {trip.route.source} Bus Stand</div>
            <div className="bp-item"><strong>Dropping:</strong> {trip.route.destination} Bus Stand</div>
          </div>
        </div>
      )}
    </div>
  );
}