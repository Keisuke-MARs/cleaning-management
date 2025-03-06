import Link from "next/link"
// import { Home } from "lucide-react"
import Image from "next/image"


export default function Header() {
    return (
        <header className="bg-surface shadow-md">

            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* <Link href="/" className="text-primary hover:text-primary-dark transition-colors">
                    <Home className="h-8 w-8" />
                </Link> */}
                <div className="flex items-center flex-grow justify-center">
                    <Link href="/" className="flex items-center flex-grow justify-center">
                        <Image
                            src="/icon.png"
                            alt="アイコン"
                            width={50}
                            height={50}
                            className="mr-2"
                        />
                        <h1 className="text-3xl font-bold text-primary font-heading">
                            清掃管理システム
                        </h1>
                    </Link>

                </div>
                <div className="w-6"></div> {/* スペーサー */}
            </div>
        </header>
    )
}

