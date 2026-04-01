import { useState, useEffect, useRef } from 'react'

function DatePicker({ 
  value, 
  onChange, 
  label, 
  min, 
  max, 
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(value || '')
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const pickerRef = useRef(null)

  useEffect(() => {
    if (value) {
      setSelectedDate(value)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay()
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i)
      const dateString = date.toISOString().split('T')[0]
      const isSelected = selectedDate === dateString
      const isToday = new Date().toISOString().split('T')[0] === dateString
      const isDisabled = (min && dateString < min) || (max && dateString > max)

      days.push(
        <div
          key={i}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isDisabled ? 'disabled' : ''}`}
          onClick={() => {
            if (!isDisabled) {
              setSelectedDate(dateString)
              onChange(dateString)
              setIsOpen(false)
            }
          }}
        >
          {i}
        </div>
      )
    }

    return days
  }

  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  return (
    <div className={`date-picker-container ${className}`} ref={pickerRef}>
      {label && <label className="date-picker-label">{label}</label>}
      <div className="date-picker-input-wrapper">
        <input
          type="text"
          className="date-picker-input"
          value={selectedDate}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          placeholder="选择日期"
        />
        <div className="date-picker-icon" onClick={() => setIsOpen(!isOpen)}>
          📅
        </div>
      </div>

      {isOpen && (
        <div className="date-picker-calendar">
          <div className="calendar-header">
            <button className="calendar-nav" onClick={handlePrevMonth}>
              ‹
            </button>
            <div className="calendar-month-year">
              {months[currentMonth]} {currentYear}
            </div>
            <button className="calendar-nav" onClick={handleNextMonth}>
              ›
            </button>
          </div>
          <div className="calendar-weekdays">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>
          <div className="calendar-days">
            {generateCalendarDays()}
          </div>
        </div>
      )}
    </div>
  )
}

function DateRangePicker({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange, 
  label = '日期范围', 
  min, 
  max 
}) {
  return (
    <div className="date-range-picker">
      {label && <label className="date-range-label">{label}</label>}
      <div className="date-range-inputs">
        <DatePicker
          value={startDate}
          onChange={onStartDateChange}
          label="开始日期"
          min={min}
          max={endDate || max}
          className="date-range-start"
        />
        <div className="date-range-separator">至</div>
        <DatePicker
          value={endDate}
          onChange={onEndDateChange}
          label="结束日期"
          min={startDate || min}
          max={max}
          className="date-range-end"
        />
      </div>
    </div>
  )
}

export { DatePicker, DateRangePicker }