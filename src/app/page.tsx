import DateDisplay from "./components/date-display"
import Header from "./components/layout/header"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <DateDisplay />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* 今日の指示書 */}
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-sky-300 p-4">
              <h2 className="text-xl font-bold text-center tracking-wider">今日の指示書</h2>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              <Link
                href="/instructions/create"
                className="bg-sky-300 hover:bg-sky-400 transition-colors text-black px-8 py-2 rounded-md text-center min-w-32 tracking-wider"
              >
                作る
              </Link>
              <Link
                href="/instructions/view"
                className="bg-sky-300 hover:bg-sky-400 transition-colors text-black px-8 py-2 rounded-md text-center min-w-32 tracking-wider"
              >
                見る
              </Link>
              <Link
                href="/instructions/edit"
                className="bg-sky-300 hover:bg-sky-400 transition-colors text-black px-8 py-2 rounded-md text-center min-w-32 tracking-wider"
              >
                編集
              </Link>
            </div>
          </div>

          {/* 過去の指示書 */}
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-sky-300 p-4">
              <h2 className="text-xl font-bold text-center tracking-wider">過去の指示書</h2>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              <Link
                href="/instructions/history"
                className="bg-sky-300 hover:bg-sky-400 transition-colors text-black px-8 py-2 rounded-md text-center min-w-32 tracking-wider"
              >
                見る
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

