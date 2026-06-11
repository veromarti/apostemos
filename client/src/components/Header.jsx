import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Header({ user }) {
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  return (
    <header className="header">
      <Link to="/schedule" className="header-logo">
        ⚽ Apostemos
      </Link>
      <nav className="header-nav">
        <Link
          to="/schedule"
          className={location.pathname === '/schedule' ? 'active' : ''}
        >
          Schedule
        </Link>
        <Link
          to="/leaderboard"
          className={location.pathname === '/leaderboard' ? 'active' : ''}
        >
          Leaderboard
        </Link>
      </nav>
      <div className="header-right">
        {user && (
          <span className="header-username">
            {user.is_admin ? '👑 ' : ''}{user.username}
          </span>
        )}
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}
