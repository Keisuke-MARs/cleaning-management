import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Basic認証の設定
const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER || "admin" // 環境変数から取得することを推奨
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || "password" // 環境変数から取得することを推奨

// Basic認証が必要なパスのパターン
const PROTECTED_PATHS = ["/instructions/create"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 保護されたパスかどうかを確認
  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path))

  if (isProtectedPath) {
    // Basic認証ヘッダーを取得
    const authHeader = request.headers.get("authorization")

    // 認証ヘッダーがない場合（初回アクセス時）
    if (!authHeader) {
      // Basic認証ダイアログを表示するために401ステータスコードを返す
      return new NextResponse("認証が必要です", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      })
    }

    try {
      // Basic認証ヘッダーをデコード
      const authValue = authHeader.split(" ")[1]
      const [user, password] = atob(authValue).split(":")

      // 認証情報を検証
      if (user === BASIC_AUTH_USER && password === BASIC_AUTH_PASSWORD) {
        // 認証成功時は通常通りリクエストを処理
        return NextResponse.next()
      } else {
        // 認証失敗時は401ステータスコードを返す（再度ダイアログを表示）
        return new NextResponse("認証が必要です", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Secure Area"',
          },
        })
      }
    } catch (error) {
      // デコードエラーなどの場合も401ステータスコードを返す
      return new NextResponse("認証が必要です", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      })
    }
  }

  // 保護されていないパスの場合はそのまま次へ
  return NextResponse.next()
}

// ミドルウェアを適用するパスを設定
export const config = {
  matcher: ["/instructions/:path*"],
}
