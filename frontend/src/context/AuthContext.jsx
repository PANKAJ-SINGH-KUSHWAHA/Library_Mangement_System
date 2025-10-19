import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

function _extractStoredUser(payload) {
  // payload may be { token, role } or { token, roles: [], user: {...} } or user object itself
  const obj = payload?.user || payload;
  const role = payload?.role || (payload?.roles && payload.roles[0]) || obj?.role || (obj?.roles && obj.roles[0]);
  const firstName = obj?.firstName || obj?.givenName || obj?.name || obj?.email?.split('@')[0];
  return { ...obj, role, firstName };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user and token from localStorage on page refresh
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = (payload) => {
    // payload may contain token and nested user info
    if (!payload) return;

    // persist token if present
    if (payload.token) {
      localStorage.setItem("token", payload.token);
    }

    const storedUser = _extractStoredUser(payload);
    setUser(storedUser);
    localStorage.setItem("user", JSON.stringify(storedUser));
    // also store role key for older code that expects it
    if (storedUser.role) localStorage.setItem("role", storedUser.role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  const isAuthenticated = () => !!localStorage.getItem("token") || !!user;

  const role = user?.role || localStorage.getItem("role") || null;
  const firstName = user?.firstName || null;

  return (
    <AuthContext.Provider value={{ user, role, firstName, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
