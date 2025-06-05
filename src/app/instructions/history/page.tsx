"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Calendar } from "lucide-react"
import HeaderWithMenu from "@/app/components/layout/header-with-menu"
import RoomSearch from "@/app/components/room-search"
import ScrollToTopButton from "@/app/components/scroll-to-top-button"
import LoadingSpinner from "@/app/components/loading-spinner"
import FloorSelector from "@/app/components/floor-selector"

// APIクライアント
import { RoomWithCleaningApi } from "@/lib/api-client"

// 型定義
import type { RoomWithCleaning, CleaningAvailability } from "@/types/database"

export default function HistoryPage() {
  // 状態管理
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rooms, setRooms] = useState<RoomWithCleaning[]>([])
  const [dataNotFound, setDataNotFound] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isFloorSelectorOpen, setIsFloorSelectorOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)

  // refs
  const stickyRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const calendarButtonRef = useRef<HTMLButtonElement>(null)
  const floorSelectorContainerRef = useRef<HTMLDivElement>(null)
  const floorSelectorRef = useRef<HTMLDivElement>(null)

  // 日付をフォーマットする関数
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // 日本語の曜日を取得する関数
  const getJapaneseWeekday = (date: Date): string => {
    const weekdays = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"]
    return weekdays[date.getDay()]
  }

  // 日本語の日付表示
  const formattedJapaneseDate = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth() + 1
    const day = selectedDate.getDate()
    const weekday = getJapaneseWeekday(selectedDate)
    return `${year}年${month}月${day}日 ${weekday}`
  }, [selectedDate])

  // 指定された日付が今日かどうかを判定する関数
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // 指定した日付の指示書データを取得
  const fetchRoomsByDate = async (date: Date) => {
    try {
      setIsLoading(true)
      const formattedDate = formatDate(date)
      console.log(`${formattedDate}の指示書データを取得します`)

      const response = await RoomWithCleaningApi.getAll(formattedDate)

      if (response.success && response.data) {
        console.log("取得したデータ:", response.data)
        setRooms(response.data)
        setDataNotFound(false)
      } else if (response.status === 404) {
        console.log(`${formattedDate}の指示書は存在しません`)
        setDataNotFound(true)
        setRooms([])
      } else {
        console.error("データ取得エラー:", response.error)
        setDataNotFound(true)
        setRooms([])
      }
    } catch (error) {
      console.error("データ取得中にエラーが発生しました:", error)
      setDataNotFound(true)
      setRooms([])
    } finally {
      setIsLoading(false)
    }
  }

  // 初期データ取得
  useEffect(() => {
    fetchRoomsByDate(selectedDate)
  }, [])

  // 日付変更時のデータ取得
  useEffect(() => {
    const fetchRooms = async () => {
      await fetchRoomsByDate(selectedDate)
    }
    fetchRooms()
  }, [selectedDate])

  // レスポンシブ対応
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // カレンダー外クリック検知
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        calendarButtonRef.current &&
        !calendarButtonRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false)
      }
    }

    // スクロール処理
    const handleScroll = () => {
      if (stickyRef.current && topRef.current) {
        const stickyTop = stickyRef.current.getBoundingClientRect().top
        const topElementBottom = topRef.current.getBoundingClientRect().bottom
        const shouldBeSticky = stickyTop <= 0 && topElementBottom < 0
        setIsSticky(shouldBeSticky)

        // PC版での階層選択の固定
        if (!isMobile && floorSelectorRef.current && floorSelectorContainerRef.current) {
          const container = floorSelectorContainerRef.current
          const selector = floorSelectorRef.current
          const containerRect = container.getBoundingClientRect()

          if (shouldBeSticky) {
            selector.style.position = "fixed"
            selector.style.top = "80px" // 検索バーの下に配置
            selector.style.width = `${containerRect.width}px`
          } else {
            selector.style.position = "static"
            selector.style.width = "100%"
          }
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("resize", checkMobile)
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isMobile])

  // 部屋データのフィルタリング
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // 部屋番号での検索
      const matchesSearch = searchQuery.trim() === "" || room.room_number.includes(searchQuery.trim())
      if (!matchesSearch) return false

      // 階層でのフィルタリング
      if (selectedFloor === null) {
        return true
      }

      // 部屋番号から階層を抽出（例: 101 → 1階）
      const floorFromRoomNumber = Number.parseInt(room.room_number.substring(0, room.room_number.length - 2))
      return floorFromRoomNumber === selectedFloor
    })
  }, [selectedFloor, searchQuery, rooms])

  // 日付選択ハンドラ
  const handleDateChange = (date: Date) => {
    // 今日の日付を取得（時刻部分をリセット）
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 選択された日付が今日より後の場合は今日の日付を使用
    if (date > today) {
      date = today
    }

    setSelectedDate(date)
    setIsCalendarOpen(false)
  }

  // 清掃状態に基づいた行の背景色を取得
  const getRowBackgroundColor = (cleaningAvailability: CleaningAvailability) => {
    if (cleaningAvailability === "×" || cleaningAvailability === "連泊:清掃なし") {
      return "bg-gray-200"
    }
    return ""
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderWithMenu title="過去の指示書を見る" />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div ref={topRef} className="mb-6">
          {/* 日付表示と日付選択 */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="flex items-center mb-4 md:mb-0 relative">
              <h2 className="text-2xl font-bold mr-2">{formattedJapaneseDate}</h2>
              <button
                ref={calendarButtonRef}
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="日付を選択"
              >
                <Calendar className="w-6 h-6" />
              </button>

              {/* カレンダーUI - 修正版 */}
              {isCalendarOpen && (
                <div
                  ref={calendarRef}
                  className="absolute z-50 bg-white rounded-lg shadow-lg p-4 border"
                  style={{ top: "100%", left: "0", marginTop: "8px", width: "300px" }}
                >
                  <div className="mb-2 font-bold">日付を選択</div>
                  <input
                    type="date"
                    value={formatDate(selectedDate)}
                    max={formatDate(new Date())} // 今日までに制限
                    onChange={(e) => {
                      if (e.target.value) {
                        handleDateChange(new Date(e.target.value))
                      }
                    }}
                    className="p-2 border rounded w-full"
                  />
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => {
                        const yesterday = new Date(selectedDate)
                        yesterday.setDate(yesterday.getDate() - 1)
                        handleDateChange(yesterday)
                      }}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                      前日
                    </button>
                    <button
                      onClick={() => handleDateChange(new Date())}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                    >
                      今日
                    </button>
                    {/* 「翌日」ボタンは今日が選択されている場合は無効化 */}
                    <button
                      onClick={() => {
                        const tomorrow = new Date(selectedDate)
                        tomorrow.setDate(tomorrow.getDate() + 1)
                        handleDateChange(tomorrow)
                      }}
                      disabled={isToday(selectedDate)}
                      className={`px-3 py-1 ${
                        isToday(selectedDate)
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 hover:bg-gray-300"
                      } rounded text-sm`}
                    >
                      翌日
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          ref={stickyRef}
          className={`${
            isSticky ? "fixed top-0 left-0 right-0 bg-gray-50 shadow-md z-10 p-4" : ""
          } transition-all duration-300 ease-in-out`}
        >
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="w-full md:w-1/2 lg:w-1/3">
                <RoomSearch onSearch={setSearchQuery} />
              </div>
              <div className="flex items-center space-x-4">
                {isMobile && (
                  <button
                    onClick={() => setIsFloorSelectorOpen(true)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    階層選択
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`${isSticky ? "mt-24 md:mt-0" : ""}`}>
          <div className="flex flex-col md:flex-row gap-6 mt-6">
            {/* 左側：階層選択 */}
            <div ref={floorSelectorContainerRef} className={`md:w-64 ${isMobile ? "hidden" : ""}`}>
              <div ref={floorSelectorRef} className="w-full">
                <FloorSelector selectedFloor={selectedFloor} onFloorSelect={setSelectedFloor} />
              </div>
            </div>

            {/* 右側：指示書データ */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <LoadingSpinner size="large" text="データを読み込み中..." />
                </div>
              ) : dataNotFound ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="text-xl font-bold mb-4">指示書が見つかりません</div>
                  <p className="text-gray-600">
                    {formattedJapaneseDate}の指示書は作成されていないか、削除された可能性があります。
                  </p>
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
                        {filteredRooms.map((room) => (
                          <tr
                            key={room.room_number}
                            className={`border-t ${getRowBackgroundColor(room.cleaning_availability as CleaningAvailability)}`}
                          >
                            <td className="px-4 py-2">{room.room_number}</td>
                            <td className="px-4 py-2">{room.cleaning_availability}</td>
                            <td className="px-4 py-2">{room.check_in_time || "-"}</td>
                            <td className="px-4 py-2">{room.guest_count ? `${room.guest_count}人` : "-"}</td>
                            <td className="px-4 py-2">{room.set_type || "-"}</td>
                            <td className="px-4 py-2">{room.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* モバイル表示 */}
                  <div className="md:hidden space-y-4">
                    {filteredRooms.map((room) => (
                      <div
                        key={room.room_number}
                        className={`bg-white p-4 rounded-lg shadow ${getRowBackgroundColor(
                          room.cleaning_availability as CleaningAvailability,
                        )}`}
                      >
                        <div className="font-bold text-lg mb-2">{room.room_number}</div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">清掃可否:</span>
                            <span>{room.cleaning_availability}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">チェックイン時刻:</span>
                            <span>{room.check_in_time || "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">チェックイン人数:</span>
                            <span>{room.guest_count ? `${room.guest_count}人` : "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">セット:</span>
                            <span>{room.set_type || "-"}</span>
                          </div>
                          {room.notes && (
                            <div>
                              <span className="text-gray-600 block">備考:</span>
                              <div className="mt-1 p-2 bg-gray-50 rounded">{room.notes}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredRooms.length === 0 && !dataNotFound && (
                    <div className="text-center py-10">
                      <p className="text-gray-500">該当する部屋がありません</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* モバイル用階層選択モーダル */}
        {isMobile && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${
              isFloorSelectorOpen ? "flex" : "hidden"
            } items-center justify-center p-6`}
          >
            <div className="bg-white rounded-lg p-4 w-11/12 max-w-md max-h-[85vh] overflow-hidden flex flex-col">
              <div className="overflow-y-auto flex-grow py-2">
                <FloorSelector
                  selectedFloor={selectedFloor}
                  onFloorSelect={(floor) => {
                    setSelectedFloor(floor)
                    setIsFloorSelectorOpen(false)
                  }}
                />
              </div>
              <button
                onClick={() => setIsFloorSelectorOpen(false)}
                className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </main>
      <ScrollToTopButton />
    </div>
  )
}
