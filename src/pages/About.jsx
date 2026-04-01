import { useEffect } from 'react'

function About() {
  useEffect(() => {
    // 设置页面标题
    document.title = '关于我们 - PPSUC Date'
  }, [])

  return (
    <div className="about-page">
      {/* 主背景 */}
      <div className="main-background">
        <div className="background-overlay">
          {/* 顶部导航 */}
          <nav className="sjtudate-nav">
            <div className="nav-content">
              <span className="nav-text">PPSUC Date</span>
            </div>
          </nav>

          {/* 主内容 */}
          <div className="main-content">
            <h1 className="main-title">关于我们</h1>
            <p className="main-subtitle">PPSUC Date</p>
            <p className="main-description">
              专为公安大学学子打造的校园社交平台
            </p>
          </div>
        </div>
      </div>

      {/* 关于内容 */}
      <div className="about-content">
        <div className="container">
          {/* 我们的故事 */}
          <section className="about-section">
            <h2 className="section-title">我们的故事</h2>
            <div className="story-content">
              <p>
                PPSUC Date 的起点，是斯坦福大学的 Date Drop 给我们的一次启发。
              </p>
              <p>
                我们几个公大学子在聊这件事的时候，开始认真思考身边人的情况：
                很多人渴望进入一段亲密关系，却苦于没有契机、没有动力，
                或者无法打破日常社交圈，找不到"最适合自己"的那个人。
              </p>
              <p>
                日复一日于实验室、食堂、宿舍、教室或者自己的小圈子中，
                偶尔认识了一个新朋友，却发现聊不到一起，或者在某些根本性的问题上观念相左。
              </p>
              <p>
                所以我们做了 PPSUC Date——一个由深度问卷与科学匹配算法驱动的、免费的、安全的恋爱匹配平台。
                我们不想做一个让您无休止左滑右滑的社交 App，
                我们的初衷是认真地帮您找到一个三观契合的人，把 TA 介绍给您。
                剩下的故事，由你们自己决定。
              </p>
            </div>
          </section>

          {/* 我们的团队 */}
          <section className="team-section">
            <h2 className="section-title">我们的团队</h2>
            <p className="team-subtitle">按首字母排序</p>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-avatar">徐</div>
                <h3 className="member-name">徐海博</h3>
                <p className="member-info">中国人民公安大学 · 网络安全</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">王</div>
                <h3 className="member-name">王久畅</h3>
                <p className="member-info">中国人民公安大学 · 网络安全</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">刘</div>
                <h3 className="member-name">刘超</h3>
                <p className="member-info">西南财经大学</p>
              </div>
            </div>
            <p className="team-note">
              PPSUC Date 还在成长，我们也期待和更多志同道合的伙伴一起把它做得更完整。
              如果您在产品、设计、运营或市场方向有经验，认同我们在做的这件事，欢迎您的加入。
            </p>
          </section>

          {/* 项目背景 */}
          <section className="background-section">
            <h2 className="section-title">项目背景</h2>
            <div className="background-content">
              <p>
                在当今快节奏的校园生活中，很多学生都面临着社交圈子狭窄、难以找到志同道合的朋友或伴侣的问题。
                特别是在公安大学这样的特殊环境中，学生们的学习和训练任务繁重，社交时间有限，
                更需要一个专门为他们设计的社交平台。
              </p>
              <p>
                我们希望通过 PPSUC Date，为公安大学的学子们搭建一个安全、可靠、高效的社交桥梁，
                帮助他们找到三观契合的朋友或伴侣，丰富校园生活，促进人际交流。
              </p>
            </div>
          </section>

          {/* 开发理念 */}
          <section className="philosophy-section">
            <h2 className="section-title">开发理念</h2>
            <div className="philosophy-content">
              <div className="philosophy-item">
                <div className="philosophy-icon">🎯</div>
                <h3 className="philosophy-title">精准匹配</h3>
                <p className="philosophy-description">
                  基于深度问卷和科学的匹配算法，为用户找到最契合的伙伴
                </p>
              </div>
              <div className="philosophy-item">
                <div className="philosophy-icon">🔒</div>
                <h3 className="philosophy-title">安全可靠</h3>
                <p className="philosophy-description">
                  严格的身份验证，保护用户隐私，营造安全的社交环境
                </p>
              </div>
              <div className="philosophy-item">
                <div className="philosophy-icon">❤️</div>
                <h3 className="philosophy-title">真诚交友</h3>
                <p className="philosophy-description">
                  鼓励用户真诚交流，建立深度连接，避免 superficial 的社交
                </p>
              </div>
              <div className="philosophy-item">
                <div className="philosophy-icon">🎓</div>
                <h3 className="philosophy-title">校园专属</h3>
                <p className="philosophy-description">
                  专为公安大学学子打造，了解校园文化，满足学生需求
                </p>
              </div>
            </div>
          </section>


        </div>
      </div>

      {/* 页脚 */}
      <footer className="sjtudate-footer">
        <div className="container">
          <p className="footer-text">© 2024 PPSUC Date. 保留所有权利。</p>
          <div className="footer-links">
            <a href="#" className="footer-link">关于我们</a>
            <a href="#" className="footer-link">隐私政策</a>
            <a href="#" className="footer-link">使用条款</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default About