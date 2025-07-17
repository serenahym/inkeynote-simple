'use client'
import { useState, useEffect } from 'react'

export default function DiaryPage() {
  const [diaryEntries, setDiaryEntries] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [todayMood, setTodayMood] = useState('')
  const [todayNote, setTodayNote] = useState('')

  // 저장된 일기 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('diaryEntries')
    if (saved) {
      setDiaryEntries(JSON.parse(saved))
    }
  }, [])

  // 오늘의 일기 찾기
  const todayEntry = diaryEntries.find(entry => entry.date === selectedDate)

  const moods = [
    { emoji: '😊', label: '아주 좋음' },
    { emoji: '🙂', label: '좋음' },
    { emoji: '😐', label: '보통' },
    { emoji: '😟', label: '안좋음' },
    { emoji: '😢', label: '힘듦' }
  ]

  const saveDiary = () => {
    const newEntry = {
      date: selectedDate,
      mood: todayMood,
      note: todayNote,
      morningDone: false,
      eveningDone: false
    }

    const updatedEntries = [...diaryEntries.filter(e => e.date !== selectedDate), newEntry]
    setDiaryEntries(updatedEntries)
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries))
    
    alert('저장되었습니다!')
    setTodayMood('')
    setTodayNote('')
  }

  // 이번 주 날짜들 생성
  const getWeekDates = () => {
    const today = new Date()
    const week = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - today.getDay() + i)
      week.push(date)
    }
    return week
  }

  const weekDates = getWeekDates()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-sm mx-auto px-4 py-8">
        {/* 헤더 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          피부 다이어리
        </h1>

        {/* 주간 캘린더 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-7 gap-1 text-center">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
              <div key={idx} className="text-xs text-gray-500 mb-2">
                {day}
              </div>
            ))}
            {weekDates.map((date) => {
              const dateStr = date.toISOString().split('T')[0]
              const hasEntry = diaryEntries.some(e => e.date === dateStr)
              const isSelected = dateStr === selectedDate
              const isToday = dateStr === new Date().toISOString().split('T')[0]
              
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm
                    ${isSelected ? 'bg-blue-600 text-white' : 
                      isToday ? 'bg-blue-100 text-blue-600' : 
                      'hover:bg-gray-100'}
                    ${hasEntry && !isSelected ? 'font-bold' : ''}
                  `}
                >
                  <span>{date.getDate()}</span>
                  {hasEntry && (
                    <div className="w-1 h-1 bg-current rounded-full mt-1" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 선택된 날짜의 기록 */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="font-semibold mb-4">
            {new Date(selectedDate).toLocaleDateString('ko-KR', { 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </h2>

          {todayEntry ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">오늘의 기분</p>
                <p className="text-2xl">{todayEntry.mood}</p>
              </div>
              {todayEntry.note && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">메모</p>
                  <p className="text-gray-800">{todayEntry.note}</p>
                </div>
              )}
              <div className="flex gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={todayEntry.morningDone} disabled />
                  <span>아침 루틴</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={todayEntry.eveningDone} disabled />
                  <span>저녁 루틴</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">오늘의 기분을 선택하세요</p>
                <div className="flex gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood.emoji}
                      onClick={() => setTodayMood(mood.emoji)}
                      className={`p-3 rounded-lg border-2 transition-all
                        ${todayMood === mood.emoji 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <span className="text-xl">{mood.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">오늘의 피부는 어땠나요?</p>
                <textarea
                  value={todayNote}
                  onChange={(e) => setTodayNote(e.target.value)}
                  placeholder="자유롭게 기록해보세요"
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none"
                  rows={3}
                />
              </div>

              <button
                onClick={saveDiary}
                disabled={!todayMood}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${todayMood 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-400'}
                `}
              >
                저장하기
              </button>
            </div>
          )}
        </div>

        {/* 이번 주 통계 */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-3">이번 주 기록</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">기록한 날</span>
              <span className="font-medium">{diaryEntries.length}일</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">가장 많은 기분</span>
              <span className="font-medium">
                {diaryEntries.length > 0 
                  ? diaryEntries[0].mood 
                  : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
