import { useState, useRef, useEffect } from 'react'

function CollegeSelector({ 
  value, 
  onChange, 
  label = '学院', 
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredColleges, setFilteredColleges] = useState([])
  const selectorRef = useRef(null)

  // 学院数据
  const colleges = [
    '计算机学院',
    '电子工程学院',
    '机械工程学院',
    '经济管理学院',
    '人文学院',
    '外国语学院',
    '法学院',
    '理学院',
    '艺术学院',
    '体育学院',
    '生命科学学院',
    '建筑学院',
    '土木工程学院',
    '化学化工学院',
    '材料科学与工程学院',
    '环境科学与工程学院',
    '能源与动力工程学院',
    '航空航天学院',
    '海洋学院',
    '医学院',
    '药学院',
    '公共卫生学院',
    '护理学院',
    '教育学院',
    '马克思主义学院',
    '国际教育学院',
    '继续教育学院',
    '研究生院'
  ]

  useEffect(() => {
    setFilteredColleges(colleges)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = colleges.filter(college => 
        college.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredColleges(filtered)
    } else {
      setFilteredColleges(colleges)
    }
  }, [searchTerm])

  const handleCollegeSelect = (college) => {
    onChange(college)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={`college-selector ${className}`} ref={selectorRef}>
      {label && <label className="college-selector-label">{label}</label>}
      <div className="college-search">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={() => setIsOpen(!isOpen)}
          placeholder="搜索学院..."
        />
        <div className="college-search-icon">🔍</div>
      </div>
      {isOpen && (
        <div className="college-options">
          {filteredColleges.length > 0 ? (
            filteredColleges.map((college) => (
              <div
                key={college}
                className={`college-option ${value === college ? 'selected' : ''}`}
                onClick={() => handleCollegeSelect(college)}
              >
                {college}
              </div>
            ))
          ) : (
            <div className="college-option">
              未找到匹配的学院
            </div>
          )}
        </div>
      )}
      {value && (
        <div className="college-selected">
          已选择：{value}
        </div>
      )}
    </div>
  )
}

export default CollegeSelector