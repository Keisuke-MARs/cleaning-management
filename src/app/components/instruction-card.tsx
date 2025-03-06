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
        <div className="bg-surface rounded-lg shadow-card overflow-hidden transition-shadow hover:shadow-lg">
            <div className="bg-primary p-4 rounded-t-lg">
                <h2 className="text-xl font-bold text-center text-white font-heading">{title}</h2>
            </div>
            <div className="p-6 flex flex-col items-center gap-4 bg-white rounded-b-lg">
                {buttons.map((button, index) => (
                    <Link
                        key={index}
                        href={button.href}
                        className="bg-primary p-4 hover:bg-sky-400 transition-colors text-white px-8 py-3 rounded-full text-center min-w-40 font-medium shadow-md hover:shadow-lg"
                    >
                        {button.label}
                    </Link>
                ))}
            </div>
        </div>
    )
}

