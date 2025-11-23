import React, { useEffect, useRef, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StudySession from './pages/StudySession';
import PackSelection from './pages/PackSelection';
import CreateCards from './pages/CreateCards';
import Community from './pages/Community';
import Settings from './pages/Settings';
import Library from './pages/Library';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import { getSettings } from './services/storageService';

// Define the order of main tabs for navigation logic
const TAB_ORDER = ['/', '/library', '/study', '/community', '/create'];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Hide nav on study session on mobile, but sidebar always visible on desktop unless fullscreen desired
  const hideNavMobile = location.pathname === '/session' || location.pathname === '/settings';
  const isStudySession = location.pathname === '/session';
  const isSettings = location.pathname === '/settings';

  // --- TRANSITION LOGIC ---
  const [transitionClass, setTransitionClass] = useState('');
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const prevIdx = TAB_ORDER.indexOf(prevPathRef.current);
    const currIdx = TAB_ORDER.indexOf(location.pathname);
    
    // Only animate if both paths are in our main tab order
    if (prevIdx !== -1 && currIdx !== -1 && prevIdx !== currIdx) {
      if (currIdx > prevIdx) {
        // Moving Forward (e.g. Dashboard -> Library) -> Slide in from Right
        setTransitionClass('animate-in slide-in-from-right-10 fade-in duration-300 ease-out');
      } else {
        // Moving Backward (e.g. Library -> Dashboard) -> Slide in from Left
        setTransitionClass('animate-in slide-in-from-left-10 fade-in duration-300 ease-out');
      }
    } else {
      // Default fade for non-tab routes (like settings or details)
      setTransitionClass('animate-in fade-in zoom-in-95 duration-200');
    }

    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  // --- SWIPE NAVIGATION LOGIC ---
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    // Disable swipe nav on specific pages
    if (isStudySession || isSettings) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;

    // Reset
    touchStartX.current = null;
    touchStartY.current = null;

    // Check if horizontal swipe dominates vertical scroll
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Threshold for swipe
      if (Math.abs(deltaX) > 50) {
        const currentIndex = TAB_ORDER.indexOf(location.pathname);
        if (currentIndex === -1) return; // Not on a main tab

        if (deltaX > 0) {
          // Swipe LEFT -> Go Next
          if (currentIndex < TAB_ORDER.length - 1) {
            navigate(TAB_ORDER[currentIndex + 1]);
          }
        } else {
          // Swipe RIGHT -> Go Prev
          if (currentIndex > 0) {
            navigate(TAB_ORDER[currentIndex - 1]);
          }
        }
      }
    }
  };

  return (
    <div 
      className="font-sans text-gray-900 bg-paper dark:bg-slate-950 dark:text-gray-100 min-h-screen transition-colors duration-300 flex overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Desktop Sidebar */}
      {!isStudySession && <Sidebar />}
      
      {/* Main Content Area */}
      <main className={`flex-1 min-h-screen w-full transition-all duration-300 ${!isStudySession ? 'md:ml-64' : ''}`}>
        {/* Animated Wrapper */}
        <div 
            key={location.pathname} 
            className={`w-full h-full ${transitionClass}`}
        >
            {children}
        </div>
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
          <Route path="/study" element={<PackSelection />} />
          <Route path="/session" element={<StudySession />} />
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