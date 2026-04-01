import { useEffect, useState } from 'react'
import localforage from 'localforage'

function TestAdmin({ user, setUser }) {
  const [users, setUsers] = useState([])
  const [currentUserFromStorage, setCurrentUserFromStorage] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const usersData = await localforage.getItem('users') || []
    setUsers(usersData)
    
    const currentUserData = await localforage.getItem('user')
    setCurrentUserFromStorage(currentUserData)
  }

  const makeAdmin = async () => {
    if (!user) return

    // 直接修改当前用户的 isAdmin 状态
    const updatedUser = { ...user, isAdmin: true }
    setUser(updatedUser)
    await localforage.setItem('user', updatedUser)

    // 更新 users 数组中的用户
    const usersData = await localforage.getItem('users') || []
    const updatedUsers = usersData.map(u => {
      if (u.id === user.id) {
        return { ...u, isAdmin: true }
      }
      return u
    })
    await localforage.setItem('users', updatedUsers)

    alert('您已成功设置为管理员！')
    loadData()
  }

  return (
    <div className="container">
      <div className="card">
        <h2>管理员状态测试</h2>
        
        <h3>当前用户状态</h3>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        
        <h3>本地存储中的用户</h3>
        <pre>{JSON.stringify(currentUserFromStorage, null, 2)}</pre>
        
        <h3>用户数组中的当前用户</h3>
        {users.find(u => u.id === user?.id) ? (
          <pre>{JSON.stringify(users.find(u => u.id === user.id), null, 2)}</pre>
        ) : (
          <p>未找到当前用户</p>
        )}
        
        <button onClick={makeAdmin} className="btn btn-primary">
          设置为管理员
        </button>
      </div>
    </div>
  )
}

export default TestAdmin