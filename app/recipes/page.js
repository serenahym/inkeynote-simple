'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function RecipesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const concerns = searchParams.get('concerns')?.split(',') || []

  // 샘플 레시피 데이터
  const allRecipes = [
    {
      id: '1',
      title: 'BHA 블랙헤드 케어',
      description: '모공 속 노폐물을 깨끗하게',
      concerns: ['acne'],
      difficulty: '초급',
      time: 10,
      mainIngredients: ['BHA 2%', '나이아신아마이드']
    },
    {
      id: '2', 
      title: '극건성 7스킨법',
      description: '7번의 수분 레이어링으로 촉촉하게',
      concerns: ['dry'],
      difficulty: '중급',
      time: 15,
      mainIngredients: ['히알루론산', '세라마이드']
    },
    {
      id: '3',
      title: '비타민C 브라이트닝',
      description: '맑고 환한 피부톤 만들기',
      concerns: ['dull'],
      difficulty: '초급',
      time: 5,
      mainIngredients: ['비타민C 15%', '페룰산']
    },
    {
      id: '4',
      title: '시카 진정 루틴',
      description: '예민한 피부를 편안하게',
      concerns: ['sensitive'],
      difficulty: '초급',
      time: 8,
      mainIngredients: ['센텔라', '판테놀']
    },
    {
      id: '5',
      title: '레티놀 안티에이징',
      description: '탄력있는 피부 만들기',
      concerns: ['aging'],
      difficulty: '고급',
      time: 12,
      mainIngredients: ['레티놀 0.3%', '펩타이드']
    }
  ]

  // 선택한 고민에 맞는 레시피 필터링
  const filteredRecipes = allRecipes.filter(recipe => 
    recipe.concerns.some(concern => concerns.includes(concern))
  )

  const handleRecipeClick = (recipeId) => {
    router.push(`/recipes/${recipeId}`)
  }

  const difficultyColors = {
    '초급': 'bg-green-100 text-green-700',
    '중급': 'bg-yellow-100 text-yellow-700',
    '고급': 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
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
            맞춤 레시피
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredRecipes.length}개의 레시피를 찾았어요
          </p>
        </div>

        {/* 레시피 카드 목록 */}
        <div className="space-y-4">
          {filteredRecipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => handleRecipeClick(recipe.id)}
              className="w-full bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">
                  {recipe.title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[recipe.difficulty]}`}>
                  {recipe.difficulty}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {recipe.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {recipe.mainIngredients.map((ingredient, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {ingredient}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center text-xs text-gray-500">
                <span>⏱ {recipe.time}분</span>
              </div>
            </button>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              선택하신 고민에 맞는 레시피가 없어요 😢
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
