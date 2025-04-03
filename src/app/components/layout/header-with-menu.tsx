"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import Image from "next/image"

interface HeaderWithMenuProps {
    title: string
}

export default function HeaderWithMenu({ title }: HeaderWithMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)

        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const menuItems = [
        { label: "作成", href: "/instructions/create" },
        { label: "閲覧", href: "/instructions/view" },
        { label: "履歴", href: "/instructions/history" },
    ]

    return (
        <header className="bg-surface shadow-md">
            <div className="container mx-auto px-4 h-16 flex items-center relative">
                {/* 左側のロゴリンク */}
                <Link href="/" className="flex items-center hover:opacity-75 transition-opacity absolute left-0">
                    <Image src="/icon.png" alt="アイコン" width={40} height={40} className="mr-2" />
                    {/* <h1 className={`font-bold text-primary font-heading ${isMobile ? "text-md" : "text-2xl"}`}>
                        {isMobile ? "清掃管理システム" : "清掃管理システム"}
                    </h1> */}
                </Link>

                {/* 中央のタイトル */}
                <h1 className={`font-bold text-primary font-heading text-center ${isMobile ? "text-md" : "text-3xl"} mx-auto`}>
                    {title}
                </h1>

                {/* 右側のハンバーガーメニュー */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-black hover:opacity-75 transition-opacity absolute right-0"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* モバイルメニュー */}
            {isOpen && (
                <div className="absolute left-0 right-0 bg-white shadow-lg z-50">
                    <nav className="container mx-auto py-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block px-4 py-2 hover:bg-gray-100"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    )
}

