import { Shield, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer({ darkMode }) {
  return (
    <footer className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SafeText AI
              </span>
            </div>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              Advanced AI-powered cyberbullying and toxicity detection system to make online spaces safer.
            </p>
          </div>

          <div>
            <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm`}>
                  Home
                </a>
              </li>
              <li>
                <a href="/analyze" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm`}>
                  Analyze Text
                </a>
              </li>
              <li>
                <a href="/history" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm`}>
                  History
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Connect</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className={`mt-8 pt-8 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} text-center`}>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            © 2025 SafeText AI. Final Year Project - AI Cyberbullying & Toxicity Detection System
          </p>
        </div>
      </div>
    </footer>
  );
}
