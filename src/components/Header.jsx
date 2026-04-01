import { Link } from 'react-router-dom'

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <h1>PPSUC Date Clone</h1>
      <nav className="nav">
        {user ? (
          <>
            <Link to="/">首页</Link>
            <Link to="/profile">个人信息</Link>
            <Link to="/schedule">日程安排</Link>
            <Link to="/messages">消息</Link>
            <Link to="/events">活动</Link>
            <button className="btn btn-secondary" onClick={onLogout}>
              退出登录
            </button>
          </>
        ) : (
          <>
            <Link to="/login">登录</Link>
            <Link to="/register">注册</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header