'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [selectedConcerns, setSelectedConcerns] = useState([])
  const [hasRecipe, setHasRecipe] = useState(false)
  const [currentRecipe, setCurrentRecipe] = useState(null)
  const router = useRouter()

  // 페이지 로드 시 저장된 레시피 확인
  useEffect(() => {
    const savedRecipe = localStorage.getItem('currentRecipe')
    if (savedRecipe) {
      setCurrentRecipe(JSON.parse(savedRecipe))
      setHasRecipe(true)
    }
  }, [])

  const concerns = [
    { id: 'acne', emoji: '🔴', name: '여드름' },
    { id: 'dry', emoji: '💧', name: '건조함' },
    { id: 'dull', emoji: '☀️', name: '칙칙한 피부' },
    { id: 'sensitive', emoji: '😣', name: '민감성' },
    { id: 'aging', emoji: '⏰', name: '노화' },
    { id: 'etc', emoji: '✨', name: '기타' }
  ]

  const toggleConcern = (concernId) => {
    if (selectedConcerns.includes(concernId)) {
      setSelectedConcerns(selectedConcerns.filter(id => id !== concernId))
    } else if (selectedConcerns.length < 2) {
      setSelectedConcerns([...selectedConcerns, concernId])
    }
  }

  const handleNext = () => {
    if (selectedConcerns.length > 0) {
      router.push(`/recipes?concerns=${selectedConcerns.join(',')}`)
    }
  }

  const handleStartRoutine = () => {
    router.push(`/recipes/${currentRecipe.id}`)
  }

  const handleChangeRecipe = () => {
    localStorage.removeItem('currentRecipe')
    setHasRecipe(false)
    setCurrentRecipe(null)
  }

  // 대시보드 화면
  if (hasRecipe && currentRecipe) {
    return (
      <div className="min-h-screen bg-gray-50 pb-4">
        <div className="max-w-sm mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              안녕하세요! 👋
            </h1>
            <p className="text-gray-600">오늘도 건강한 피부 만들어요</p>
          </div>

          {/* 현재 진행 중인 레시피 */}
          <div className="bg-blue-50 rounded-2xl p-5 mb-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-blue-600 mb-1">진행 중인 레시피</p>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentRecipe.title}
                </h2>
              </div>
              <span className="text-2xl">{currentRecipe.emoji || '✨'}</span>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-blue-100 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${currentRecipe.progress || 25}%` }}
                />
              </div>
              <span className="text-xs text-blue-600">
                {currentRecipe.daysCompleted || 7}/28일
              </span>
            </div>

            <button
              onClick={handleStartRoutine}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              오늘의 루틴 시작하기
            </button>
          </div>

          {/* 오늘의 체크리스트 미리보기 */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>☀️</span> 오늘의 할 일
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <input type="checkbox" className="w-4 h-4" disabled />
                <span className="text-gray-700">아침 루틴 (5단계)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <input type="checkbox" className="w-4 h-4" disabled />
                <span className="text-gray-700">저녁 루틴 (4단계)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <input type="checkbox" className="w-4 h-4" disabled />
                <span className="text-gray-700">피부 상태 기록</span>
              </div>
            </div>
          </div>

          {/* 빠른 통계 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">7</p>
              <p className="text-xs text-gray-600">연속 실천일</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">85%</p>
              <p className="text-xs text-gray-600">이번주 달성률</p>
            </div>
          </div>

          {/* 레시피 변경 버튼 */}
          <button
            onClick={handleChangeRecipe}
            className="w-full text-gray-500 text-sm text-center hover:text-gray-700"
          >
            다른 레시피 찾아보기
          </button>
        </div>
      </div>
    )
  }

  // 온보딩 화면 (기존 코드)
  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <div className="max-w-sm mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            INKEYNOTE
          </h1>
          <p className="text-sm text-gray-600">
            당신의 피부를 위한 맞춤 레시피
          </p>
        </div>

        {/* 온보딩 카드 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-center mb-6">
            어떤 피부 고민이 있으신가요?
          </h2>
          
          {/* 컴팩트한 버튼들 */}
          <div className="space-y-2">
            {concerns.map((concern) => (
              <button
                key={concern.id}
                onClick={() => toggleConcern(concern.id)}
                className={`w-full p-3 text-sm flex items-center gap-3 rounded-xl border transition-all ${
                  selectedConcerns.includes(concern.id)
                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <span className="text-xl">{concern.emoji}</span>
                <span className="font-medium">{concern.name}</span>
                {selectedConcerns.includes(concern.id) && (
                  <span className="ml-auto">✓</span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={selectedConcerns.length === 0}
            className={`w-full mt-6 py-3 rounded-xl text-sm font-medium transition-colors ${
              selectedConcerns.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            다음
          </button>
        </div>

        {/* 하단 안내 */}
        <p className="text-center text-xs text-gray-500 mt-6">
          {selectedConcerns.length}/2개 선택됨
        </p>
      </div>
    </div>
  )
}