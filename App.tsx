import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StudySession from './pages/StudySession';
import CreateCards from './pages/CreateCards';
import Community from './pages/Community';
import Settings from './pages/Settings';
import Library from './pages/Library';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import { getSettings } from './services/storageService';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Hide nav on study session on mobile, but sidebar always visible on desktop unless fullscreen desired
  const hideNavMobile = location.pathname === '/study' || location.pathname === '/settings';
  const isStudySession = location.pathname === '/study';

  return (
    <div className="font-sans text-gray-900 bg-paper dark:bg-slate-950 dark:text-gray-100 min-h-screen transition-colors duration-300 flex">
      {/* Desktop Sidebar */}
      {!isStudySession && <Sidebar />}
      
      {/* Main Content Area */}
      <main className={`flex-1 min-h-screen w-full transition-all duration-300 ${!isStudySession ? 'md:ml-64' : ''}`}>
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {!hideNavMobile && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  // Initialize Theme
  useEffect(() => {
    const settings = getSettings();
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/study" element={<StudySession />} />
          <Route path="/create" element={<CreateCards />} />
          <Route path="/community" element={<Community />} />
          <Route path="/library" element={<Library />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;