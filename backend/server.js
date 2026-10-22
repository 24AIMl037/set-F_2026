const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Attendee = require("./models/Attendee");
const Event = require("./models/Event");
const Ticket = require("./models/Ticket");

const app = express();

app.use(cors());
app.use(express.json());

// Task 3: Global request logger middleware
function requestLogger(req, res, next) {
  console.log(`[${req.method}] ${req.path} [${new Date().toISOString()}]`);
  next();
}
app.use(requestLogger);

const JWT_SECRET = process.env.JWT_SECRET || "eventhub_jwt_super_secret_key_charusat_2026";

// Task 3: authGuard middleware for token verification
function authGuard(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token required"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}

// -------------------------------------------------------------
// Task 3 & 5: REST API ENDPOINTS
// -------------------------------------------------------------

// 1. POST /api/v1/auth/login
app.post("/api/v1/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const attendee = await Attendee.findOne({ email: email.toLowerCase().trim() });
    if (!attendee) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Verify password (supports bcrypt or plain text for lab ease)
    let isMatch = false;
    if (attendee.password.startsWith("$2a$") || attendee.password.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(password, attendee.password);
    } else {
      isMatch = attendee.password === password;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Sign JWT with attendeeId and role
    const token = jwt.sign(
      {
        attendeeId: attendee._id,
        email: attendee.email,
        name: attendee.name,
        role: attendee.role
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: attendee._id,
        name: attendee.name,
        email: attendee.email,
        role: attendee.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// 2. GET /api/v1/events - List all events (public)
app.get("/api/v1/events", async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    const events = await Event.find(query).sort({ date: 1 });
    res.status(200).json(events);
  } catch (err) {
    next(err);
  }
});

// Helper: POST /api/v1/events - Create event (Organizer only)
app.post("/api/v1/events", authGuard, async (req, res, next) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({ success: false, message: "Only organizers can create events" });
    }
    const { title, category, date, venue, ticketsAvailable } = req.body;
    const newEvent = await Event.create({
      title,
      category,
      date,
      venue,
      ticketsAvailable: Number(ticketsAvailable)
    });
    res.status(201).json({ success: true, event: newEvent });
  } catch (err) {
    next(err);
  }
});

// 3. POST /api/v1/tickets - Book tickets (authGuard)
app.post("/api/v1/tickets", authGuard, async (req, res, next) => {
  try {
    const { eventId, quantity } = req.body;
    const parsedQty = Number(quantity);

    // 1. Validate request
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "A valid event ID is required"
      });
    }

    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer"
      });
    }

    // 2. Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event does not exist"
      });
    }

    // 3. Check availability
    if (event.ticketsAvailable < parsedQty) {
      return res.status(400).json({
        success: false,
        message: "Insufficient tickets available"
      });
    }

    // 4. Save and atomic conditional update to prevent overselling
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, ticketsAvailable: { $gte: parsedQty } },
      { $inc: { ticketsAvailable: -parsedQty } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({
        success: false,
        message: "Insufficient tickets available"
      });
    }

    const ticket = await Ticket.create({
      attendeeId: req.user.attendeeId,
      eventId: eventId,
      quantity: parsedQty,
      bookingDate: new Date(),
      status: "booked"
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("attendeeId", "name email")
      .populate("eventId", "title date venue");

    // 5. Return result
    return res.status(201).json({
      success: true,
      message: "Ticket booked successfully",
      ticket: populatedTicket
    });
  } catch (err) {
    next(err);
  }
});

// 4. GET /api/v1/tickets/my - Show logged-in attendee's tickets (authGuard)
app.get("/api/v1/tickets/my", authGuard, async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ attendeeId: req.user.attendeeId })
      .populate("attendeeId", "name email")
      .populate("eventId", "title date venue")
      .sort({ bookingDate: -1 });

    res.status(200).json(tickets);
  } catch (err) {
    next(err);
  }
});

// 5. PATCH /api/v1/tickets/:id/status - Change ticket status (authGuard)
app.patch("/api/v1/tickets/:id/status", authGuard, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID"
      });
    }

    const validStatuses = ["booked", "cancelled", "used"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`
      });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    // Security: Only owner or organizer can update status
    if (
      ticket.attendeeId.toString() !== req.user.attendeeId.toString() &&
      req.user.role !== "organizer"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this ticket"
      });
    }

    const prevStatus = ticket.status;
    ticket.status = status;
    await ticket.save();

    // If cancelled from booked state, replenish available tickets
    if (prevStatus === "booked" && status === "cancelled") {
      await Event.findByIdAndUpdate(ticket.eventId, {
        $inc: { ticketsAvailable: ticket.quantity }
      });
    }

    const populated = await Ticket.findById(ticket._id)
      .populate("attendeeId", "name email")
      .populate("eventId", "title date venue");

    res.status(200).json({
      success: true,
      message: `Ticket status updated to ${status}`,
      ticket: populated
    });
  } catch (err) {
    next(err);
  }
});

// Task 3: Structured global error handler (registered last)
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  const statusCode = err.status || (err.name === "ValidationError" ? 400 : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// -------------------------------------------------------------
// Database Connection & Initial Seeder
// -------------------------------------------------------------
async function seedDefaultData() {
  try {
    const attendeeCount = await Attendee.countDocuments();
    if (attendeeCount === 0) {
      await Attendee.create([
        {
          name: "Ronak Patel",
          email: "student@charusat.edu.in",
          password: "password123",
          phone: "9876543210",
          role: "attendee"
        },
        {
          name: "Prof. Sharma (Organizer)",
          email: "organizer@charusat.edu.in",
          password: "admin123",
          phone: "9123456780",
          role: "organizer"
        }
      ]);
      console.log("[SEED] Created default users: student@charusat.edu.in and organizer@charusat.edu.in");
    }

    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      await Event.create([
        {
          title: "Tech Fest 2026: AI & Cloud Conclave",
          category: "Technology",
          date: new Date("2026-11-15T10:00:00.000Z"),
          venue: "CHARUSAT Auditorium, Changa",
          ticketsAvailable: 50
        },
        {
          title: "HackNovate 36-Hour Hackathon",
          category: "Coding",
          date: new Date("2026-12-05T09:00:00.000Z"),
          venue: "CSPIT Lab Complex, Anand",
          ticketsAvailable: 15
        },
        {
          title: "Cyber Security Workshop (SOLD OUT DEMO)",
          category: "Security",
          date: new Date("2026-11-20T14:00:00.000Z"),
          venue: "DEPSTAR Seminar Hall",
          ticketsAvailable: 0 // Explicitly 0 for Task 1 "Sold Out" testing!
        }
      ]);
      console.log("[SEED] Created 3 demo events (including 1 Sold Out event)");
    }
  } catch (err) {
    console.error("Seed error:", err.message);
  }
}

async function startServer() {
  const PORT = process.env.PORT || 5000;
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventhub";

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log(`[DB] Connected to MongoDB at ${MONGO_URI}`);
    await seedDefaultData();
  } catch (err) {
    console.warn(`[DB] Could not connect to ${MONGO_URI}: ${err.message}`);
    console.log("[DB] Attempting fallback to in-memory MongoDB for offline/exam mode...");
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`[DB] Connected to In-Memory MongoDB at ${uri}`);
      await seedDefaultData();
    } catch (memErr) {
      console.error("[DB] In-memory MongoDB initialization failed:", memErr.message);
      console.log("[DB] Please start local MongoDB or provide MONGO_URI in .env");
    }
  }

  app.listen(PORT, () => {
    console.log(`[SERVER] EventHub API running on http://localhost:${PORT}`);
  });
}

startServer();
