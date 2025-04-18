
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import RegisterForm from "@/components/forms/RegisterForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const RegisterPage = () => {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-evolve-100 shadow-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-evolve-700">
                Admin Registration
              </CardTitle>
              <CardDescription className="text-center">
                Create an account for your institute
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm />
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-evolve-600 hover:text-evolve-700 font-medium">
                  Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;
