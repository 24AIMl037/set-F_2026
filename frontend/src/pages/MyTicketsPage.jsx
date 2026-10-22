import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState(null);

  const { token, attendee } = useContext(AuthContext);

  async function fetchMyTickets() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:5000/api/v1/tickets/my", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Could not retrieve your booked tickets");
      }

      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMyTickets();
  }, []);

  async function handleCancelTicket(ticketId) {
    if (!window.confirm("Are you sure you want to cancel this ticket booking?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/v1/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "cancelled" })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not cancel ticket");
      }

      setActionMessage({ type: "success", text: "Ticket cancelled successfully and tickets released!" });
      fetchMyTickets();
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>My Booked Tickets</h2>
          <p className="text-muted">Review your confirmed bookings and event passes</p>
        </div>
        {attendee && (
          <div className="user-pill">
            Attendee: <strong>{attendee.name}</strong> ({attendee.email})
          </div>
        )}
      </div>

      {actionMessage && (
        <div className={`alert alert-${actionMessage.type}`}>
          {actionMessage.text}
        </div>
      )}

      {loading && (
        <div className="state-box loading-state">
          <div className="spinner"></div>
          <p>Loading your tickets...</p>
        </div>
      )}

      {error && !loading && (
        <div className="state-box error-state">
          <p>Error: {error}</p>
          <button className="btn btn-outline" onClick={fetchMyTickets}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {tickets.length === 0 ? (
            <div className="state-box empty-state">
              <p>You have not booked any tickets yet.</p>
              <a href="/events" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                Browse Events to Book
              </a>
            </div>
          ) : (
            <div className="tickets-grid">
              {tickets.map((t) => {
                const eventInfo = t.eventId || {};
                const eventDate = eventInfo.date
                  ? new Date(eventInfo.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })
                  : "N/A";
                const bookedOn = new Date(t.bookingDate).toLocaleString();

                return (
                  <div key={t._id} className={`ticket-card ticket-status-${t.status}`}>
                    <div className="ticket-header">
                      <span className="ticket-id">Ticket #{t._id.slice(-6).toUpperCase()}</span>
                      <span className={`status-badge status-${t.status}`}>
                        {t.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="ticket-body">
                      <h3 className="ticket-event-title">{eventInfo.title || "Unknown Event"}</h3>
                      <p><strong>Venue:</strong> {eventInfo.venue || "TBD"}</p>
                      <p><strong>Date & Time:</strong> {eventDate}</p>
                      <p><strong>Quantity:</strong> {t.quantity} ticket(s)</p>
                      <p className="ticket-booked-date">
                        <small>Booked on: {bookedOn}</small>
                      </p>
                    </div>

                    <div className="ticket-footer">
                      {t.status === "booked" && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancelTicket(t._id)}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyTicketsPage;
