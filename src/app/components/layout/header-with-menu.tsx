"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import Image from "next/image"

interface HeaderWithMenuProps {
    title: string
}

export default function HeaderWithMenu({ title }: HeaderWithMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    const menuItems = [
        { label: "作成", href: "instruction/create" },
        { label: "閲覧", href: "instruction/view" },
        { label: "編集", href: "instruction/edit" },
        { label: "履歴", href: "instruction/history" }
    ]

    return (
        <header className="bg-surface shadow-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <button onClick={() => setIsOpen(!isOpen)} className="text-black hover:opacity-75 transition-opacity">
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
                <Link href="/" className="flex items-center flex-grow justify-center">
                    <Image
                        src="/icon.png"
                        alt="アイコン"
                        width={50}
                        height={50}
                        className="mr-2"
                    />
                    <h1 className="text-3xl font-bold text-primary font-heading">
                        清掃管理システム:{title}
                    </h1>
                </Link>
                <div className="w-6"></div>
            </div>
            {/*モバイルメニュー */}
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