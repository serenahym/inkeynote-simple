'use client'
import { useState, useEffect, useRef } from 'react'

export default function DiaryPage() {
  const [diaryEntries, setDiaryEntries] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [todayMood, setTodayMood] = useState('')
  const [todayNote, setTodayNote] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [todayPhoto, setTodayPhoto] = useState('')
  
  // 카메라 관련 refs
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // 저장된 일기 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('diaryEntries')
    if (saved) {
      setDiaryEntries(JSON.parse(saved))
    }
  }, [])

  // 오늘의 일기 찾기
  const todayEntry = diaryEntries.find(entry => entry.date === selectedDate)
  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  const moods = [
    { emoji: '😊', label: '아주 좋음' },
    { emoji: '🙂', label: '좋음' },
    { emoji: '😐', label: '보통' },
    { emoji: '😟', label: '안좋음' },
    { emoji: '😢', label: '힘듦' }
  ]

  // 카메라 시작
  const startCamera = async () => {
    try {
      // iOS 체크
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      
      // 먼저 권한 확인
      const permissions = await navigator.permissions.query({ name: 'camera' }).catch(() => null)
      console.log('Camera permission:', permissions?.state)
      
      // 카메라 스트림 요청
      const constraints = {
        video: isIOS 
          ? {
              facingMode: { ideal: 'user' },
              width: { ideal: 640 },
              height: { ideal: 480 }
            }
          : {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
        audio: false
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // iOS에서는 명시적으로 play() 호출
        if (isIOS) {
          videoRef.current.setAttribute('autoplay', '')
          videoRef.current.setAttribute('playsinline', '')
          await videoRef.current.play()
        }
        streamRef.current = stream
      }
      setShowCamera(true)
    } catch (err) {
      console.error('카메라 접근 오류:', err)
      
      // 더 자세한 에러 메시지
      if (err.name === 'NotAllowedError') {
        alert('카메라 권한이 필요합니다.\n\n설정 > Safari > 카메라에서 권한을 허용해주세요.')
      } else if (err.name === 'NotFoundError') {
        alert('카메라를 찾을 수 없습니다.')
      } else if (err.name === 'NotReadableError') {
        alert('카메라가 이미 다른 앱에서 사용 중입니다.')
      } else if (err.name === 'OverconstrainedError') {
        // 제약 조건이 맞지 않을 때 - 더 간단한 설정으로 재시도
        try {
          const simpleStream = await navigator.mediaDevices.getUserMedia({ video: true })
          if (videoRef.current) {
            videoRef.current.srcObject = simpleStream
            streamRef.current = simpleStream
          }
          setShowCamera(true)
        } catch (retryErr) {
          alert('카메라를 시작할 수 없습니다: ' + retryErr.message)
        }
      } else {
        alert('카메라 오류: ' + err.message)
      }
    }
  }

  // 카메라 정지
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  // 사진 촬영
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      // 캔버스 크기를 비디오와 동일하게 설정
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // 비디오 프레임을 캔버스에 그리기
      context.drawImage(video, 0, 0)
      
      // 캔버스를 base64 이미지로 변환
      const photoData = canvas.toDataURL('image/jpeg', 0.8)
      setTodayPhoto(photoData)
      
      // 카메라 정지
      stopCamera()
    }
  }

  // 사진 삭제
  const deletePhoto = () => {
    setTodayPhoto('')
  }

  // 다이어리 저장 함수 개선
  const saveDiary = (customEntry = null) => {
    const newEntry = customEntry || {
      date: selectedDate,
      mood: todayMood,
      note: todayNote,
      photo: todayPhoto, // 사진 추가
      morningDone: todayEntry?.morningDone || false,
      eveningDone: todayEntry?.eveningDone || false,
      createdAt: new Date().toISOString()
    }

    const updatedEntries = [...diaryEntries.filter(e => e.date !== selectedDate), newEntry]
    setDiaryEntries(updatedEntries)
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries))
    
    if (!customEntry) {
      alert('저장되었습니다!')
      setTodayMood('')
      setTodayNote('')
      setTodayPhoto('')
      setIsEditMode(false)
    }
  }

  // 루틴 완료 상태 업데이트 함수
  const updateRoutineStatus = (routineType, completed) => {
    const existingEntry = diaryEntries.find(e => e.date === selectedDate)
    
    const updatedEntry = existingEntry ? {
      ...existingEntry,
      [routineType]: completed
    } : {
      date: selectedDate,
      mood: '',
      note: '',
      photo: '',
      morningDone: routineType === 'morningDone' ? completed : false,
      eveningDone: routineType === 'eveningDone' ? completed : false,
      createdAt: new Date().toISOString()
    }

    saveDiary(updatedEntry)
  }

  // 외부에서 루틴 완료 시 호출할 수 있도록 전역 함수 등록
  useEffect(() => {
    window.updateDiaryRoutine = (routineType) => {
      const today = new Date().toISOString().split('T')[0]
      const saved = localStorage.getItem('diaryEntries')
      const entries = saved ? JSON.parse(saved) : []
      const todayEntryIndex = entries.findIndex(e => e.date === today)
      
      if (todayEntryIndex >= 0) {
        entries[todayEntryIndex][routineType] = true
      } else {
        entries.push({
          date: today,
          mood: '',
          note: '',
          photo: '',
          morningDone: routineType === 'morningDone',
          eveningDone: routineType === 'eveningDone',
          createdAt: new Date().toISOString()
        })
      }
      
      localStorage.setItem('diaryEntries', JSON.stringify(entries))
    }

    return () => {
      delete window.updateDiaryRoutine
    }
  }, [])

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

  // 이번 주 통계 계산
  const getWeekStats = () => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartStr = weekStart.toISOString().split('T')[0]
    
    const weekEntries = diaryEntries.filter(entry => entry.date >= weekStartStr)
    const moodCounts = {}
    let routineCount = 0
    
    weekEntries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
      }
      if (entry.morningDone || entry.eveningDone) {
        routineCount++
      }
    })
    
    const mostFrequentMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '-'
    
    return {
      recordedDays: weekEntries.filter(e => e.mood || e.note).length,
      mostFrequentMood,
      routineCount
    }
  }

  const weekStats = getWeekStats()

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
              const entry = diaryEntries.find(e => e.date === dateStr)
              const hasEntry = !!entry
              const hasRoutine = entry?.morningDone || entry?.eveningDone
              const hasPhoto = !!entry?.photo
              const isSelected = dateStr === selectedDate
              const isToday = dateStr === new Date().toISOString().split('T')[0]
              
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative
                    ${isSelected ? 'bg-blue-600 text-white' : 
                      isToday ? 'bg-blue-100 text-blue-600' : 
                      'hover:bg-gray-100'}
                    ${hasEntry && !isSelected ? 'font-bold' : ''}
                  `}
                >
                  <span>{date.getDate()}</span>
                  <div className="flex gap-0.5 mt-1">
                    {hasEntry && (
                      <div className="w-1 h-1 bg-current rounded-full" />
                    )}
                    {hasRoutine && (
                      <div className="w-1 h-1 bg-green-500 rounded-full" />
                    )}
                    {hasPhoto && (
                      <div className="w-1 h-1 bg-purple-500 rounded-full" />
                    )}
                  </div>
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
              {(todayEntry.mood || todayEntry.note || todayEntry.photo) && !isEditMode ? (
                <>
                  {todayEntry.mood && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">오늘의 기분</p>
                      <p className="text-2xl">{todayEntry.mood}</p>
                    </div>
                  )}
                  {todayEntry.note && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">메모</p>
                      <p className="text-gray-800">{todayEntry.note}</p>
                    </div>
                  )}
                  {todayEntry.photo && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">오늘의 피부</p>
                      <img 
                        src={todayEntry.photo} 
                        alt="피부 상태" 
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex gap-3 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={todayEntry.morningDone || false}
                        onChange={(e) => isToday && updateRoutineStatus('morningDone', e.target.checked)}
                        disabled={!isToday}
                        className={isToday ? 'cursor-pointer' : 'cursor-not-allowed'}
                      />
                      <span className={todayEntry.morningDone ? 'text-green-600' : ''}>
                        아침 루틴 {todayEntry.morningDone && '✓'}
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={todayEntry.eveningDone || false}
                        onChange={(e) => isToday && updateRoutineStatus('eveningDone', e.target.checked)}
                        disabled={!isToday}
                        className={isToday ? 'cursor-pointer' : 'cursor-not-allowed'}
                      />
                      <span className={todayEntry.eveningDone ? 'text-green-600' : ''}>
                        저녁 루틴 {todayEntry.eveningDone && '✓'}
                      </span>
                    </label>
                  </div>
                  {/* 수정 버튼 */}
                  {isToday && (
                    <button
                      onClick={() => {
                        setIsEditMode(true)
                        setTodayMood(todayEntry.mood || '')
                        setTodayNote(todayEntry.note || '')
                        setTodayPhoto(todayEntry.photo || '')
                      }}
                      className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      수정하기
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* 루틴만 완료하고 기분/메모가 없는 경우 또는 편집 모드 */}
                  {(todayEntry.morningDone || todayEntry.eveningDone) && !todayEntry.mood && !todayEntry.note && !todayEntry.photo && !isEditMode && (
                    <>
                      <div className="flex gap-3 text-sm mb-4">
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={todayEntry.morningDone || false}
                            onChange={(e) => isToday && updateRoutineStatus('morningDone', e.target.checked)}
                            disabled={!isToday}
                            className={isToday ? 'cursor-pointer' : 'cursor-not-allowed'}
                          />
                          <span className={todayEntry.morningDone ? 'text-green-600' : ''}>
                            아침 루틴 {todayEntry.morningDone && '✓'}
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={todayEntry.eveningDone || false}
                            onChange={(e) => isToday && updateRoutineStatus('eveningDone', e.target.checked)}
                            disabled={!isToday}
                            className={isToday ? 'cursor-pointer' : 'cursor-not-allowed'}
                          />
                          <span className={todayEntry.eveningDone ? 'text-green-600' : ''}>
                            저녁 루틴 {todayEntry.eveningDone && '✓'}
                          </span>
                        </label>
                      </div>
                      <button
                        onClick={() => {
                          setIsEditMode(true)
                          setTodayMood('')
                          setTodayNote('')
                          setTodayPhoto('')
                        }}
                        className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        기분과 메모 추가하기
                      </button>
                    </>
                  )}
                  
                  {/* 편집 모드 또는 새로 입력하는 경우 */}
                  {(isEditMode || (!todayEntry.morningDone && !todayEntry.eveningDone)) && (
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

                      {/* 사진 섹션 */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">피부 상태 사진</p>
                        {todayPhoto ? (
                          <div className="relative">
                            <img 
                              src={todayPhoto} 
                              alt="피부 상태" 
                              className="w-full rounded-lg"
                            />
                            <button
                              onClick={deletePhoto}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <button
                              onClick={startCamera}
                              className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                            >
                              <div className="text-center">
                                <span className="text-3xl mb-2">📷</span>
                                <p className="text-sm text-gray-600">카메라로 촬영하기</p>
                              </div>
                            </button>
                            
                            {/* iOS 대안 - 파일 선택 */}
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-2">카메라가 안 되시나요?</p>
                              <label className="inline-block px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files[0]
                                    if (file) {
                                      const reader = new FileReader()
                                      reader.onloadend = () => {
                                        setTodayPhoto(reader.result)
                                      }
                                      reader.readAsDataURL(file)
                                    }
                                  }}
                                />
                                갤러리에서 선택 / 사진 촬영
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 오늘 날짜인 경우 루틴 체크박스 표시 */}
                      {isToday && !todayEntry.morningDone && !todayEntry.eveningDone && (
                        <div className="flex gap-3 text-sm">
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              onChange={(e) => updateRoutineStatus('morningDone', e.target.checked)}
                            />
                            <span>아침 루틴 완료</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              onChange={(e) => updateRoutineStatus('eveningDone', e.target.checked)}
                            />
                            <span>저녁 루틴 완료</span>
                          </label>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            saveDiary()
                          }}
                          disabled={!todayMood && !todayNote && !todayPhoto}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors
                            ${todayMood || todayNote || todayPhoto
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-200 text-gray-400'}
                          `}
                        >
                          저장하기
                        </button>
                        {isEditMode && (
                          <button
                            onClick={() => {
                              setIsEditMode(false)
                              setTodayMood('')
                              setTodayNote('')
                              setTodayPhoto('')
                            }}
                            className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            취소
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
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

              {/* 사진 섹션 */}
              <div>
                <p className="text-sm text-gray-600 mb-2">피부 상태 사진</p>
                {todayPhoto ? (
                  <div className="relative">
                    <img 
                      src={todayPhoto} 
                      alt="피부 상태" 
                      className="w-full rounded-lg"
                    />
                    <button
                      onClick={deletePhoto}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={startCamera}
                      className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      <div className="text-center">
                        <span className="text-3xl mb-2">📷</span>
                        <p className="text-sm text-gray-600">카메라로 촬영하기</p>
                      </div>
                    </button>
                    
                    {/* iOS 대안 - 파일 선택 */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2">카메라가 안 되시나요?</p>
                      <label className="inline-block px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setTodayPhoto(reader.result)
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                        갤러리에서 선택 / 사진 촬영
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={saveDiary}
                disabled={!todayMood && !todayNote && !todayPhoto}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${todayMood || todayNote || todayPhoto
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
              <span className="font-medium">{weekStats.recordedDays}일</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">루틴 실천</span>
              <span className="font-medium">{weekStats.routineCount}일</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">가장 많은 기분</span>
              <span className="font-medium">{weekStats.mostFrequentMood}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 카메라 모달 */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="relative flex-1">
            <video 
              ref={videoRef}
              autoPlay
              playsInline  // iOS에서 중요!
              muted        // iOS에서 자동재생을 위해 필요
              className="w-full h-full object-cover"
              onLoadedMetadata={() => {
                // 비디오가 로드되면 재생 시작
                if (videoRef.current) {
                  videoRef.current.play().catch(err => {
                    console.error('Video play error:', err)
                  })
                }
              }}
            />
            <canvas 
              ref={canvasRef}
              className="hidden"
            />
            
            {/* 상단 버튼 */}
            <button
              onClick={stopCamera}
              className="absolute top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-full"
            >
              ✕
            </button>
          </div>
          
          {/* 하단 컨트롤 */}
          <div className="bg-black p-6 flex justify-center">
            <button
              onClick={takePhoto}
              className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-gray-400 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  )
}
