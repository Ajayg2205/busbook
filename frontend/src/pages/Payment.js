import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCreditCard, FaMoneyBill, FaMobileAlt, FaLock, FaArrowLeft, FaTag } from 'react-icons/fa';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './Payment.css';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / QR', icon: <FaMobileAlt />, desc: 'PhonePe, GPay, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: <FaCreditCard />, desc: 'Visa, Mastercard, Rupay' },
  { id: 'netbanking', label: 'Net Banking', icon: <FaMoneyBill />, desc: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: <FaMobileAlt />, desc: 'Paytm, Amazon Pay' },
];

const COUPONS = ['FIRST50', 'BUSBOOK20', 'SAVE100'];

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { trip, selectedSeats, passengers } = state || {};

  const [method, setMethod] = useState('upi');
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!trip) { navigate('/search'); return null; }

  const baseFare = selectedSeats.length * parseFloat(trip.fare);
  const convFee = parseFloat((baseFare * 0.02).toFixed(2));
  const total = baseFare + convFee - discount;

  const applyCoupon = () => {
    if (!COUPONS.includes(coupon.toUpperCase())) { toast.error('Invalid coupon code'); return; }
    let disc = 0;
    if (coupon.toUpperCase() === 'FIRST50') disc = Math.min(50, baseFare * 0.1);
    else if (coupon.toUpperCase() === 'BUSBOOK20') disc = baseFare * 0.2;
    else if (coupon.toUpperCase() === 'SAVE100') disc = Math.min(100, baseFare);
    setDiscount(parseFloat(disc.toFixed(2)));
    setAppliedCoupon(coupon.toUpperCase());
    toast.success(`Coupon applied! You saved ₹${disc.toFixed(0)}`);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Step 1 — Create Razorpay order from backend
      const orderRes = await API.post('/bookings/razorpay/create-order/', {
        amount: total.toFixed(2),
      });
      const { order_id, amount, key } = orderRes.data;

      // Step 2 — Open Razorpay checkout popup
      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'BusBook',
        description: `${trip.route.source} → ${trip.route.destination}`,
        order_id,
        handler: async (response) => {
          try {
            // Step 3 — Verify payment with backend
            const verifyRes = await API.post('/bookings/razorpay/verify/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.verified) {
              // Step 4 — Create booking
              const bookingRes = await API.post('/bookings/create/', {
                trip_id: trip.id,
                seat_ids: selectedSeats.map(s => s.id),
                passengers: passengers.map(p => ({
                  name: p.name,
                  age: parseInt(p.age),
                  gender: p.gender,
                  id_type: p.id_type || '',
                  id_number: p.id_number || '',
                })),
                payment_method: method,
                coupon_code: appliedCoupon,
                razorpay_payment_id: response.razorpay_payment_id,
              });
              toast.success('Booking confirmed! 🎉');
              navigate(`/booking-confirmation/${bookingRes.data.id}`, {
                state: { booking: bookingRes.data },
              });
            } else {
              toast.error('Payment verification failed!');
            }
          } catch {
            toast.error('Booking failed after payment. Contact support.');
          }
        },
        prefill: {
          name: passengers[0]?.name || '',
          email: '',
          contact: '',
        },
        theme: { color: '#f97316' },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled.');
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="container">
        <div className="booking-progress">
          <div className="progress-step progress-step--done">1. Seats</div>
          <div className="progress-line progress-line--done" />
          <div className="progress-step progress-step--done">2. Passengers</div>
          <div className="progress-line progress-line--done" />
          <div className="progress-step progress-step--active">3. Payment</div>
          <div className="progress-line" />
          <div className="progress-step">4. Confirm</div>
        </div>

        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 32 }}>Secure Payment</h2>

        <div className="payment-layout">
          <div className="payment-left">
            <div className="card payment-methods-card">
              <h3><FaLock /> Choose Payment Method</h3>
              <div className="payment-methods">
                {PAYMENT_METHODS.map(pm => (
                  <button key={pm.id} className={`payment-method ${method === pm.id ? 'active' : ''}`}
                    onClick={() => setMethod(pm.id)}>
                    <div className="pm-icon">{pm.icon}</div>
                    <div className="pm-info">
                      <span className="pm-label">{pm.label}</span>
                      <span className="pm-desc">{pm.desc}</span>
                    </div>
                    <div className={`pm-radio ${method === pm.id ? 'checked' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="card coupon-card">
              <h3><FaTag /> Apply Coupon</h3>
              <div className="coupon-input-row">
                <input className="form-input" placeholder="Enter coupon code"
                  value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} />
                <button className="btn btn-outline" onClick={applyCoupon}>Apply</button>
              </div>
              {appliedCoupon && (
                <div className="coupon-applied">
                  ✅ <strong>{appliedCoupon}</strong> applied — You saved ₹{discount.toFixed(0)}!
                </div>
              )}
              <div className="coupon-hints"><span>Try: FIRST50 · BUSBOOK20 · SAVE100</span></div>
            </div>
          </div>

          <div className="order-summary card">
            <h3>Order Summary</h3>
            <div className="order-route">
              <strong>{trip.route.source}</strong> → <strong>{trip.route.destination}</strong>
            </div>
            <div className="order-date">
              {new Date(trip.departure_time).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              &nbsp;·&nbsp;
              {new Date(trip.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
            <div className="order-seats">
              <span>Seats: {selectedSeats.map(s => s.seat_number).join(', ')}</span>
            </div>
            <div className="order-passengers">
              {passengers.map((p, i) => (
                <div key={i} className="order-passenger">
                  <span>{p.name || `Passenger ${i + 1}`}</span>
                  <span className="gender-badge">{p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</span>
                </div>
              ))}
            </div>
            <div className="order-fare">
              <div className="fare-row"><span>Base Fare ({selectedSeats.length} seats)</span><span>₹{baseFare.toFixed(0)}</span></div>
              <div className="fare-row"><span>Convenience Fee</span><span>₹{convFee.toFixed(0)}</span></div>
              {discount > 0 && <div className="fare-row fare-discount"><span>Discount ({appliedCoupon})</span><span>−₹{discount.toFixed(0)}</span></div>}
              <div className="fare-row fare-total"><strong>Total Payable</strong><strong>₹{total.toFixed(0)}</strong></div>
            </div>
            <div className="secure-note"><FaLock /> 100% Secure · Instant Confirmation</div>
            <button className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              onClick={handlePayment} disabled={loading}>
              {loading ? 'Processing...' : `Pay ₹${total.toFixed(0)}`}
            </button>
            <button className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={() => navigate(-1)} disabled={loading}>
              <FaArrowLeft /> Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}