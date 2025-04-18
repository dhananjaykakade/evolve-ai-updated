
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-evolve-700 mb-4">EvolveAI</h3>
            <p className="text-gray-600">
              Transforming education through intelligent solutions.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-evolve-700 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-evolve-600">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-evolve-600">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-evolve-600">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-evolve-700 mb-4">Portals</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-admin hover:text-admin-light">
                  Admin Portal
                </Link>
              </li>
              <li>
                <span className="text-teacher hover:text-teacher-light cursor-not-allowed">
                  Teacher Portal
                </span>
              </li>
              <li>
                <span className="text-student hover:text-student-light cursor-not-allowed">
                  Student Portal
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} EvolveAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
