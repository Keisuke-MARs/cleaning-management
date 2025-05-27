"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import HeaderWithMenu from "@/app/components/layout/header-with-menu"
import LoadingSpinner from "@/app/components/loading-spinner"

interface SimpleAuthProps {
  children: React.ReactNode
}

export default function SimpleAuth({ children }: SimpleAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      console.log('🔍 シンプル認証チェック開始')
      
      // 認証ダイアログを表示
      const credentials = prompt('認証が必要です。\nユーザー名:パスワードの形式で入力してください\n(例: admin:password)')
      
      if (credentials) {
        const [username, password] = credentials.split(':')
        
        // 簡単な認証チェック
        if (username === 'admin' && password === 'password') {
          console.log('✅ 認証成功')
          setIsAuthenticated(true)
        } else {
          console.log('❌ 認証失敗')
          alert('認証に失敗しました')
          window.location.href = '/'
        }
      } else {
        console.log('❌ 認証キャンセル')
        window.location.href = '/'
      }
      
      setIsAuthenticating(false)
    }

    checkAuth()
  }, [])

  // 認証中の表示
  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <HeaderWithMenu title="指示書作成" />
        <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-8">
          <LoadingSpinner size="large" text="認証中..." />
        </main>
      </div>
    )
  }

  // 認証されていない場合の表示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <HeaderWithMenu title="指示書作成" />
        <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-8">
          <div className="w-full max-w-lg flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
            <div className="text-xl font-bold mb-4">認証が必要です</div>
            <p className="text-gray-600 mb-6">このページにアクセスするには認証が必要です。</p>
            <Link
              href="/"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-colors"
            >
              トップに戻る
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // 認証成功時は子コンポーネントを表示
  return <>{children}</>
} 