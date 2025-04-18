import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  role: "student";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  // Start with loading true until we check authentication
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (on page refresh)
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      
      // Only set loading to false after we've checked authentication
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login Function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:9001/auth/students/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }
  
      setUser(data.data.student);
      setToken(data.data.token);
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.student));
    } catch (error) {
      console.error("Login failed:", error.message);
      throw new Error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  
  // Logout Function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};