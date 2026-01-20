import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from './pages/Home'
import InterviewSession from './pages/InterviewSession'
import Dashboard from './pages/Dashboard'
import ReportView from './pages/ReportView'
import Navigation from './components/Navigation'

// Create a client for React Query
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/interview/:sessionId" element={<InterviewSession />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/report/:sessionId" element={<ReportView />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
