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

  useEffect(() => {
    loadPosts()
    loadComments()
  }, [])

  const loadPosts = async () => {
    const allPosts = await localforage.getItem('communityPosts') || []
    setPosts(allPosts)
  }

  const loadComments = async () => {
    const allComments = await localforage.getItem('communityComments') || {}
    setComments(allComments)
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
      </div>
    </div>
  )
}

export default Events