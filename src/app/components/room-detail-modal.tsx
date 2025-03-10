"use client"

import { X } from "lucide-react"

interface RoomDetailModalProps {
    isOpen: boolean
    onClose: () => void
    roomData: {
        roomNumber: string
        cleaningStatus: string
        checkInTime?: string
        guestCount?: number
        setType?: string
        notes?: string
    }
}

export default function RoomDetailModal({ isOpen, onClose, roomData }: RoomDetailModalProps) {
    if (!isOpen) return null

    const sections = [
        {
            title: "基本情報",
            content: [
                { label: "部屋番号", value: roomData.roomNumber },
                { label: "清掃状態", value: roomData.cleaningStatus },
            ],
        },
        {
            title: "チェックイン情報",
            content: [
                { label: "時間", value: roomData.checkInTime || "未設定" },
                { label: "人数", value: roomData.guestCount ? `${roomData.guestCount}人` : "未設定" },
            ],
        },
        {
            title: "追加情報",
            content: [
                { label: "セット", value: roomData.setType || "なし" },
                { label: "備考", value: roomData.notes || "なし" },
            ],
        },
    ]

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">部屋詳細</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    {sections.map((section) => (
                        <div key={section.title} className="border rounded-lg">
                            <div className="p-3 bg-gray-50 font-bold border-b">{section.title}</div>
                            <div className="p-4 space-y-2">
                                {section.content.map((item) => (
                                    <div key={item.label} className="flex justify-between">
                                        <span className="text-gray-600">{item.label}</span>
                                        <span className="font-medium">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t">
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    )
}

