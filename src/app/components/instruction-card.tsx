import Link from "next/link"

interface InstructionCardProps {
    title: string
    buttons: {
        label: string
        href: string
    }[]
}

export default function InstructionCard({ title, buttons }: InstructionCardProps) {
    return (
        <div className="overflow-hidden shadow-sm bg-[#f5f5f5] rounded-lg">
            <div className="bg-sky-300 p-4 rounded-t-lg">
                <h2 className="text-xl font-bold text-center">{title}</h2>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
                {buttons.map((buttons, index) => (
                    <Link
                        key={index}
                        href={buttons.href}
                        className="bg-sky-300 hover:bg-sky-400 transition-colors text-black px-8 py-2 rounded-md text-center min-w-32"
                    >
                        {buttons.label}
                    </Link>
                ))}
            </div>
        </div>
    )
}

