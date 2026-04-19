import React from 'react';
import { Link } from 'react-router-dom';
import { FaBus, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="footer__logo-icon"><FaBus /></div>
              <span>Bus<span className="accent">Book</span></span>
            </div>
            <p className="footer__tagline">India's most trusted online bus booking platform. Safe, affordable, and comfortable travel for everyone.</p>
            <div className="footer__socials">
              <a href="#!" className="social-btn"><FaFacebook /></a>
              <a href="#!" className="social-btn"><FaTwitter /></a>
              <a href="#!" className="social-btn"><FaInstagram /></a>
              <a href="#!" className="social-btn"><FaLinkedin /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/search">Search Buses</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
              <li><Link to="/profile">My Profile</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          {/* Popular Routes */}
          <div className="footer__col">
            <h4>Popular Routes</h4>
            <ul>
              <li><Link to="/search?source=Chennai&destination=Bangalore">Chennai → Bangalore</Link></li>
              <li><Link to="/search?source=Mumbai&destination=Pune">Mumbai → Pune</Link></li>
              <li><Link to="/search?source=Delhi&destination=Jaipur">Delhi → Jaipur</Link></li>
              <li><Link to="/search?source=Hyderabad&destination=Vizag">Hyderabad → Vizag</Link></li>
              <li><Link to="/search?source=Madurai&destination=Coimbatore">Madurai → Coimbatore</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4>Contact Us</h4>
            <ul className="contact-list">
              <li><FaPhone /><span>+91 1800-123-4567 (Toll Free)</span></li>
              <li><FaEnvelope /><span>support@busbook.in</span></li>
              <li><FaMapMarkerAlt /><span>123, MG Road, Chennai, Tamil Nadu 600001</span></li>
            </ul>
            <div className="footer__app-btns">
              <a href="#!" className="app-btn">📱 App Store</a>
              <a href="#!" className="app-btn">🤖 Play Store</a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} BusBook. All rights reserved.</p>
          <div className="footer__bottom-links">
            <a href="#!">Privacy Policy</a>
            <a href="#!">Terms of Service</a>
            <a href="#!">Refund Policy</a>
            <a href="#!">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
