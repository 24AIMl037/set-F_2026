import { useEffect, useState, useContext } from "react";
import EventCard from "../components/EventCard";
import { AuthContext } from "../context/AuthContext";

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Task 2: Booking form with two state values
  const [selectedEvent, setSelectedEvent] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [bookingMessage, setBookingMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token, attendee } = useContext(AuthContext);

  async function fetchEvents() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:5000/api/v1/events");

      if (!response.ok) {
        throw new Error("Could not fetch events");
      }

      const data = await response.json();
      setEvents(data);
      if (data.length > 0 && !selectedEvent) {
        // default to first bookable event if available
        const bookable = data.find((e) => e.ticketsAvailable > 0);
        if (bookable) setSelectedEvent(bookable._id);
        else setSelectedEvent(data[0]._id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  // Quick book click from EventCard
  function handleSelectFromCard(eventId) {
    setSelectedEvent(eventId);
    const bookingFormEl = document.getElementById("booking-form-section");
    if (bookingFormEl) {
      bookingFormEl.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Handle booking form submission
  async function handleBookTicket(e) {
    e.preventDefault();
    setBookingMessage(null);

    if (!selectedEvent) {
      setBookingMessage({ type: "error", text: "Please select an event." });
      return;
    }

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      setBookingMessage({ type: "error", text: "Quantity must be at least 1." });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:5000/api/v1/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: selectedEvent,
          quantity: qty
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to book tickets");
      }

      setBookingMessage({
        type: "success",
        text: `Success! Booked ${qty} ticket(s) for "${data.ticket?.eventId?.title || "event"}".`
      });

      // Refresh events to show updated ticketsAvailable count in real-time!
      fetchEvents();
    } catch (err) {
      setBookingMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Client-side search filtering by title
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Explore Events</h2>
          <p className="text-muted">Browse upcoming events, check ticket availability, and book instantly</p>
        </div>
        {attendee && (
          <div className="user-pill">
            Logged in as: <strong>{attendee.name}</strong> ({attendee.role})
          </div>
        )}
      </div>

      {/* Task 2: Booking Form Section */}
      <section id="booking-form-section" className="booking-panel">
        <div className="booking-panel-header">
          <h3>Quick Ticket Booking Form</h3>
          <span className="badge badge-info">Task 2 & 5 Requirement</span>
        </div>

        {bookingMessage && (
          <div className={`alert alert-${bookingMessage.type}`}>
            {bookingMessage.text}
          </div>
        )}

        <form onSubmit={handleBookTicket} className="booking-form-inline">
          <div className="form-group flex-2">
            <label htmlFor="event-select">Select Event</label>
            <select
              id="event-select"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              required
            >
              <option value="" disabled>-- Choose an Event --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id} disabled={ev.ticketsAvailable === 0}>
                  {ev.title} ({ev.ticketsAvailable > 0 ? `${ev.ticketsAvailable} tickets available` : "SOLD OUT"})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group flex-1">
            <label htmlFor="ticket-quantity">Quantity</label>
            <input
              id="ticket-quantity"
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="form-group btn-align">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || events.length === 0}
            >
              {isSubmitting ? "Processing..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </section>

      {/* Task 4: Search input */}
      <div className="search-bar-container">
        <input
          id="event-search"
          type="text"
          className="search-input"
          placeholder="Search events by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="search-count">
          Showing {filteredEvents.length} of {events.length} events
        </span>
      </div>

      {/* Task 4: Three states (Loading, Error, Success) */}
      {loading && (
        <div className="state-box loading-state">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      )}

      {error && !loading && (
        <div className="state-box error-state">
          <p>Error: {error}</p>
          <button className="btn btn-outline" onClick={fetchEvents}>
            Retry Fetching
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredEvents.length === 0 ? (
            <div className="state-box empty-state">
              <p>No events found matching "{search}".</p>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  title={event.title}
                  category={event.category}
                  date={event.date}
                  venue={event.venue}
                  ticketsAvailable={event.ticketsAvailable}
                  onBook={() => handleSelectFromCard(event._id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EventsPage;
