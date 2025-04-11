import DateDisplay from "./components/date-display"
import InstructionCard from "./components/instruction-card"
import HeaderWithMenu from "./components/layout/header-with-menu"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderWithMenu title="トップメニュー" />
      <main className="flex-1 container mx-auto px-4 py-8">
        <DateDisplay />
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
          <InstructionCard
            title="今日の指示書"
            buttons={[
              { label: "作成", href: "/instructions/create" },
              { label: "閲覧", href: "/instructions/view" },
            ]}
          />
          <InstructionCard title="過去の指示書" buttons={[{ label: "履歴", href: "/instructions/history" }]} />
        </div>
      </main>
    </div>
  )
}

