import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import localforage from 'localforage'

function Home() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({})
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' })
  const [nextRevealDate, setNextRevealDate] = useState('')
  const [visitorCount, setVisitorCount] = useState(0)
  const [isCounting, setIsCounting] = useState(false)
  
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const currentUser = await localforage.getItem('user')
    setUser(currentUser)

    const users = await localforage.getItem('users') || []
    const events = await localforage.getItem('events') || []
    
    setStats({
      users: users.length,
      events: events.length,
      matches: Math.floor(users.length * 0.7) // 模拟匹配数据
    })
  }
  
  // 处理用户访问计数
  useEffect(() => {
    const handleVisitorCount = async () => {
      // 检查用户是否已经访问过（防刷机制）
      const hasVisited = localStorage.getItem('ppsucdate_visited')
      
      if (!hasVisited) {
        // 标记用户已访问
        localStorage.setItem('ppsucdate_visited', 'true')
        
        // 获取当前访问计数
        let count = await localforage.getItem('visitorCount') || 0
        
        // 增加计数
        count += 1
        
        // 保存到本地存储
        await localforage.setItem('visitorCount', count)
        
        // 触发计数动画
        setIsCounting(true)
        setVisitorCount(0)
        
        // 动画效果：从0计数到实际值
        const duration = 1500 // 动画持续时间（毫秒）
        const startTime = Date.now()
        
        const updateCount = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          
          // 使用缓动函数使动画更自然
          const easeOutQuad = 1 - (1 - progress) * (1 - progress)
          const currentCount = Math.floor(count * easeOutQuad)
          
          setVisitorCount(currentCount)
          
          if (progress < 1) {
            requestAnimationFrame(updateCount)
          } else {
            setVisitorCount(count)
            setIsCounting(false)
          }
        }
        
        requestAnimationFrame(updateCount)
      } else {
        // 如果用户已经访问过，直接获取当前计数
        const count = await localforage.getItem('visitorCount') || 0
        setVisitorCount(count)
      }
    }
    
    handleVisitorCount()
  }, [])

  useEffect(() => {
    // 计算下一个周五晚上8点的时间
    const calculateNextFriday8pm = () => {
      const now = new Date()
      const nextFriday = new Date(now)
      
      // 计算距离下一个周五的天数
      const dayOfWeek = now.getDay() // 0-6，0是周日
      const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 12 - dayOfWeek
      
      nextFriday.setDate(now.getDate() + daysUntilFriday)
      nextFriday.setHours(20, 0, 0, 0)
      
      return nextFriday
    }

    // 更新倒计时
    const updateCountdown = () => {
      const nextReveal = calculateNextFriday8pm()
      const now = new Date()
      const timeLeft = nextReveal - now
      
      if (timeLeft <= 0) {
        // 如果时间已到，显示00:00:00:00
        setCountdown({ days: '00', hours: '00', minutes: '00', seconds: '00' })
      } else {
        // 计算天、时、分、秒
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)
        
        // 更新状态
        setCountdown({
          days: days.toString().padStart(2, '0'),
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        })
      }
      
      // 更新下次揭晓日期
      const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' }
      setNextRevealDate(nextReveal.toLocaleString('zh-CN', options))
    }

    // 初始更新
    updateCountdown()
    
    // 每秒更新一次
    const interval = setInterval(updateCountdown, 1000)
    
    // 清理函数
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="home-page">
      {/* 主背景 */}
      <div className="main-background">
        <div className="background-overlay">
          {/* 顶部导航 */}
          <nav className="sjtudate-nav">
            <div className="nav-content">
              <span className="nav-text">
                <span className="count-text">已有 </span>
                <span className={`visitor-count ${isCounting ? 'counting' : ''}`}>
                  {visitorCount.toLocaleString()}
                </span>
                <span className="count-text"> 位同学加入</span>
              </span>
            </div>
          </nav>

          {/* 主内容 */}
          <div className="main-content">
            <h1 className="main-title animate-fade-in-up-1">让一段缘分值得等待。</h1>
            <p className="main-subtitle animate-fade-in-up-2">For ppsuc.edu.cn</p>
            <p className="main-description animate-fade-in-up-3">
              只需填写一份深度问卷，每周五晚八点，<br />
              您将收到匹配结果，并附上我们认为你们会合拍的理由。
            </p>
            
            {/* 操作按钮 */}
            <div className="action-buttons animate-fade-in-up-4">
              {!user ? (
                <Link to="/register" className="sjtudate-btn">
                  立即注册
                </Link>
              ) : (
                <Link to="/interests" className="sjtudate-btn">
                  开始匹配
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 倒计时区域 */}
      <div className="countdown-section animate-fade-in-up-5">
        <div className="container">
          <div className="countdown-content">
            <h2 className="countdown-section-title animate-fade-in-up-6">距下次配对揭晓</h2>
            <div className="countdown-timer animate-fade-in-up-7">
              <span className="countdown-digit">{countdown.days}</span>
              <span className="countdown-separator">天</span>
              <span className="countdown-digit">{countdown.hours}</span>
              <span className="countdown-separator">时</span>
              <span className="countdown-digit">{countdown.minutes}</span>
              <span className="countdown-separator">分</span>
              <span className="countdown-digit">{countdown.seconds}</span>
              <span className="countdown-separator">秒</span>
            </div>
            <div className="countdown-date animate-fade-in-up-8">
              {nextRevealDate}
            </div>
          </div>
        </div>
      </div>

      {/* 步骤说明 */}
      <div className="steps-section animate-fade-in">
        <div className="container">
          <div className="steps-grid">
            <div className="step-item animate-fade-in-up-1">
              <div className="step-number">01</div>
              <h3 className="step-title">填写一份深度问卷</h3>
              <p className="step-description">
                让我们充分了解您的价值观、情感风格、生活方式，让算法为您找到最契合的人。
              </p>
            </div>
            <div className="step-item animate-fade-in-up-2">
              <div className="step-number">02</div>
              <h3 className="step-title">每周五晚八点，打开信封</h3>
              <p className="step-description">
                收到对方的昵称、匹配度，以及我们认为你们会合拍的理由。点击「联系 TA」，我们将为您向对方发送简短的讯息，并向您提供对方的邮箱地址。
              </p>
            </div>
            <div className="step-item animate-fade-in-up-3">
              <div className="step-number">03</div>
              <h3 className="step-title">去见见 TA 吧！</h3>
              <p className="step-description">
                剩下的交给你们自己，或许你们可以见面、散步、聊天，当然，一起约图也可以。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 平台特点 */}
      <div className="features-section animate-fade-in">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item animate-fade-in-up-1">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">每周一次</h3>
              <p className="feature-description">
                没有"左滑右滑"。每周五晚八点统一揭晓，一周至多一次配对。
              </p>
            </div>
            <div className="feature-item animate-fade-in-up-2">
              <div className="feature-icon">💡</div>
              <h3 className="feature-title">精准匹配</h3>
              <p className="feature-description">
                基于价值观、情感风格、生活方式等契合度研究与合理的匹配算法——不只看相似，也捕捉互补的差异。
              </p>
            </div>
            <div className="feature-item animate-fade-in-up-3">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">隐私优先</h3>
              <p className="feature-description">
                PPSUC Date 不是公开的社交平台。任何人除每周五晚上收到匹配对象的信息（包括昵称、匹配度、共同点）外，只能看到与自己有关的信息。
              </p>
            </div>
            <div className="feature-item animate-fade-in-up-4">
              <div className="feature-icon">🎓</div>
              <h3 className="feature-title">仅限公大</h3>
              <p className="feature-description">
                仅支持 @ppsuc.edu.cn 邮箱注册。彼此真诚，互相尊重。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 常见问题 */}
      <div className="faq-section animate-fade-in">
        <div className="container">
          <h2 className="faq-title animate-fade-in-up-1">常见问题</h2>
          <div className="faq-content">
            <p className="faq-question animate-fade-in-up-2">PPSUC Date 是什么？</p>
            <p className="faq-answer animate-fade-in-up-3">
              PPSUC Date 是一个恋爱（date）匹配平台。我们的问卷和算法都围绕恋爱契合度设计，初衷是帮您找到"最适合自己"的那个人。当然，缘分的形式不止一种——也许你会在这里遇到志同道合的好朋友，我们同样乐见其成。
            </p>
            
            <p className="faq-question animate-fade-in-up-4">如何使用？</p>
            <p className="faq-answer animate-fade-in-up-5">
              用公大邮箱注册，花 10 分钟填写一份关于您的价值观和生活方式的问卷，并「确认参与」，然后等待。每周五晚八点，您将收到一封信封，附有 TA 的昵称、匹配度，以及我们认为你们会合拍的理由。如果您选择联系 TA，双方将各自收到对方的邮箱——接下来的流程，由你们自己决定。
            </p>
            
            <p className="faq-question animate-fade-in-up-6">匹配算法是怎样的？</p>
            <p className="faq-answer animate-fade-in-up-7">
              我们的算法借鉴了价值观契合度研究、五大人格特质理论和社会心理学成果。它不只寻找相似的人，也会捕捉互补的差异。
            </p>
            
            <p className="faq-question animate-fade-in-up-8">我的数据安全吗？</p>
            <p className="faq-answer animate-fade-in-up-9">
              我们绝不出售您的数据。您的问卷答案仅用于匹配，且在数据库中以随机 ID 存储，与您的邮箱地址分开保存——即使是维护团队，也无法直接将两者关联起来。
            </p>
          </div>
        </div>
      </div>

      {/* 底部CTA */}
      <div className="cta-section animate-fade-in">
        <div className="container">
          <h2 className="cta-title animate-fade-in-up-1">准备好了吗？</h2>
          <p className="cta-subtitle animate-fade-in-up-2">每周五晚八点，为你揭晓最契合的 TA。</p>
          <div className="animate-fade-in-up-3">
            {!user ? (
              <Link to="/register" className="sjtudate-btn">
                立即注册
              </Link>
            ) : (
              <Link to="/interests" className="sjtudate-btn">
                开始匹配
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="sjtudate-footer">
        <div className="container">
          <p className="footer-text">© 2024 PPSUC Date. 保留所有权利。</p>
          <div className="footer-links">
            <Link to="#" className="footer-link">关于我们</Link>
            <Link to="#" className="footer-link">隐私政策</Link>
            <Link to="#" className="footer-link">使用条款</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home