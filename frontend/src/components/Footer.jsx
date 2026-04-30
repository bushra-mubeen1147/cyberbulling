import { Shield, Github, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer({ darkMode }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SafeText AI
              </span>
            </Link>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mb-4 leading-relaxed`}>
              Advanced AI-powered cyberbullying and toxicity detection system to make online spaces safer for everyone.
            </p>
            <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <Heart className="w-3 h-3 text-red-500" />
              <span>Making the internet safer</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm flex items-center group`}>
                  <span className="w-1 h-1 bg-blue-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm flex items-center group`}>
                  <span className="w-1 h-1 bg-blue-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm flex items-center group`}>
                  <span className="w-1 h-1 bg-blue-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm flex items-center group`}>
                  <span className="w-1 h-1 bg-blue-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/analyze" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm flex items-center group`}>
                  <span className="w-1 h-1 bg-blue-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Try Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm flex items-center group`}>
                  <span className="w-1 h-1 bg-blue-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm flex items-center group`}>
                  <span className="w-1 h-1 bg-blue-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm flex items-center group`}>
                  <span className="w-1 h-1 bg-blue-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm flex items-center group`}>
                  <span className="w-1 h-1 bg-blue-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm flex items-center group`}>
                  <span className="w-1 h-1 bg-blue-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Get In Touch
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:support@safetextai.com" 
                  className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm flex items-center gap-2`}
                >
                  <Mail className="w-4 h-4" />
                  <span>support@safetextai.com</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+1234567890" 
                  className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm flex items-center gap-2`}
                >
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </a>
              </li>
              <li>
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm flex items-start gap-2`}>
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>San Francisco, CA 94103</span>
                </div>
              </li>
            </ul>

            {/* Social Links */}
            <div className="mt-6">
              <h4 className={`font-semibold mb-3 text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Follow Us
              </h4>
              <div className="flex gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} p-2 rounded-lg transition-all transform hover:scale-110`}
                  aria-label="GitHub"
                >
                  <Github className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} p-2 rounded-lg transition-all transform hover:scale-110`}
                  aria-label="Twitter"
                >
                  <Twitter className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} p-2 rounded-lg transition-all transform hover:scale-110`}
                  aria-label="LinkedIn"
                >
                  <Linkedin className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} p-2 rounded-lg transition-all transform hover:scale-110`}
                  aria-label="Instagram"
                >
                  <Instagram className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`mt-10 pt-8 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm text-center md:text-left`}>
              © {currentYear} SafeText AI. All rights reserved. | Final Year Project - AI Cyberbullying Detection
            </p>
            <div className="flex items-center gap-4 text-sm">
              <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                Privacy
              </a>
              <span className={darkMode ? 'text-gray-700' : 'text-gray-300'}>|</span>
              <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                Terms
              </a>
              <span className={darkMode ? 'text-gray-700' : 'text-gray-300'}>|</span>
              <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
