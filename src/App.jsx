import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import localforage from 'localforage'
import Header from './components/Header'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Schedule from './pages/Schedule'
import Messages from './pages/Messages'
import Events from './pages/Events'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await localforage.getItem('user')
      if (storedUser) {
        setUser(storedUser)
      }
    }
    loadUser()
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localforage.setItem('user', userData)
  }

  const handleLogout = async () => {
    setUser(null)
    await localforage.removeItem('user')
  }

  return (
    <Router>
      <Header user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/register" element={<Register onRegister={handleLogin} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/schedule" element={user ? <Schedule user={user} /> : <Navigate to="/login" />} />
        <Route path="/messages" element={user ? <Messages user={user} /> : <Navigate to="/login" />} />
        <Route path="/events" element={user ? <Events user={user} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App