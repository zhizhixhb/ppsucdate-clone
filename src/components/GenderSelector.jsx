import { useState } from 'react'

function GenderSelector({ 
  value, 
  onChange, 
  label = '性别', 
  className = '' 
}) {
  const [selectedGender, setSelectedGender] = useState(value || '')

  const genders = [
    { value: 'male', label: '男' },
    { value: 'female', label: '女' },
    { value: 'other', label: '其他' }
  ]

  const handleGenderChange = (gender) => {
    setSelectedGender(gender)
    onChange(gender)
  }

  return (
    <div className={`gender-selector ${className}`}>
      {label && <label className="gender-selector-label">{label}</label>}
      <div className="gender-options">
        {genders.map((gender) => (
          <div
            key={gender.value}
            className={`gender-option ${selectedGender === gender.value ? 'selected' : ''}`}
            onClick={() => handleGenderChange(gender.value)}
          >
            <input
              type="radio"
              id={`gender-${gender.value}`}
              name="gender"
              value={gender.value}
              checked={selectedGender === gender.value}
              onChange={() => handleGenderChange(gender.value)}
              style={{ display: 'none' }}
            />
            <label htmlFor={`gender-${gender.value}`} style={{ cursor: 'pointer' }}>
              {gender.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GenderSelector