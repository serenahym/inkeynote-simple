import { Inter } from 'next/font/google'
import './globals.css'
import BottomNav from './components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'INKEYNOTE',
  description: '맞춤형 스킨케어 레시피',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="pb-16"> {/* 네비게이션 높이만큼 패딩 추가 */}
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  )
}