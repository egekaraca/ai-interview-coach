import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Sayfalar
import Home from './pages/Home'
import InterviewSession from './components/Interview/InterviewSession.jsx'
import Dashboard from './pages/Dashboard'
import ReportView from './pages/ReportView'
import Pricing from "./pages/Pricing.jsx"

// Bileşenler
import Navigation from './components/Navigation'
import SmoothScroll from './components/SmoothScroll'
import Methodology from "./pages/Methodology.jsx";
import Results from "./pages/Results.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx"; // <-- 1. SmoothScroll'u import et

// Create a client for React Query
const queryClient = new QueryClient()

// Navigasyon barını mülakat sayfasında gizlemek için yardımcı bileşen
function AppContent() {
  const location = useLocation()
  // Mülakat ekranında üst menüyü gizle (Tam odaklanma için)
  const isInterviewPage = location.pathname.startsWith('/interview/')

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Sadece mülakat dışındaki sayfalarda Navigasyon göster */}
      <ScrollToTop />
      {!isInterviewPage && <Navigation />}

      {/* 'container' sınıfını kaldırdık -> Artık sayfalar tam genişlik (full-width) olabilir */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interview/:sessionId" element={<InterviewSession />} />
          <Route path= "/methodology" element = {<Methodology/>} />
          <Route path="/pricing" element={<Pricing/>} />
          <Route path="/results" element={<Results />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report/:sessionId" element={<ReportView />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {/* 2. SmoothScroll bileşeni ile AppContent'i sarmalıyoruz.
            Router'ın içinde olması önemlidir, böylece sayfa geçişlerinde
            scroll pozisyonunu (ileride gerekirse) yönetebiliriz.
        */}
        <SmoothScroll>
          <AppContent />
        </SmoothScroll>
      </Router>
    </QueryClientProvider>
  )
}

export default App