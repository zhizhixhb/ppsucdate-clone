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
import Interests from './pages/Interests'
import Admin from './pages/Admin'
import AdminSetup from './pages/AdminSetup'
import TestAdmin from './pages/TestAdmin'
import About from './pages/About'
import Contact from './pages/Contact'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      // 首先检查当前登录的用户
      const storedUser = await localforage.getItem('user')
      if (storedUser) {
        setUser(storedUser)
      } else {
        // 检查是否有记住的用户（新方式，使用localStorage）
        const encryptedUser = localStorage.getItem('rememberedUser')
        if (encryptedUser) {
          try {
            const rememberedUser = JSON.parse(atob(encryptedUser))
            // 检查是否过期
            if (rememberedUser.rememberExpiry && Date.now() < rememberedUser.rememberExpiry) {
              // 移除过期时间字段
              const { rememberExpiry, ...userData } = rememberedUser
              setUser(userData)
              localforage.setItem('user', userData)
            } else {
              // 已过期，清除存储
              localStorage.removeItem('rememberedUser')
            }
          } catch (error) {
            // 解析错误，清除存储
            localStorage.removeItem('rememberedUser')
          }
        } else {
          // 兼容旧版本（使用localforage）
          const rememberedUser = await localforage.getItem('rememberedUser')
          if (rememberedUser) {
            setUser(rememberedUser)
            localforage.setItem('user', rememberedUser)
          }
        }
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
    // 清除记住的用户信息
    localStorage.removeItem('rememberedUser')
    await localforage.removeItem('rememberedUser') // 兼容旧版本
  }

  // 实现自动跳转到首页的功能 - 只在访问不存在的路径时跳转
  useEffect(() => {
    // 定义允许的路径
    const allowedPaths = [
      '/',
      '/index.html',
      '/login',
      '/register',
      '/interests',
      '/profile',
      '/schedule',
      '/messages',
      '/events',
      '/admin',
      '/admin/setup',
      '/test-admin',
      '/about',
      '/contact'
    ];
    
    // 检查当前路径是否在允许的路径列表中
    const currentPath = window.location.pathname;
    const isAllowed = allowedPaths.some(path => currentPath === path);
    
    // 只有当路径不在允许列表中时才跳转
    if (!isAllowed) {
      // 使用setTimeout避免立即跳转导致的问题
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  }, [])

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
        <Route path="/interests" element={user ? <Interests user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user ? <Admin user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/admin/setup" element={user ? <AdminSetup user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/test-admin" element={user ? <TestAdmin user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/about" element={user ? <About /> : <Navigate to="/login" />} />
        <Route path="/contact" element={user ? <Contact /> : <Navigate to="/login" />} />
        {/* 404页面，重定向到首页 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App