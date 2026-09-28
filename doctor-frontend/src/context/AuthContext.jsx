import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("mavizc_doctor_user");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });

    if (res.data.user.role !== "doctor") {
      throw new Error(
        "This portal is for doctors only. Please use the staff admin portal to log in."
      );
    }

    localStorage.setItem("mavizc_token", res.data.token);
    localStorage.setItem("mavizc_doctor_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem("mavizc_token");
    localStorage.removeItem("mavizc_doctor_user");
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
