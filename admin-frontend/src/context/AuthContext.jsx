import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("mavizc_user");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });

    if (res.data.user.role === "doctor") {
      throw new Error(
        "Doctor logins use the separate Doctor Portal, not this staff admin portal."
      );
    }

    localStorage.setItem("mavizc_token", res.data.token);
    localStorage.setItem("mavizc_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem("mavizc_token");
    localStorage.removeItem("mavizc_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
