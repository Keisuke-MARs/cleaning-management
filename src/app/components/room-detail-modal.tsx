"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"

// 清掃状態の種類を定義
// type CleaningStatus = "清掃不要" | "未チェックアウト" | "ゴミ回収" | "ベッドメイク" | "掃除機" | "最終チェック"

// // 清掃可否の種類
// type CleaningAvailability = "〇" | "×" | "連泊:清掃あり" | "連泊:清掃なし"

import type { CleaningStatus, CleaningAvailability, SetType } from "@/types/database"

interface RoomDetailModalProps {
  isOpen: boolean
  onClose: () => void
  roomData: {
    roomNumber: string
    roomType?: string
    cleaningStatus: CleaningStatus
    cleaningAvailability?: CleaningAvailability
    checkInTime?: string | null
    guestCount?: number | null
    setType?: SetType
    notes?: string | null
  }
  onUpdate: (roomNumber: string, updateData: any) => void
}

export default function RoomDetailModal({ isOpen, onClose, roomData, onUpdate }: RoomDetailModalProps) {
  console.log("RoomDetailModal-受け取ったデータ:", {
    roomNumber: roomData.roomNumber,
    cleaningStatus: roomData.cleaningStatus,
    cleaningAvailability: roomData.cleaningAvailability,
    checkInTime: roomData.checkInTime,
    guestCount: roomData.guestCount,
    setType: roomData.setType,
    notes: roomData.notes,
  })

  const initialTormData = {
    cleaningStatus: roomData.cleaningStatus,
    cleaningAvailability: roomData.cleaningAvailability,
    checkInTime: roomData.checkInTime || "",
    guestCount: roomData.guestCount?.toString() || "",
    setType: roomData.setType || "なし",
    notes: roomData.notes || "",
  }

  const [formData, setFormData] = useState(initialTormData)

  useEffect(() => {
    console.log("RoomDetailModal - roomDataが変更されました:", roomData)

    // チェックイン時刻の形式を正規化
    let normalizedCheckInTime = roomData.checkInTime || ""
    if (normalizedCheckInTime && typeof normalizedCheckInTime === "string" && normalizedCheckInTime.includes(":")) {
      // HH:MM:SS形式からHH:MM形式に変換
      normalizedCheckInTime = normalizedCheckInTime.substring(0, 5)
      console.log("RoomDetailModal - 正規化されたチェックイン時刻:", normalizedCheckInTime)
    }

    setFormData({
      cleaningStatus: roomData.cleaningStatus,
      cleaningAvailability: roomData.cleaningAvailability || "〇",
      checkInTime: normalizedCheckInTime,
      guestCount: roomData.guestCount?.toString() || "",
      setType: roomData.setType || "なし",
      notes: roomData.notes || "",
    })
  }, [roomData])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    console.log(`RoomDetailModal - フィールド ${name} の値を変更: ${value}`)
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdate = () => {
    const updateData = {
      cleaning_status: formData.cleaningStatus,
      cleaning_availability: formData.cleaningAvailability,
      check_in_time: formData.checkInTime || null,
      guest_count: formData.guestCount ? Number.parseInt(formData.guestCount) : null,
      set_type: formData.setType || "なし",
      notes: formData.notes || null,
    }
    console.log("RoomDetailModal - 更新するデータ:", {
      roomNumber: roomData.roomNumber,
      ...formData,
      guestCount: formData.guestCount ? Number.parseInt(formData.guestCount) : undefined,
    })
    onUpdate(roomData.roomNumber, updateData)
    onClose()
  }

  const timeOptions = [
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
    "24:00",
  ]

  // 人数のオプション
  const guestCountOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

  // セットタイプのオプション
  const setTypeOptions = ["なし", "ソファ", "和布団", "ソファ・和布団"]

  // 清掃状態のオプション
  const cleaningStatusOptions: CleaningStatus[] = [
    "清掃不要",
    "未チェックアウト",
    "ゴミ回収",
    "ベッドメイク",
    "掃除機",
    "最終チェック",
  ]

  // 清掃可否のオプション
  const cleaningAvailabilityOptions: CleaningAvailability[] = ["〇", "×", "連泊:清掃あり", "連泊:清掃なし"]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="text-xl font-bold">部屋詳細</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3 space-y-3 overflow-y-auto flex-grow">
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
                  <option value="">選択してください</option>
                  {timeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
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
                  <option value="">選択してください</option>
                  {guestCountOptions.map((count) => (
                    <option key={count} value={count}>
                      {count}人
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
                  placeholder="備考を入力してください"
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
