import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import localforage from 'localforage'

function Interests({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('interests') // 'interests', 'mbti', 'values', 'lifestyle'
  const [interests, setInterests] = useState({
    hobbies: [],
    sports: [],
    music: [],
    movies: [],
    books: [],
    food: [],
    travel: [],
    personality: []
  })
  
  // 价值观问卷状态
  const [values, setValues] = useState({
    family: 0,
    career: 0,
    friends: 0,
    health: 0,
    wealth: 0,
    education: 0,
    spirituality: 0,
    freedom: 0,
    community: 0,
    creativity: 0,
    stability: 0,
    adventure: 0
  })
  
  // 生活方式问卷状态
  const [lifestyle, setLifestyle] = useState({
    social: 0,
    workLifeBalance: 0,
    riskTaking: 0,
    routine: 0,
    spending: 0,
    healthConsciousness: 0,
    environmentalAwareness: 0,
    culturalEngagement: 0,
    travel: 0,
    hobbies: 0,
    technology: 0,
    relaxation: 0
  })
  
  const [customInterests, setCustomInterests] = useState({})
  const [allUsers, setAllUsers] = useState([])
  const [matches, setMatches] = useState([])
  const [showMatches, setShowMatches] = useState(false)
  
  // 新增筛选功能
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  
  // 新增兴趣热度分析功能
  const [interestPopularity, setInterestPopularity] = useState({})
  const [showPopularity, setShowPopularity] = useState(false)
  
  // 新增兴趣推荐功能
  const [recommendedInterests, setRecommendedInterests] = useState({})
  const [showRecommendations, setShowRecommendations] = useState(false)
  
  // MBTI相关状态
  const [mbtiAnswers, setMbtiAnswers] = useState({})
  const [mbtiResult, setMbtiResult] = useState(null)
  const [testProgress, setTestProgress] = useState(0)
  
  // 兴趣选项配置
  const interestOptions = {
    hobbies: ['阅读', '旅行', '运动', '音乐', '电影', '烹饪', '摄影', '绘画', '编程', '游戏'],
    sports: ['篮球', '足球', '羽毛球', '乒乓球', '游泳', '跑步', '健身', '瑜伽', '网球', '其他'],
    music: ['流行', '摇滚', '古典', '爵士', '电子', '民谣', '说唱', 'R&B', '乡村', '其他'],
    movies: ['动作', '喜剧', '科幻', '悬疑', '爱情', '动画', '纪录片', '恐怖', '战争', '其他'],
    books: ['小说', '散文', '历史', '哲学', '科技', '科幻', '悬疑', '言情', '传记', '其他'],
    food: ['中餐', '西餐', '日料', '韩料', '素食', '甜点', '海鲜', '烧烤', '火锅', '其他'],
    travel: ['城市游', '自然风光', '历史古迹', '美食之旅', '户外探险', '主题公园', '海岛度假', '文化体验', '背包旅行', '其他'],
    personality: ['开朗', '内向', '幽默', '稳重', '创意', '理性', '感性', '冒险', '细心', '其他']
  }
  
  // MBTI测试题目
  const mbtiQuestions = [
    {
      id: 1,
      question: '你更喜欢：',
      options: [
        { value: 'E', text: '与很多人交流互动' },
        { value: 'I', text: '独自思考或与少数亲密朋友相处' }
      ]
    },
    {
      id: 2,
      question: '你获取信息的方式更倾向于：',
      options: [
        { value: 'S', text: '通过具体事实和经验' },
        { value: 'N', text: '通过抽象概念和可能性' }
      ]
    },
    {
      id: 3,
      question: '做决定时，你更依赖：',
      options: [
        { value: 'T', text: '逻辑和客观分析' },
        { value: 'F', text: '情感和个人价值观' }
      ]
    },
    {
      id: 4,
      question: '你更喜欢：',
      options: [
        { value: 'J', text: '有计划、有条理的生活' },
        { value: 'P', text: '灵活、随性的生活' }
      ]
    },
    {
      id: 5,
      question: '在社交场合，你通常是：',
      options: [
        { value: 'E', text: '主动与他人交流' },
        { value: 'I', text: '等待他人主动' }
      ]
    },
    {
      id: 6,
      question: '你更关注：',
      options: [
        { value: 'S', text: '当前的、具体的细节' },
        { value: 'N', text: '未来的、潜在的可能性' }
      ]
    },
    {
      id: 7,
      question: '处理问题时，你更注重：',
      options: [
        { value: 'T', text: '公平和原则' },
        { value: 'F', text: '和谐和人际关系' }
      ]
    },
    {
      id: 8,
      question: '对于计划，你倾向于：',
      options: [
        { value: 'J', text: '提前制定详细计划' },
        { value: 'P', text: '灵活应对，随机应变' }
      ]
    }
  ]
  
  // MBTI类型描述
  const mbtiTypes = {
    'ISTJ': {
      name: '物流师',
      description: '实际、逻辑、可靠，喜欢有序的生活，注重细节和传统。'
    },
    'ISFJ': {
      name: '守护者',
      description: '温暖、有责任感，注重和谐，喜欢帮助他人，传统且务实。'
    },
    'INFJ': {
      name: '提倡者',
      description: '理想主义、洞察力强，注重意义和价值，致力于帮助他人和世界。'
    },
    'INTJ': {
      name: '建筑师',
      description: '理性、独立，具有战略思维，追求知识和自我提升。'
    },
    'ISTP': {
      name: '鉴赏家',
      description: '灵活、实际，擅长分析和解决问题，喜欢动手操作。'
    },
    'ISFP': {
      name: '探险家',
      description: '敏感、温和，注重个人价值观，喜欢和谐的生活。'
    },
    'INFP': {
      name: '调停者',
      description: '理想主义、富有同理心，注重个人成长和意义。'
    },
    'INTP': {
      name: '逻辑学家',
      description: '好奇、理性，喜欢分析和理论，追求知识和理解。'
    },
    'ESTP': {
      name: '企业家',
      description: '活跃、实用，喜欢行动和挑战，善于适应变化。'
    },
    'ESFP': {
      name: '表演者',
      description: '热情、友好，喜欢社交和体验新事物，注重当下。'
    },
    'ENFP': {
      name: '竞选者',
      description: '充满活力、创意，喜欢探索可能性，善于激励他人。'
    },
    'ENTP': {
      name: '辩论家',
      description: '聪明、好奇，喜欢挑战和辩论，富有创意。'
    },
    'ESTJ': {
      name: '执行官',
      description: '实际、果断，喜欢组织和管理，注重效率和秩序。'
    },
    'ESFJ': {
      name: '领事',
      description: '热情、有责任感，注重和谐和传统，喜欢帮助他人。'
    },
    'ENFJ': {
      name: '主人公',
      description: '热情、理想主义，善于领导和激励他人，注重和谐。'
    },
    'ENTJ': {
      name: '指挥官',
      description: '自信、果断，具有领导力，喜欢挑战和成就。'
    }
  }

  useEffect(() => {
    loadUserInterests()
    loadAllUsers()
  }, [user])

  const loadUserInterests = async () => {
    if (user) {
      const userInterests = await localforage.getItem(`interests_${user.id}`)
      if (userInterests) {
        setInterests(userInterests)
      }
      
      const userMbti = await localforage.getItem(`mbti_${user.id}`)
      if (userMbti) {
        setMbtiResult(userMbti)
      }
      
      const userValues = await localforage.getItem(`values_${user.id}`)
      if (userValues) {
        setValues(userValues)
      }
      
      const userLifestyle = await localforage.getItem(`lifestyle_${user.id}`)
      if (userLifestyle) {
        setLifestyle(userLifestyle)
      }
    }
  }

  const loadAllUsers = async () => {
    const users = await localforage.getItem('users') || []
    setAllUsers(users.filter(u => u.id !== user?.id))
    calculateInterestPopularity(users)
  }
  
  // 计算兴趣热度
  const calculateInterestPopularity = (users) => {
    const popularity = {}
    
    users.forEach(user => {
      if (user.interests) {
        Object.entries(user.interests).forEach(([category, categoryInterests]) => {
          if (!popularity[category]) {
            popularity[category] = {}
          }
          
          categoryInterests.forEach(interest => {
            if (!popularity[category][interest]) {
              popularity[category][interest] = 0
            }
            popularity[category][interest]++
          })
        })
      }
    })
    
    // 按热度排序
    Object.keys(popularity).forEach(category => {
      popularity[category] = Object.entries(popularity[category])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10) // 只取前10个最热门的兴趣
    })
    
    setInterestPopularity(popularity)
  }
  
  // 计算兴趣推荐
  const calculateRecommendations = () => {
    const recommendations = {}
    const selectedInterests = Object.entries(interests).flatMap(([category, items]) => 
      items.map(item => ({ category, interest: item }))
    )
    
    if (selectedInterests.length === 0) {
      setRecommendedInterests({})
      return
    }
    
    // 基于共同选择的推荐
    Object.entries(interestOptions).forEach(([category, options]) => {
      const userCategoryInterests = interests[category] || []
      if (userCategoryInterests.length === 0) return
      
      // 找出与用户已选择兴趣最常一起出现的其他兴趣
      const coOccurrence = {}
      
      allUsers.forEach(user => {
        const userInterests = user.interests?.[category] || []
        // 检查用户是否有相同的兴趣
        const hasCommonInterest = userCategoryInterests.some(interest => userInterests.includes(interest))
        if (hasCommonInterest) {
          userInterests.forEach(interest => {
            if (!userCategoryInterests.includes(interest)) {
              if (!coOccurrence[interest]) {
                coOccurrence[interest] = 0
              }
              coOccurrence[interest]++
            }
          })
        }
      })
      
      // 按共现频率排序
      const sortedRecommendations = Object.entries(coOccurrence)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // 只取前5个推荐
      
      if (sortedRecommendations.length > 0) {
        recommendations[category] = sortedRecommendations
      }
    })
    
    setRecommendedInterests(recommendations)
  }

  const handleInterestChange = (category, interest) => {
    setInterests(prev => {
      const updated = { ...prev }
      if (updated[category].includes(interest)) {
        updated[category] = updated[category].filter(item => item !== interest)
      } else {
        updated[category].push(interest)
      }
      return updated
    })
    
    // 计算推荐兴趣
    setTimeout(calculateRecommendations, 100)
  }

  const handleCustomInterest = (category, value) => {
    setCustomInterests(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const addCustomInterest = (category) => {
    const customValue = customInterests[category]
    if (customValue && customValue.trim()) {
      setInterests(prev => {
        const updated = { ...prev }
        if (!updated[category].includes(customValue.trim())) {
          updated[category].push(customValue.trim())
        }
        return updated
      })
      setCustomInterests(prev => ({
        ...prev,
        [category]: ''
      }))
    }
  }

  const saveInterests = async () => {
    if (user) {
      await localforage.setItem(`interests_${user.id}`, interests)
      alert('兴趣保存成功！')
    }
  }

  const calculateMatchScore = (otherUser) => {
    let totalScore = 0
    let totalPossible = 0
    
    // 为不同类别设置不同权重
    const categoryWeights = {
      hobbies: 1.0,
      sports: 0.8,
      music: 1.2,
      movies: 0.9,
      books: 1.1,
      food: 0.8,
      travel: 1.0,
      personality: 1.3
    }
    
    Object.keys(interests).forEach(category => {
      const userInterests = interests[category]
      const otherInterests = otherUser.interests?.[category] || []
      const weight = categoryWeights[category] || 1.0
      
      // 计算该类别的匹配度
      const commonInterests = userInterests.filter(interest => otherInterests.includes(interest))
      const categoryScore = commonInterests.length
      const categoryPossible = Math.max(userInterests.length, otherInterests.length)
      
      // 考虑兴趣数量的影响（兴趣越多，匹配难度越大）
      const quantityFactor = Math.min(1.0, 1 / (1 + Math.log(Math.max(userInterests.length, otherInterests.length) + 1)))
      
      totalScore += categoryScore * weight * quantityFactor
      totalPossible += categoryPossible * weight
    })
    
    // 添加价值观匹配分数（权重高）
    if (Object.values(values).some(v => v > 0) && otherUser.values) {
      const valuesMatchScore = calculateValuesMatch(values, otherUser.values)
      const valuesWeight = 1.5
      totalScore += valuesMatchScore * valuesWeight
      totalPossible += 10 * valuesWeight
    }
    
    // 添加生活方式匹配分数（权重高）
    if (Object.values(lifestyle).some(v => v > 0) && otherUser.lifestyle) {
      const lifestyleMatchScore = calculateLifestyleMatch(lifestyle, otherUser.lifestyle)
      const lifestyleWeight = 1.5
      totalScore += lifestyleMatchScore * lifestyleWeight
      totalPossible += 10 * lifestyleWeight
    }
    
    // 添加MBTI匹配分数（权重更高）
    if (mbtiResult && otherUser.mbti) {
      const mbtiMatchScore = calculateMbtiMatch(mbtiResult.type, otherUser.mbti.type)
      const mbtiWeight = 2.0
      totalScore += mbtiMatchScore * mbtiWeight
      totalPossible += 5 * mbtiWeight
    }
    
    // 归一化分数到0-100范围
    return totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0
  }

  const calculateValuesMatch = (userValues, otherValues) => {
    let totalDifference = 0
    let totalCategories = 0
    
    // 为不同价值观类别设置不同权重
    const valueWeights = {
      family: 1.2,
      career: 1.1,
      friends: 1.0,
      health: 1.3,
      wealth: 0.9,
      education: 1.0,
      spirituality: 0.8,
      freedom: 1.1,
      community: 0.9,
      creativity: 0.8,
      stability: 1.0,
      adventure: 0.7
    }
    
    Object.keys(userValues).forEach(key => {
      if (otherValues[key] !== undefined && userValues[key] > 0) {
        const weight = valueWeights[key] || 1.0
        totalDifference += Math.abs(userValues[key] - otherValues[key]) * weight
        totalCategories += weight
      }
    })
    
    if (totalCategories === 0) return 5
    
    // 计算加权平均差异（0-10分）
    const averageDifference = totalDifference / totalCategories
    // 转换为匹配分数（10-0分，差异越小分数越高）
    const matchScore = 10 - averageDifference
    return matchScore
  }
  
  const calculateLifestyleMatch = (userLifestyle, otherLifestyle) => {
    let totalDifference = 0
    let totalCategories = 0
    
    // 为不同生活方式类别设置不同权重
    const lifestyleWeights = {
      social: 1.0,
      workLifeBalance: 1.2,
      riskTaking: 0.8,
      routine: 0.9,
      spending: 0.8,
      healthConsciousness: 1.1,
      environmentalAwareness: 0.7,
      culturalEngagement: 0.8,
      travel: 0.9,
      hobbies: 0.8,
      technology: 0.7,
      relaxation: 1.0
    }
    
    Object.keys(userLifestyle).forEach(key => {
      if (otherLifestyle[key] !== undefined && userLifestyle[key] > 0) {
        const weight = lifestyleWeights[key] || 1.0
        totalDifference += Math.abs(userLifestyle[key] - otherLifestyle[key]) * weight
        totalCategories += weight
      }
    })
    
    if (totalCategories === 0) return 5
    
    // 计算加权平均差异（0-10分）
    const averageDifference = totalDifference / totalCategories
    // 转换为匹配分数（10-0分，差异越小分数越高）
    const matchScore = 10 - averageDifference
    return matchScore
  }
  
  const calculateMbtiMatch = (userType, otherType) => {
    // 扩展的MBTI匹配算法
    const compatibility = {
      'ISTJ': { 'ISFJ': 5, 'ESTJ': 5, 'ISTP': 4, 'ESTP': 4, 'INFJ': 3, 'ENFJ': 3, 'INTJ': 3, 'ENTJ': 3 },
      'ISFJ': { 'ISTJ': 5, 'ESFJ': 5, 'ISFP': 4, 'ESFP': 4, 'INFJ': 3, 'ENFJ': 3, 'INTJ': 3, 'ENTJ': 3 },
      'INFJ': { 'INTJ': 5, 'ENFJ': 5, 'INFP': 4, 'ENFP': 4, 'ISTJ': 3, 'ISFJ': 3, 'ESTJ': 2, 'ESFJ': 2 },
      'INTJ': { 'INFJ': 5, 'ENTJ': 5, 'INTP': 4, 'ENTP': 4, 'ISTJ': 3, 'ISFJ': 2, 'ESTJ': 3, 'ESFJ': 2 },
      'ISTP': { 'ISTJ': 4, 'ESTP': 5, 'ISFP': 4, 'ESFP': 5, 'INTP': 3, 'ENTP': 3, 'INTJ': 2, 'ENTJ': 2 },
      'ISFP': { 'ISFJ': 4, 'ESFP': 5, 'ISTP': 4, 'ESTP': 5, 'INFP': 3, 'ENFP': 3, 'INFJ': 2, 'ENFJ': 2 },
      'INFP': { 'INFJ': 4, 'ENFP': 5, 'INTP': 4, 'ENTP': 5, 'ISFP': 3, 'ESFP': 2, 'ISFJ': 2, 'ESFJ': 2 },
      'INTP': { 'INTJ': 4, 'ENTP': 5, 'INFP': 4, 'ENFP': 5, 'ISTP': 3, 'ESTP': 2, 'ISTJ': 2, 'ESTJ': 2 },
      'ESTP': { 'ISTP': 5, 'ESTJ': 4, 'ESFP': 5, 'ESFJ': 4, 'ENTP': 3, 'ENTJ': 3, 'INTP': 2, 'INTJ': 2 },
      'ESFP': { 'ISFP': 5, 'ESFJ': 4, 'ESTP': 5, 'ESTJ': 4, 'ENFP': 3, 'ENFJ': 3, 'INFP': 2, 'INFJ': 2 },
      'ENFP': { 'INFP': 5, 'ENFJ': 4, 'ENTP': 5, 'ENTJ': 4, 'ESFP': 3, 'ESFJ': 2, 'ISFP': 3, 'ISFJ': 2 },
      'ENTP': { 'INTP': 5, 'ENTJ': 4, 'ENFP': 5, 'ENFJ': 4, 'ESTP': 3, 'ESTJ': 2, 'ISTP': 3, 'ISTJ': 2 },
      'ESTJ': { 'ISTJ': 5, 'ESTP': 4, 'ESFJ': 5, 'ESFP': 4, 'ENTJ': 3, 'ENFJ': 3, 'INTJ': 2, 'INFJ': 2 },
      'ESFJ': { 'ISFJ': 5, 'ESFP': 4, 'ESTJ': 5, 'ESTP': 4, 'ENFJ': 3, 'ENFP': 3, 'INFJ': 2, 'INFP': 2 },
      'ENFJ': { 'INFJ': 5, 'ENFP': 4, 'ENTJ': 5, 'ENTP': 4, 'ESFJ': 3, 'ESFP': 2, 'ISFJ': 3, 'ISFP': 2 },
      'ENTJ': { 'INTJ': 5, 'ENTP': 4, 'ENFJ': 5, 'ENFP': 4, 'ESTJ': 3, 'ESTP': 2, 'ISTJ': 3, 'ISTP': 2 }
    }
    
    // 计算基本匹配分数
    let baseScore = compatibility[userType]?.[otherType] || 3
    
    // 考虑相同类型的特殊匹配
    if (userType === otherType) {
      baseScore = 5
    }
    
    // 考虑四个维度的匹配情况
    const dimensions = ['E/I', 'S/N', 'T/F', 'J/P']
    const userDimensions = {
      'E': 'E/I', 'I': 'E/I',
      'S': 'S/N', 'N': 'S/N',
      'T': 'T/F', 'F': 'T/F',
      'J': 'J/P', 'P': 'J/P'
    }
    
    let dimensionMatches = 0
    for (let i = 0; i < 4; i++) {
      if (userType[i] === otherType[i]) {
        dimensionMatches++
      }
    }
    
    // 根据维度匹配情况调整分数
    if (dimensionMatches >= 3) {
      baseScore += 1
    } else if (dimensionMatches <= 1) {
      baseScore -= 1
    }
    
    // 确保分数在1-5范围内
    return Math.max(1, Math.min(5, baseScore))
  }

  const findMatches = async () => {
    const matchesWithScores = allUsers.map(otherUser => {
      const score = calculateMatchScore(otherUser)
      return {
        user: otherUser,
        score,
        commonInterests: findCommonInterests(otherUser),
        mbtiMatch: mbtiResult && otherUser.mbti ? calculateMbtiMatch(mbtiResult.type, otherUser.mbti.type) : null,
        valuesMatch: Object.values(values).some(v => v > 0) && otherUser.values ? calculateValuesMatch(values, otherUser.values) : null,
        lifestyleMatch: Object.values(lifestyle).some(v => v > 0) && otherUser.lifestyle ? calculateLifestyleMatch(lifestyle, otherUser.lifestyle) : null
      }
    })
    
    const sortedMatches = matchesWithScores
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score)
    
    setMatches(sortedMatches)
    setShowMatches(true)
  }

  const findCommonInterests = (otherUser) => {
    const common = {}
    Object.keys(interests).forEach(category => {
      const userInterests = interests[category]
      const otherInterests = otherUser.interests?.[category] || []
      const commonInCategory = userInterests.filter(interest => otherInterests.includes(interest))
      if (commonInCategory.length > 0) {
        common[category] = commonInCategory
      }
    })
    return common
  }
  
  // AI提问功能相关状态
  const [aiQuestions, setAiQuestions] = useState([])
  const [aiAnswers, setAiAnswers] = useState({})
  const [isAiTesting, setIsAiTesting] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  
  // MBTI测试相关函数
  const handleMbtiAnswer = (questionId, value) => {
    setMbtiAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
    
    // 更新进度
    const answeredCount = Object.keys({ ...mbtiAnswers, [questionId]: value }).length
    setTestProgress(Math.round((answeredCount / mbtiQuestions.length) * 100))
  }
  
  // AI提问功能
  const startAiTest = () => {
    // 生成AI问题
    const questions = [
      {
        id: 'ai1',
        question: '当你参加社交活动时，你更倾向于：',
        options: [
          { value: 'E', text: '主动与很多人交流，享受热闹的氛围' },
          { value: 'I', text: '与少数熟悉的人深入交流，避免过度社交' }
        ]
      },
      {
        id: 'ai2',
        question: '面对新信息时，你更关注：',
        options: [
          { value: 'S', text: '具体的事实和细节，注重实际应用' },
          { value: 'N', text: '抽象的概念和可能性，喜欢探索新想法' }
        ]
      },
      {
        id: 'ai3',
        question: '做决定时，你通常：',
        options: [
          { value: 'T', text: '基于逻辑分析和客观事实' },
          { value: 'F', text: '考虑个人价值观和他人感受' }
        ]
      },
      {
        id: 'ai4',
        question: '对于生活规划，你更偏好：',
        options: [
          { value: 'J', text: '有明确的计划和安排' },
          { value: 'P', text: '灵活应对，随遇而安' }
        ]
      },
      {
        id: 'ai5',
        question: '在解决问题时，你更倾向于：',
        options: [
          { value: 'S', text: '使用已有的经验和方法' },
          { value: 'N', text: '寻找创新的解决方案' }
        ]
      }
    ]
    
    setAiQuestions(questions)
    setAiAnswers({})
    setIsAiTesting(true)
    setAiProgress(0)
  }
  
  const handleAiAnswer = (questionId, value) => {
    setAiAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
    
    // 更新进度
    const answeredCount = Object.keys({ ...aiAnswers, [questionId]: value }).length
    setAiProgress(Math.round((answeredCount / aiQuestions.length) * 100))
  }
  
  const calculateAiMbti = () => {
    if (Object.keys(aiAnswers).length < aiQuestions.length) {
      alert('请完成所有AI问题！')
      return
    }
    
    // 统计各维度得分
    const counts = {
      E: 0, I: 0,
      S: 0, N: 0,
      T: 0, F: 0,
      J: 0, P: 0
    }
    
    Object.values(aiAnswers).forEach(value => {
      counts[value]++
    })
    
    // 确定类型
    const type = 
      (counts.E > counts.I ? 'E' : 'I') +
      (counts.S > counts.N ? 'S' : 'N') +
      (counts.T > counts.F ? 'T' : 'F') +
      (counts.J > counts.P ? 'J' : 'P')
    
    const result = {
      type,
      name: mbtiTypes[type]?.name || '未知类型',
      description: mbtiTypes[type]?.description || '暂无描述',
      cartoonUrl: getMbtiCartoon(type) // 生成MBTI卡通形象
    }
    
    setMbtiResult(result)
    setIsAiTesting(false)
    
    // 保存MBTI结果
    if (user) {
      localforage.setItem(`mbti_${user.id}`, result)
    }
  }
  
  // 根据MBTI类型生成卡通形象
  const getMbtiCartoon = (type) => {
    // 为每种MBTI类型生成不同的卡通形象
    const cartoonPrompts = {
      'ISTJ': 'cartoon character for ISTJ personality type, responsible, practical, traditional, police academy student, professional, blue uniform, serious expression',
      'ISFJ': 'cartoon character for ISFJ personality type, caring, supportive, loyal, police academy student, warm smile, blue uniform, helping others',
      'INFJ': 'cartoon character for INFJ personality type, intuitive, idealistic, compassionate, police academy student, thoughtful expression, blue uniform, visionary',
      'INTJ': 'cartoon character for INTJ personality type, strategic, analytical, independent, police academy student, confident, blue uniform, thinking',
      'ISTP': 'cartoon character for ISTP personality type, hands-on, practical, adaptable, police academy student, active, blue uniform, problem-solving',
      'ISFP': 'cartoon character for ISFP personality type, artistic, sensitive, flexible, police academy student, creative, blue uniform, expressive',
      'INFP': 'cartoon character for INFP personality type, idealistic, empathetic, creative, police academy student, dreamy, blue uniform, imaginative',
      'INTP': 'cartoon character for INTP personality type, logical, curious, innovative, police academy student, analytical, blue uniform, questioning',
      'ESTP': 'cartoon character for ESTP personality type, energetic, action-oriented, adaptable, police academy student, dynamic, blue uniform, adventurous',
      'ESFP': 'cartoon character for ESFP personality type, outgoing, friendly, spontaneous, police academy student, enthusiastic, blue uniform, social',
      'ENFP': 'cartoon character for ENFP personality type, energetic, creative, enthusiastic, police academy student, optimistic, blue uniform, inspiring',
      'ENTP': 'cartoon character for ENTP personality type, clever, curious, debate-loving, police academy student, witty, blue uniform, challenging',
      'ESTJ': 'cartoon character for ESTJ personality type, organized, decisive, responsible, police academy student, authoritative, blue uniform, leading',
      'ESFJ': 'cartoon character for ESFJ personality type, sociable, caring, organized, police academy student, helpful, blue uniform, connecting',
      'ENFJ': 'cartoon character for ENFJ personality type, charismatic, inspiring, empathetic, police academy student, leader, blue uniform, motivating',
      'ENTJ': 'cartoon character for ENTJ personality type, strategic, confident, decisive, police academy student, ambitious, blue uniform, commanding'
    }
    
    const prompt = cartoonPrompts[type] || 'cartoon character for police academy student, friendly, blue uniform'
    return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=portrait_4_3`
  }
  
  const calculateMbti = () => {
    if (Object.keys(mbtiAnswers).length < mbtiQuestions.length) {
      alert('请完成所有问题！')
      return
    }
    
    // 统计各维度得分
    const counts = {
      E: 0, I: 0,
      S: 0, N: 0,
      T: 0, F: 0,
      J: 0, P: 0
    }
    
    Object.values(mbtiAnswers).forEach(value => {
      counts[value]++
    })
    
    // 确定类型
    const type = 
      (counts.E > counts.I ? 'E' : 'I') +
      (counts.S > counts.N ? 'S' : 'N') +
      (counts.T > counts.F ? 'T' : 'F') +
      (counts.J > counts.P ? 'J' : 'P')
    
    const result = {
      type,
      name: mbtiTypes[type]?.name || '未知类型',
      description: mbtiTypes[type]?.description || '暂无描述',
      cartoonUrl: getMbtiCartoon(type) // 生成MBTI卡通形象
    }
    
    setMbtiResult(result)
    
    // 保存MBTI结果
    if (user) {
      localforage.setItem(`mbti_${user.id}`, result)
    }
  }
  
  const resetMbtiTest = () => {
    setMbtiAnswers({})
    setMbtiResult(null)
    setTestProgress(0)
  }

  return (
    <div className="interests-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="brand-highlight">兴趣匹配</span>
          </h1>
          <p className="hero-subtitle">找到志同道合的人</p>
          <p className="hero-description">
            通过兴趣爱好和性格测试，发现与你最匹配的朋友
          </p>
        </div>
      </section>

      {/* Interests Section */}
      <section className="interests-section">
        <div className="container">
          {!showMatches ? (
            <div className="interests-card">
              {/* 选项卡导航 */}
              <div className="tab-navigation">
                <button
                  className={`tab-button ${activeTab === 'interests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('interests')}
                >
                  兴趣爱好
                </button>
                <button
                  className={`tab-button ${activeTab === 'mbti' ? 'active' : ''}`}
                  onClick={() => setActiveTab('mbti')}
                >
                  MBTI性格测试
                </button>
                <button
                  className={`tab-button ${activeTab === 'values' ? 'active' : ''}`}
                  onClick={() => setActiveTab('values')}
                >
                  价值观问卷
                </button>
                <button
                  className={`tab-button ${activeTab === 'lifestyle' ? 'active' : ''}`}
                  onClick={() => setActiveTab('lifestyle')}
                >
                  生活方式问卷
                </button>
              </div>
              
              {/* 兴趣爱好选项卡 */}
              {activeTab === 'interests' && (
                <div className="tab-content">
                  <h2 className="section-title">选择你的兴趣爱好</h2>
                  
                  {/* 筛选和搜索功能 */}
                  <div className="filter-section">
                    <div className="search-bar">
                      <input
                        type="text"
                        placeholder="搜索兴趣..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                      />
                    </div>
                    
                    <div className="category-filters">
                      <button
                        className={`filter-button ${filterCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterCategory('all')}
                      >
                        全部
                      </button>
                      {Object.entries(interestOptions).map(([category, _]) => (
                        <button
                          key={category}
                          className={`filter-button ${filterCategory === category ? 'active' : ''}`}
                          onClick={() => setFilterCategory(category)}
                        >
                          {{
                            hobbies: '爱好',
                            sports: '运动',
                            music: '音乐',
                            movies: '电影',
                            books: '书籍',
                            food: '美食',
                            travel: '旅行',
                            personality: '性格特点'
                          }[category]}
                        </button>
                      ))}
                    </div>
                    
                    {/* 类别选择器 */}
                    <div className="category-selector">
                      <p className="selector-title">选择类别：</p>
                      <div className="category-tags">
                        {Object.entries(interestOptions).map(([category, _]) => (
                          <button
                            key={category}
                            className={`category-tag ${selectedCategories.includes(category) ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedCategories(prev => 
                                prev.includes(category)
                                  ? prev.filter(c => c !== category)
                                  : [...prev, category]
                              )
                            }}
                          >
                            {{
                              hobbies: '爱好',
                              sports: '运动',
                              music: '音乐',
                              movies: '电影',
                              books: '书籍',
                              food: '美食',
                              travel: '旅行',
                              personality: '性格特点'
                            }[category]}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* 兴趣热度分析 */}
                    <div className="popularity-section">
                      <div className="popularity-header">
                        <h4 className="popularity-title">兴趣热度分析</h4>
                        <button
                          className={`toggle-button ${showPopularity ? 'active' : ''}`}
                          onClick={() => setShowPopularity(!showPopularity)}
                        >
                          {showPopularity ? '收起' : '展开'}
                        </button>
                      </div>
                      
                      {showPopularity && (
                        <div className="popularity-content">
                          {Object.entries(interestPopularity).map(([category, popularInterests]) => (
                            <div key={category} className="popularity-category">
                              <h5 className="popularity-category-title">
                                {{
                                  hobbies: '爱好',
                                  sports: '运动',
                                  music: '音乐',
                                  movies: '电影',
                                  books: '书籍',
                                  food: '美食',
                                  travel: '旅行',
                                  personality: '性格特点'
                                }[category]}
                              </h5>
                              <div className="popularity-list">
                                {popularInterests.map(([interest, count], index) => (
                                  <div key={interest} className="popularity-item">
                                    <span className="popularity-rank">{index + 1}</span>
                                    <span className="popularity-interest">{interest}</span>
                                    <span className="popularity-count">{count}人选择</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* 兴趣推荐 */}
                    <div className="recommendation-section">
                      <div className="recommendation-header">
                        <h4 className="recommendation-title">为你推荐</h4>
                        <button
                          className={`toggle-button ${showRecommendations ? 'active' : ''}`}
                          onClick={() => setShowRecommendations(!showRecommendations)}
                        >
                          {showRecommendations ? '收起' : '展开'}
                        </button>
                      </div>
                      
                      {showRecommendations && (
                        <div className="recommendation-content">
                          {Object.entries(recommendedInterests).map(([category, recommendations]) => (
                            <div key={category} className="recommendation-category">
                              <h5 className="recommendation-category-title">
                                {{
                                  hobbies: '爱好',
                                  sports: '运动',
                                  music: '音乐',
                                  movies: '电影',
                                  books: '书籍',
                                  food: '美食',
                                  travel: '旅行',
                                  personality: '性格特点'
                                }[category]}
                              </h5>
                              <div className="recommendation-list">
                                {recommendations.map(([interest, count], index) => (
                                  <div key={interest} className="recommendation-item">
                                    <span className="recommendation-rank">{index + 1}</span>
                                    <span className="recommendation-interest">{interest}</span>
                                    <span className="recommendation-count">{count}人同时选择</span>
                                    <button
                                      className="add-recommendation-button"
                                      onClick={() => handleInterestChange(category, interest)}
                                    >
                                      添加
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          {Object.keys(recommendedInterests).length === 0 && (
                            <div className="empty-recommendations">
                              <p>选择一些兴趣后，我们会为你推荐相关的兴趣</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 兴趣选项展示 */}
                  {Object.entries(interestOptions).map(([category, options]) => {
                    // 应用筛选条件
                    if (filterCategory !== 'all' && filterCategory !== category) {
                      return null
                    }
                    
                    // 应用搜索过滤
                    const filteredOptions = options.filter(option => 
                      option.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    
                    return (
                      <div key={category} className="interest-category">
                        <h3 className="category-title">
                          {{
                            hobbies: '爱好',
                            sports: '运动',
                            music: '音乐',
                            movies: '电影',
                            books: '书籍',
                            food: '美食',
                            travel: '旅行',
                            personality: '性格特点'
                          }[category]}
                        </h3>
                        
                        <div className="interest-options">
                          {filteredOptions.map(option => (
                            <button
                              key={option}
                              className={`interest-option ${interests[category].includes(option) ? 'selected' : ''}`}
                              onClick={() => {
                                handleInterestChange(category, option);
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                        
                        <div className="custom-interest">
                          <input
                            type="text"
                            placeholder="自定义选项"
                            value={customInterests[category] || ''}
                            onChange={(e) => handleCustomInterest(category, e.target.value)}
                            className="custom-interest-input"
                          />
                          <button
                            className="add-interest-button"
                            onClick={() => addCustomInterest(category)}
                          >
                            添加
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  
                  <div className="action-buttons">
                    <button className="primary-button" onClick={saveInterests}>
                      保存兴趣
                    </button>
                    <button className="secondary-button" onClick={findMatches}>
                      查找匹配
                    </button>
                  </div>
                </div>
              )}
              
              {/* MBTI测试选项卡 */}
              {activeTab === 'mbti' && (
                <div className="tab-content">
                  {!mbtiResult ? (
                    <div>
                      <h2 className="section-title">MBTI性格测试</h2>
                      
                      {/* 测试方式选择 */}
                      {!isAiTesting && (
                        <div className="test-options">
                          <p className="test-options-text">选择测试方式：</p>
                          <div className="test-buttons">
                            <button className="primary-button" onClick={() => setIsAiTesting(false)}>
                              标准测试
                            </button>
                            <button className="secondary-button" onClick={startAiTest}>
                              AI智能提问
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* 标准测试 */}
                      {!isAiTesting && (
                        <div>
                          {/* 测试进度条 */}
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${testProgress}%` }}
                              />
                            </div>
                            <p className="progress-text">进度: {testProgress}%</p>
                          </div>
                          
                          {/* 测试题目 */}
                          <div className="mbti-questions">
                            {mbtiQuestions.map((question, index) => (
                              <div key={question.id} className="mbti-question">
                                <h3 className="question-text">{index + 1}. {question.question}</h3>
                                <div className="question-options">
                                  {question.options.map((option) => (
                                    <button
                                      key={option.value}
                                      className={`option-button ${mbtiAnswers[question.id] === option.value ? 'selected' : ''}`}
                                      onClick={() => handleMbtiAnswer(question.id, option.value)}
                                    >
                                      {option.text}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="action-buttons">
                            <button className="primary-button" onClick={calculateMbti}>
                              查看结果
                            </button>
                            <button className="secondary-button" onClick={resetMbtiTest}>
                              重新测试
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* AI测试 */}
                      {isAiTesting && (
                        <div>
                          <h3 className="ai-test-title">AI智能提问</h3>
                          <p className="ai-test-description">
                            回答AI提出的问题，让AI分析你的性格类型
                          </p>
                          
                          {/* 测试进度条 */}
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${aiProgress}%` }}
                              />
                            </div>
                            <p className="progress-text">进度: {aiProgress}%</p>
                          </div>
                          
                          {/* AI测试题目 */}
                          <div className="mbti-questions">
                            {aiQuestions.map((question, index) => (
                              <div key={question.id} className="mbti-question ai-question">
                                <div className="ai-avatar">🤖</div>
                                <h3 className="question-text">{index + 1}. {question.question}</h3>
                                <div className="question-options">
                                  {question.options.map((option) => (
                                    <button
                                      key={option.value}
                                      className={`option-button ${aiAnswers[question.id] === option.value ? 'selected' : ''}`}
                                      onClick={() => handleAiAnswer(question.id, option.value)}
                                    >
                                      {option.text}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="action-buttons">
                            <button className="primary-button" onClick={calculateAiMbti}>
                              AI分析结果
                            </button>
                            <button className="secondary-button" onClick={() => setIsAiTesting(false)}>
                              取消
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mbti-result">
                      <h2 className="section-title">你的MBTI性格类型</h2>
                      <div className="mbti-result-content">
                        <div className="mbti-cartoon">
                          {mbtiResult.cartoonUrl && (
                            <img 
                              src={mbtiResult.cartoonUrl} 
                              alt={`${mbtiResult.type} 卡通形象`} 
                              className="cartoon-image"
                            />
                          )}
                        </div>
                        <div className="mbti-info">
                          <div className="mbti-type">{mbtiResult.type}</div>
                          <h3 className="mbti-name">{mbtiResult.name}</h3>
                          <p className="mbti-description">{mbtiResult.description}</p>
                        </div>
                      </div>
                      <button className="secondary-button" onClick={resetMbtiTest}>
                        重新测试
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* 价值观问卷选项卡 */}
              {activeTab === 'values' && (
                <div className="tab-content">
                  <h2 className="section-title">价值观问卷</h2>
                  <p className="section-description">请对以下价值观进行评分，1-10分表示重要程度（1=不重要，10=非常重要）</p>
                  
                  <div className="questionnaire-container">
                    {Object.entries({
                      family: '家庭：与家人的关系和家庭生活',
                      career: '事业：职业发展和工作成就',
                      friends: '友谊：与朋友的关系和社交网络',
                      health: '健康：身体健康和心理健康',
                      wealth: '财富：经济安全和物质生活',
                      education: '教育：个人学习和知识获取',
                      spirituality: '精神追求：信仰和个人价值观',
                      freedom: '自由：个人自主和独立',
                      community: '社区：为社会做出贡献',
                      creativity: '创造力：表达和创新',
                      stability: '稳定性：生活的可预测性和安全性',
                      adventure: '冒险：探索和新体验'
                    }).map(([key, label]) => (
                      <div key={key} className="question-item">
                        <div className="question-label">{label}</div>
                        <div className="rating-container">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={values[key] || 0}
                            onChange={(e) => setValues(prev => ({
                              ...prev,
                              [key]: parseInt(e.target.value)
                            }))}
                            className="rating-slider"
                          />
                          <span className="rating-value">{values[key] || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="action-buttons">
                    <button className="primary-button" onClick={() => {
                      if (user) {
                        localforage.setItem(`values_${user.id}`, values)
                        alert('价值观保存成功！')
                      }
                    }}>
                      保存价值观
                    </button>
                  </div>
                </div>
              )}
              
              {/* 生活方式问卷选项卡 */}
              {activeTab === 'lifestyle' && (
                <div className="tab-content">
                  <h2 className="section-title">生活方式问卷</h2>
                  <p className="section-description">请对以下生活方式相关问题进行评分，1-10分表示符合程度（1=非常不符合，10=非常符合）</p>
                  
                  <div className="questionnaire-container">
                    {Object.entries({
                      social: '社交活动：我喜欢参加各种社交活动和聚会',
                      workLifeBalance: '工作生活平衡：我能够平衡工作和个人生活',
                      riskTaking: '冒险倾向：我喜欢尝试新事物和冒险',
                      routine: '生活规律：我喜欢有规律的生活方式',
                      spending: '消费观念：我更注重品质而非价格',
                      healthConsciousness: '健康意识：我注重健康饮食和锻炼',
                      environmentalAwareness: '环保意识：我关注环保和可持续生活',
                      culturalEngagement: '文化参与：我喜欢参与文化活动和艺术',
                      travel: '旅行：我喜欢探索新地方和文化',
                      hobbies: '兴趣爱好：我有多种兴趣爱好',
                      technology: '科技使用：我喜欢使用最新科技产品',
                      relaxation: '放松方式：我有有效的放松和减压方式'
                    }).map(([key, label]) => (
                      <div key={key} className="question-item">
                        <div className="question-label">{label}</div>
                        <div className="rating-container">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={lifestyle[key] || 0}
                            onChange={(e) => setLifestyle(prev => ({
                              ...prev,
                              [key]: parseInt(e.target.value)
                            }))}
                            className="rating-slider"
                          />
                          <span className="rating-value">{lifestyle[key] || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="action-buttons">
                    <button className="primary-button" onClick={() => {
                      if (user) {
                        localforage.setItem(`lifestyle_${user.id}`, lifestyle)
                        alert('生活方式保存成功！')
                      }
                    }}>
                      保存生活方式
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="matches-container">
              <div className="matches-card">
                <h2 className="section-title">匹配结果</h2>
                {matches.length === 0 ? (
                  <div className="empty-matches">
                    <div className="empty-icon">🔍</div>
                    <p>暂无匹配用户</p>
                    <p>尝试添加更多兴趣爱好，或完成MBTI测试以获得更准确的匹配</p>
                  </div>
                ) : (
                  <div className="matches-list">
                    {matches.map((match, index) => (
                      <div key={match.user.id} className="match-item">
                        <div className="match-header">
                          <h3 className="match-name">{match.user.username}</h3>
                          <div className="match-score">
                            <div className="score-bar">
                              <div 
                                className="score-fill" 
                                style={{ 
                                  width: `${match.score}%`,
                                  backgroundColor: match.score > 70 ? '#4caf50' : match.score > 40 ? '#ff9800' : '#f44336'
                                }}
                              />
                            </div>
                            <span className="score-value">{match.score}%</span>
                          </div>
                        </div>
                        
                        {/* MBTI匹配信息 */}
                        {mbtiResult && match.user.mbti && (
                          <div className="mbti-match-info">
                            <p>MBTI匹配: {mbtiResult.type} vs {match.user.mbti.type}</p>
                          </div>
                        )}
                        
                        {/* 价值观匹配信息 */}
                        {match.valuesMatch !== null && (
                          <div className="values-match-info">
                            <p>价值观匹配: {Math.round(match.valuesMatch)}%</p>
                          </div>
                        )}
                        
                        {/* 生活方式匹配信息 */}
                        {match.lifestyleMatch !== null && (
                          <div className="lifestyle-match-info">
                            <p>生活方式匹配: {Math.round(match.lifestyleMatch)}%</p>
                          </div>
                        )}
                        
                        <div className="common-interests">
                          <h4>共同兴趣：</h4>
                          <div className="interest-tags">
                            {Object.entries(match.commonInterests).map(([category, commonItems]) => (
                              <div key={category} className="interest-tag">
                                <span className="tag-category">
                                  {{
                                    hobbies: '爱好',
                                    sports: '运动',
                                    music: '音乐',
                                    movies: '电影',
                                    books: '书籍',
                                    food: '美食',
                                    travel: '旅行',
                                    personality: '性格特点'
                                  }[category]}: 
                                </span>
                                <span className="tag-items">{commonItems.join(', ')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button className="secondary-button back-button" onClick={() => setShowMatches(false)}>
                  返回编辑
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>PPSUC Date</h3>
              <p>公安大学校园社交平台</p>
            </div>
            <div className="footer-links">
              <Link to="#">关于我们</Link>
              <Link to="#">使用条款</Link>
              <Link to="#">隐私政策</Link>
              <Link to="#">联系我们</Link>
            </div>
            <div className="footer-copyright">
              <p>&copy; 2024 PPSUC Date. 保留所有权利。</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Interests