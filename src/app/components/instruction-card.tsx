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
        <div className="border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-sky-300 p-4">
                <h2 className="text-xl font-bold text-center">{title}</h2>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
                {buttons.map((button, index) => (
                    <Link
                        key={index}
                        href={button.href}
                        className="bg-sky-300 hover:bg-sky-400 transition-colors text-black px-8 py-2 rounded-md text-center min-w-32"
                    >
                        {button.label}
                    </Link>
                ))}
            </div>
        </div>
    )
}

