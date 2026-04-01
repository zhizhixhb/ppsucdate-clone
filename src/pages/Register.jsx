import { useState } from 'react'
import { Link } from 'react-router-dom'
import localforage from 'localforage'

// 简单的密码加密函数
const encryptPassword = (password) => {
  // 在实际应用中，应该使用更安全的加密方法，如bcrypt
  return btoa(password) // 仅作为示例，实际应用中应使用更安全的方法
}

const decryptPassword = (encryptedPassword) => {
  return atob(encryptedPassword)
}

function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 简单验证
    if (!formData.username || !formData.email || !formData.password) {
      alert('请填写所有字段')
      return
    }

    // 检查用户是否已存在
    const users = await localforage.getItem('users') || []
    const existingUser = users.find(user => user.email === formData.email)
    
    if (existingUser) {
      alert('该邮箱已被注册')
      return
    }

    // 创建新用户
    const newUser = {
      id: Date.now(),
      username: formData.username,
      email: formData.email,
      password: encryptPassword(formData.password),
      createdAt: new Date().toISOString(),
      isAdmin: false // 默认不是管理员
    }

    // 保存用户数据
    users.push(newUser)
    await localforage.setItem('users', users)

    // 登录新用户
    onRegister(newUser)
  }

  return (
    <div className="auth-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="brand-highlight">PPSUC Date</span>
          </h1>
          <p className="hero-subtitle">加入我们</p>
          <p className="hero-description">
            注册账号，开启您的校园社交之旅
          </p>
        </div>
      </section>

      {/* Register Form */}
      <section className="auth-form-section">
        <div className="container">
          <div className="auth-form-card">
            <h2 className="auth-form-title">注册</h2>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">用户名</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">邮箱</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">密码</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
              </div>
              <div className="form-group">
                <button type="submit" className="auth-button">
                  注册
                </button>
              </div>
              <div className="auth-links">
                <p>已有账号？ <Link to="/login">立即登录</Link></p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>PPSUC Date</h3>
              <p>公安大学校园社交平台</p>
            </div>
            <div className="footer-links">
              <Link to="#">关于我们</Link>
              <Link to="#">使用条款</Link>
              <Link to="#">隐私政策</Link>
              <Link to="#">联系我们</Link>
            </div>
            <div className="footer-copyright">
              <p>&copy; 2024 PPSUC Date. 保留所有权利。</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Register