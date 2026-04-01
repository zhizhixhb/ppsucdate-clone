import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import localforage from 'localforage'

function Messages({ user }) {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      loadMessages()
    }
  }, [selectedUser, user])

  const loadUsers = async () => {
    const allUsers = await localforage.getItem('users') || []
    const otherUsers = allUsers.filter(u => u.id !== user.id)
    setUsers(otherUsers)
  }

  const loadMessages = async () => {
    const chatId = [user.id, selectedUser.id].sort().join('_')
    const chatMessages = await localforage.getItem(`messages_${chatId}`) || []
    setMessages(chatMessages)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return

    const chatId = [user.id, selectedUser.id].sort().join('_')
    const message = {
      id: Date.now(),
      senderId: user.id,
      receiverId: selectedUser.id,
      content: newMessage,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)
    await localforage.setItem(`messages_${chatId}`, updatedMessages)
    setNewMessage('')
  }

  return (
    <div className="messages-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="brand-highlight">消息中心</span>
          </h1>
          <p className="hero-subtitle">保持联系</p>
          <p className="hero-description">
            与朋友和匹配的人进行实时交流，建立深厚的友谊
          </p>
        </div>
      </section>

      {/* Messages Section */}
      <section className="messages-section">
        <div className="container">
          <div className="messages-container">
            {/* Contacts Sidebar */}
            <div className="contacts-sidebar">
              <h2 className="contacts-title">联系人</h2>
              {users.length === 0 ? (
                <div className="empty-contacts">
                  <div className="empty-icon">👥</div>
                  <p>暂无联系人</p>
                  <p>开始与其他用户互动吧</p>
                </div>
              ) : (
                <div className="contacts-list">
                  {users.map(otherUser => (
                    <div 
                      key={otherUser.id} 
                      className={`contact-item ${selectedUser?.id === otherUser.id ? 'active' : ''}`}
                      onClick={() => setSelectedUser(otherUser)}
                    >
                      <div className="contact-info">
                        <h3 className="contact-name">{otherUser.username}</h3>
                        {otherUser.mbti && (
                          <span className="contact-mbti">{otherUser.mbti}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="chat-area">
              {selectedUser ? (
                <>
                  <div className="chat-header">
                    <h2 className="chat-title">与 {selectedUser.username} 聊天</h2>
                    {selectedUser.mbti && (
                      <span className="chat-mbti">{selectedUser.mbti}</span>
                    )}
                  </div>
                  <div className="chat-messages">
                    {messages.map(message => (
                      <div 
                        key={message.id} 
                        className={`message ${message.senderId === user.id ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          <p>{message.content}</p>
                          <span className="message-time">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="message-input-container">
                    <input
                      type="text"
                      className="message-input"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="输入消息..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                      className="message-send-button" 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      发送
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-chat-selected">
                  <div className="empty-icon">💬</div>
                  <h3>请选择联系人</h3>
                  <p>选择一个联系人开始聊天</p>
                </div>
              )}
            </div>
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

export default Messages