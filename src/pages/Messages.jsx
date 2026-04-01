import { useState, useEffect } from 'react'
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
    <div className="container">
      <h2>消息</h2>
      <div className="message-container">
        <div style={{ flex: 1, maxWidth: '300px' }}>
          <h3>联系人</h3>
          {users.length === 0 ? (
            <p>暂无联系人</p>
          ) : (
            <ul>
              {users.map(otherUser => (
                <li 
                  key={otherUser.id} 
                  style={{ 
                    padding: '10px', 
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    backgroundColor: selectedUser?.id === otherUser.id ? '#f0f8ff' : 'white'
                  }}
                  onClick={() => setSelectedUser(otherUser)}
                >
                  {otherUser.username}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ flex: 2 }}>
          <h3>{selectedUser ? `与 ${selectedUser.username} 聊天` : '请选择联系人'}</h3>
          {selectedUser ? (
            <div className="chat-area">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  style={{ 
                    marginBottom: '10px', 
                    padding: '10px', 
                    borderRadius: '8px',
                    backgroundColor: message.senderId === user.id ? '#e3f2fd' : '#f5f5f5',
                    alignSelf: message.senderId === user.id ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    marginLeft: message.senderId === user.id ? 'auto' : '0'
                  }}
                >
                  <p style={{ margin: '0' }}>{message.content}</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>选择一个联系人开始聊天</p>
          )}
          {selectedUser && (
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="输入消息..."
              />
              <button className="btn btn-primary" onClick={handleSendMessage}>
                发送
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages