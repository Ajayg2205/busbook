import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBus, FaBars, FaTimes, FaUser, FaTicketAlt, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled || !isHome ? 'navbar--solid' : 'navbar--transparent'} ${menuOpen ? 'navbar--open' : ''}`}>
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon"><FaBus /></div>
          <span className="navbar__logo-text">Bus<span>Book</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar__links">
          <Link to="/" className={`navbar__link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/search" className={`navbar__link ${location.pathname === '/search' ? 'active' : ''}`}>Search Buses</Link>
          <a href="#features" className="navbar__link">Features</a>
          <a href="#popular-routes" className="navbar__link">Popular Routes</a>
        </div>

        {/* Right actions */}
        <div className="navbar__actions">
          {user ? (
            <div className="navbar__user" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="navbar__avatar">
                {user.first_name?.[0] || user.email[0].toUpperCase()}
              </div>
              <span className="navbar__username">{user.first_name || 'Account'}</span>
              <FaChevronDown className={`navbar__chevron ${dropdownOpen ? 'open' : ''}`} />
              {dropdownOpen && (
                <div className="navbar__dropdown">
                  <Link to="/profile" className="dropdown__item"><FaUser /> My Profile</Link>
                  <Link to="/my-bookings" className="dropdown__item"><FaTicketAlt /> My Bookings</Link>
                  <div className="dropdown__divider" />
                  <button onClick={handleLogout} className="dropdown__item dropdown__item--danger">
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          <Link to="/" className="mobile-link">Home</Link>
          <Link to="/search" className="mobile-link">Search Buses</Link>
          {user ? (
            <>
              <Link to="/my-bookings" className="mobile-link">My Bookings</Link>
              <Link to="/profile" className="mobile-link">Profile</Link>
              <button onClick={handleLogout} className="mobile-link mobile-link--danger">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link">Login</Link>
              <Link to="/register" className="mobile-link mobile-link--primary">Sign Up Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
