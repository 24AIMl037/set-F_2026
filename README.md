# EventHub — Smart Event Ticket Booking System
**Course:** ITUE301: Advanced Web Development Frameworks (AWDF)  
**Semester:** 5 &bull; CHARUSAT  
**Practical Exam:** Set F (20 Marks Total)

---

## 📋 Task Mapping & Score Guide (20/20 Marks)

| Task | Marks | Requirement | File Reference | Status |
|---|---|---|---|---|
| **Task 1** | **4 Marks** | React Components: `LoginPage`, `EventsPage`, `MyTicketsPage`, reusable `EventCard` with 5 props (`title`, `category`, `date`, `venue`, `ticketsAvailable`, `onBook`). Sold Out displays when tickets = 0. | `frontend/src/components/EventCard.jsx` | ✅ Completed |
| **Task 2** | **4 Marks** | Routing & State: React Router, 4 routes (`/`, `/events`, `/my-tickets`, `/organizer`), `AuthContext`, `ProtectedRoute` (missing token -> `/`, role mismatch -> `/events`), lazy-loaded `OrganizerPanel`, booking state (`selectedEvent`, `quantity`). | `frontend/src/App.jsx`<br>`frontend/src/context/AuthContext.jsx`<br>`frontend/src/ProtectedRoute.jsx` | ✅ Completed |
| **Task 3** | **4 Marks** | Express REST API: 5 endpoints, global `requestLogger` middleware, `authGuard` Bearer token verification, structured error handler, atomic updates. | `backend/server.js` | ✅ Completed |
| **Task 4** | **4 Marks** | React API Integration: `useEffect` fetching `GET /api/v1/events`, loading state, error state, title-based client search `.filter()`, booking trigger. | `frontend/src/pages/EventsPage.jsx` | ✅ Completed |
| **Task 5** | **4 Marks** | MongoDB + Mongoose Schemas: 3 models (`Attendee`, `Event`, `Ticket`), validation, references, `.populate()`, insufficient ticket validation (400), and atomic decrement. | `backend/models/Attendee.js`<br>`backend/models/Event.js`<br>`backend/models/Ticket.js` | ✅ Completed |

---

## 🚀 Quick Start Guide (Run in 2 Minutes)

### 1. Start the Backend
Open a terminal:
```bash
cd backend
npm run dev
# or: npm start
```
> **Exam Lifesaver:** The backend automatically tries `mongodb://127.0.0.1:27017/eventhub`. If local MongoDB isn't active or in a lab without MongoDB service, it automatically falls back to an embedded in-memory MongoDB and seeds test events & accounts!

### 2. Start the Frontend
Open a second terminal:
```bash
cd frontend
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🔑 Default Exam Demo Credentials

On the login page, you can either click the one-click quick demo buttons or enter manually:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Attendee (Student)** | `student@charusat.edu.in` | `password123` | Can view events, search, and book tickets (`/events`, `/my-tickets`). Cannot access `/organizer`. |
| **Organizer (Admin)** | `organizer@charusat.edu.in` | `admin123` | Full access, including the lazy-loaded command center (`/organizer`). |

---

## 🌐 API Endpoints Reference (Task 3)

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Authenticates credentials and returns JWT token & user |
| `GET` | `/api/v1/events` | Public | Retrieves all events |
| `POST` | `/api/v1/tickets` | `authGuard` (Bearer) | Books tickets, validates inventory, atomically decrements availability (returns 201 or 400) |
| `GET` | `/api/v1/tickets/my` | `authGuard` (Bearer) | Returns logged-in user's tickets with `.populate()` on attendee and event |
| `PATCH` | `/api/v1/tickets/:id/status` | `authGuard` (Bearer) | Updates ticket status (`booked`, `cancelled`, `used`) and restores availability if cancelled |

---

## 🧪 Quick Test Scenarios for Examiner / Viva

1. **Task 1 (Sold Out Card):**
   - Look at the "Cyber Security Workshop" card on the Events page.
   - It shows a red **"Sold Out"** label and the "Book Ticket" button is disabled/hidden.
2. **Task 2 (Role-Based Redirection):**
   - Log in as `student@charusat.edu.in`.
   - Manually navigate to `http://localhost:5173/organizer`.
   - Result: Automatically redirected back to `/events` (role mismatch prevention).
   - Log out and open `http://localhost:5173/events` without a token.
   - Result: Automatically redirected to `/` (missing token prevention).
3. **Task 4 (Search & Loading):**
   - Type `Hackathon` in the search bar — cards filter in real-time using client-side `.filter()`.
4. **Task 5 (Insufficient Tickets Validation):**
   - Select an event with 15 tickets left and try to book 20 tickets.
   - Result: Backend rejects with HTTP 400 `"Insufficient tickets available"` and no ticket document is created!
