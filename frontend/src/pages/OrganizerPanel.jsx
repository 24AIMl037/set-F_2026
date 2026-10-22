import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function OrganizerPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Technology");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [ticketsAvailable, setTicketsAvailable] = useState(50);
  const [message, setMessage] = useState(null);

  const { token, attendee } = useContext(AuthContext);

  async function loadEvents() {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/v1/events");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleCreateEvent(e) {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch("http://localhost:5000/api/v1/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          category,
          date,
          venue,
          ticketsAvailable: Number(ticketsAvailable)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create event");
      }

      setMessage({ type: "success", text: `Event "${title}" created successfully!` });
      setTitle("");
      setDate("");
      setVenue("");
      setTicketsAvailable(50);
      loadEvents();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Organizer Command Center</h2>
          <p className="text-muted">Manage events, track inventory, and publish new sessions</p>
        </div>
        <div className="user-pill">
          Role: <strong>{attendee?.role?.toUpperCase()}</strong>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="organizer-layout">
        <div className="organizer-create-card">
          <h3>Create New Event</h3>
          <form onSubmit={handleCreateEvent} className="organizer-form">
            <div className="form-group">
              <label>Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g. AI Innovation Summit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Technology">Technology</option>
                  <option value="Coding">Coding</option>
                  <option value="Security">Security</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <label>Venue</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auditorium A, CHARUSAT"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </div>

              <div className="form-group flex-1">
                <label>Total Tickets</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={ticketsAvailable}
                  onChange={(e) => setTicketsAvailable(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Publish Event
            </button>
          </form>
        </div>

        <div className="organizer-inventory-card">
          <h3>Current Event Inventory</h3>
          {loading ? (
            <p>Loading inventory...</p>
          ) : (
            <div className="inventory-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Remaining</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev._id}>
                      <td><strong>{ev.title}</strong></td>
                      <td>{ev.category}</td>
                      <td>{new Date(ev.date).toLocaleDateString()}</td>
                      <td>{ev.ticketsAvailable}</td>
                      <td>
                        {ev.ticketsAvailable === 0 ? (
                          <span className="badge badge-soldout">Sold Out</span>
                        ) : (
                          <span className="badge badge-available">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrganizerPanel;
