# EventHub — AWDF Practical Exam Viva Cheat Sheet (Set F)

Keep this open or memorize these 5 key sections for maximum marks during the viva examination.

---

### Task 1: React Component Architecture
- **Q: Why do we use props and reusable components like `EventCard`?**
  - **Answer:** Props (short for properties) allow a parent component (`EventsPage`) to pass dynamic data down to a child component (`EventCard`) in a unidirectional data flow. By creating a reusable `EventCard`, we avoid duplicating JSX code for every single event and keep our UI DRY (Don't Repeat Yourself).
- **Q: How is the Sold Out condition handled in `EventCard`?**
  - **Answer:** We check the prop `ticketsAvailable === 0`. If true, we render a `<span className="sold-out-label">Sold Out</span>` instead of the `<button onClick={onBook}>Book Ticket</button>`.

---

### Task 2: React Routing & State Management
- **Q: What is the purpose of `useState` vs `useContext`?**
  - **Answer:** `useState` manages local component-level state (such as `selectedEvent`, `quantity`, or search text in `EventsPage`). `useContext` provides global state sharing across the entire component tree (such as `attendee`, `token`, and `role` via `AuthContext`) without having to prop-drill through intermediate components.
- **Q: How does `ProtectedRoute` work?**
  - **Answer:** `ProtectedRoute` checks the authentication state:
    1. If `!token`, it redirects the user to the login page (`/`) via `<Navigate to="/" replace />`.
    2. If a `requiredRole` is specified (e.g. `organizer`) and `role !== requiredRole`, it redirects the user to `/events` via `<Navigate to="/events" replace />`.
- **Q: Why use `React.lazy` and `Suspense`?**
  - **Answer:** `React.lazy` enables code splitting. It delays downloading the bundle for the `OrganizerPanel` until a user actually navigates to `/organizer`. `Suspense` renders a fallback UI (`<p>Loading organizer panel...</p>`) while the chunk is being loaded over the network.

---

### Task 3: Express REST API & Middleware
- **Q: What is Express middleware?**
  - **Answer:** Middleware is a function that has access to the request object (`req`), response object (`res`), and the `next` function in the application's request-response cycle. It can execute code, modify `req`/`res`, end the cycle, or call `next()` to pass control.
- **Q: Explain `requestLogger` and `authGuard`.**
  - **Answer:** 
    - `requestLogger` is a global middleware that logs `[METHOD] /path [TIMESTAMP]` for every incoming request.
    - `authGuard` is route-level middleware that inspects `req.headers.authorization`. It extracts the Bearer token, verifies it using `jwt.verify()` with our secret key, attaches `req.user`, and rejects unauthorized requests with HTTP 401.
- **Q: Why is frontend route protection not enough for security?**
  - **Answer:** Anyone can bypass the frontend using Postman, cURL, or browser dev tools and send raw HTTP requests directly to the API. The backend must independently authenticate tokens and validate permissions on every protected endpoint.

---

### Task 4: React API Integration
- **Q: Why do we use `useEffect` for fetching?**
  - **Answer:** In React, data fetching is a side effect. `useEffect` with an empty dependency array `[]` runs once immediately after the component mounts, preventing infinite render loops.
- **Q: Explain the 3 states of network requests.**
  - **Answer:**
    1. `loading: true` — shows a loading indicator while the asynchronous `fetch()` is pending.
    2. `error: string` — captures network or HTTP errors in a `try...catch` block and alerts the user.
    3. `data` (success) — updates state with the parsed JSON array once `response.ok` is confirmed.
- **Q: How does client-side search work?**
  - **Answer:** We take the already fetched array and apply JavaScript's `.filter()` method comparing `event.title.toLowerCase().includes(search.toLowerCase())`. This delivers instant search without triggering redundant server requests.

---

### Task 5: MongoDB, Mongoose & Atomic Updates
- **Q: What is Mongoose and what is a Schema?**
  - **Answer:** Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. A Schema defines the document structure, field types (`String`, `Number`, `Date`, `ObjectId`), defaults, and validators (`required`, `min`, `enum`).
- **Q: How do references and `.populate()` work?**
  - **Answer:** In the `Ticket` schema, `attendeeId` and `eventId` store references (`ref: 'Attendee'`, `ref: 'Event'`). When querying with `.populate('attendeeId', 'name email').populate('eventId', 'title date venue')`, Mongoose automatically performs an internal lookup and replaces the raw ObjectIDs with the actual referenced documents.
- **Q: How do you prevent ticket overselling (race conditions)?**
  - **Answer:** Instead of doing a separate read and then write, we use an atomic conditional query:
    ```js
    const updated = await Event.findOneAndUpdate(
      { _id: eventId, ticketsAvailable: { $gte: quantity } },
      { $inc: { ticketsAvailable: -quantity } },
      { new: true }
    );
    ```
    If `ticketsAvailable` is less than `quantity`, the query matches 0 documents and returns null, rejecting the request with HTTP 400 before creating any ticket.
