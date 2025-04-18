
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BarChart3 } from "lucide-react";

const LandingPage = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-evolve-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Transform Education with <span className="text-evolve-600">EvolveAI</span>
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                An intelligent educational platform designed to connect teachers, students, and administrators for an enhanced learning experience.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-evolve-600 hover:bg-evolve-700">
                    Get Started
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 mt-12 lg:mt-0">
              <div className="relative">
                <div className="w-full h-64 md:h-80 lg:h-96 bg-evolve-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-evolve-400/40 to-evolve-600/40 flex items-center justify-center text-white p-8">
                    <div className="text-center">
                      <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                        Your Education Ecosystem
                      </h3>
                      <p className="text-base md:text-lg">
                        Seamlessly connect all your educational resources in one place
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Three Portals, One Platform
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              EvolveAI provides specialized portals for administrators, teachers, and students.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Admin Portal */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="mb-4 p-2 bg-admin-light/10 rounded-full w-12 h-12 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-admin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Portal</h3>
              <p className="text-gray-700 mb-4">
                Comprehensive tools for institution management, including teacher and student oversight.
              </p>
              <Link to="/login">
                <Button variant="outline" className="border-admin text-admin hover:bg-admin hover:text-white">
                  Admin Login
                </Button>
              </Link>
            </div>

            {/* Teacher Portal */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="mb-4 p-2 bg-teacher-light/10 rounded-full w-12 h-12 flex items-center justify-center">
                <Users className="h-6 w-6 text-teacher" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Teacher Portal</h3>
              <p className="text-gray-700 mb-4">
                Tools for curriculum management, student assessment, and educational content delivery.
              </p>
              <Button variant="outline" className="border-teacher text-teacher hover:bg-teacher hover:text-white" onClick={() => {
                window.open("http://localhost:8080/login")
              }} >
                Teacher Login
              </Button>
            </div>

            {/* Student Portal */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="mb-4 p-2 bg-student-light/10 rounded-full w-12 h-12 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-student" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Portal</h3>
              <p className="text-gray-700 mb-4">
                Access to courses, assignments, progress tracking, and interactive learning materials.
              </p>
              <Button variant="outline" className="border-student text-student hover:bg-student hover:text-white" 
              onClick={() => {
                window.open("http://localhost:8081/login")
              }
              } >
                Student Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-evolve-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to evolve your institution?
              </h2>
              <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                Join EvolveAI today and transform the way your institution manages education.
              </p>
              <Link to="/register">
                <Button size="lg" className="bg-evolve-600 hover:bg-evolve-700">
                  Register Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
