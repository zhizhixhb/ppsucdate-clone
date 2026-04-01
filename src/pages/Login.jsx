import { useState } from 'react'
import localforage from 'localforage'

// 简单的密码加密函数
const encryptPassword = (password) => {
  // 在实际应用中，应该使用更安全的加密方法，如bcrypt
  return btoa(password) // 仅作为示例，实际应用中应使用更安全的方法
}

const decryptPassword = (encryptedPassword) => {
  return atob(encryptedPassword)
}

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
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
    if (!formData.email || !formData.password) {
      alert('请填写所有字段')
      return
    }

    // 查找用户
    const users = await localforage.getItem('users') || []
    const user = users.find(user => user.email === formData.email && user.password === encryptPassword(formData.password))
    
    if (!user) {
      alert('邮箱或密码错误')
      return
    }

    // 登录用户
    onLogin(user)
  }

  return (
    <div className="auth-form">
      <h2>登录</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">邮箱</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
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
          />
        </div>
        <div className="form-group">
          <button type="submit">登录</button>
        </div>
      </form>
    </div>
  )
}

export default Login