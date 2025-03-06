import DateDisplay from "./components/date-display"
import Header from "./components/layout/header"
import InstructionCard from "./components/instruction-card"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <DateDisplay />
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
          <InstructionCard
            title="今日の指示書"
            buttons={[
              { label: "作成", href: "/instructions/create" },
              { label: "閲覧", href: "/instructions/view" },
              { label: "編集", href: "/instructions/edit" },
            ]}
          />
          <InstructionCard title="過去の指示書" buttons={[{ label: "履歴", href: "/instructions/history" }]} />
        </div>
      </main>
    </div>
  )
}

