/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import HeaderWithMenu from "../../components/layout/header-with-menu"
import DateDisplay from "../../components/date-display"
import RoomSearch from "../../components/room-search"
import ScrollToTopButton from "../../components/scroll-to-top-button"
import LoadingSpinner from "../../components/loading-spinner"

// APIクライアントをインポート
import { roomsApi, cleaningsApi, formatDate } from "@/lib/api-client"
import type { Room, Cleaning } from "@/types/database"

// 部屋データの型定義を修正
interface RoomData {
  roomNumber: string
  cleaningStatus: string
  checkInTime: string | null
  guestCount: number | null
  setType: string
  notes: string | null
}

export default function CreateInstruction() {
  const [roomStatus, setRoomStatus] = useState<Record<string, string>>({})
  // 状態変数を追加
  const [rooms, setRooms] = useState<Room[]>([])
  const [cleaningData, setCleaningData] = useState<Record<string, Partial<RoomData>>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // エラー状態を追加
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

  // useEffectでAPIからデータを取得するように変更
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null) // エラー状態をリセット

        // 部屋データを取得
        const roomsResponse = await roomsApi.getAll()
        if (roomsResponse.success && roomsResponse.data) {
          setRooms(roomsResponse.data)

          // 今日の日付を取得
          const today = new Date()
          const formattedDate = formatDate(today)

          // 今日の清掃データを取得
          const cleaningsResponse = await cleaningsApi.getByDate(formattedDate)
          if (cleaningsResponse.success && cleaningsResponse.data) {
            // 清掃データを部屋番号をキーとしたオブジェクトに変換
            const cleaningMap: Record<string, Partial<RoomData>> = {}

            cleaningsResponse.data.forEach((cleaning: Cleaning) => {
              cleaningMap[cleaning.room_number] = {
                roomNumber: cleaning.room_number,
                cleaningStatus: cleaning.cleaning_status,
                checkInTime: cleaning.check_in_time,
                guestCount: cleaning.guest_count,
                setType: cleaning.set_type,
                notes: cleaning.notes,
              }
            })

            setCleaningData(cleaningMap)

            // 清掃状態を設定
            const initialStatuses: Record<string, string> = {}
            roomsResponse.data.forEach((room: Room) => {
              initialStatuses[room.room_number] = cleaningMap[room.room_number]?.cleaningStatus || "×"
            })

            setRoomStatus(initialStatuses)
          } else if (cleaningsResponse.error) {
            // 清掃データの取得エラーは無視して続行（新規作成の場合はエラーになる可能性がある）
            console.warn("清掃データの取得に失敗しましたが、新規作成として続行します:", cleaningsResponse.error)

            // 初期状態を設定
            const initialStatuses: Record<string, string> = {}
            roomsResponse.data.forEach((room: Room) => {
              initialStatuses[room.room_number] = "×"
            })
            setRoomStatus(initialStatuses)
          }
        } else {
          // 部屋データの取得に失敗した場合はエラーを設定
          setError(roomsResponse.error || "部屋データの取得に失敗しました")
          console.error("部屋データの取得に失敗しました:", roomsResponse.error)
        }
      } catch (error) {
        setError("データの取得中にエラーが発生しました")
        console.error("データの取得中にエラーが発生しました:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  //すべての部屋番号を生成
  const allRoomNumbers = useMemo(() => {
    return rooms.map((room) => room.room_number).sort()
  }, [rooms])

  //検索クエリに基づいてフィルタリングされた部屋番号
  const filteredRoomNumbers = useMemo(() => {
    if (!searchQuery.trim()) {
      return allRoomNumbers
    }
    return allRoomNumbers.filter((roomNumber) => roomNumber.includes(searchQuery.trim()))
  }, [allRoomNumbers, searchQuery])

  // 清掃状態が変更されたときのハンドラを修正
  const handleCleaningStatusChange = (roomNumber: string, status: string) => {
    setRoomStatus((prev) => ({ ...prev, [roomNumber]: status }))

    // 清掃データも更新
    setCleaningData((prev) => ({
      ...prev,
      [roomNumber]: {
        ...(prev[roomNumber] || {}),
        cleaningStatus: status,
      },
    }))
  }

  // フォーム入力変更ハンドラを追加
  const handleInputChange = (roomNumber: string, field: keyof RoomData, value: any) => {
    setCleaningData((prev) => ({
      ...prev,
      [roomNumber]: {
        ...(prev[roomNumber] || {}),
        [field]: value,
      },
    }))
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

  // 指示書作成ボタンのハンドラを追加
  const handleCreateInstructions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 今日の日付を取得
      const today = new Date()
      const formattedDate = formatDate(today)

      // 各部屋の清掃データを保存
      const savePromises = Object.entries(cleaningData).map(async ([roomNumber, data]) => {
        // 清掃状態が設定されている部屋のみ保存
        if (roomStatus[roomNumber]) {
          return cleaningsApi.saveOrUpdate({
            cleaning_date: formattedDate,
            room_number: roomNumber,
            cleaning_status: roomStatus[roomNumber] || "清掃不要",
            cleaning_availability:
              data.cleaningStatus === "×" || data.cleaningStatus === "連泊:清掃なし" ? data.cleaningStatus : "〇",
            check_in_time: data.checkInTime || null,
            guest_count: data.guestCount || null,
            set_type: data.setType || "なし",
            notes: data.notes || null,
          })
        }
        return Promise.resolve()
      })

      const results = await Promise.all(savePromises)

      // エラーがあるか確認
      const errors = results.filter((result) => !result.success)
      if (errors.length > 0) {
        setError(`${errors.length}件のデータ保存に失敗しました`)
        console.error("指示書の作成中にエラーが発生しました:", errors)
      } else {
        alert("指示書が正常に作成されました")
        // 閲覧ページに遷移
        window.location.href = "/instructions/view"
      }
    } catch (error) {
      setError("指示書の作成中にエラーが発生しました")
      console.error("指示書の作成中にエラーが発生しました:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // データベースエラーが発生した場合のフォールバック表示
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <HeaderWithMenu title="指示書作成" />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
            <div className="text-xl font-bold mb-4">エラーが発生しました</div>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-gray-600 mb-6">
              データベース接続に問題がある可能性があります。管理者に連絡してください。
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                再読み込み
              </button>
              <Link
                href="/"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-colors"
              >
                トップに戻る
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
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
              {/* 作成ボタンのonClickイベントを追加 */}
              <button
                className="bg-orange-400 text-white px-6 py-2 rounded-full hover:bg-orange-500 transition-colors ml-4"
                onClick={handleCreateInstructions}
                disabled={isLoading}
              >
                {isLoading ? "処理中..." : "作成"}
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
                            {/* チェックイン時刻のselect要素 */}
                            <select
                              className="w-full p-2 border rounded"
                              disabled={isDisabled}
                              value={cleaningData[roomNumber]?.checkInTime || ""}
                              onChange={(e) => handleInputChange(roomNumber, "checkInTime", e.target.value)}
                            >
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
                            {/* チェックイン人数のselect要素 */}
                            <select
                              className="w-full p-2 border rounded"
                              disabled={isDisabled}
                              value={cleaningData[roomNumber]?.guestCount?.toString() || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  roomNumber,
                                  "guestCount",
                                  e.target.value ? Number.parseInt(e.target.value) : null,
                                )
                              }
                            >
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
                            {/* セットタイプのselect要素 */}
                            <select
                              className="w-full p-2 border rounded"
                              disabled={isDisabled}
                              value={cleaningData[roomNumber]?.setType || "なし"}
                              onChange={(e) => handleInputChange(roomNumber, "setType", e.target.value)}
                            >
                              {" "}
                              {setTypeOptions.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            {/* 備考欄のinput要素 */}
                            <input
                              type="text"
                              className="w-full p-2 border rounded"
                              placeholder="備考を入力"
                              value={cleaningData[roomNumber]?.notes || ""}
                              onChange={(e) => handleInputChange(roomNumber, "notes", e.target.value)}
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
                          {/* チェックイン時刻のselect要素 */}
                          <select
                            className="w-full p-2 border rounded"
                            disabled={isDisabled}
                            value={cleaningData[roomNumber]?.checkInTime || ""}
                            onChange={(e) => handleInputChange(roomNumber, "checkInTime", e.target.value)}
                          >
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
                          {/* チェックイン人数のselect要素 */}
                          <select
                            className="w-full p-2 border rounded"
                            disabled={isDisabled}
                            value={cleaningData[roomNumber]?.guestCount?.toString() || ""}
                            onChange={(e) =>
                              handleInputChange(
                                roomNumber,
                                "guestCount",
                                e.target.value ? Number.parseInt(e.target.value) : null,
                              )
                            }
                          >
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
                          {/* セットタイプのselect要素 */}
                          <select
                            className="w-full p-2 border rounded"
                            disabled={isDisabled}
                            value={cleaningData[roomNumber]?.setType || "なし"}
                            onChange={(e) => handleInputChange(roomNumber, "setType", e.target.value)}
                          >
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
                          {/* 備考欄のinput要素 */}
                          <input
                            type="text"
                            className="w-full p-2 border rounded"
                            placeholder="備考を入力"
                            value={cleaningData[roomNumber]?.notes || ""}
                            onChange={(e) => handleInputChange(roomNumber, "notes", e.target.value)}
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
