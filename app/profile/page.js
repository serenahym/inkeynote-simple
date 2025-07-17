'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [currentRecipe, setCurrentRecipe] = useState(null)
  const [diaryCount, setDiaryCount] = useState(0)
  const [userInfo, setUserInfo] = useState({
    name: '스킨케어 러버',
    skinType: '복합성',
    startDate: '2024-01-01'
  })

  useEffect(() => {
    // 현재 레시피 정보 가져오기
    const savedRecipe = localStorage.getItem('currentRecipe')
    if (savedRecipe) {
      setCurrentRecipe(JSON.parse(savedRecipe))
    }

    // 다이어리 기록 수 가져오기
    const diaryEntries = localStorage.getItem('diaryEntries')
    if (diaryEntries) {
      setDiaryCount(JSON.parse(diaryEntries).length)
    }

    // 사용자 정보 가져오기 (있다면)
    const savedUser = localStorage.getItem('userInfo')
    if (savedUser) {
      setUserInfo(JSON.parse(savedUser))
    }
  }, [])

  const stats = [
    { label: '진행 중인 레시피', value: currentRecipe ? '1개' : '0개' },
    { label: '총 기록일수', value: `${diaryCount}일` },
    { label: '연속 실천일', value: '7일' },
    { label: '완료한 레시피', value: '3개' }
  ]

  const menuItems = [
    { icon: '📝', label: '내 정보 수정', action: () => alert('준비중입니다!') },
    { icon: '🎯', label: '목표 설정', action: () => alert('준비중입니다!') },
    { icon: '📊', label: '상세 통계', action: () => alert('준비중입니다!') },
    { icon: '🔔', label: '알림 설정', action: () => alert('준비중입니다!') },
    { icon: '❓', label: '도움말', action: () => alert('준비중입니다!') },
    { icon: '📧', label: '문의하기', action: () => alert('inkeynote@example.com') }
  ]

  const handleLogout = () => {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
      localStorage.clear()
      router.push('/')
    }
  }

  const resetData = () => {
    if (confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      localStorage.clear()
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-sm mx-auto px-4 py-8">
        {/* 헤더 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          프로필
        </h1>

        {/* 사용자 정보 카드 */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg">{userInfo.name}</h2>
              <p className="text-sm text-gray-600">피부타입: {userInfo.skinType}</p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            INKEYNOTE와 함께한 지 {Math.floor((new Date() - new Date(userInfo.startDate)) / (1000 * 60 * 60 * 24))}일째
          </div>
        </div>

        {/* 통계 그리드 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 현재 진행 중인 레시피 */}
        {currentRecipe && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-2 text-blue-900">진행 중인 레시피</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentRecipe.title}</p>
                <p className="text-sm text-blue-700">
                  {currentRecipe.daysCompleted || 0}/28일 진행
                </p>
              </div>
              <button
                onClick={() => router.push(`/recipes/${currentRecipe.id}`)}
                className="text-blue-600 text-sm font-medium"
              >
                보기 →
              </button>
            </div>
          </div>
        )}

        {/* 메뉴 리스트 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          ))}
        </div>

        {/* 로그아웃 / 데이터 초기화 */}
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full py-3 text-gray-600 text-sm font-medium hover:text-gray-800"
          >
            로그아웃
          </button>
          
          <button
            onClick={resetData}
            className="w-full py-3 text-red-500 text-sm font-medium hover:text-red-600"
          >
            데이터 초기화
          </button>
        </div>

        {/* 버전 정보 */}
        <p className="text-center text-xs text-gray-400 mt-8">
          INKEYNOTE v1.0.0
        </p>
      </div>
    </div>
  )
}
