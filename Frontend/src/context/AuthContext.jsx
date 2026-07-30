import { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCurrentUser() {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        try {
          const response = await axiosInstance.get("/auth/me");
          setUser(response.data.result.user);
          setToken(storedToken);
        } catch (error) {
          console.error("Failed to fetch user:", error);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    }

    fetchCurrentUser();
  }, []);

  async function login(email, password) {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    const { token: newToken, user: userData } = response.data.result;

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);

    return response.data;
  }

  // إضافة دالة تسجيل حساب جديد
  async function register(name, email, password) {
    await axiosInstance.post("/auth/register", {
      name,
      email,
      password,
    });

    return await login(email, password);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
