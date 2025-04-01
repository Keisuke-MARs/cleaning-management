/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

// 清掃状態の種類を定義
type CleaningStatus = "清掃不要"| "未チェックアウト" | "ゴミ回収" | "ベッドメイク" | "掃除機" | "最終チェック"

// 清掃可否の種類
type CleaningAvailability = "〇" | "×" | "連泊:清掃あり" | "連泊:清掃なし"

interface RoomDetailModalProps {
    isOpen: boolean
    onClose: () => void
    roomData: {
        roomNumber: string
        roomType?: string
        cleaningStatus: CleaningStatus
        cleaningAvailability?: CleaningAvailability
        checkInTime?: string
        guestCount?: number
        setType?: string
        notes?: string
    }
    onUpdate: (roomNumber: string, updatedData: any) => void
}

export default function RoomDetailModal({ isOpen, onClose, roomData, onUpdate }: RoomDetailModalProps) {
    // 編集用の状態を初期化
    const initialFormData = {
        cleaningStatus: roomData.cleaningStatus,
        cleaningAvailability: roomData.cleaningAvailability || "〇",
        checkInTime: roomData.checkInTime || "",
        guestCount: roomData.guestCount?.toString() || "",
        setType: roomData.setType || "なし",
        notes: roomData.notes || "",
    }

    const [formData, setFormData] = useState(initialFormData)

    if (!isOpen) return null

    // 入力変更ハンドラ
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // 更新ボタンハンドラ
    const handleUpdate = () => {
        onUpdate(roomData.roomNumber, {
            ...formData,
            guestCount: formData.guestCount ? Number.parseInt(formData.guestCount) : undefined,
        })
        onClose()
    }

    // チェックイン時刻のオプション生成
    const timeOptions = ["", ...Array.from({ length: 9 }, (_, i) => `${i + 14}:00`)]

    // 人数のオプション
    const guestCountOptions = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

    // セットタイプのオプション
    const setTypeOptions = ["なし", "ソファ", "和布団", "ソファ・和布団"]

    // 清掃状態のオプション
    const cleaningStatusOptions: CleaningStatus[] = ["清掃不要", "未チェックアウト","ゴミ回収", "ベッドメイク", "掃除機", "最終チェック"]

    // 清掃可否のオプション
    const cleaningAvailabilityOptions: CleaningAvailability[] = ["〇", "×", "連泊:清掃あり", "連泊:清掃なし"]

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
                    <div className="border rounded-lg">
                        <div className="p-3 bg-gray-50 font-bold border-b">基本情報</div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">部屋番号</span>
                                <span className="font-medium">{roomData.roomNumber}</span>
                            </div>
                            {roomData.roomType && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">部屋タイプ</span>
                                    <span className="font-medium">{roomData.roomType}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">状態</span>
                                <select
                                    name="cleaningStatus"
                                    value={formData.cleaningStatus}
                                    onChange={handleChange}
                                    className="p-2 border rounded w-40"
                                >
                                    {cleaningStatusOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">清掃可否</span>
                                <select
                                    name="cleaningAvailability"
                                    value={formData.cleaningAvailability}
                                    onChange={handleChange}
                                    className="p-2 border rounded w-40"
                                >
                                    {cleaningAvailabilityOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg">
                        <div className="p-3 bg-gray-50 font-bold border-b">チェックイン情報</div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">時間</span>
                                <select
                                    name="checkInTime"
                                    value={formData.checkInTime}
                                    onChange={handleChange}
                                    className="p-2 border rounded w-40"
                                >
                                    {timeOptions.map((time) => (
                                        <option key={time} value={time}>
                                            {time || "選択してください"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">人数</span>
                                <select
                                    name="guestCount"
                                    value={formData.guestCount}
                                    onChange={handleChange}
                                    className="p-2 border rounded w-40"
                                >
                                    {guestCountOptions.map((count) => (
                                        <option key={count} value={count}>
                                            {count ? `${count}人` : "選択してください"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg">
                        <div className="p-3 bg-gray-50 font-bold border-b">追加情報</div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">セット</span>
                                <select
                                    name="setType"
                                    value={formData.setType}
                                    onChange={handleChange}
                                    className="p-2 border rounded w-40"
                                >
                                    {setTypeOptions.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <span className="block text-gray-600 mb-2">備考</span>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded h-24 resize-none"
                                    placeholder="備考を入力"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t flex justify-between">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-8 rounded-lg"
                    >
                        更新
                    </button>
                </div>
            </div>
        </div>
    )
}

