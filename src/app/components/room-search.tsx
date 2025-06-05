"use client"

interface RoomSearchProps {
    onSearch: (query: string) => void
}

export default function RoomSearch({onSearch}: RoomSearchProps) {
    return(
        <div className="relative">
            <input
                type="search"
                placeholder="部屋番号で検索"
                className="w-full rounded-full
                px-4 py-2 pr-10 border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-sky-300"
                onChange={(e) => onSearch(e.target.value)}
                />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">🔍</span>
        </div>
    )
}