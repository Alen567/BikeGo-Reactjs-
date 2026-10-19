
import { useState } from 'react';
import './App.css';

const bikes = [
  { id: 'scooter', name: 'City Scooter', type: 'Scooter', rate: 500, emoji: '🛵' },
  { id: 'commuter', name: 'Street Commuter', type: 'Commuter', rate: 800, emoji: '🏍️' },
  { id: 'sports', name: 'Sport Bike', type: 'Sports', rate: 1500, emoji: '🏁' },
];

const initialForm = {
  name: '',
  email: '',
  phone: '',
  licence: '',
  bike: 'scooter',
  startDate: '',
  endDate: '',
};

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const difference = end.getTime() - start.getTime();

  if (!Number.isFinite(difference) || difference < 0) return 0;

  return Math.floor(difference / 86400000) + 1;
}

function Field({ label, name, error, children }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a href="#home" className="brand" aria-label="BikeGo home">
        <span className="brand-icon">B</span>
        <span>BikeGo<span className="brand-dot">.</span></span>
      </a>
      <span className="header-tag">YOUR RIDE, YOUR WAY</span>
    </header>
  );
}

function BikeCard({ bike, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`bike-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(bike.id)}
      aria-pressed={selected}
    >
      <span className="bike-emoji" aria-hidden="true">{bike.emoji}</span>
      <span className="bike-name">{bike.name}</span>
      <span className="bike-type">{bike.type}</span>
      <span className="bike-price">
        ₹{bike.rate.toLocaleString('en-IN')}
        <small> / day</small>
      </span>
      <span className="bike-radio" aria-hidden="true">
        {selected ? '✓' : ''}
      </span>
    </button>
  );
}

function BookingSuccess({ booking, onNewBooking }) {
  return (
    <section className="success-card" aria-live="polite">
      <div className="success-icon">✓</div>
      <p className="eyebrow">BOOKING REQUEST SUBMITTED</p>
      <h2>You're ready to ride!</h2>
      <p className="success-description">
        Thank you, {booking.name}. Your booking details are shown below.
      </p>

      <div className="reference-box">
        <span>Booking reference</span>
        <strong>{booking.reference}</strong>
      </div>

      <div className="summary-list">
        <div><span>Bike</span><strong>{booking.bike.name}</strong></div>
        <div><span>Start date</span><strong>{booking.startDate}</strong></div>
        <div><span>End date</span><strong>{booking.endDate}</strong></div>
        <div><span>Rental duration</span><strong>{booking.days} day(s)</strong></div>
        <div className="total-row">
          <span>Estimated total</span>
          <strong>₹{booking.total.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      <p className="demo-notice">
        This is a demonstration booking. No payment has been taken and
        no actual reservation has been made.
      </p>

      <button className="primary-button" onClick={onNewBooking}>
        Create another booking
      </button>
    </section>
  );
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [booking, setBooking] = useState(null);
  const [attempted, setAttempted] = useState(false);

  const selectedBike = bikes.find((bike) => bike.id === form.bike) ?? bikes[0];
  const days = calculateDays(form.startDate, form.endDate);
  const total = days * selectedBike.rate;
  const today = getLocalDateString();

  function validate(values) {
    const nextErrors = {};
    const trimmedName = values.name.trim();

    if (!trimmedName) {
      nextErrors.name = 'Please enter your full name.';
    } else if (trimmedName.length < 3) {
      nextErrors.name = 'Name must contain at least 3 characters.';
    } else if (!/^[\p{L}\p{M} .'-]+$/u.test(trimmedName)) {
      nextErrors.name = 'Name can contain letters, spaces, apostrophes and hyphens only.';
    }

    if (!values.email.trim()) {
      nextErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    const phone = values.phone.replace(/[\s()-]/g, '');
    if (!values.phone.trim()) {
      nextErrors.phone = 'Please enter your phone number.';
    } else if (!/^\+?[0-9]{10,15}$/.test(phone)) {
      nextErrors.phone = 'Enter a valid phone number with 10–15 digits.';
    }

    if (!values.licence.trim()) {
      nextErrors.licence = 'Please enter your driving licence number.';
    } else if (!/^[a-zA-Z0-9/-]{5,20}$/.test(values.licence.trim())) {
      nextErrors.licence = 'Use 5–20 letters, numbers, hyphens or slashes.';
    }

    if (!bikes.some((bike) => bike.id === values.bike)) {
      nextErrors.bike = 'Please select a valid bike.';
    }

    if (!values.startDate) {
      nextErrors.startDate = 'Please select a rental start date.';
    } else if (values.startDate < today) {
      nextErrors.startDate = 'Start date cannot be in the past.';
    }

    if (!values.endDate) {
      nextErrors.endDate = 'Please select a rental end date.';
    } else if (values.startDate && values.endDate < values.startDate) {
      nextErrors.endDate = 'End date must be on or after the start date.';
    }

    return nextErrors;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const updatedForm = { ...form, [name]: value };

    setForm(updatedForm);

    if (attempted) {
      setErrors(validate(updatedForm));
    } else if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: '' }));
    }
  }

  function handleBikeSelect(bikeId) {
    const updatedForm = { ...form, bike: bikeId };
    setForm(updatedForm);

    if (attempted) {
      setErrors(validate(updatedForm));
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setAttempted(true);

    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstInvalidField = Object.keys(validationErrors)[0];
      document.getElementById(firstInvalidField)?.focus();
      return;
    }

    const bike = bikes.find((item) => item.id === form.bike);

    setBooking({
      ...form,
      name: form.name.trim(),
      bike,
      days: calculateDays(form.startDate, form.endDate),
      total: calculateDays(form.startDate, form.endDate) * bike.rate,
      reference: `BG${Date.now().toString().slice(-8)}`,
    });
  }

  function handleNewBooking() {
    setForm(initialForm);
    setErrors({});
    setBooking(null);
    setAttempted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app-shell" id="home">
      <Header />

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">EXPLORE WITHOUT LIMITS</p>
            <h1>Find your next<br /> <span>open road.</span></h1>
            <p className="hero-description">
              Your next adventure starts here. Choose your ride,
              pick your dates, and let the journey begin.
            </p>
            <a className="hero-link" href="#booking">
              Book your bike <span>↓</span>
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-circle"></div>
            <span className="hero-bike">🏍️</span>
            <span className="art-label">RIDE MORE. WORRY LESS.</span>
          </div>
        </section>

        <section className="booking-section" id="booking">
          {booking ? (
            <BookingSuccess
              booking={booking}
              onNewBooking={handleNewBooking}
            />
          ) : (
            <>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">QUICK & EASY</p>
                  <h2>Book your ride</h2>
                </div>
                <span className="step-label">01 — YOUR DETAILS</span>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <section className="form-section">
                  <h3><span className="section-number">01</span> Personal information</h3>
                  <div className="form-grid">
                    <Field label="Full name" name="name" error={errors.name}>
                      <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Alex Johnson"
                        autoComplete="name"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                    </Field>

                    <Field label="Email address" name="email" error={errors.email}>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="alex@example.com"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                      />
                    </Field>

                    <Field label="Phone number" name="phone" error={errors.phone}>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        autoComplete="tel"
                        aria-invalid={Boolean(errors.phone)}
                      />
                    </Field>

                    <Field label="Driving licence number" name="licence" error={errors.licence}>
                      <input
                        id="licence"
                        name="licence"
                        value={form.licence}
                        onChange={handleChange}
                        placeholder="Enter licence number"
                        autoComplete="off"
                        aria-invalid={Boolean(errors.licence)}
                      />
                    </Field>
                  </div>
                </section>

                <section className="form-section">
                  <h3><span className="section-number">02</span> Choose your ride</h3>
                  <p className="section-description">Select a bike that suits your journey.</p>

                  <div className="bike-grid">
                    {bikes.map((bike) => (
                      <BikeCard
                        key={bike.id}
                        bike={bike}
                        selected={form.bike === bike.id}
                        onSelect={handleBikeSelect}
                      />
                    ))}
                  </div>

                  {errors.bike && <p className="field-error">{errors.bike}</p>}
                </section>

                <section className="form-section">
                  <h3><span className="section-number">03</span> Rental dates</h3>
                  <div className="form-grid">
                    <Field label="Start date" name="startDate" error={errors.startDate}>
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        min={today}
                        value={form.startDate}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.startDate)}
                      />
                    </Field>

                    <Field label="End date" name="endDate" error={errors.endDate}>
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        min={form.startDate || today}
                        value={form.endDate}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.endDate)}
                      />
                    </Field>
                  </div>
                </section>

                <section className="price-panel" aria-live="polite">
                  <div>
                    <span className="price-label">ESTIMATED RENTAL TOTAL</span>
                    <p className="price-total">₹{total.toLocaleString('en-IN')}</p>
                    <span className="price-note">
                      {days > 0
                        ? `${days} rental day(s) × ₹${selectedBike.rate.toLocaleString('en-IN')}`
                        : 'Select valid rental dates to calculate your total.'}
                    </span>
                  </div>
                  <div className="price-icon" aria-hidden="true">₹</div>
                </section>

                <p className="privacy-note">
                  This demo does not send your details to a server. Do not
                  enter real driving licence or other sensitive information.
                </p>

                <button type="submit" className="primary-button">
                  Confirm booking <span>→</span>
                </button>
                <p className="submit-note">
                  All fields are required. Please review your details before submitting.
                </p>
              </form>
            </>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <a href="#home" className="footer-brand">BikeGo.</a>
        <span>Ride safe. Explore more.</span>
        <span>ReactJS Mini Project</span>
      </footer>
    </div>
  );
}
