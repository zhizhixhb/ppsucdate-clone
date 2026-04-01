import { useEffect } from 'react'

function Contact() {
  useEffect(() => {
    // 设置页面标题
    document.title = '联系我们 - PPSUC Date'
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
            <h1 className="main-title">联系我们</h1>
            <p className="main-subtitle">PPSUC Date</p>
            <p className="main-description">
              如有任何问题或建议，欢迎随时联系我们
            </p>
          </div>
        </div>
      </div>

      {/* 联系内容 */}
      <div className="about-content">
        <div className="container">
          {/* 联系信息 */}
          <section className="contact-section">
            <div className="contact-content">
              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div className="contact-info">
                  <h3 className="contact-title">办公地址</h3>
                  <p className="contact-detail">
                    <a href="https://maps.google.com/?q=中国人民公安大学团河校区10号楼115" target="_blank" rel="noopener noreferrer">
                      中国人民公安大学团河校区10号楼115
                    </a>
                  </p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div className="contact-info">
                  <h3 className="contact-title">联系电话</h3>
                  <p className="contact-detail">
                    <a href="tel:13379114429">13379114429</a>
                  </p>
                </div>
              </div>
            </div>
            
            {/* 联系表单 */}
            <div className="contact-form-section">
              <h3 className="form-title">发送消息</h3>
              <form className="contact-form" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const message = {
                  name: formData.get('name'),
                  email: formData.get('email'),
                  subject: formData.get('subject'),
                  message: formData.get('message')
                };
                
                // 模拟表单提交
                console.log('Form submitted:', message);
                alert('消息已发送！我们会尽快回复您。');
                e.target.reset();
              }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">姓名</label>
                    <input type="text" id="name" name="name" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">邮箱</label>
                    <input type="email" id="email" name="email" required />
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="subject">主题</label>
                    <input type="text" id="subject" name="subject" required />
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="message">消息</label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                  </div>
                </div>
                <button type="submit" className="submit-button">发送消息</button>
              </form>
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

export default Contact