import React, { useEffect, useRef, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StudySession from './pages/StudySession';
import PackSelection from './pages/PackSelection';
import CreateCards from './pages/CreateCards';
import Community from './pages/Community';
import Settings from './pages/Settings';
import Library from './pages/Library';
import Login from './pages/Login';
import Register from './pages/Register';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import { getSettings } from './services/storageService';
import { AuthProvider, useAuth } from './context/AuthContext';

// Define the order of main tabs for navigation logic
const TAB_ORDER = ['/', '/library', '/study', '/community', '/create'];

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen bg-paper dark:bg-slate-950"></div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Routes where nav should be hidden
  const hideNavMobile = location.pathname === '/session' || location.pathname === '/settings' || location.pathname === '/login' || location.pathname === '/register';
  const isStudySession = location.pathname === '/session';
  const isSettings = location.pathname === '/settings';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

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
    
    // Disable swipe nav on specific pages or if not logged in
    if (isStudySession || isSettings || isAuthPage || !user) return;

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
      {/* Desktop Sidebar - Only show if logged in and not in full screen mode */}
      {user && !isStudySession && !isAuthPage && <Sidebar />}
      
      {/* Main Content Area */}
      <main className={`flex-1 min-h-screen w-full transition-all duration-300 ${user && !isStudySession && !isAuthPage ? 'md:ml-64' : ''}`}>
        {/* Animated Wrapper */}
        <div 
            key={location.pathname} 
            className={`w-full h-full ${transitionClass}`}
        >
            {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      {user && !hideNavMobile && <BottomNav />}
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
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/study" element={<ProtectedRoute><PackSelection /></ProtectedRoute>} />
            <Route path="/session" element={<ProtectedRoute><StudySession /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreateCards /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;