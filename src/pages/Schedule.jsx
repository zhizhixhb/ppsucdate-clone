import { useState, useEffect } from 'react'
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
    <div className="container">
      <h2>日程安排</h2>
      
      <div className="card">
        <h3>添加新日程</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">标题</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
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
            />
          </div>
          <div className="form-group">
            <button type="submit">添加日程</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>我的日程</h3>
        {schedules.length === 0 ? (
          <p>暂无日程</p>
        ) : (
          <ul>
            {schedules.map(schedule => (
              <li key={schedule.id} style={{ marginBottom: '10px', padding: '10px', borderBottom: '1px solid #eee' }}>
                <h4>{schedule.title}</h4>
                <p>{schedule.description}</p>
                <p>{schedule.date} {schedule.time}</p>
                <button className="btn btn-secondary" onClick={() => handleDelete(schedule.id)}>
                  删除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Schedule