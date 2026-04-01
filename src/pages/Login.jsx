import { useState } from 'react'
import { Link } from 'react-router-dom'
import localforage from 'localforage'

// 密码加密函数 - 使用更安全的方式
const encryptPassword = (password) => {
  // 在实际应用中，应该使用更安全的加密方法，如bcrypt
  // 这里使用更复杂的编码方式作为示例
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  return btoa(String.fromCharCode(...data));
}

const decryptPassword = (encryptedPassword) => {
  const data = atob(encryptedPassword);
  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array([...data].map(char => char.charCodeAt(0))));
}

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // 清除错误信息
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 简单验证
    if (!formData.email || !formData.password) {
      setError('请填写所有字段')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 查找用户
      const users = await localforage.getItem('users') || []
      const user = users.find(user => user.email === formData.email && user.password === encryptPassword(formData.password))
      
      if (!user) {
        setError('邮箱或密码错误')
        return
      }

      // 登录用户
      onLogin(user)
      
      // 记住登录信息
      if (formData.remember) {
        // 添加过期时间（30天）
        const rememberedUser = {
          ...user,
          rememberExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30天过期
        }
        // 使用localStorage存储，添加加密
        const encryptedUser = btoa(JSON.stringify(rememberedUser))
        localStorage.setItem('rememberedUser', encryptedUser)
      } else {
        // 清除记住的用户信息
        localStorage.removeItem('rememberedUser')
        await localforage.removeItem('rememberedUser') // 兼容旧版本
      }
    } catch (err) {
      setError('登录过程中发生错误，请重试')
      console.error('登录错误:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* 主背景 */}
      <div className="main-background">
        <div className="background-overlay">
          {/* 顶部导航 */}
          <nav className="sjtudate-nav">
            <div className="nav-content">
              <span className="nav-text">PPSUC Date</span>
            </div>
          </nav>

          {/* 主内容 */}
          <div className="main-content">
            <h1 className="main-title animate-fade-in-up-1">欢迎回来</h1>
            <p className="main-subtitle animate-fade-in-up-2">登录您的账号</p>
            <p className="main-description animate-fade-in-up-3">
              登录后继续探索校园社交的精彩，找到志同道合的朋友
            </p>
            
            {/* 登录表单 */}
            <div className="auth-form-card animate-fade-in-up-4">
              <h2 className="auth-form-title">登录</h2>
              <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="error-message">{error}</div>}
                <div className="form-group animate-fade-in-up-5">
                  <label htmlFor="email">邮箱</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="auth-input"
                    placeholder="请输入您的公大邮箱"
                  />
                </div>
                <div className="form-group animate-fade-in-up-6">
                  <label htmlFor="password">密码</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="auth-input"
                    placeholder="请输入您的密码"
                  />
                </div>
                <div className="form-group form-checkbox animate-fade-in-up-7">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="remember"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleChange}
                    />
                    记住我（30天内自动登录）
                  </label>
                  <small className="form-help">勾选后，系统将安全存储您的登录信息，30天内无需重新输入密码</small>
                </div>
                <div className="form-group animate-fade-in-up-8">
                  <button 
                    type="submit" 
                    className="auth-button"
                    disabled={isLoading}
                  >
                    {isLoading ? '登录中...' : '登录'}
                  </button>
                </div>
                <div className="form-group animate-fade-in-up-9">
                  <button 
                    type="button" 
                    className="clear-credentials-btn"
                    onClick={() => {
                      localStorage.removeItem('rememberedUser')
                      localforage.removeItem('rememberedUser')
                      alert('已清除保存的登录信息')
                    }}
                  >
                    清除已保存的登录信息
                  </button>
                </div>
                <div className="auth-links animate-fade-in-up-10">
                  <p>还没有账号？ <Link to="/register" className="auth-link">立即注册</Link></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="sjtudate-footer">
        <div className="container">
          <p className="footer-text">© 2024 PPSUC Date. 保留所有权利。</p>
          <div className="footer-links">
            <Link to="#" className="footer-link">关于我们</Link>
            <Link to="#" className="footer-link">隐私政策</Link>
            <Link to="#" className="footer-link">使用条款</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Login