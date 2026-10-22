import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [attendee, setAttendee] = useState(() => {
    const saved = localStorage.getItem("eventhub_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem("eventhub_token") || null;
  });
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem("eventhub_user");
    return saved ? JSON.parse(saved).role : null;
  });

  function login(user, accessToken) {
    setAttendee(user);
    setToken(accessToken);
    setRole(user.role);
    localStorage.setItem("eventhub_user", JSON.stringify(user));
    localStorage.setItem("eventhub_token", accessToken);
  }

  function logout() {
    setAttendee(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem("eventhub_user");
    localStorage.removeItem("eventhub_token");
  }

  return (
    <AuthContext.Provider
      value={{ attendee, token, role, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
