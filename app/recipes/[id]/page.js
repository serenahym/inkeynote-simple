'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id
  
  // 체크리스트 상태 관리
  const [checkedSteps, setCheckedSteps] = useState({
    morning: [],
    evening: []
  })

  // 샘플 레시피 상세 데이터 (실제로는 ID로 데이터 가져오기)
  const recipe = {
    id: recipeId,
    title: 'BHA 블랙헤드 케어',
    description: '모공 속 노폐물을 깨끗하게',
    difficulty: '초급',
    time: 10,
    duration: '4주 프로그램',
    morningSteps: [
      { id: 1, name: '약산성 클렌저로 세안', time: '1분' },
      { id: 2, name: 'BHA 토너 흡수시키기', time: '30초' },
      { id: 3, name: '수분 세럼 도포', time: '30초' },
      { id: 4, name: '수분 크림 마무리', time: '30초' },
      { id: 5, name: '선크림 필수!', time: '30초' }
    ],
    eveningSteps: [
      { id: 1, name: '오일 클렌저로 1차 세안', time: '1분' },
      { id: 2, name: '폼 클렌저로 2차 세안', time: '1분' },
      { id: 3, name: 'BHA 세럼 도포', time: '30초' },
      { id: 4, name: '진정 크림 마무리', time: '30초' }
    ],
    ingredients: [
      { name: 'BHA (살리실산)', description: '모공 속 각질 제거' },
      { name: '나이아신아마이드', description: '피지 조절 & 미백' },
      { name: '히알루론산', description: '수분 공급' }
    ],
    tips: [
      'BHA는 처음엔 주 2-3회만 사용하세요',
      '자외선 차단제는 필수입니다',
      '따가움이 있다면 사용을 중단하세요'
    ]
  }

  const toggleStep = (routine, stepId) => {
    setCheckedSteps(prev => ({
      ...prev,
      [routine]: prev[routine].includes(stepId)
        ? prev[routine].filter(id => id !== stepId)
        : [...prev[routine], stepId]
    }))
  }

  const startRoutine = () => {
    // 현재 레시피 정보를 localStorage에 저장
    const recipeData = {
      id: recipe.id,
      title: recipe.title,
      emoji: '🔴', // 또는 고민별 이모지
      daysCompleted: 0,
      progress: 0
    }
    localStorage.setItem('currentRecipe', JSON.stringify(recipeData))
    
    alert('루틴이 시작되었습니다!')
    router.push('/') // 홈으로 이동
  }

  return (
<div className="min-h-screen bg-gray-50 pb-4">      <div className="max-w-sm mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 text-sm mb-4"
          >
            ← 뒤로가기
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {recipe.title}
          </h1>
          <p className="text-gray-600">{recipe.description}</p>
          <div className="flex gap-3 mt-3">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {recipe.difficulty}
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {recipe.duration}
            </span>
          </div>
        </div>

        {/* 주요 성분 */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <h2 className="font-semibold mb-3">주요 성분</h2>
          <div className="space-y-2">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="font-medium">{ing.name}</span>
                <span className="text-gray-600">{ing.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 아침 루틴 */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <span>🌅</span> 아침 루틴 ({recipe.morningSteps.length}단계)
          </h2>
          <div className="space-y-2">
            {recipe.morningSteps.map((step) => (
              <label
                key={step.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checkedSteps.morning.includes(step.id)}
                  onChange={() => toggleStep('morning', step.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <span className={`text-sm ${
                    checkedSteps.morning.includes(step.id) ? 'line-through text-gray-400' : ''
                  }`}>
                    {step.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{step.time}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 저녁 루틴 */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <span>🌙</span> 저녁 루틴 ({recipe.eveningSteps.length}단계)
          </h2>
          <div className="space-y-2">
            {recipe.eveningSteps.map((step) => (
              <label
                key={step.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checkedSteps.evening.includes(step.id)}
                  onChange={() => toggleStep('evening', step.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <span className={`text-sm ${
                    checkedSteps.evening.includes(step.id) ? 'line-through text-gray-400' : ''
                  }`}>
                    {step.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{step.time}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 팁 */}
        <div className="bg-yellow-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-2 text-yellow-800">💡 꿀팁</h3>
          <ul className="space-y-1">
            {recipe.tips.map((tip, idx) => (
              <li key={idx} className="text-sm text-yellow-700">
                • {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA 버튼 */}
        <button
          onClick={startRoutine}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          이 루틴 시작하기
        </button>
      </div>
    </div>
  )
}
