import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import localforage from 'localforage'

function Schedule({ user }) {
  const [schedules, setSchedules] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: ''
  })

  useEffect(() => {
    loadSchedules()
  }, [user])

  const loadSchedules = async () => {
    const userSchedules = await localforage.getItem(`schedules_${user.id}`) || []
    setSchedules(userSchedules)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.date) {
      alert('请填写标题和日期')
      return
    }

    const newSchedule = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString()
    }

    const updatedSchedules = [...schedules, newSchedule]
    setSchedules(updatedSchedules)
    await localforage.setItem(`schedules_${user.id}`, updatedSchedules)
    
    // 重置表单
    setFormData({
      title: '',
      description: '',
      date: '',
      time: ''
    })

    // 请求通知权限
    if ('Notification' in window) {
      Notification.requestPermission()
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个日程吗？')) {
      const updatedSchedules = schedules.filter(schedule => schedule.id !== id)
      setSchedules(updatedSchedules)
      await localforage.setItem(`schedules_${user.id}`, updatedSchedules)
    }
  }

  return (
    <div className="schedule-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="brand-highlight">日程安排</span>
          </h1>
          <p className="hero-subtitle">管理您的时间</p>
          <p className="hero-description">
            记录重要事件，合理规划时间，让生活更加有序
          </p>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="schedule-section">
        <div className="container">
          {/* Add Schedule Card */}
          <div className="schedule-card">
            <h2 className="schedule-card-title">添加新日程</h2>
            <form onSubmit={handleSubmit} className="schedule-form">
              <div className="form-group">
                <label htmlFor="title">标题</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="schedule-input"
                  placeholder="输入日程标题"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">描述</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="schedule-input"
                  placeholder="添加详细描述"
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">日期</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="schedule-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="time">时间</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="schedule-input"
                />
              </div>
              <div className="form-group">
                <button type="submit" className="schedule-button">
                  添加日程
                </button>
              </div>
            </form>
          </div>

          {/* My Schedules Card */}
          <div className="schedule-card">
            <h2 className="schedule-card-title">我的日程</h2>
            {schedules.length === 0 ? (
              <div className="empty-schedule">
                <div className="empty-icon">📅</div>
                <p>暂无日程安排</p>
                <p>添加您的第一个日程，开始规划时间</p>
              </div>
            ) : (
              <div className="schedule-list">
                {schedules.map(schedule => (
                  <div key={schedule.id} className="schedule-item">
                    <div className="schedule-item-content">
                      <h3 className="schedule-item-title">{schedule.title}</h3>
                      {schedule.description && (
                        <p className="schedule-item-description">{schedule.description}</p>
                      )}
                      <p className="schedule-item-time">
                        <span className="schedule-item-date">{schedule.date}</span>
                        {schedule.time && (
                          <span className="schedule-item-time-value"> {schedule.time}</span>
                        )}
                      </p>
                    </div>
                    <button 
                      className="schedule-item-delete" 
                      onClick={() => handleDelete(schedule.id)}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
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

export default Schedule