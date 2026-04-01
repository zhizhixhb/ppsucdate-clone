import { useEffect } from 'react'
import localforage from 'localforage'
import { useNavigate } from 'react-router-dom'

function AdminSetup({ user, setUser }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const setupAdmin = async () => {
      try {
        // 获取所有用户
        const users = await localforage.getItem('users') || []
        
        // 找到当前用户并设置为管理员
        const updatedUsers = users.map(u => {
          if (u.id === user.id) {
            return { ...u, isAdmin: true }
          }
          return u
        })
        
        // 保存更新后的用户数据
        await localforage.setItem('users', updatedUsers)
        
        // 更新当前用户状态
        const updatedUser = { ...user, isAdmin: true }
        setUser(updatedUser)
        await localforage.setItem('user', updatedUser)
        
        alert('您已成功设置为管理员！')
        navigate('/admin')
      } catch (error) {
        console.error('设置管理员失败:', error)
        alert('设置管理员失败，请重试')
        navigate('/')
      }
    }

    setupAdmin()
  }, [user, setUser, navigate])

  return (
    <div className="container">
      <div className="card">
        <h2>设置管理员权限</h2>
        <p>正在设置管理员权限，请稍候...</p>
      </div>
    </div>
  )
}

export default AdminSetup