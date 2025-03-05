import type React from "react"
import type { Metadata } from "next"
import { M_PLUS_Rounded_1c } from "next/font/google"
import "./globals.css"

const mPlusRounded = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "清掃管理システム",
  description: "清掃指示書の作成・管理アプリケーション",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={mPlusRounded.className}>{children}</body>
    </html>
  )
}

