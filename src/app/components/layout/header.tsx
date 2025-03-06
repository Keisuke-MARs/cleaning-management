import Link from "next/link"
import { Home } from "lucide-react"

export default function Header() {
    return (
        <header className="bg-sky-300 shadow-sm px-4">
            <div className="container mx-auto flex items-center justify-between h-[75px]">
                <Link href="/" className="text-black hover:opacity-75 transition-opacity">
                    <Home className="h-10 w-10" />
                </Link>
                <h1 className="text-xl font-bold absolute left-1/2 -translate-x-1/2">メニュー</h1>
                <div className="w-6"></div> {/* スペーサー */}
            </div>
        </header>
    )
}

