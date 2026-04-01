import { useState, useEffect } from 'react'
import localforage from 'localforage'

function Events({ user }) {
  const [posts, setPosts] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })
  const [comments, setComments] = useState({})
  const [commentText, setCommentText] = useState({})
  
  // 消息系统状态
  const [activeTab, setActiveTab] = useState('posts') // 'posts' or 'messages'
  const [messages, setMessages] = useState([])
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [messageInput, setMessageInput] = useState('')
  const [notifications, setNotifications] = useState([])
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  
  // 联系人添加系统
  const [showAddContact, setShowAddContact] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [recommendedUsers, setRecommendedUsers] = useState([])
  const [scanCode, setScanCode] = useState('')
  
  // 联系人管理功能
  const [showContactDetails, setShowContactDetails] = useState(false)
  const [selectedContactForEdit, setSelectedContactForEdit] = useState(null)
  const [contactNote, setContactNote] = useState('')
  const [contactGroup, setContactGroup] = useState('默认')
  const [contactGroups, setContactGroups] = useState(['默认', '同学', '朋友', '家人'])

  useEffect(() => {
    loadPosts()
    loadComments()
    loadMessages()
    loadContacts()
    loadNotifications()
    simulateOnlineUsers()
    
    // 模拟实时消息更新
    const interval = setInterval(() => {
      checkForNewMessages()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const loadPosts = async () => {
    const allPosts = await localforage.getItem('communityPosts') || []
    setPosts(allPosts)
  }

  const loadComments = async () => {
    const allComments = await localforage.getItem('communityComments') || {}
    setComments(allComments)
  }

  const loadMessages = async () => {
    const allMessages = await localforage.getItem('messages') || []
    setMessages(allMessages)
  }

  const loadContacts = async () => {
    const allContacts = await localforage.getItem('contacts') || []
    setContacts(allContacts)
  }

  const loadNotifications = async () => {
    const allNotifications = await localforage.getItem('notifications') || []
    setNotifications(allNotifications)
  }

  const simulateOnlineUsers = () => {
    // 模拟在线用户
    const online = new Set(['user1', 'user2', 'user3'])
    setOnlineUsers(online)
  }

  const checkForNewMessages = async () => {
    // 模拟检查新消息
    const allMessages = await localforage.getItem('messages') || []
    if (allMessages.length > messages.length) {
      setMessages(allMessages)
      // 添加通知
      const newMessage = allMessages[allMessages.length - 1]
      if (newMessage.receiverId === user.id && newMessage.senderId !== user.id) {
        const newNotification = {
          id: Date.now(),
          type: 'message',
          content: `${newMessage.senderName} 给你发了一条新消息`,
          createdAt: new Date().toISOString()
        }
        const updatedNotifications = [...notifications, newNotification]
        setNotifications(updatedNotifications)
        await localforage.setItem('notifications', updatedNotifications)
      }
    }
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
    
    if (!formData.title || !formData.content) {
      alert('请填写标题和内容')
      return
    }

    const newPost = {
      id: Date.now(),
      authorId: user.id,
      authorName: user.username,
      ...formData,
      likes: [],
      comments: 0,
      createdAt: new Date().toISOString()
    }

    const updatedPosts = [...posts, newPost]
    setPosts(updatedPosts)
    await localforage.setItem('communityPosts', updatedPosts)
    
    // 重置表单
    setFormData({
      title: '',
      content: ''
    })
  }

  const handleLike = async (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        if (post.likes.includes(user.id)) {
          return {
            ...post,
            likes: post.likes.filter(id => id !== user.id)
          }
        } else {
          return {
            ...post,
            likes: [...post.likes, user.id]
          }
        }
      }
      return post
    })
    setPosts(updatedPosts)
    await localforage.setItem('communityPosts', updatedPosts)
  }

  const handleCommentChange = (postId, value) => {
    setCommentText(prev => ({
      ...prev,
      [postId]: value
    }))
  }

  const handleCommentSubmit = async (postId) => {
    const text = commentText[postId]
    if (!text) return

    const newComment = {
      id: Date.now(),
      postId,
      authorId: user.id,
      authorName: user.username,
      content: text,
      createdAt: new Date().toISOString()
    }

    const updatedComments = {
      ...comments,
      [postId]: [...(comments[postId] || []), newComment]
    }
    setComments(updatedComments)
    await localforage.setItem('communityComments', updatedComments)

    // 更新帖子的评论数
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: (comments[postId] || []).length + 1
        }
      }
      return post
    })
    setPosts(updatedPosts)
    await localforage.setItem('communityPosts', updatedPosts)

    // 清空评论输入
    setCommentText(prev => ({
      ...prev,
      [postId]: ''
    }))
  }

  // 消息发送功能
  const handleSendMessage = async () => {
    if (!messageInput || !selectedContact) return

    const newMessage = {
      id: Date.now(),
      senderId: user.id,
      senderName: user.username,
      receiverId: selectedContact.id,
      receiverName: selectedContact.name,
      content: messageInput,
      createdAt: new Date().toISOString(),
      read: false
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    await localforage.setItem('messages', updatedMessages)
    setMessageInput('')
  }

  // 计算用户参与统计
  const participationStats = {
    totalPosts: posts.length,
    userPosts: posts.filter(post => post.authorId === user.id).length,
    totalLikes: posts.reduce((sum, post) => sum + post.likes.length, 0),
    userLikes: posts.filter(post => post.likes.includes(user.id)).length,
    totalComments: Object.values(comments).reduce((sum, postComments) => sum + postComments.length, 0),
    userComments: Object.values(comments).reduce((sum, postComments) => 
      sum + postComments.filter(comment => comment.authorId === user.id).length, 0
    )
  }

  // 获取与选定联系人的聊天记录
  const getChatMessages = () => {
    if (!selectedContact) return []
    return messages.filter(msg => 
      (msg.senderId === user.id && msg.receiverId === selectedContact.id) || 
      (msg.senderId === selectedContact.id && msg.receiverId === user.id)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  // 检查用户是否在线
  const isUserOnline = (userId) => {
    return onlineUsers.has(userId)
  }

  // 联系人添加系统函数
  const handleSearchUsers = async (query) => {
    if (!query) {
      setSearchResults([])
      return
    }
    
    // 模拟搜索用户
    const users = await localforage.getItem('users') || []
    const results = users.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) && user.id !== user.id
    )
    setSearchResults(results)
  }

  const getRecommendedUsers = async () => {
    // 模拟推荐用户
    const users = await localforage.getItem('users') || []
    const recommendations = users
      .filter(u => u.id !== user.id && !contacts.some(c => c.id === u.id))
      .slice(0, 5)
    setRecommendedUsers(recommendations)
  }

  const addContact = async (newContact) => {
    // 检查是否已经是联系人
    if (contacts.some(c => c.id === newContact.id)) {
      alert('该用户已经是您的联系人')
      return
    }

    const updatedContacts = [...contacts, {
      id: newContact.id,
      name: newContact.username,
      avatar: newContact.username.charAt(0),
      addedAt: new Date().toISOString()
    }]
    setContacts(updatedContacts)
    await localforage.setItem('contacts', updatedContacts)
    setShowAddContact(false)
    alert('联系人添加成功')
  }

  const handleScanCode = () => {
    // 模拟扫码添加联系人
    if (scanCode) {
      // 假设扫码结果是用户ID
      alert('扫码功能暂未实现，模拟添加联系人成功')
      setScanCode('')
    }
  }

  // 联系人管理功能函数
  const openContactDetails = (contact) => {
    setSelectedContactForEdit(contact)
    setContactNote(contact.note || '')
    setContactGroup(contact.group || '默认')
    setShowContactDetails(true)
  }

  const saveContactDetails = async () => {
    if (!selectedContactForEdit) return

    const updatedContacts = contacts.map(contact => {
      if (contact.id === selectedContactForEdit.id) {
        return {
          ...contact,
          note: contactNote,
          group: contactGroup
        }
      }
      return contact
    })

    setContacts(updatedContacts)
    await localforage.setItem('contacts', updatedContacts)
    setShowContactDetails(false)
    setSelectedContactForEdit(null)
    alert('联系人信息更新成功')
  }

  const deleteContact = async (contactId) => {
    if (window.confirm('确定要删除这个联系人吗？')) {
      const updatedContacts = contacts.filter(contact => contact.id !== contactId)
      setContacts(updatedContacts)
      await localforage.setItem('contacts', updatedContacts)
      if (selectedContact && selectedContact.id === contactId) {
        setSelectedContact(null)
      }
      alert('联系人删除成功')
    }
  }

  const addNewGroup = (groupName) => {
    if (groupName && !contactGroups.includes(groupName)) {
      setContactGroups([...contactGroups, groupName])
    }
  }

  return (
    <div className="community-page">
      {/* 英雄区域 */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">社区互动</h1>
          <p className="hero-description">
            在这里与其他同学交流、分享想法和参与讨论
          </p>
        </div>
      </div>

      <div className="container">
        {/* 标签页切换 */}
        <div className="tab-container">
          <button 
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            社区动态
          </button>
          <button 
            className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            消息
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>
        </div>

        {activeTab === 'posts' ? (
          <>
            {/* 用户参与统计 */}
            <div className="stats-section">
              <h3 className="stats-title">我的参与统计</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">{participationStats.userPosts}</div>
                  <div className="stat-label">发布帖子</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{participationStats.userLikes}</div>
                  <div className="stat-label">获得点赞</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{participationStats.userComments}</div>
                  <div className="stat-label">发表评论</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{participationStats.totalPosts}</div>
                  <div className="stat-label">总帖子数</div>
                </div>
              </div>
            </div>

            {/* 发布新帖子 */}
            <div className="post-form-section">
              <h3 className="section-title">发布新帖子</h3>
              <form className="post-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="title">标题</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="请输入帖子标题"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="content">内容</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    placeholder="分享你的想法..."
                    rows="5"
                  ></textarea>
                </div>
                <button type="submit" className="submit-button">发布帖子</button>
              </form>
            </div>

            {/* 帖子列表 */}
            <div className="posts-section">
              <h3 className="section-title">社区动态</h3>
              {posts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <p>暂无帖子，快来发布第一条吧！</p>
                </div>
              ) : (
                <div className="posts-grid">
                  {posts.map(post => (
                    <div key={post.id} className="post-card">
                      <div className="post-header">
                        <div className="post-author">
                          <div className="author-avatar">{post.authorName.charAt(0)}</div>
                          <div className="author-info">
                            <div className="author-name">{post.authorName}</div>
                            <div className="post-time">
                              {new Date(post.createdAt).toLocaleString('zh-CN')}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="post-content">
                        <h4 className="post-title">{post.title}</h4>
                        <p className="post-text">{post.content}</p>
                      </div>
                      <div className="post-actions">
                        <button 
                          className={`action-button like-button ${post.likes.includes(user.id) ? 'liked' : ''}`}
                          onClick={() => handleLike(post.id)}
                        >
                          <span className="action-icon">❤️</span>
                          <span className="action-count">{post.likes.length}</span>
                        </button>
                        <div className="comment-section">
                          <div className="comment-input">
                            <input
                              type="text"
                              placeholder="写下你的评论..."
                              value={commentText[post.id] || ''}
                              onChange={(e) => handleCommentChange(post.id, e.target.value)}
                            />
                            <button 
                              className="comment-button"
                              onClick={() => handleCommentSubmit(post.id)}
                            >
                              发送
                            </button>
                          </div>
                          <div className="comments-list">
                            {comments[post.id] && comments[post.id].map(comment => (
                              <div key={comment.id} className="comment-item">
                                <div className="comment-author">{comment.authorName}</div>
                                <div className="comment-content">{comment.content}</div>
                                <div className="comment-time">
                                  {new Date(comment.createdAt).toLocaleString('zh-CN')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="messages-section">
            <div className="messages-container">
              {/* 联系人列表 */}
              <div className="contacts-sidebar">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 className="sidebar-title">联系人</h3>
                  <button 
                    className="add-contact-button"
                    onClick={() => {
                      setShowAddContact(true)
                      getRecommendedUsers()
                    }}
                  >
                    + 添加
                  </button>
                </div>
                
                {/* 添加联系人界面 */}
                {showAddContact && (
                  <div className="add-contact-modal">
                    <h4>添加联系人</h4>
                    
                    {/* 搜索用户 */}
                    <div className="search-section">
                      <input
                        type="text"
                        placeholder="搜索用户..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          handleSearchUsers(e.target.value)
                        }}
                      />
                      {searchResults.length > 0 && (
                        <div className="search-results">
                          {searchResults.map(result => (
                            <div 
                              key={result.id} 
                              className="search-result-item"
                              onClick={() => addContact(result)}
                            >
                              <div className="result-avatar">{result.username.charAt(0)}</div>
                              <div className="result-name">{result.username}</div>
                              <button className="add-button">添加</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* 推荐用户 */}
                    <div className="recommendations-section">
                      <h5>推荐用户</h5>
                      {recommendedUsers.map(rec => (
                        <div 
                          key={rec.id} 
                          className="recommendation-item"
                          onClick={() => addContact(rec)}
                        >
                          <div className="result-avatar">{rec.username.charAt(0)}</div>
                          <div className="result-name">{rec.username}</div>
                          <button className="add-button">添加</button>
                        </div>
                      ))}
                    </div>
                    
                    {/* 扫码添加 */}
                    <div className="scan-section">
                      <h5>扫码添加</h5>
                      <input
                        type="text"
                        placeholder="输入二维码内容..."
                        value={scanCode}
                        onChange={(e) => setScanCode(e.target.value)}
                      />
                      <button 
                        className="scan-button"
                        onClick={handleScanCode}
                      >
                        确认扫码
                      </button>
                    </div>
                    
                    <button 
                      className="cancel-button"
                      onClick={() => setShowAddContact(false)}
                    >
                      取消
                    </button>
                  </div>
                )}
                
                {/* 联系人详情编辑界面 */}
                {showContactDetails && selectedContactForEdit && (
                  <div className="contact-details-modal">
                    <h4>编辑联系人</h4>
                    
                    <div className="contact-detail-section">
                      <label>联系人名称</label>
                      <input
                        type="text"
                        value={selectedContactForEdit.name}
                        disabled
                      />
                    </div>
                    
                    <div className="contact-detail-section">
                      <label>分组</label>
                      <select
                        value={contactGroup}
                        onChange={(e) => setContactGroup(e.target.value)}
                      >
                        {contactGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="添加新分组..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addNewGroup(e.target.value)
                            e.target.value = ''
                          }
                        }}
                      />
                    </div>
                    
                    <div className="contact-detail-section">
                      <label>备注</label>
                      <textarea
                        value={contactNote}
                        onChange={(e) => setContactNote(e.target.value)}
                        placeholder="添加备注信息..."
                        rows="3"
                      ></textarea>
                    </div>
                    
                    <div className="contact-detail-actions">
                      <button 
                        className="save-button"
                        onClick={saveContactDetails}
                      >
                        保存
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => {
                          setShowContactDetails(false)
                          setSelectedContactForEdit(null)
                        }}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 联系人列表 */}
                <div className="contacts-list">
                  {contacts.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">👥</div>
                      <p>暂无联系人，快来添加吧！</p>
                    </div>
                  ) : (
                    contacts.map(contact => (
                      <div 
                        key={contact.id} 
                        className={`contact-item ${selectedContact && selectedContact.id === contact.id ? 'active' : ''}`}
                        onClick={() => setSelectedContact(contact)}
                      >
                        <div className="contact-avatar">
                          {contact.name.charAt(0)}
                          {isUserOnline(contact.id) && <span className="online-indicator"></span>}
                        </div>
                        <div className="contact-info">
                          <div className="contact-name">{contact.name}</div>
                          <div className="contact-status">
                            {isUserOnline(contact.id) ? '在线' : '离线'}
                            {contact.group && <span className="contact-group">{contact.group}</span>}
                          </div>
                        </div>
                        <div className="contact-actions">
                          <button 
                            className="contact-action-button edit"
                            onClick={(e) => {
                              e.stopPropagation()
                              openContactDetails(contact)
                            }}
                          >
                            编辑
                          </button>
                          <button 
                            className="contact-action-button delete"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteContact(contact.id)
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* 聊天区域 */}
              <div className="chat-area">
                {selectedContact ? (
                  <>
                    <div className="chat-header">
                      <div className="chat-contact">
                        <div className="contact-avatar">
                          {selectedContact.name.charAt(0)}
                          {isUserOnline(selectedContact.id) && <span className="online-indicator"></span>}
                        </div>
                        <div className="contact-info">
                          <div className="contact-name">{selectedContact.name}</div>
                          <div className="contact-status">
                            {isUserOnline(selectedContact.id) ? '在线' : '离线'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="chat-messages">
                      {getChatMessages().map(message => (
                        <div 
                          key={message.id} 
                          className={`message-item ${message.senderId === user.id ? 'sent' : 'received'}`}
                        >
                          <div className="message-content">
                            <div className="message-text">{message.content}</div>
                            <div className="message-time">
                              {new Date(message.createdAt).toLocaleTimeString('zh-CN')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="chat-input">
                      <input
                        type="text"
                        placeholder="输入消息..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button 
                        className="send-button"
                        onClick={handleSendMessage}
                      >
                        发送
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="empty-chat">
                    <div className="empty-icon">💬</div>
                    <p>请选择一个联系人开始聊天</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Events