import { useState, useEffect } from 'react'
import localforage from 'localforage'

function Events({ user }) {
  const [events, setEvents] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
  })
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    const allEvents = await localforage.getItem('events') || []
    setEvents(allEvents)
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
    
    if (!formData.title || !formData.date || !formData.location) {
      alert('请填写标题、日期和地点')
      return
    }

    const newEvent = {
      id: Date.now(),
      organizerId: user.id,
      organizerName: user.username,
      ...formData,
      participants: [user.id],
      createdAt: new Date().toISOString()
    }

    const updatedEvents = [...events, newEvent]
    setEvents(updatedEvents)
    await localforage.setItem('events', updatedEvents)
    
    // 重置表单
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: ''
    })
  }

  const handleJoinEvent = async (eventId) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        if (!event.participants.includes(user.id)) {
          return {
            ...event,
            participants: [...event.participants, user.id]
          }
        }
      }
      return event
    })
    setEvents(updatedEvents)
    await localforage.setItem('events', updatedEvents)
    alert('成功参与活动')
  }

  const handleLeaveEvent = async (eventId) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          participants: event.participants.filter(id => id !== user.id)
        }
      }
      return event
    })
    setEvents(updatedEvents)
    await localforage.setItem('events', updatedEvents)
    alert('已退出活动')
  }

  return (
    <div className="container">
      <h2>活动</h2>
      
      <div className="card">
        <h3>发布新活动</h3>
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
            <label htmlFor="location">地点</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit">发布活动</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>活动列表</h3>
        {events.length === 0 ? (
          <p>暂无活动</p>
        ) : (
          <ul>
            {events.map(event => (
              <li key={event.id} style={{ marginBottom: '10px', padding: '10px', borderBottom: '1px solid #eee' }}>
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <p>时间：{event.date} {event.time}</p>
                <p>地点：{event.location}</p>
                <p>组织者：{event.organizerName}</p>
                <p>参与人数：{event.participants.length}</p>
                {event.participants.includes(user.id) ? (
                  <button className="btn btn-secondary" onClick={() => handleLeaveEvent(event.id)}>
                    退出活动
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => handleJoinEvent(event.id)}>
                    参与活动
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Events