import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Login from './pages/Login';
import Signup from './pages/Signup';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Contact from './pages/Contact.jsx';
import Admin from './pages/Admin.jsx';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className={darkMode ? 'dark' : ''}>
        <Navbar 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
          user={user}
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} />} />
          <Route path="/about" element={<About darkMode={darkMode} />} />
          <Route path="/services" element={<Services darkMode={darkMode} />} />
          <Route path="/contact" element={<Contact darkMode={darkMode} />} />
          <Route path="/dashboard" element={<Dashboard darkMode={darkMode} />}> 
            <Route path="analyze" element={<Analyze darkMode={darkMode} />} />
            <Route path="history" element={<History darkMode={darkMode} />} />
            <Route path="profile" element={<Profile darkMode={darkMode} />} />
          </Route>
          <Route path="/admin" element={<Admin darkMode={darkMode} />} />
          {/* Optional non-nested routes */}
          <Route path="/analyze" element={<Analyze darkMode={darkMode} />} />
          <Route path="/login" element={<Login darkMode={darkMode} setUser={setUser} />} />
          <Route path="/signup" element={<Signup darkMode={darkMode} setUser={setUser} />} />
          <Route path="/history" element={<History darkMode={darkMode} />} />
          <Route path="/profile" element={<Profile darkMode={darkMode} />} />
        </Routes>
        <Footer darkMode={darkMode} />
      </div>
    </Router>
  );
}

export default App;
