import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Basic認証の設定
const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER || "admin"
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || "password"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /instructions/create のみで認証を実行
  if (pathname === "/instructions/create") {
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return new NextResponse("認証が必要です", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      })
    }

    try {
      const authValue = authHeader.split(" ")[1]
      const [user, password] = atob(authValue).split(":")

      if (user !== BASIC_AUTH_USER || password !== BASIC_AUTH_PASSWORD) {
        return new NextResponse("認証が必要です", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Secure Area"',
          },
        })
      }
    } catch (error) {
      return new NextResponse("認証が必要です", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/instructions/create",
} 