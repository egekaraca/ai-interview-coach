/**
 * API Service - Handles all backend communication
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interview endpoints
export const interviewAPI = {
  /**
   * Start a new interview session
   */
  async startSession(data) {
    const response = await api.post('/api/interviews/start', data)
    return response.data
  },

  /**
   * Get interview session details
   */
  async getSession(sessionId) {
    const response = await api.get(`/api/interviews/${sessionId}`)
    return response.data
  },

  /**
   * List all interview sessions
   */
  async listSessions(skip = 0, limit = 10) {
    const response = await api.get('/api/interviews/', {
      params: { skip, limit }
    })
    return response.data
  },

  /**
   * Mark interview as completed
   */
  async completeSession(sessionId) {
    const response = await api.post(`/api/interviews/${sessionId}/complete`)
    return response.data
  },

  /**
   * Upload video for a session
   */
  async uploadVideo(sessionId, videoFile) {
    const formData = new FormData()
    formData.append('video', videoFile)
    
    const response = await api.post(
      `/api/interviews/${sessionId}/upload-video`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  /**
   * Delete interview session
   */
  async deleteSession(sessionId) {
    const response = await api.delete(`/api/interviews/${sessionId}`)
    return response.data
  },
}

// Analysis endpoints
export const analysisAPI = {
  /**
   * Analyze an interview session
   */
  async analyzeSession(sessionId) {
    const response = await api.post('/api/analysis/analyze', { session_id: sessionId })
    return response.data
  },

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(sessionId) {
    const response = await api.get(`/api/analysis/real-time/${sessionId}`)
    return response.data
  },
}

// Report endpoints
export const reportAPI = {
  /**
   * Get detailed report
   */
  async getReport(sessionId) {
    const response = await api.get(`/api/reports/${sessionId}`)
    return response.data
  },

  /**
   * Download PDF report
   */
  async downloadPDF(sessionId) {
    const response = await api.get(`/api/reports/${sessionId}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Get progress summary
   */
  async getProgressSummary() {
    const response = await api.get('/api/reports/progress/summary')
    return response.data
  },
}

// Health check
export const healthCheck = async () => {
  const response = await api.get('/api/health')
  return response.data
}

export default api
