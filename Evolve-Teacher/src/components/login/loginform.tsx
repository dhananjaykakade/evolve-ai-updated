import { useState,useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading,user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);


  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();
    try{
      
    await login(email, password);
    navigate("/");
    } catch (error) {
      console.error("Login failed", error);
    } 
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-6">
      <Card className="w-full max-w-md p-8 shadow-lg bg-white rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Welcome to Evolve
          </CardTitle>
          <p className="text-gray-500 text-sm">
            Empowering Educators with AI-Powered Assistance
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
