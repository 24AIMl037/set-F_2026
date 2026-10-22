import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      login(data.user, data.token);

      if (data.user.role === "organizer") {
        navigate("/organizer");
      } else {
        navigate("/events");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Quick fill helper for exam viva demonstration
  function fillDemo(roleType) {
    if (roleType === "attendee") {
      setEmail("student@charusat.edu.in");
      setPassword("password123");
    } else {
      setEmail("organizer@charusat.edu.in");
      setPassword("admin123");
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome to EventHub</h2>
          <p>AWDF Practical Exam — Smart Event Ticket Booking System</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              required
              placeholder="e.g. student@charusat.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="demo-credentials-box">
          <h4>Viva Quick Demo Credentials</h4>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => fillDemo("attendee")}
            >
              Fill Student (Attendee)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => fillDemo("organizer")}
            >
              Fill Organizer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
