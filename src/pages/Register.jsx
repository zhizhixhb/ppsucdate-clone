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
      createdAt: new Date().toISOString()
    }

    // 保存用户数据
    users.push(newUser)
    await localforage.setItem('users', users)

    // 登录新用户
    onRegister(newUser)
  }

  return (
    <div className="auth-form">
      <h2>注册</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">用户名</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
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
          <button type="submit">注册</button>
        </div>
      </form>
    </div>
  )
}

export default Register