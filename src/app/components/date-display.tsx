"use client"

import { useEffect, useState } from "react"

export default function DateDisplay() {
    const [date, setDate] = useState<Date>(new Date())

    useEffect(() => {
        setDate(new Date())
    }, [])

    const weekdays = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"]
    const formattedDate = `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, "0")}月${String(date.getDate()).padStart(2, "0")}日`
    const weekday = weekdays[date.getDay()]

    return (
        <div className="py-6 text-center">
            <h2 className="text-2xl font-bold tracking-wider">{formattedDate}</h2>
            <p className="text-lg mt-1 tracking-wider">{weekday}</p>
        </div>
    )
}

