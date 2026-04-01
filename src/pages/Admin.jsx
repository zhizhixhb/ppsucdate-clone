import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import localforage from 'localforage'

function Admin({ user, setUser }) {
  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [schedules, setSchedules] = useState([])
  const [messages, setMessages] = useState([])
  const [interests, setInterests] = useState([])
  const [communityPosts, setCommunityPosts] = useState([])
  const [communityComments, setCommunityComments] = useState({})
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
  })
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    isAdmin: false
  })
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'PPSUC Date',
    siteDescription: '公安大学校园社交平台',
    requireStrongPassword: true,
    enableTwoFactorAuth: true,
    maxUsers: 1000
  })
  const [logs, setLogs] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // 加载用户数据
      const usersData = await localforage.getItem('users') || []
      setUsers(usersData)

      // 加载活动数据
      const eventsData = await localforage.getItem('events') || []
      setEvents(eventsData)

      // 加载日程数据
      const schedulesData = await localforage.getItem('schedules') || []
      setSchedules(schedulesData)

      // 加载消息数据
      const messagesData = await localforage.getItem('messages') || []
      setMessages(messagesData)

      // 加载兴趣数据
      const interestsData = await localforage.getItem('interests') || []
      setInterests(interestsData)

      // 加载社区帖子数据
      const communityPostsData = await localforage.getItem('communityPosts') || []
      setCommunityPosts(communityPostsData)

      // 加载社区评论数据
      const communityCommentsData = await localforage.getItem('communityComments') || {}
      setCommunityComments(communityCommentsData)

      // 加载系统设置
      const settingsData = await localforage.getItem('systemSettings') || {
        siteName: 'PPSUC Date',
        siteDescription: '公安大学校园社交平台',
        requireStrongPassword: true,
        enableTwoFactorAuth: true,
        maxUsers: 1000
      }
      setSystemSettings(settingsData)

      // 加载操作日志
      const logsData = await localforage.getItem('adminLogs') || []
      setLogs(logsData)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEventChange = (e) => {
    const { name, value } = e.target
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEventSubmit = async (e) => {
    e.preventDefault()
    
    if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.time || !newEvent.location) {
      alert('请填写所有字段')
      return
    }

    const event = {
      id: Date.now(),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      organizer: user.username,
      participants: [],
      createdAt: new Date().toISOString()
    }

    const updatedEvents = [...events, event]
    await localforage.setItem('events', updatedEvents)
    setEvents(updatedEvents)
    setNewEvent({ title: '', description: '', date: '', time: '', location: '' })
    alert('活动发布成功！')
  }

  const toggleAdminStatus = async (userId) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, isAdmin: !u.isAdmin }
      }
      return u
    })
    await localforage.setItem('users', updatedUsers)
    setUsers(updatedUsers)
  }

  const deleteUser = async (userId) => {
    if (window.confirm('确定要删除该用户吗？')) {
      const updatedUsers = users.filter(u => u.id !== userId)
      await localforage.setItem('users', updatedUsers)
      setUsers(updatedUsers)
    }
  }

  const deleteEvent = async (eventId) => {
    if (window.confirm('确定要删除该活动吗？')) {
      const updatedEvents = events.filter(e => e.id !== eventId)
      await localforage.setItem('events', updatedEvents)
      setEvents(updatedEvents)
      await logAction('删除活动', `删除了活动ID: ${eventId}`)
    }
  }

  // 记录操作日志
  const logAction = async (action, details) => {
    const newLog = {
      id: Date.now(),
      action,
      details,
      adminId: user.id,
      adminName: user.username,
      timestamp: new Date().toISOString()
    }
    const updatedLogs = [newLog, ...logs].slice(0, 1000) // 保留最近1000条日志
    setLogs(updatedLogs)
    await localforage.setItem('adminLogs', updatedLogs)
  }

  // 验证强密码
  const validateStrongPassword = (password) => {
    if (password.length < 8) return false
    if (!/[A-Z]/.test(password)) return false
    if (!/[a-z]/.test(password)) return false
    if (!/[0-9]/.test(password)) return false
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false
    return true
  }

  // 处理新用户输入变化
  const handleNewUserChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // 创建新用户
  const handleCreateUser = async (e) => {
    e.preventDefault()
    
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert('请填写所有字段')
      return
    }

    if (systemSettings.requireStrongPassword && !validateStrongPassword(newUser.password)) {
      alert('密码必须至少8位，包含大小写字母、数字和特殊符号')
      return
    }

    const existingUser = users.find(u => u.email === newUser.email || u.username === newUser.username)
    if (existingUser) {
      alert('用户名或邮箱已存在')
      return
    }

    const userCount = users.length
    if (systemSettings.maxUsers > 0 && userCount >= systemSettings.maxUsers) {
      alert(`已达到最大用户数限制(${systemSettings.maxUsers})`)
      return
    }

    const newUserObj = {
      id: Date.now(),
      username: newUser.username,
      email: newUser.email,
      password: btoa(newUser.password), // 简单加密
      isAdmin: newUser.isAdmin,
      createdAt: new Date().toISOString()
    }

    const updatedUsers = [...users, newUserObj]
    setUsers(updatedUsers)
    await localforage.setItem('users', updatedUsers)
    setNewUser({ username: '', email: '', password: '', isAdmin: false })
    await logAction('创建用户', `创建了用户: ${newUserObj.username} (${newUserObj.isAdmin ? '管理员' : '普通用户'})`)
    alert('用户创建成功！')
  }

  // 处理系统设置变化
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    setSystemSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // 保存系统设置
  const saveSystemSettings = async () => {
    await localforage.setItem('systemSettings', systemSettings)
    await logAction('更新系统设置', '修改了系统配置')
    alert('系统设置已保存！')
  }

  // 备份数据
  const backupData = async () => {
    try {
      const allData = {
        users: users,
        events: events,
        schedules: schedules,
        messages: messages,
        interests: interests,
        communityPosts: communityPosts,
        communityComments: communityComments,
        systemSettings: systemSettings,
        adminLogs: logs,
        backupTime: new Date().toISOString()
      }

      const dataStr = JSON.stringify(allData)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ppsucdate-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      await logAction('备份数据', '创建了系统数据备份')
      alert('数据备份成功！')
    } catch (error) {
      console.error('备份数据失败:', error)
      alert('备份数据失败，请重试')
    }
  }

  // 恢复数据
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const backupData = JSON.parse(event.target.result)
          
          if (confirm('确定要恢复数据吗？这将覆盖当前所有数据！')) {
            // 恢复所有数据
            if (backupData.users) await localforage.setItem('users', backupData.users)
            if (backupData.events) await localforage.setItem('events', backupData.events)
            if (backupData.schedules) await localforage.setItem('schedules', backupData.schedules)
            if (backupData.messages) await localforage.setItem('messages', backupData.messages)
            if (backupData.interests) await localforage.setItem('interests', backupData.interests)
            if (backupData.communityPosts) await localforage.setItem('communityPosts', backupData.communityPosts)
            if (backupData.communityComments) await localforage.setItem('communityComments', backupData.communityComments)
            if (backupData.systemSettings) await localforage.setItem('systemSettings', backupData.systemSettings)
            if (backupData.adminLogs) await localforage.setItem('adminLogs', backupData.adminLogs)

            await logAction('恢复数据', '从备份文件恢复了系统数据')
            alert('数据恢复成功！')
            loadData() // 重新加载数据
          }
        } catch (error) {
          console.error('解析备份文件失败:', error)
          alert('备份文件格式错误，请检查文件是否正确')
        }
      }
      reader.readAsText(file)
    } catch (error) {
      console.error('恢复数据失败:', error)
      alert('恢复数据失败，请重试')
    }
  }

  // 删除社区帖子
  const deleteCommunityPost = async (postId) => {
    if (window.confirm('确定要删除该帖子吗？')) {
      const updatedPosts = communityPosts.filter(post => post.id !== postId)
      setCommunityPosts(updatedPosts)
      await localforage.setItem('communityPosts', updatedPosts)
      
      // 删除相关评论
      const updatedComments = { ...communityComments }
      delete updatedComments[postId]
      setCommunityComments(updatedComments)
      await localforage.setItem('communityComments', updatedComments)
      
      await logAction('删除社区帖子', `删除了帖子ID: ${postId}`)
    }
  }

  const clearAllData = async () => {
    if (window.confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      await localforage.clear()
      loadData()
      alert('所有数据已清空')
    }
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="admin-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="brand-highlight">后台管理</span>
            </h1>
            <p className="hero-subtitle">系统管理中心</p>
            <p className="hero-description">
              管理用户、活动和系统数据
            </p>
          </div>
        </section>

        <section className="admin-section">
          <div className="container">
            <div className="admin-card">
              <h2 className="section-title">访问被拒绝</h2>
              <p className="error-message">您没有权限访问后台管理页面</p>
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

  if (isLoading) {
    return (
      <div className="admin-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="brand-highlight">后台管理</span>
            </h1>
            <p className="hero-subtitle">系统管理中心</p>
            <p className="hero-description">
              管理用户、活动和系统数据
            </p>
          </div>
        </section>

        <section className="admin-section">
          <div className="container">
            <div className="admin-card">
              <h2 className="section-title">加载中...</h2>
              <div className="loading-spinner"></div>
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

  return (
    <div className="admin-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="brand-highlight">后台管理</span>
          </h1>
          <p className="hero-subtitle">系统管理中心</p>
          <p className="hero-description">
            管理用户、活动和系统数据
          </p>
        </div>
      </section>

      <section className="admin-section">
        <div className="container">
          {/* 导航标签页 */}
          <div className="admin-tabs">
            <button 
              className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              仪表盘
            </button>
            <button 
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              用户管理
            </button>
            <button 
              className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              内容管理
            </button>
            <button 
              className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              系统设置
            </button>
            <button 
              className={`tab-button ${activeTab === 'backup' ? 'active' : ''}`}
              onClick={() => setActiveTab('backup')}
            >
              数据备份
            </button>
            <button 
              className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              操作日志
            </button>
          </div>

          {/* 仪表盘 */}
          {activeTab === 'dashboard' && (
            <div className="tab-content">
              <div className="admin-card">
                <h2 className="section-title">数据统计</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h4>用户总数</h4>
                    <p className="stat-value">{users.length}</p>
                  </div>
                  <div className="stat-card">
                    <h4>活动总数</h4>
                    <p className="stat-value">{events.length}</p>
                  </div>
                  <div className="stat-card">
                    <h4>社区帖子</h4>
                    <p className="stat-value">{communityPosts.length}</p>
                  </div>
                  <div className="stat-card">
                    <h4>管理员数量</h4>
                    <p className="stat-value">{users.filter(u => u.isAdmin).length}</p>
                  </div>
                  <div className="stat-card">
                    <h4>消息数量</h4>
                    <p className="stat-value">{messages.length}</p>
                  </div>
                  <div className="stat-card">
                    <h4>系统设置</h4>
                    <p className="stat-value">{systemSettings.requireStrongPassword ? '强密码' : '弱密码'}</p>
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <h2 className="section-title">快速操作</h2>
                <div className="quick-actions">
                  <button className="quick-action-button" onClick={() => setActiveTab('users')}>
                    <span className="action-icon">👥</span>
                    <span>用户管理</span>
                  </button>
                  <button className="quick-action-button" onClick={() => setActiveTab('content')}>
                    <span className="action-icon">📝</span>
                    <span>内容管理</span>
                  </button>
                  <button className="quick-action-button" onClick={() => setActiveTab('settings')}>
                    <span className="action-icon">⚙️</span>
                    <span>系统设置</span>
                  </button>
                  <button className="quick-action-button" onClick={() => setActiveTab('backup')}>
                    <span className="action-icon">💾</span>
                    <span>数据备份</span>
                  </button>
                </div>
              </div>

              <div className="admin-card">
                <h2 className="section-title">最近操作</h2>
                <div className="recent-logs">
                  {logs.slice(0, 10).map(log => (
                    <div key={log.id} className="log-item">
                      <div className="log-time">{new Date(log.timestamp).toLocaleString()}</div>
                      <div className="log-action">{log.action}</div>
                      <div className="log-details">{log.details}</div>
                      <div className="log-admin">{log.adminName}</div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="empty-logs">暂无操作日志</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 用户管理 */}
          {activeTab === 'users' && (
            <div className="tab-content">
              <div className="admin-card">
                <h2 className="section-title">创建新用户</h2>
                <form onSubmit={handleCreateUser} className="user-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="username">用户名</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={newUser.username}
                        onChange={handleNewUserChange}
                        required
                        className="admin-input"
                        placeholder="输入用户名"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">邮箱</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={newUser.email}
                        onChange={handleNewUserChange}
                        required
                        className="admin-input"
                        placeholder="输入邮箱"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="password">密码</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={newUser.password}
                        onChange={handleNewUserChange}
                        required
                        className="admin-input"
                        placeholder="输入密码"
                      />
                    </div>
                    <div className="form-group checkbox-group">
                      <label htmlFor="isAdmin">
                        <input
                          type="checkbox"
                          id="isAdmin"
                          name="isAdmin"
                          checked={newUser.isAdmin}
                          onChange={handleNewUserChange}
                        />
                        管理员权限
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <button type="submit" className="primary-button">创建用户</button>
                  </div>
                </form>
              </div>

              <div className="admin-card">
                <h2 className="section-title">用户列表</h2>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>用户名</th>
                        <th>邮箱</th>
                        <th>注册时间</th>
                        <th>管理员</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{new Date(user.createdAt).toLocaleString()}</td>
                          <td>
                            <button
                              className={`status-button ${user.isAdmin ? 'admin' : 'user'}`}
                              onClick={() => toggleAdminStatus(user.id)}
                            >
                              {user.isAdmin ? '是' : '否'}
                            </button>
                          </td>
                          <td>
                            <button
                              className="delete-button"
                              onClick={() => deleteUser(user.id)}
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 内容管理 */}
          {activeTab === 'content' && (
            <div className="tab-content">
              <div className="admin-card">
                <h2 className="section-title">发布活动</h2>
                <form onSubmit={handleEventSubmit} className="event-form">
                  <div className="form-group">
                    <label htmlFor="title">活动标题</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newEvent.title}
                      onChange={handleEventChange}
                      required
                      className="admin-input"
                      placeholder="输入活动标题"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">活动描述</label>
                    <textarea
                      id="description"
                      name="description"
                      value={newEvent.description}
                      onChange={handleEventChange}
                      rows={4}
                      required
                      className="admin-textarea"
                      placeholder="输入活动详细描述"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="date">日期</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={newEvent.date}
                        onChange={handleEventChange}
                        required
                        className="admin-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="time">时间</label>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        value={newEvent.time}
                        onChange={handleEventChange}
                        required
                        className="admin-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="location">地点</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={newEvent.location}
                      onChange={handleEventChange}
                      required
                      className="admin-input"
                      placeholder="输入活动地点"
                    />
                  </div>
                  <div className="form-group">
                    <button type="submit" className="primary-button">发布活动</button>
                  </div>
                </form>
              </div>

              <div className="admin-card">
                <h2 className="section-title">活动管理</h2>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>标题</th>
                        <th>日期</th>
                        <th>地点</th>
                        <th>组织者</th>
                        <th>参与人数</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(event => (
                        <tr key={event.id}>
                          <td>{event.id}</td>
                          <td>{event.title}</td>
                          <td>{event.date} {event.time}</td>
                          <td>{event.location}</td>
                          <td>{event.organizer}</td>
                          <td>{event.participants?.length || 0}</td>
                          <td>
                            <button
                              className="delete-button"
                              onClick={() => deleteEvent(event.id)}
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="admin-card">
                <h2 className="section-title">社区帖子管理</h2>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>标题</th>
                        <th>作者</th>
                        <th>发布时间</th>
                        <th>点赞数</th>
                        <th>评论数</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {communityPosts.map(post => (
                        <tr key={post.id}>
                          <td>{post.id}</td>
                          <td>{post.title}</td>
                          <td>{post.authorName}</td>
                          <td>{new Date(post.createdAt).toLocaleString()}</td>
                          <td>{post.likes?.length || 0}</td>
                          <td>{post.comments || 0}</td>
                          <td>
                            <button
                              className="delete-button"
                              onClick={() => deleteCommunityPost(post.id)}
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 系统设置 */}
          {activeTab === 'settings' && (
            <div className="tab-content">
              <div className="admin-card">
                <h2 className="section-title">系统设置</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveSystemSettings(); }} className="settings-form">
                  <div className="form-group">
                    <label htmlFor="siteName">网站名称</label>
                    <input
                      type="text"
                      id="siteName"
                      name="siteName"
                      value={systemSettings.siteName}
                      onChange={handleSettingsChange}
                      className="admin-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="siteDescription">网站描述</label>
                    <input
                      type="text"
                      id="siteDescription"
                      name="siteDescription"
                      value={systemSettings.siteDescription}
                      onChange={handleSettingsChange}
                      className="admin-input"
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label htmlFor="requireStrongPassword">
                      <input
                        type="checkbox"
                        id="requireStrongPassword"
                        name="requireStrongPassword"
                        checked={systemSettings.requireStrongPassword}
                        onChange={handleSettingsChange}
                      />
                      启用强密码策略
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label htmlFor="enableTwoFactorAuth">
                      <input
                        type="checkbox"
                        id="enableTwoFactorAuth"
                        name="enableTwoFactorAuth"
                        checked={systemSettings.enableTwoFactorAuth}
                        onChange={handleSettingsChange}
                      />
                      启用双因素认证
                    </label>
                  </div>
                  <div className="form-group">
                    <label htmlFor="maxUsers">最大用户数</label>
                    <input
                      type="number"
                      id="maxUsers"
                      name="maxUsers"
                      value={systemSettings.maxUsers}
                      onChange={handleSettingsChange}
                      min="0"
                      className="admin-input"
                    />
                    <small className="form-help">0表示无限制</small>
                  </div>
                  <div className="form-group">
                    <button type="submit" className="primary-button">保存设置</button>
                  </div>
                </form>
              </div>

              <div className="admin-card">
                <h2 className="section-title">安全设置</h2>
                <div className="security-info">
                  <h3>强密码策略</h3>
                  <p>密码必须至少8位，包含大小写字母、数字和特殊符号</p>
                  <h3>双因素认证</h3>
                  <p>启用后，用户登录时需要输入验证码</p>
                  <h3>操作日志</h3>
                  <p>所有管理员操作都会被记录，确保可追溯性</p>
                </div>
              </div>
            </div>
          )}

          {/* 数据备份 */}
          {activeTab === 'backup' && (
            <div className="tab-content">
              <div className="admin-card">
                <h2 className="section-title">数据备份与恢复</h2>
                <div className="backup-actions">
                  <button className="primary-button" onClick={backupData}>
                    备份数据
                  </button>
                  <div className="file-upload">
                    <label htmlFor="backupFile" className="secondary-button">
                      选择备份文件
                    </label>
                    <input
                      type="file"
                      id="backupFile"
                      accept=".json"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                <div className="backup-info">
                  <h3>备份说明</h3>
                  <ul>
                    <li>备份文件包含所有系统数据，包括用户、活动、社区帖子等</li>
                    <li>恢复数据会覆盖当前所有数据，请谨慎操作</li>
                    <li>建议定期备份数据，以防数据丢失</li>
                    <li>备份文件请妥善保管，不要泄露给他人</li>
                  </ul>
                </div>
              </div>

              <div className="admin-card">
                <h2 className="section-title">系统操作</h2>
                <div className="system-actions">
                  <button
                    className="secondary-button"
                    onClick={loadData}
                  >
                    刷新数据
                  </button>
                  <button
                    className="danger-button"
                    onClick={clearAllData}
                  >
                    清空所有数据
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 操作日志 */}
          {activeTab === 'logs' && (
            <div className="tab-content">
              <div className="admin-card">
                <h2 className="section-title">操作日志</h2>
                <div className="logs-container">
                  {logs.length === 0 ? (
                    <div className="empty-logs">暂无操作日志</div>
                  ) : (
                    <div className="logs-list">
                      {logs.map(log => (
                        <div key={log.id} className="log-item">
                          <div className="log-header">
                            <div className="log-time">{new Date(log.timestamp).toLocaleString()}</div>
                            <div className="log-admin">{log.adminName}</div>
                          </div>
                          <div className="log-action">{log.action}</div>
                          <div className="log-details">{log.details}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
              <Link to="/about">关于我们</Link>
              <Link to="/contact">联系我们</Link>
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

export default Admin