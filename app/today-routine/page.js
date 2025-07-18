'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function TodayRoutinePage() {
  const router = useRouter()
  const [currentRecipe, setCurrentRecipe] = useState(null)
  const [checkedSteps, setCheckedSteps] = useState({
    morning: [],
    evening: []
  })
  const [currentTime, setCurrentTime] = useState('morning')
  const [routineStartTime, setRoutineStartTime] = useState(null)
  // 컴포넌트 상태 초기화 - 기본 루틴 데이터 포함
  const [routineData, setRoutineData] = useState({
    morning: [
      { id: 'morning-default-1', name: '미온수로 세안', time: '30초' },
      { id: 'morning-default-2', name: '토너로 피부 정리', time: '30초' },
      { id: 'morning-default-3', name: '세럼/에센스 도포', time: '30초' },
      { id: 'morning-default-4', name: '수분크림 마무리', time: '30초' },
      { id: 'morning-default-5', name: '선크림 필수!', time: '1분', important: true }
    ],
    evening: [
      { id: 'evening-default-1', name: '클렌징 오일로 1차 세안', time: '1분' },
      { id: 'evening-default-2', name: '폼 클렌저로 2차 세안', time: '1분' },
      { id: 'evening-default-3', name: '토너로 피부 정리', time: '30초' },
      { id: 'evening-default-4', name: '세럼/앰플 흡수', time: '30초' },
      { id: 'evening-default-5', name: '나이트 크림 마무리', time: '30초' }
    ]
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // 타이머 관련 상태
  const [activeTimer, setActiveTimer] = useState(null) // 현재 실행 중인 타이머의 stepId
  const [timerSeconds, setTimerSeconds] = useState({}) // 각 단계별 남은 시간
  const [timerRunning, setTimerRunning] = useState({}) // 각 단계별 타이머 실행 상태
  const intervalRef = useRef({}) // 타이머 인터벌 참조

  // 시간 문자열을 초로 변환 (예: "1분" -> 60, "30초" -> 30)
  const parseTimeToSeconds = (timeStr) => {
    if (!timeStr) return 30 // 기본값 30초
    if (timeStr.includes('분')) {
      const minutes = parseInt(timeStr.replace('분', '').trim())
      return minutes * 60
    } else {
      // 체크 항목이 없으면 빈 배열로 초기화
      setCheckedSteps({
        morning: [],
        evening: []
      })
    }
    return parseInt(timeStr.replace('초', '').trim()) || 30
  }

  // 타이머 시작
  const startTimer = (stepId, timeStr) => {
    // 이전 타이머가 있다면 정지
    if (activeTimer && activeTimer !== stepId) {
      stopTimer(activeTimer)
    }

    const seconds = parseTimeToSeconds(timeStr)
    setActiveTimer(stepId)
    setTimerSeconds(prev => ({ ...prev, [stepId]: seconds }))
    setTimerRunning(prev => ({ ...prev, [stepId]: true }))

    intervalRef.current[stepId] = setInterval(() => {
      setTimerSeconds(prev => {
        const newSeconds = (prev[stepId] || seconds) - 1
        
        if (newSeconds <= 0) {
          // 타이머 완료
          stopTimer(stepId)
          // 완료 알림 (진동이 가능하면 진동도)
          if ('vibrate' in navigator) {
            navigator.vibrate(200)
          }
          // 자동 체크
          if (!checkedSteps[currentTime].includes(stepId)) {
            toggleStep(stepId)
          }
          // 알림음 재생 (optional)
          playNotificationSound()
          return prev
        }
        
        return { ...prev, [stepId]: newSeconds }
      })
    }, 1000)
  }

  // 타이머 정지
  const stopTimer = (stepId) => {
    if (intervalRef.current[stepId]) {
      clearInterval(intervalRef.current[stepId])
      delete intervalRef.current[stepId]
    }
    setTimerRunning(prev => ({ ...prev, [stepId]: false }))
    if (activeTimer === stepId) {
      setActiveTimer(null)
    }
  }

  // 알림음 재생 (간단한 비프음)
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUq7n4blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT' +
        'gwPU7Hn47RcGAU+k9j1vHYlBS10xu7bi0AIHWu+9OaXTwwHUa/n4rdcGAU8k9r1vHYlBS10xu7bi0AIHWu+9OaXTwwHUa/n4rdcGAU8k9r1vncmBC9zxu3hlEIJG2m98eSWTwwPU7Hn47RcGAU+k9j1vHYlBS10xu7bi0AIHWu+9OaXTwwHUa/n4rdcGAU8k9r1vncmBC9zxu3hlEIJG2m98eSWTwwPU7Hn47RcGAU+k9j1vHYlBS10xu7bi0AIHWu+9OaXTwwNU6zn47RcGAU+k9j1vHYlBS10xu7bi0AIHWu+9OaXTwwHUa/n4rdcGAU8k9r1vncmBC9zxu3hlEIJG2m98eSWTwwPU7Hn47RcGAU+k9j1vHYlBS10xu7bi0AIHWu+9OaXTwwHUa/n4rdcGAU8k9r1vncmBC9zxu3hlEIJG2m98eSWTwwPU7Hn47RcGAU+k9j1vHYlBS10xu7bi0AIHWu+9OaXTwwHUa/n4rdcGAU8k9r1vncmBC9zxu3hlEIJG2m98eSWTwwPU7Hn47RcGAU+k9j1vHYlBS10xu7bi0AIHWu+9OaXTwwHUa/n4rdcGAU8k9r1vncmBC9zxu3hlEIJG2m98eSWTwwPU7Hn47RcGAU+k9j1vHYlBS10xu7bi0AIHWu+9OaXTwwHUa/n4rdcGAU8k9r1vncmBC9zxu3hlEIJG2m98eSWTwwPU7Hn47RcGAU+k9j1vHYlBS10xu7bi0AIHWu+9OaXTwwHUa/n4rdcGAU8k9r1vncmBC9zxu3hlEIJG2m98eSWTwwPU7Hn47RcGAU+k9j1vHYlBS10xu7bi0AIHWu+9OaXTwwHUa/n4rdcGAU8k9r1vncmBC9zxu3hlEIJG2m98eSWTwwPU7Hn47RcGAU+k9j1vHYlBS10xu7bi0AIHWu+9OaXTwwHUa/n4rdcGAU8k9r1vncmBC9zxu3hlEIJG2m98eSWTwwPU7Hn47RcGAU+k9j1vHYlBS10xu7bi0AIHWu+9OaXTwwHUa/n4rdcGAU8k9r1vncmBC9zxu3hlEIJG2m98eSWTwwPU7Hn47RcGAU+k9j1vHYlBS10xu7b')
      audio.volume = 0.3
      audio.play()
    } catch (e) {
      console.log('Could not play sound')
    }
  }

  // 시간 포맷팅 (초를 분:초 형식으로)
  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return () => {
      Object.keys(intervalRef.current).forEach(stepId => {
        clearInterval(intervalRef.current[stepId])
      })
    }
  }, [])
  const generateRoutineFromRecipe = (recipe) => {
    if (!recipe) return { morning: [], evening: [] }

    // 레시피의 단계를 아침/저녁으로 분류
    const morningSteps = []
    const eveningSteps = []

    // 기본 클렌징 단계
    morningSteps.push({
      id: 'cleanse-1',
      name: '미온수로 가볍게 세안',
      time: '30초',
      category: 'cleanse'
    })

    eveningSteps.push({
      id: 'cleanse-1',
      name: '클렌징 오일/밤으로 1차 세안',
      time: '1분',
      category: 'cleanse'
    })
    eveningSteps.push({
      id: 'cleanse-2',
      name: '폼/젤 클렌저로 2차 세안',
      time: '1분',
      category: 'cleanse'
    })

    // 레시피의 주요 성분에 따른 단계 추가
    if (recipe.mainIngredients?.includes('BHA')) {
      morningSteps.push({
        id: 'treatment-1',
        name: 'BHA 토너로 각질 정리',
        time: '30초',
        category: 'treatment'
      })
      eveningSteps.push({
        id: 'treatment-1',
        name: 'BHA 세럼 집중 케어',
        time: '30초',
        category: 'treatment'
      })
    }

    // 수분/보습 단계
    morningSteps.push({
      id: 'moisturize-1',
      name: '수분 세럼/에센스 도포',
      time: '30초',
      category: 'moisturize'
    })
    morningSteps.push({
      id: 'moisturize-2',
      name: '가벼운 수분크림 마무리',
      time: '30초',
      category: 'moisturize'
    })

    eveningSteps.push({
      id: 'moisturize-1',
      name: '영양 세럼 흡수시키기',
      time: '30초',
      category: 'moisturize'
    })
    eveningSteps.push({
      id: 'moisturize-2',
      name: '나이트 크림으로 마무리',
      time: '30초',
      category: 'moisturize'
    })

    // 선크림은 아침에만
    morningSteps.push({
      id: 'protect-1',
      name: '선크림 꼼꼼히 바르기',
      time: '1분',
      category: 'protect',
      important: true
    })

    return { morning: morningSteps, evening: eveningSteps }
  }

  useEffect(() => {
    // 현재 시간에 따라 아침/저녁 자동 선택
    const hour = new Date().getHours()
    setCurrentTime(hour >= 6 && hour < 12 ? 'morning' : 'evening')

    // 저장된 레시피 정보 가져오기
    const saved = localStorage.getItem('currentRecipe')
    if (saved) {
      const recipe = JSON.parse(saved)
      setCurrentRecipe(recipe)
      const generatedRoutine = generateRoutineFromRecipe(recipe)
      setRoutineData(generatedRoutine)
    }

    // 오늘 체크한 항목 가져오기
    const today = new Date().toDateString()
    const savedChecks = localStorage.getItem(`routine-${today}`)
    if (savedChecks) {
      const parsedChecks = JSON.parse(savedChecks)
      // 저장된 체크 항목이 현재 루틴에 유효한지 확인
      setCheckedSteps({
        morning: parsedChecks.morning || [],
        evening: parsedChecks.evening || []
      })
    }
    
    setIsLoading(false)
  }, [])

  const toggleStep = (stepId) => {
    const currentChecked = checkedSteps[currentTime] || []
    const isChecking = !currentChecked.includes(stepId)
    
    // 체크 해제 시 타이머도 정지
    if (!isChecking && timerRunning[stepId]) {
      stopTimer(stepId)
    }
    
    // 현재 루틴에 실제로 존재하는 step인지 확인
    const stepExists = currentRoutine.some(step => step.id === stepId)
    if (!stepExists) {
      console.error('Step not found in current routine:', stepId)
      return
    }
    
    const newCheckedSteps = {
      ...checkedSteps,
      [currentTime]: isChecking
        ? [...currentChecked, stepId]
        : currentChecked.filter(id => id !== stepId)
    }
    
    setCheckedSteps(newCheckedSteps)
    
    // 로컬스토리지에 저장
    const today = new Date().toDateString()
    localStorage.setItem(`routine-${today}`, JSON.stringify(newCheckedSteps))

    // 첫 번째 체크 시 시작 시간 기록
    if (isChecking && currentChecked.length === 0) {
      setRoutineStartTime(new Date())
    }

    // 실시간으로 다이어리 업데이트
    updateDiaryProgress(newCheckedSteps)
  }

  const updateDiaryProgress = (currentCheckedSteps) => {
    const today = new Date().toISOString().split('T')[0]
    const diaryEntries = JSON.parse(localStorage.getItem('diaryEntries') || '[]')
    
    const todayEntry = diaryEntries.find(e => e.date === today) || {
      date: today,
      mood: '',
      note: '',
      morningDone: false,
      eveningDone: false,
      morningProgress: 0,
      eveningProgress: 0
    }
    
    // 진행률 계산
    const currentRoutine = routineData[currentTime] || []
    const checkedCount = (currentCheckedSteps[currentTime] || []).length
    const progress = currentRoutine.length > 0 
      ? Math.round((checkedCount / currentRoutine.length) * 100)
      : 0
    
    todayEntry[`${currentTime}Progress`] = progress
    
    // 100% 완료 시 자동으로 완료 표시
    if (progress === 100) {
      todayEntry[`${currentTime}Done`] = true
    }
    
    const updatedEntries = [
      ...diaryEntries.filter(e => e.date !== today),
      todayEntry
    ]
    
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries))

    // 전역 함수가 있으면 호출
    if (window.updateDiaryRoutine && progress === 100) {
      window.updateDiaryRoutine(`${currentTime}Done`)
    }
  }

  const completeRoutine = () => {
    const routineEndTime = new Date()
    const duration = routineStartTime 
      ? Math.round((routineEndTime - routineStartTime) / 1000 / 60) 
      : 0

    // 완료 메시지에 소요 시간 포함
    const message = duration > 0 
      ? `${currentTime === 'morning' ? '아침' : '저녁'} 루틴 완료! 🎉\n소요 시간: ${duration}분`
      : `${currentTime === 'morning' ? '아침' : '저녁'} 루틴 완료! 🎉`
    
    alert(message)

    // 현재 시간대 루틴 완료 처리
    updateDiaryCompletion()

    // 다음 추천 액션
    if (currentTime === 'morning') {
      // 아침 완료 후 
      const response = confirm('저녁 루틴도 미리 확인하시겠어요?')
      if (response) {
        setCurrentTime('evening')
      } else {
        router.push('/') // 홈으로
      }
    } else {
      // 저녁 완료 후 다이어리로
      router.push('/diary')
    }
  }

  // 다이어리에 완료 상태 저장하는 별도 함수
  const updateDiaryCompletion = () => {
    const today = new Date().toISOString().split('T')[0]
    const diaryEntries = JSON.parse(localStorage.getItem('diaryEntries') || '[]')
    
    const todayEntry = diaryEntries.find(e => e.date === today) || {
      date: today,
      mood: '',
      note: '',
      morningDone: false,
      eveningDone: false
    }
    
    todayEntry[`${currentTime}Done`] = true
    
    const updatedEntries = [
      ...diaryEntries.filter(e => e.date !== today),
      todayEntry
    ]
    
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries))
  }

  const skipRoutine = () => {
    if (confirm('정말 이번 루틴을 건너뛰시겠어요?')) {
      router.push('/')
    }
  }

  // 진행률 계산 - 현재 루틴에 있는 항목만 카운트
  const currentRoutine = routineData[currentTime] || []
  const currentRoutineIds = currentRoutine.map(step => step.id)
  
  // 현재 루틴에 실제로 존재하는 체크 항목만 필터링
  const validCheckedItems = (checkedSteps[currentTime] || []).filter(id => 
    currentRoutineIds.includes(id)
  )
  
  const checkedCount = validCheckedItems.length
  const totalCount = currentRoutine.length
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0
  const isCurrentTimeCompleted = checkedCount === totalCount && totalCount > 0
  
  // 디버깅
  if (checkedSteps[currentTime] && checkedSteps[currentTime].length !== validCheckedItems.length) {
    console.warn(`Invalid items filtered out for ${currentTime}:`, 
      checkedSteps[currentTime].filter(id => !currentRoutineIds.includes(id))
    )
  }

  // 현재 시간대에 맞는 인사말
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return '좋은 아침이에요! ☀️'
    if (hour >= 12 && hour < 18) return '오늘도 화이팅! 💪'
    return '하루 마무리 시간이에요 🌙'
  }

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">루틴을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-sm mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 text-sm mb-4 hover:text-gray-900"
          >
            ← 뒤로가기
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getGreeting()}
          </h1>
          
          {currentRecipe ? (
            <p className="text-gray-600">
              {currentRecipe.title} 진행 중
            </p>
          ) : (
            <p className="text-gray-600">
              기본 스킨케어 루틴
            </p>
          )}
        </div>

        {/* 아침/저녁 탭 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setCurrentTime('morning')
              // 탭 전환 시 해당 시간대 체크 항목 검증
              const morningIds = routineData.morning.map(step => step.id)
              const validMorningChecks = (checkedSteps.morning || []).filter(id => 
                morningIds.includes(id)
              )
              if (validMorningChecks.length !== (checkedSteps.morning || []).length) {
                setCheckedSteps(prev => ({ ...prev, morning: validMorningChecks }))
              }
            }}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all
              ${currentTime === 'morning' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            <span className="mr-1">🌅</span>
            아침 루틴
            {routineData.morning && routineData.morning.length > 0 && checkedSteps.morning && (
              <span className="ml-2 text-xs">
                ({Math.min(checkedSteps.morning.length, routineData.morning.length)}/{routineData.morning.length})
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setCurrentTime('evening')
              // 탭 전환 시 해당 시간대 체크 항목 검증
              const eveningIds = routineData.evening.map(step => step.id)
              const validEveningChecks = (checkedSteps.evening || []).filter(id => 
                eveningIds.includes(id)
              )
              if (validEveningChecks.length !== (checkedSteps.evening || []).length) {
                setCheckedSteps(prev => ({ ...prev, evening: validEveningChecks }))
              }
            }}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all
              ${currentTime === 'evening' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            <span className="mr-1">🌙</span>
            저녁 루틴
            {routineData.evening && routineData.evening.length > 0 && checkedSteps.evening && (
              <span className="ml-2 text-xs">
                ({Math.min(checkedSteps.evening.length, routineData.evening.length)}/{routineData.evening.length})
              </span>
            )}
          </button>
        </div>

        {/* 진행률 */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {currentTime === 'morning' ? '아침' : '저녁'} 루틴 진행률
            </span>
            <span className="text-sm font-medium">
              {Math.min(checkedCount, totalCount)}/{totalCount} ({Math.min(Math.round(progress), 100)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            {routineStartTime && (
              <p className="text-xs text-gray-500">
                시작: {routineStartTime.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            )}
            {activeTimer && (
              <p className="text-xs text-yellow-600 font-medium">
                ⏱ 타이머 실행 중
              </p>
            )}
          </div>
        </div>

        {/* 체크리스트 */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          {currentRoutine.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">루틴이 설정되지 않았습니다.</p>
              <button
                onClick={() => router.push('/recipe')}
                className="mt-4 text-blue-600 text-sm hover:underline"
              >
                레시피 선택하러 가기 →
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {currentRoutine.map((step, index) => {
                  const isChecked = validCheckedItems.includes(step.id)
                  const isTimerActive = timerRunning[step.id]
                  const remainingTime = timerSeconds[step.id]
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all
                        ${isChecked ? 'bg-blue-50 border border-blue-200' : 
                          isTimerActive ? 'bg-yellow-50 border border-yellow-200' :
                          'hover:bg-gray-50 border border-transparent'}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleStep(step.id)}
                        className="w-5 h-5 mt-0.5 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className={`font-medium transition-all ${
                          isChecked ? 'line-through text-gray-400' : 'text-gray-900'
                        }`}>
                          <span className="text-blue-600 mr-1">{index + 1}.</span>
                          {step.name}
                          {step.important && (
                            <span className="ml-2 text-red-500">⚡</span>
                          )}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-500">
                            예상 시간: {step.time}
                          </p>
                          {isTimerActive && remainingTime !== undefined && (
                            <p className="text-xs font-medium text-yellow-600">
                              남은 시간: {formatTime(remainingTime)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* 타이머 버튼 */}
                      {!isChecked && (
                        <button
                          onClick={() => {
                            if (isTimerActive) {
                              stopTimer(step.id)
                            } else {
                              startTimer(step.id, step.time)
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${isTimerActive 
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {isTimerActive ? (
                            <>⏸ 정지</>
                          ) : (
                            <>⏱ 타이머</>
                          )}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* 타이머 사용 안내 */}
              {currentRoutine.length > 0 && !activeTimer && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 각 단계의 타이머를 사용하면 정확한 시간 동안 케어할 수 있어요!
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={completeRoutine}
            disabled={!isCurrentTimeCompleted}
            className={`w-full py-3 rounded-xl font-medium transition-all
              ${isCurrentTimeCompleted 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg' 
                : 'bg-gray-200 text-gray-400'}`}
          >
            {isCurrentTimeCompleted 
              ? `${currentTime === 'morning' ? '아침' : '저녁'} 루틴 완료하기 🎉` 
              : `${Math.max(totalCount - checkedCount, 0)}개 단계 남음`}
          </button>

          {!isCurrentTimeCompleted && (
            <button
              onClick={skipRoutine}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              이번엔 건너뛰기
            </button>
          )}
        </div>

        {/* 동기부여 메시지 */}
        <div className={`mt-6 p-4 rounded-xl transition-all ${
          activeTimer ? 'bg-yellow-50' :
          progress === 0 ? 'bg-gray-50' :
          progress < 50 ? 'bg-blue-50' :
          progress < 100 ? 'bg-green-50' :
          'bg-gradient-to-r from-blue-50 to-purple-50'
        }`}>
          <p className={`text-sm ${
            activeTimer ? 'text-yellow-800' :
            progress === 0 ? 'text-gray-700' :
            progress < 50 ? 'text-blue-800' :
            progress < 100 ? 'text-green-800' :
            'text-purple-800'
          }`}>
            {activeTimer && '⏱ 타이머 진행 중! 피부에 충분한 시간을 주세요.'}
            {!activeTimer && progress === 0 && '💡 천천히, 꼼꼼하게 진행해보세요!'}
            {!activeTimer && progress > 0 && progress < 50 && '👍 좋은 시작이에요! 계속 진행해보세요.'}
            {!activeTimer && progress >= 50 && progress < 100 && '🔥 절반 이상 완료! 조금만 더 힘내세요!'}
            {!activeTimer && progress === 100 && '🌟 완벽해요! 오늘도 피부 관리 성공!'}
          </p>
        </div>
      </div>
    </div>
  )
}
