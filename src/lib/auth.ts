// 環境変数からBasic認証の設定を取得する関数
export function getBasicAuthCredentials() {
    return {
      username: process.env.BASIC_AUTH_USER || "admin",
      password: process.env.BASIC_AUTH_PASSWORD || "password",
    }
  }
  
  // Basic認証の検証を行う関数
  export function validateBasicAuth(authHeader: string | null) {
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return false
    }
  
    const { username, password } = getBasicAuthCredentials()
    const base64Credentials = authHeader.split(" ")[1]
    const credentials = atob(base64Credentials)
    const [user, pass] = credentials.split(":")
  
    return user === username && pass === password
  }
  