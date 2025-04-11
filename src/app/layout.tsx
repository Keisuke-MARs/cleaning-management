import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans_JP, Zen_Maru_Gothic, Roboto } from "next/font/google"
import "./globals.css"

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
})

const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-zen-maru-gothic",
})

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
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
      <body
        className={`${notoSansJP.variable} ${zenMaruGothic.variable} ${roboto.variable} font-sans bg-background text-text`}
      >
        {children}
      </body>
    </html>
  )
}

