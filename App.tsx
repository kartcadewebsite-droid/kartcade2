import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ReactLenis from 'lenis/react';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import FloatingCallButton from './components/FloatingCallButton';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import PricingPage from './pages/PricingPage';
import EventsPage from './pages/EventsPage';
import EquipmentPage from './pages/EquipmentPage';
import FAQPage from './pages/FAQPage';
import BookingPage from './pages/BookingPage';
import CancelPage from './pages/CancelPage';
import GalleryPage from './pages/GalleryPage';
import RulesPage from './pages/RulesPage';
import ExperiencesPage from './pages/ExperiencesPage';
import WaiverPage from './pages/WaiverPage';
import MembershipPage from './pages/MembershipPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    const initialRefresh = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    const delayedRefresh = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);

    const handleLoad = () => {
      setTimeout(() => ScrollTrigger.refresh(), 100);
    };
    window.addEventListener('load', handleLoad);

    return () => {
      clearTimeout(initialRefresh);
      clearTimeout(delayedRefresh);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  useEffect(() => {
    if (lenisRef.current?.lenis) {
      (window as any).__lenis = lenisRef.current.lenis;
    }
  });

  return (
    <AuthProvider>
      <ReactLenis root ref={lenisRef} options={{ duration: 1.2, smoothWheel: true }}>
        <Router>
          <ScrollToTop />
          <div className="relative min-h-screen">
            <CustomCursor />
            <Navbar />
            <FloatingCallButton />

            {/* Main Content Wrapper */}
            <main className="relative z-10 w-full">
              <div className="min-h-screen">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/equipment" element={<EquipmentPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/book" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/cancel" element={<CancelPage />} />
                  <Route path="/rules" element={<RulesPage />} />
                  <Route path="/experiences" element={<ExperiencesPage />} />
                  <Route path="/waiver" element={<WaiverPage />} />
                  <Route path="/membership" element={<MembershipPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </div>
            </main>

            {/* Fixed Footer */}
            <Footer />
          </div>
        </Router>
      </ReactLenis>
    </AuthProvider>
  );
};

export default App;