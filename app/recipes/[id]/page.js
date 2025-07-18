'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RecipeDetailPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('morning')

  // 예시 레시피 데이터
  const recipe = {
    title: 'BHA 블랙헤드 케어',
    description: '모공 속 노폐물을 깨끗하게',
    difficulty: '초급',
    duration: '4주 프로그램',
    mainIngredients: ['BHA (살리실산)', '나이아신아마이드', '히알루론산'],
    targetConcerns: ['모공 속 각질 제거', '피지 조절 & 미백', '수분 공급'],
    morning: [
      { id: 1, name: '약산성 클렌저로 세안', time: '1분' },
      { id: 2, name: 'BHA 토너 흡수시키기', time: '30초' },
      { id: 3, name: '수분 세럼 도포', time: '30초' },
      { id: 4, name: '수분 크림 마무리', time: '30초' },
      { id: 5, name: '선크림 필수!', time: '30초' }
    ],
    evening: [
      { id: 1, name: '오일 클렌저로 1차 세안', time: '1분' },
      { id: 2, name: '폼 클렌저로 2차 세안', time: '1분' },
      { id: 3, name: 'BHA 세럼 도포', time: '30초' },
      { id: 4, name: '진정 크림 마무리', time: '30초' }
    ],
    tips: [
      'BHA는 처음엔 주 2-3회만 사용하세요',
      '자외선 차단제는 필수입니다',
      '따가움이 있다면 사용을 중단하세요'
    ]
  }

  const startRoutine = () => {
    // 현재 레시피 정보를 저장
    localStorage.setItem('currentRecipe', JSON.stringify(recipe))
    // 루틴 체크리스트 페이지로 이동
    router.push('/today-routine')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-sm mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 text-sm mb-4"
          >
            ← 뒤로가기
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {recipe.title}
          </h1>
          <p className="text-gray-600 mt-2">{recipe.description}</p>
          
          <div className="flex gap-4 mt-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              {recipe.difficulty}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {recipe.duration}
            </span>
          </div>
        </div>

        {/* 주요 성분 */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="font-semibold mb-4">주요 성분</h2>
          <div className="space-y-3">
            {recipe.mainIngredients.map((ingredient, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{ingredient}</p>
                  <p className="text-sm text-gray-500">{recipe.targetConcerns[index]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 아침/저녁 루틴 탭 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedTab('morning')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all
              ${selectedTab === 'morning' 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-white text-gray-600'}`}
          >
            ☀️ 아침 루틴 (5단계)
          </button>
          <button
            onClick={() => setSelectedTab('evening')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all
              ${selectedTab === 'evening' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-white text-gray-600'}`}
          >
            🌙 저녁 루틴 (4단계)
          </button>
        </div>

        {/* 루틴 단계 표시 (체크박스 없이) */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="space-y-3">
            {recipe[selectedTab].map((step, index) => (
              <div
                key={step.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{step.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 꿀팁 */}
        <div className="bg-yellow-50 rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            💡 꿀팁
          </h3>
          <ul className="space-y-2">
            {recipe.tips.map((tip, index) => (
              <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                <span>•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 시작하기 버튼 */}
        <button
          onClick={startRoutine}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          이 루틴 시작하기
        </button>

        {/* 추가 안내 */}
        <p className="text-center text-sm text-gray-500 mt-4">
          시작하면 매일 체크리스트와 타이머를 사용할 수 있어요
        </p>
      </div>
    </div>
  )
}
