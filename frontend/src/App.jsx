import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from './pages/Home'
import InterviewSession from './pages/InterviewSession'
import Dashboard from './pages/Dashboard'
import ReportView from './pages/ReportView'
import Navigation from './components/Navigation'

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
      {!isInterviewPage && <Navigation />}

      {/* 'container' sınıfını kaldırdık -> Artık sayfalar tam genişlik (full-width) olabilir */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interview/:sessionId" element={<InterviewSession />} />
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
        <AppContent />
      </Router>
    </QueryClientProvider>
  )
}

export default App