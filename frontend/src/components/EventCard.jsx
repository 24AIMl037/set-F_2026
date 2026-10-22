import React from "react";

function EventCard({
  title,
  category,
  date,
  venue,
  ticketsAvailable,
  onBook
}) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : "TBD";

  const isSoldOut = ticketsAvailable === 0;

  return (
    <div className={`event-card ${isSoldOut ? "sold-out" : ""}`}>
      <div className="event-card-header">
        <span className="event-category">{category || "General"}</span>
        {isSoldOut ? (
          <span className="badge badge-soldout">Sold Out</span>
        ) : (
          <span className="badge badge-available">{ticketsAvailable} left</span>
        )}
      </div>

      <h3 className="event-title">{title}</h3>

      <div className="event-details">
        <p className="event-detail-item">
          <strong>Date:</strong> {formattedDate}
        </p>
        <p className="event-detail-item">
          <strong>Venue:</strong> {venue}
        </p>
        <p className="event-detail-item">
          <strong>Tickets left:</strong> {ticketsAvailable}
        </p>
      </div>

      <div className="event-card-footer">
        {isSoldOut ? (
          <span className="sold-out-label">Sold Out</span>
        ) : (
          <button className="btn btn-primary" onClick={onBook}>
            Book Ticket
          </button>
        )}
      </div>
    </div>
  );
}

export default EventCard;
