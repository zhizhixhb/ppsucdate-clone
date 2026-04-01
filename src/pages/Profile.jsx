import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import localforage from 'localforage'
import GenderSelector from '../components/GenderSelector'
import CollegeSelector from '../components/CollegeSelector'
import { DatePicker } from '../components/DatePicker'

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
    avatar: user?.avatar || '',
    gender: user?.gender || '',
    college: user?.college || '',
    birthDate: user?.birthDate || ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGenderChange = (gender) => {
    setFormData(prev => ({
      ...prev,
      gender
    }))
  }

  const handleCollegeChange = (college) => {
    setFormData(prev => ({
      ...prev,
      college
    }))
  }

  const handleBirthDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      birthDate: date
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
    <div className="profile-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="brand-highlight">个人中心</span>
          </h1>
          <p className="hero-subtitle">管理您的个人信息</p>
          <p className="hero-description">
            完善您的个人资料，让他人更好地了解您
          </p>
        </div>
      </section>

      {/* Profile Form */}
      <section className="profile-section">
        <div className="container">
          <div className="profile-card">
            <h2 className="profile-title">个人信息</h2>
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="username">用户名</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="profile-input"
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
                  className="profile-input"
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
                  className="profile-input"
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
                  placeholder="介绍一下自己吧"
                  className="profile-input"
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
                  placeholder="输入您的头像链接"
                  className="profile-input"
                />
              </div>
              
              <GenderSelector
                value={formData.gender}
                onChange={handleGenderChange}
                label="性别"
              />
              
              <CollegeSelector
                value={formData.college}
                onChange={handleCollegeChange}
                label="学院"
              />
              
              <DatePicker
                value={formData.birthDate}
                onChange={handleBirthDateChange}
                label="出生日期"
                max={new Date().toISOString().split('T')[0]}
              />
              
              <div className="form-group">
                <button type="submit" className="profile-button">
                  保存修改
                </button>
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

export default Profile