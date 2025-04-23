"use client"

import { useEffect, useState } from "react"

const weekdayColors = {
    日曜日: "text-red-600", // より深みのある赤
    月曜日: "text-blue-600", // 落ち着いた青
    火曜日: "text-orange-500", // 明るいオレンジ
    水曜日: "text-green-600", // 深みのある緑
    木曜日: "text-indigo-600", // 落ち着いたインディゴ
    金曜日: "text-purple-600", // 深みのある紫
    土曜日: "text-teal-600", // ティール（青緑）
}

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
            <h2 className="text-3xl font-bold text-primary font-heading">
                <span className="font-numeric">{formattedDate}</span>
            </h2>
            <div className="mt-2 flex justify-center items-center">
                {weekdays.map((day, index) => (
                    <div
                        key={day}
                        className={`w-10 h-10 flex items-center justify-center rounded-full mx-1 text-sm font-bold ${day === weekday ? `${weekdayColors[day as keyof typeof weekdayColors]} bg-gray-100` : "text-gray-400"
                            }`}
                    >
                        {day.charAt(0)}
                    </div>
                ))}
            </div>
            <p className={`text-xl mt-2 font-bold font-heading ${weekdayColors[weekday as keyof typeof weekdayColors]}`}>{weekday}</p>
        </div>
    )
}

