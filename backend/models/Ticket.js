const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  attendeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attendee",
    required: [true, "Attendee ID is required"]
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "Event ID is required"]
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"]
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["booked", "cancelled", "used"],
    default: "booked"
  }
}, { timestamps: true });

module.exports = mongoose.model("Ticket", ticketSchema);
