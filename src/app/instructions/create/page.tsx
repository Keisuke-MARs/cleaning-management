/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import HeaderWithMenu from "../../components/layout/header-with-menu"
import DateDisplay from "../../components/date-display"
import RoomSearch from "../../components/room-search"
import ScrollToTopButton from "../../components/scroll-to-top-button"
import LoadingSpinner from "../../components/loading-spinner"

// 部屋データの型定義
interface RoomData {
  roomNumber: string
  cleaningStatus: string
  checkInTime: string
  guestCount: string
  setType: string
  notes: string
}

export default function CreateInstruction() {
  const [roomStatus, setRoomStatus] = useState<Record<string, string>>({})
  const [rooms, setRooms] = useState<RoomData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const stickyRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)

  // チェックイン時刻のオプション生成
  const timeOptions = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 14
    return `${hour}:00`
  })

  // 人数のオプション
  const guestCountOptions = ["1人", "2人", "3人", "4人", "5人", "6人", "7人", "8人", "9人", "10人"]

  // セットタイプのオプション
  const setTypeOptions = ["なし", "ソファ", "和布団", "ソファ・和布団"]

  // 清掃可否のオプション
  const cleaningStatusOptions = ["〇", "×", "連泊:清掃あり", "連泊:清掃なし"]

  // 清掃不可の状態（グレーアウトする状態）
  const disabledStatuses = ["×", "連泊:清掃なし"]

  // 読み込み状態をシミュレート
  useEffect(() => {
    // 実際のアプリケーションでは、ここでデータフェッチを行い、
    // 完了したらsetIsLoading(false)を呼び出します
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500) // 1.5秒後に読み込み完了とする

    return () => clearTimeout(timer)
  }, [])

  //すべての部屋番号を生成
  const allRoomNumbers = useMemo(() => {
    const roomNumbers: string[] = []
    for (let floor = 1; floor <= 14; floor++) {
      const roomCount = floor === 1 ? 1 : floor === 9 || floor === 14 ? 3 : 4
      for (let room = 1; room <= roomCount; room++) {
        roomNumbers.push(`${floor}${String(room).padStart(2, "0")}`)
      }
    }
    return roomNumbers
  }, [])

  //検索クエリに基づいてフィルタリングされた部屋番号
  const filteredRoomNumbers = useMemo(() => {
    if (!searchQuery.trim()) {
      return allRoomNumbers
    }
    return allRoomNumbers.filter((roomNumber) => roomNumber.includes(searchQuery.trim()))
  }, [allRoomNumbers, searchQuery])

  //清掃状態が変更されたときのハンドラ
  const handleCleaningStatusChange = (roomNumber: string, status: string) => {
    setRoomStatus((prev) => ({ ...prev, [roomNumber]: status }))
  }

  //検索ハンドラ
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // レスポンシブ対応の確認とスクロールハンドラ
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)

    const handleScroll = () => {
      if (stickyRef.current && topRef.current) {
        const stickyTop = stickyRef.current.getBoundingClientRect().top
        const topElementBottom = topRef.current.getBoundingClientRect().bottom
        setIsSticky(stickyTop <= 0 && topElementBottom < 0)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // 初期値として全ての部屋の清掃状態を「×」に設定
  useEffect(() => {
    const initialStatuses: Record<string, string> = {}

    for (let floor = 1; floor <= 14; floor++) {
      const roomCount = floor === 1 ? 1 : floor === 9 || floor === 14 ? 3 : 4

      for (let room = 1; room <= roomCount; room++) {
        const roomNumber = `${floor}${String(room).padStart(2, "0")}`
        initialStatuses[roomNumber] = "×"
      }
    }

    setRoomStatus(initialStatuses)
  }, [])

  function handleCreate() {
    if (window.confirm("指示書を作成しますか？")) {
      return
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-0">
      <HeaderWithMenu title="指示書作成" />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div ref={topRef}>
          <DateDisplay />
        </div>
        <div
          ref={stickyRef}
          className={`${isSticky ? "fixed top-0 left-0 right-0 bg-gray-50 shadow-md z-10 p-4" : ""
            } transition-all duration-300 ease-in-out`}
        >
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="w-full max-w-md">
                <RoomSearch onSearch={handleSearch} />
              </div>
              <button onClick={handleCreate} className="bg-orange-400 text-white px-6 py-2 rounded-full hover:bg-orange-500 transition-colors ml-4">
                作成
              </button>
            </div>
          </div>
        </div>
        <div className={`${isSticky ? "mt-24" : ""}`}>
          {/* 検索結果の表示 */}
          {searchQuery && !isLoading && (
            <div className="mb-4 text-sm text-gray-600">
              検索結果: {filteredRoomNumbers.length}件
              {filteredRoomNumbers.length === 0 && <p className="mt-1 text-red-500">該当する部屋番号がありません</p>}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <LoadingSpinner size="large" text="部屋データを読み込み中..." />
            </div>
          ) : (
            <>
              {/* デスクトップ表示 */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full bg-white shadow-md rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">部屋番号</th>
                      <th className="px-4 py-2 text-left">清掃可否</th>
                      <th className="px-4 py-2 text-left">チェックイン時刻</th>
                      <th className="px-4 py-2 text-left">チェックイン人数</th>
                      <th className="px-4 py-2 text-left">セット</th>
                      <th className="px-4 py-2 text-left">備考</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* フィルタリングされた部屋を表示 */}
                    {filteredRoomNumbers.map((roomNumber) => {
                      const isDisabled = disabledStatuses.includes(roomStatus[roomNumber])
                      return (
                        <tr key={roomNumber} className={`border-t ${isDisabled ? "bg-gray-200" : ""}`}>
                          <td className="px-4 py-2">{roomNumber}</td>
                          <td className="px-4 py-2">
                            <select
                              className="w-full p-1 border rounded"
                              value={roomStatus[roomNumber] || "〇"}
                              onChange={(e) => handleCleaningStatusChange(roomNumber, e.target.value)}
                            >
                              {cleaningStatusOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <select className="w-full p-2 border rounded" disabled={isDisabled}>
                              {" "}
                              <option value="">選択してください</option>
                              {timeOptions.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <select className="w-full p-2 border rounded" disabled={isDisabled}>
                              {" "}
                              <option value="">選択してください</option>
                              {guestCountOptions.map((count) => (
                                <option key={count} value={count}>
                                  {count}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <select className="w-full p-2 border rounded" disabled={isDisabled}>
                              {" "}
                              {setTypeOptions.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-full p-2 border rounded"
                              placeholder="備考を入力"
                            // 備考欄は清掃可否に関わらず入力可能
                            />{" "}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {/* モバイル表示 */}
              <div className="md:hidden space-y-4">
                {filteredRoomNumbers.map((roomNumber) => {
                  const isDisabled = disabledStatuses.includes(roomStatus[roomNumber])
                  return (
                    <div
                      key={roomNumber}
                      className={`bg-white p-4 rounded-lg shadow ${isDisabled ? "bg-gray-200" : ""}`}
                    >
                      <div className="font-bold text-lg mb-2">部屋 {roomNumber}</div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">清掃可否</label>
                          <select
                            className="w-full p-2 border rounded"
                            value={roomStatus[roomNumber] || "〇"}
                            onChange={(e) => handleCleaningStatusChange(roomNumber, e.target.value)}
                          >
                            {cleaningStatusOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">チェックイン時刻</label>
                          <select className="w-full p-2 border rounded" disabled={isDisabled}>
                            <option value="">選択してください</option>
                            {timeOptions.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">チェックイン人数</label>
                          <select className="w-full p-2 border rounded" disabled={isDisabled}>
                            <option value="">選択してください</option>
                            {guestCountOptions.map((count) => (
                              <option key={count} value={count}>
                                {count}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">セット</label>
                          <select className="w-full p-2 border rounded" disabled={isDisabled}>
                            <option value="">選択してください</option>
                            {setTypeOptions.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">備考</label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded"
                            placeholder="備考を入力"
                          // 備考欄は清掃可否に関わらず入力可能
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <ScrollToTopButton />
    </div>
  )
}

