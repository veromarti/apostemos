import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Schedule from './pages/Schedule.jsx'
import Leaderboard from './pages/Leaderboard.jsx'

function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decoded = decodeToken(token)
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser(decoded)
      } else {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/schedule" replace /> : <Login setUser={setUser} />} />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute user={user}>
              <Schedule user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute user={user}>
              <Leaderboard user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/schedule" replace />} />
        <Route path="*" element={<Navigate to="/schedule" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
