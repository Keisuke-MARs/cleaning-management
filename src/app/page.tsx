import DateDisplay from "./components/date-display"
import Header from "./components/layout/header"
import InstructionCard from "./components/instruction-card"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <DateDisplay />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
          {/* 今日の指示書 */}
          <InstructionCard
            title="今日の指示書"
            buttons={[
              { label: "作る", href: "/instructions/create" },
              { label: "見る", href: "/instructions/view" },
              { label: "編集", href: "/instructions/edit" },
            ]}
          />
          {/* 過去の指示書 */}
          <InstructionCard
            title="過去の指示書"
            buttons={[
              { label: "見る", href: "/instructions/history" },
            ]}
          />
        </div>
      </main>
    </div>
  )
}

