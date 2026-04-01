import { useState, useEffect } from 'react'
import localforage from 'localforage'

// 简单的密码加密函数
const encryptPassword = (password) => {
  // 在实际应用中，应该使用更安全的加密方法，如bcrypt
  return btoa(password) // 仅作为示例，实际应用中应使用更安全的方法
}

const decryptPassword = (encryptedPassword) => {
  return atob(encryptedPassword)
}

function Profile({ user, setUser }) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
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
    
    // 更新用户信息
    const updatedUser = { ...user, ...formData }
    
    // 如果用户修改了密码，对新密码进行加密
    if (formData.password) {
      updatedUser.password = encryptPassword(formData.password)
    }
    
    setUser(updatedUser)
    
    // 保存到本地存储
    await localforage.setItem('user', updatedUser)
    
    // 更新用户列表中的信息
    const users = await localforage.getItem('users') || []
    const userIndex = users.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex] = updatedUser
      await localforage.setItem('users', users)
    }
    
    alert('个人信息更新成功')
  }

  return (
    <div className="container">
      <h2>个人信息</h2>
      <div className="card">
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
            <label htmlFor="password">密码（留空表示不修改）</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="留空表示不修改密码"
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">个人简介</label>
            <input
              type="text"
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="avatar">头像URL</label>
            <input
              type="text"
              id="avatar"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <button type="submit">保存修改</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile