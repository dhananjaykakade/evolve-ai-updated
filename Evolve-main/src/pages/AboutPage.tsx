
import MainLayout from "@/components/layout/MainLayout";
import { BookOpen, BrainCircuit, Lightbulb, Globe, Briefcase, Heart } from "lucide-react";

const AboutPage = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-evolve-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About EvolveAI</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              We're on a mission to revolutionize the educational experience by connecting teachers, students, and administrators through intelligent technology.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6">
                At EvolveAI, we believe that education is the foundation of progress. Our mission is to provide innovative, AI-enhanced tools that streamline educational administration, enrich teaching methodologies, and foster student engagement.
              </p>
              <p className="text-lg text-gray-700">
                We're committed to creating technology that adapts to the unique needs of each educational institution, enabling personalized learning experiences and efficient management systems.
              </p>
            </div>
            <div className="md:w-1/2">
              <div className="bg-evolve-100 p-8 rounded-lg">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <BrainCircuit className="h-12 w-12 text-evolve-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Intelligent Education</h3>
                  <p className="text-gray-700">
                    We harness the power of artificial intelligence to optimize educational processes, predict learning outcomes, and provide data-driven insights for better decision-making.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              These principles guide everything we do at EvolveAI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <Lightbulb className="h-8 w-8 text-evolve-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-700">
                We constantly explore new technologies and methodologies to improve the educational experience.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <BookOpen className="h-8 w-8 text-evolve-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Learning-Centric</h3>
              <p className="text-gray-700">
                We design our platform with the learner's needs at the center of every feature.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <Globe className="h-8 w-8 text-evolve-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accessibility</h3>
              <p className="text-gray-700">
                We believe quality education should be accessible to all, regardless of location or resources.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <Briefcase className="h-8 w-8 text-evolve-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professionalism</h3>
              <p className="text-gray-700">
                We uphold the highest standards of integrity, reliability, and excellence in everything we do.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <Heart className="h-8 w-8 text-evolve-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-700">
                We foster a collaborative ecosystem where educators and learners can connect and grow together.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <BrainCircuit className="h-8 w-8 text-evolve-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Intelligence</h3>
              <p className="text-gray-700">
                We leverage data and AI to create smarter, more personalized educational experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
            <div className="prose lg:prose-xl mx-auto text-gray-700">
              <p>
                EvolveAI was founded by a group of educators and technologists who recognized the need for better tools to manage and enhance the educational process. Frustrated by disconnected systems and inefficient workflows, they envisioned a unified platform that would seamlessly connect all aspects of educational management.
              </p>
              <p>
                Starting with a focus on administrative efficiency, the platform quickly grew to encompass teacher tools and student engagement features. Today, EvolveAI serves educational institutions worldwide, constantly evolving to meet the changing needs of modern education.
              </p>
              <p>
                Our team combines expertise in education, artificial intelligence, and user experience design to create a platform that's not just technologically advanced, but also intuitive and practical for daily use in educational settings.
              </p>
              <p>
                As we continue to grow, we remain committed to our original vision: using technology to create more connected, efficient, and effective educational experiences for everyone involved in the learning journey.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default AboutPage;
