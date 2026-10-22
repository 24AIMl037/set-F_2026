const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true
  },
  category: {
    type: String,
    default: "General"
  },
  date: {
    type: Date,
    required: [true, "Date is required"]
  },
  venue: {
    type: String,
    required: [true, "Venue is required"]
  },
  ticketsAvailable: {
    type: Number,
    min: [0, "Tickets available cannot be negative"],
    default: 0,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
