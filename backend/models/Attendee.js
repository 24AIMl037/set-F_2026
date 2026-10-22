const mongoose = require("mongoose");

const attendeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  phone: {
    type: String
  },
  role: {
    type: String,
    enum: ["attendee", "organizer"],
    default: "attendee"
  }
}, { timestamps: true });

module.exports = mongoose.model("Attendee", attendeeSchema);
