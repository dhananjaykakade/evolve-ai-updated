
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import LoginForm from "@/components/forms/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LoginPage = () => {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-evolve-100 shadow-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-evolve-700">
                Admin Login
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
              <div className="mt-4 text-center text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-evolve-600 hover:text-evolve-700 font-medium">
                  Register
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
