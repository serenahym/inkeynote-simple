'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '../components/BottomNav'

export default function Home() {
  const router = useRouter()
  const [userData, setUserData] = useState({
    currentStreak: 0,
    todayMorning: false,
    todayEvening: false,
    startDate: null,
    currentRecipe: null
  })
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // 1초마다 시간 업데이트 (실시간 느낌)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // 사용자 데이터 로드
    const loadUserData = () => {
      const recipe = localStorage.getItem('currentRecipe')
      const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]')
      
      // 연속 일수 계산
      let streak = 0
      const today = new Date()
      for (let i = 0; i < 100; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const entry = entries.find(e => e.date === dateStr)
        
        if (i === 0) {
          // 오늘
          setUserData(prev => ({
            ...prev,
            todayMorning: entry?.morningDone || false,
            todayEvening: entry?.eveningDone || false
          }))
        }
        
        if (entry && (entry.morningDone || entry.eveningDone)) {
          if (i === 0 || i === 1) streak++
        } else if (i > 0) {
          break
        }
      }
      
      setUserData(prev => ({
        ...prev,
        currentStreak: streak,
        currentRecipe: recipe ? JSON.parse(recipe) : null,
        startDate: entries[0]?.date
      }))
    }
    
    loadUserData()
  }, [])

  // 인사말
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour >= 5 && hour < 12) return '좋은 아침이에요!'
    if (hour >= 12 && hour < 17) return '오후도 화이팅!'
    if (hour >= 17 && hour < 22) return '저녁 루틴 시간이에요!'
    return '오늘 하루도 수고했어요!'
  }

  // 다음 루틴까지 남은 시간
  const getTimeUntilNext = () => {
    const hour = currentTime.getHours()
    if (hour < 7) return `아침 루틴까지 ${7 - hour}시간`
    if (hour < 22) return `저녁 루틴까지 ${22 - hour}시간`
    return '오늘 루틴 완료!'
  }

  // 진행률 계산 (21일 기준)
  const progress = Math.min((userData.currentStreak / 21) * 100, 100)

  // 동기부여 메시지
  const getMotivationMessage = () => {
    if (userData.currentStreak === 0) return "오늘부터 시작해보세요!"
    if (userData.currentStreak < 3) return "좋은 시작이에요! 💪"
    if (userData.currentStreak < 7) return "3일 고비를 넘기고 있어요!"
    if (userData.currentStreak < 14) return "일주일 달성! 대단해요 🎉"
    if (userData.currentStreak < 21) return "2주 돌파! 곧 습관이 됩니다"
    return "습관 완성! 피부가 달라졌죠? ✨"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      <div className="max-w-sm mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skinner</h1>
          <p className="text-gray-600">{getGreeting()}</p>
        </div>

        {/* 메인 스트릭 카드 */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {userData.currentStreak}
            </div>
            <div className="text-gray-600 mb-4">일 연속 달성</div>
            
            {/* 21일 진행바 */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>습관 형성까지</span>
                <span>{21 - userData.currentStreak > 0 ? `${21 - userData.currentStreak}일 남음` : '완성!'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              {getMotivationMessage()}
            </p>
          </div>
        </div>

        {/* 오늘의 루틴 체크 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h2 className="font-semibold mb-4">오늘의 미션</h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/today-routine')}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                userData.todayMorning 
                  ? 'bg-green-50 border-2 border-green-500' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">☀️</span>
                <div className="text-left">
                  <p className="font-medium">아침 루틴</p>
                  <p className="text-xs text-gray-500">5단계, 약 5분</p>
                </div>
              </div>
              {userData.todayMorning ? (
                <span className="text-green-600 font-medium">완료 ✓</span>
              ) : (
                <span className="text-gray-400">시작하기 →</span>
              )}
            </button>

            <button
              onClick={() => router.push('/today-routine')}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                userData.todayEvening 
                  ? 'bg-green-50 border-2 border-green-500' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌙</span>
                <div className="text-left">
                  <p className="font-medium">저녁 루틴</p>
                  <p className="text-xs text-gray-500">5단계, 약 5분</p>
                </div>
              </div>
              {userData.todayEvening ? (
                <span className="text-green-600 font-medium">완료 ✓</span>
              ) : (
                <span className="text-gray-400">시작하기 →</span>
              )}
            </button>
          </div>
        </div>

        {/* 다음 루틴 알림 */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⏰</span>
              <span className="text-sm text-blue-700">{getTimeUntilNext()}</span>
            </div>
            <button className="text-xs text-blue-600 hover:underline">
              알림 설정
            </button>
          </div>
        </div>

        {/* 현재 레시피 정보 */}
        {userData.currentRecipe ? (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">진행 중인 레시피</p>
                <p className="font-medium">{userData.currentRecipe.title}</p>
              </div>
              <button 
                onClick={() => router.push('/recipes')}
                className="text-xs text-gray-400"
              >
                변경
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => router.push('/onboarding')}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
          >
            피부 진단 시작하기
          </button>
        )}

        {/* 동기부여 섹션 */}
        <div className="text-center text-sm text-gray-500">
          <p>매일 5분, 21일이면 피부가 달라집니다</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
