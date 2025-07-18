'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [hasRecipe, setHasRecipe] = useState(false)
  const [recipeId, setRecipeId] = useState(null)
  
  useEffect(() => {
    // 현재 진행 중인 레시피 확인
    const savedRecipe = localStorage.getItem('currentRecipe')
    if (savedRecipe) {
      const recipe = JSON.parse(savedRecipe)
      setHasRecipe(true)
      setRecipeId(recipe.id)
    }
  }, [pathname]) // 페이지 이동 시마다 체크
  
  const handleRecipeClick = (e) => {
    e.preventDefault()
    if (hasRecipe && recipeId) {
      // 진행 중인 레시피가 있으면 해당 레시피로
      router.push(`/recipes/${recipeId}`)
    } else {
      // 없으면 레시피 탐색으로
      router.push('/recipes')
    }
  }
  
  const navItems = [
    { href: '/', icon: '🏠', label: '홈', onClick: null },
    { href: '/recipes', icon: '📋', label: '레시피', onClick: handleRecipeClick },
    { href: '/diary', icon: '📖', label: '다이어리', onClick: null },
    { href: '/profile', icon: '👤', label: '프로필', onClick: null }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/' && pathname.startsWith(item.href))
            
            if (item.onClick) {
              return (
                <button
                  key={item.href}
                  onClick={item.onClick}
                  className={`flex flex-col items-center justify-center flex-1 h-full ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  <span className="text-xl mb-1">{item.icon}</span>
                  <span className="text-xs">
                    {item.label}
                    {item.label === '레시피' && hasRecipe && ' •'}
                  </span>
                </button>
              )
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
