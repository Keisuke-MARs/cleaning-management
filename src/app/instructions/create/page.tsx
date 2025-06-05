"use client"

//フックのインポート
import { useState, useEffect, useMemo, useRef } from "react"
//コンポーネントのインポート
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import HeaderWithMenu from "@/app/components/header-with-menu"
import DateDisplay from "@/app/components/date-display"
import RoomSearch from "@/app/components/room-search"
import ScrollToTopButton from "@/app/components/scroll-to-top-button"
import LoadingSpinner from "@/app/components/loading-spinner"

//APIクライアントのインポート
import { roomsApi, cleaningsApi } from "@/lib/api-client"
import { formatDate } from "@/lib/utils"
import type { Room, Cleaning, CleaningStatus, CleaningAvailability } from "@/types/database"

//部屋データの型定義
interface RoomData {
  roomNumber: string
  cleaningAvailability: string
  cleaningStatus: string
  checkInTime: string | null
  guestCount: number | null
  setType: string | null
  notes: string | null
}

export default function CreateInstruction() {
  // 認証関連のstate
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(true)
  const [roomStatus, setRoomStatus] = useState<Record<string, string>>({})
  const [rooms, setRooms] = useState<Room[]>([])
  const [cleaningData, setCleaningData] = useState<Record<string, Partial<RoomData>>>({})
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isMobile, setIsMobile] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)

  //チェックイン時刻のオプション生成
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

  //人数のオプション
  const guestCountOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

  //セットタイプのオプション
  const setTypeOptions = ["なし", "ソファ", "和布団1組", "和布団2組", "ソファ・和布団"]

  //清掃可否のオプション
  const CleaningAvailabilityOptions = ["〇", "×", "連泊:清掃あり", "連泊:清掃なし"]

  //清掃不可の状態(グレーアウトする状態)
  const disabledStatuses = ["×", "連泊:清掃なし"]

  // 認証チェック
  useEffect(() => {
    async function checkAuth() {
      try {
        console.log('🔍 認証チェックを開始')
        // まず認証情報なしでAPIを呼び出し
        const response = await fetch('/api/auth-check', {
          method: 'GET'
        })

        console.log('📡 API応答:', response.status, response.ok)

        if (response.ok) {
          console.log('✅ 認証成功')
          setIsAuthenticated(true)
        } else {
          console.log('🔐 認証が必要、ダイアログを表示')
          // 認証が必要な場合、Basic認証ダイアログを表示
          const credentials = prompt('認証が必要です。\nユーザー名:パスワードの形式で入力してください\n(例: admin:password)')
          if (credentials) {
            const authResponse = await fetch('/api/auth-check', {
              method: 'GET',
              headers: {
                'Authorization': 'Basic ' + btoa(credentials)
              }
            })

            if (authResponse.ok) {
              console.log('✅ 再認証成功')
              setIsAuthenticated(true)
            } else {
              console.log('❌ 再認証失敗')
              alert('認証に失敗しました')
              window.location.href = '/'
            }
          } else {
            console.log('❌ 認証キャンセル')
            window.location.href = '/'
          }
        }
      } catch (error) {
        console.error('認証エラー:', error)
        window.location.href = '/'
      } finally {
        console.log('🏁 認証チェック完了')
        setIsAuthenticating(false)
      }
    }

    checkAuth()
  }, [])

  //useEffectでAPIからデータを取得
  useEffect(() => {
    if (!isAuthenticated) return // 認証されていない場合は実行しない
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        //部屋データを取得
        console.log("部屋データを取得")
        const roomsResponse = await roomsApi.getAll()
        console.log("部屋データ取得結果", roomsResponse)
        if (roomsResponse.success && roomsResponse.data) {
          setRooms(roomsResponse.data)

          //今日の日付を取得
          const today = new Date()
          const formattedDate = formatDate(today)

          //今日の清掃データを取得
          const cleaningResponse = await cleaningsApi.getByDate(formattedDate)
          console.log("清掃データ取得結果", cleaningResponse)
          //清掃データが取得できた場合
          if (cleaningResponse.success && cleaningResponse.data) {
            console.log("清掃データ取得成功")
            // 清掃データをオブジェクトに変換。その際、部屋番号をキーとする
            const cleaningMap: Record<string, Partial<RoomData>> = {}

            // まず全ての部屋にデフォルト値を設定
            roomsResponse.data.forEach((room: Room) => {
              cleaningMap[room.room_number] = {
                roomNumber: room.room_number,
                cleaningAvailability: "×", // デフォルト値
                cleaningStatus: "清掃不要",
                checkInTime: null,
                guestCount: null,
                setType: "なし",
                notes: null,
              }
            })

            // 実際のデータで上書き
            cleaningResponse.data.forEach((cleaning: Cleaning) => {
              cleaningMap[cleaning.room_number] = {
                roomNumber: cleaning.room_number,
                cleaningAvailability: cleaning.cleaning_availability,
                cleaningStatus: cleaning.cleaning_status,
                checkInTime: cleaning.check_in_time,
                guestCount: cleaning.guest_count,
                setType: cleaning.set_type,
                notes: cleaning.notes,
              }
            })

            console.log("最終的なcleaningMap:", cleaningMap)
            setCleaningData(cleaningMap)
          } else if (cleaningResponse.status === 404) {
            console.log("清掃データが存在しない - 初期データを作成")

            // 初期清掃データをinsert
            const today = new Date()
            const formattedDate = formatDate(today)

            // まず、cleaningDataの初期状態を設定
            const initialCleaningData: Record<string, Partial<RoomData>> = {}
            roomsResponse.data.forEach((room: Room) => {
              initialCleaningData[room.room_number] = {
                roomNumber: room.room_number,
                cleaningAvailability: "×", // デフォルトで×に設定
                cleaningStatus: "清掃不要",
                checkInTime: null,
                guestCount: null,
                setType: "なし",
                notes: null,
              }
            })

            console.log("初期cleaningData:", initialCleaningData)
            setCleaningData(initialCleaningData)

            // 各部屋ごとにPOSTリクエスト
            await Promise.all(
              roomsResponse.data.map(async (room: Room) => {
                const defaultData = {
                  cleaning_date: formattedDate,
                  room_number: room.room_number,
                  cleaning_status: "清掃不要",
                  cleaning_availability: "×", // 明確にデフォルト値を設定
                  check_in_time: null,
                  guest_count: null,
                  set_type: "なし",
                  notes: null,
                }

                return cleaningsApi.createTodayCleaning(defaultData)
              }),
            )
          } else {
            setError(roomsResponse.error || "清掃データの取得に失敗しました")
            console.error("清掃データの取得に失敗", roomsResponse.error)
          }
        }
      } catch (error) {
        setError("部屋データの取得に失敗しました")
        console.error("部屋データの取得に失敗", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [isAuthenticated])

  //全ての部屋番号の生成
  const allRoomNumbers = useMemo(() => {
    return rooms.map((room) => room.room_number).sort()
  }, [rooms])

  //部屋番号のフィルタリング
  const filteredRoomNumbers = useMemo(() => {
    if (!searchQuery.trim()) {
      return allRoomNumbers
    }
    return allRoomNumbers.filter((roomNumber) => roomNumber.includes(searchQuery.trim()))
  }, [allRoomNumbers, searchQuery])

  //清掃状態が変更された時のハンドラ
  const handleCleaningStatusChange = (roomNumber: string, status: string) => {
    setRoomStatus((prev) => ({ ...prev, [roomNumber]: status }))

    //清掃データを更新
    setCleaningData((prev) => ({
      ...prev,
      [roomNumber]: {
        ...(prev[roomNumber] || {}),
        cleaningAvailability: status,
      },
    }))
  }

  //フォーム入力変更ハンドラ
  const handleInputChange = (roomNumber: string, field: keyof RoomData, value: any) => {
    setCleaningData((prev) => ({
      ...prev,
      [roomNumber]: {
        ...(prev[roomNumber] || {}),
        [field]: value,
      },
    }))
  }

  //レスポンシブ対応の確認、スクロールハンドラ
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)

    const handleScroll = () => {
      if (stickyRef.current && topRef.current) {
        const stivkyTop = stickyRef.current.getBoundingClientRect().top
        const topElementButtom = topRef.current.getBoundingClientRect().bottom
        setIsSticky(stivkyTop <= 0 && topElementButtom < 0)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  //清掃状態を適切な値に変換
  const getCleaningStatus = (status: string): CleaningStatus => {
    //清掃可否の値が清掃状態に入らないように変換
    if (status === "〇" || status === "×" || status === "連泊:清掃あり" || status === "連泊:清掃なし") {
      return "清掃不要"
    }
    return status as CleaningStatus
  }

  //清掃可否を適切な値に変換
  const getCleaningAvailability = (status: string): CleaningAvailability => {
    if (status === "×" || status === "連泊:清掃あり" || status === "連泊:清掃なし") {
      return status as CleaningAvailability
    }
    return "〇"
  }

  //指示書作成ボタンのハンドラ
  const handleCreateInstruction = async () => {
    if (!window.confirm("今日の指示書を作成しますか？")) {
      return
    }
    try {
      console.log("指示書作成ボタンがクリックされました")

      setIsLoading(true)
      setError(null)

      //今日の日付を取得
      const today = new Date()
      const formattedDate = formatDate(today)
      console.log("今日の日付", formattedDate)

      //各部屋の清掃データを保存
      const savePromises = Object.entries(cleaningData).map(async ([roomNumber]) => {
        //部屋データを取得
        const roomData = cleaningData[roomNumber] || {}
        console.log("部屋データ", roomData)

        try {
          //清掃状態を清掃可否を適切な値に変換
          const cleaningStatus = getCleaningStatus(roomData.cleaningStatus || "")
          const cleaningAvailability = getCleaningAvailability(roomData.cleaningAvailability || "")

          console.log(
            `保存データ -部屋:${roomNumber}, 清掃状態:${cleaningStatus}, 清掃可否:${cleaningAvailability}, チェックイン時刻:${roomData.checkInTime}, 人数:${roomData.guestCount}, セットタイプ:${roomData.setType}, メモ:${roomData.notes}`,
          )

          //APIを呼び出して清掃情報を保存
          const response = await cleaningsApi.updateByDate({
            cleaning_date: formattedDate,
            room_number: roomNumber,
            cleaning_status: cleaningStatus,
            cleaning_availability: cleaningAvailability,
            check_in_time: roomData.checkInTime || null,
            guest_count: roomData.guestCount || null,
            set_type: roomData.setType || "なし",
            notes: roomData.notes || null,
          })

          return { success: true, roomNumber }
        } catch (error) {
          console.error(`部屋:${roomNumber}の保存中にエラーが発生`, error)
          return { success: false, roomNumber }
        }
      })

      const results = await Promise.all(savePromises)
      //エラーがある確認
      const errors = results.filter((result) => !result.success)
      if (errors.length > 0) {
        const errorMassage = `${errors.length}件の部屋の保存に失敗しました。`
        setError(errorMassage)
        alert("指示書の作成中にエラーが発生しました")
      } else {
        //全て成功した場合は、メッセージを表示
        alert("指示書が作成されました。")
        // window.location.href = "/"
      }
    } catch (error) {
      setError("指示書の作成中にエラーが発生しました")
      console.error("指示書の作成中にエラーが発生しました", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  //DBエラー時のフォールバック処理
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <HeaderWithMenu title="指示書作成" />
        <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-8">
          <div className="w-full max-w-lg flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
            <div className="text-xl font-bold mb-4">エラーが発生しました</div>
            <p className="text-gray-600 mb-6 whitespace-pre-line">{error}</p>
            <p className="text-gray-600 mb-6">
              データベース接続に問題がある可能性があります。
              <br />
              管理者に連絡してください。
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

  // 認証中の表示
  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <HeaderWithMenu title="指示書作成" />
        <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-8">
          <LoadingSpinner size="large" text="認証中..." />
        </main>
      </div>
    )
  }

  // 認証されていない場合の表示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <HeaderWithMenu title="指示書作成" />
        <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-8">
          <div className="w-full max-w-lg flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
            <div className="text-xl font-bold mb-4">認証が必要です</div>
            <p className="text-gray-600 mb-6">このページにアクセスするには認証が必要です。</p>
            <Link
              href="/"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-colors"
            >
              トップに戻る
            </Link>
          </div>
        </main>
      </div>
    )
  }

  //メインのコンポーネント
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderWithMenu title="指示書作成" />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div ref={topRef}>
          <DateDisplay />
        </div>
        <div
          ref={stickyRef}
          className={`${
            isSticky ? "fixed top-0 left-0 right-0 bg-gray-50 shadow-md z-10 p-4" : ""
          } transition-all duration-300 ease-in-out`}
        >
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="w-full max-w-md">
                <RoomSearch onSearch={handleSearch} />
              </div>
              <button
                className="bg-orange-400 text-white px-6 py-2 rounded-full hover:bg-orange-500 transition-colors ml-4"
                onClick={handleCreateInstruction}
                disabled={isLoading}
              >
                {isLoading ? "処理中..." : "作成"}
              </button>
            </div>
          </div>
        </div>

        <div className={`${isSticky ? "mt-24" : ""}`}>
          {/* 検索結果の表示 */}
          {searchQuery && (
            <div className="mb-4 text-sm text-gray-600">
              検索結果: {filteredRoomNumbers.length}件
              {filteredRoomNumbers.length === 0 && <p className="mt-1 text-red-500">該当する部屋番号がありません</p>}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <LoadingSpinner size="large" text="データを読み込み中..." />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-lg">
                <AlertCircle className="text-red-500 w-16 h-16 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-4">エラーが発生しました</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  再読み込み
                </button>
              </div>
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
                    {filteredRoomNumbers.map((roomNumber) => {
                      const roomData = cleaningData[roomNumber] || {}
                      const currentAvailability = roomData.cleaningAvailability || "×"
                      const isDisabled = disabledStatuses.includes(currentAvailability)

                      return (
                        <tr key={roomNumber} className={`border-t ${isDisabled ? "bg-gray-100" : "bg-white"}`}>
                          <td className="px-4 py-2">{roomNumber}</td>
                          {/* 清掃可否は常に選択可能 */}
                          <td className="px-4 py-2">
                            <select
                              value={currentAvailability}
                              onChange={(e) => handleInputChange(roomNumber, "cleaningAvailability", e.target.value)}
                              className="w-full p-2 border rounded"
                            >
                              {CleaningAvailabilityOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </td>
                          {/* チェックイン時刻は清掃不可の時は無効化 */}
                          <td className="px-4 py-2">
                            <select
                              value={roomData.checkInTime || ""}
                              onChange={(e) => handleInputChange(roomNumber, "checkInTime", e.target.value)}
                              className="w-full p-2 border rounded"
                              disabled={isDisabled}
                            >
                              <option value="">選択してください</option>
                              {timeOptions.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </td>
                          {/* チェックイン人数は清掃不可の時は無効化 */}
                          <td className="px-4 py-2">
                            <select
                              value={roomData.guestCount?.toString() || ""}
                              onChange={(e) => handleInputChange(roomNumber, "guestCount", Number(e.target.value))}
                              className="w-full p-2 border rounded"
                              disabled={isDisabled}
                            >
                              <option value="">選択してください</option>
                              {guestCountOptions.map((count) => (
                                <option key={count} value={count}>
                                  {count}
                                </option>
                              ))}
                            </select>
                          </td>
                          {/* セットは清掃不可の時は無効化 */}
                          <td className="px-4 py-2">
                            <select
                              value={roomData.setType || "なし"}
                              onChange={(e) => handleInputChange(roomNumber, "setType", e.target.value)}
                              className="w-full p-2 border rounded"
                              disabled={isDisabled}
                            >
                              {setTypeOptions.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </td>
                          {/* 備考は常に入力可能 */}
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={roomData.notes || ""}
                              onChange={(e) => handleInputChange(roomNumber, "notes", e.target.value)}
                              placeholder="備考を入力"
                              className="w-full p-2 border rounded"
                            />
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
                  const roomData = cleaningData[roomNumber] || {}
                  const currentAvailability = roomData.cleaningAvailability || "×"
                  const isDisabled = disabledStatuses.includes(currentAvailability)

                  return (
                    <div
                      key={roomNumber}
                      className={`bg-white p-4 rounded-lg shadow ${isDisabled ? "bg-gray-100" : ""}`}
                    >
                      <div className="font-bold text-lg mb-2">部屋 {roomNumber}</div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">清掃可否</label>
                          <select
                            className="w-full p-2 border rounded"
                            value={currentAvailability}
                            onChange={(e) => handleInputChange(roomNumber, "cleaningAvailability", e.target.value)}
                          >
                            {CleaningAvailabilityOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">チェックイン時刻</label>
                          <select
                            className="w-full p-2 border rounded"
                            disabled={isDisabled}
                            value={roomData.checkInTime || ""}
                            onChange={(e) => handleInputChange(roomNumber, "checkInTime", e.target.value)}
                          >
                            <option value="">選択してください</option>
                            {timeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">チェックイン人数</label>
                          <select
                            className="w-full p-2 border rounded"
                            disabled={isDisabled}
                            value={roomData.guestCount?.toString() || ""}
                            onChange={(e) => {
                              handleInputChange(
                                roomNumber,
                                "guestCount",
                                e.target.value ? Number.parseInt(e.target.value) : null,
                              )
                            }}
                          >
                            <option value="">選択してください</option>
                            {guestCountOptions.map((count) => (
                              <option key={count} value={count}>
                                {count}人
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">セット</label>
                          <select
                            className="w-full p-2 border rounded"
                            disabled={isDisabled}
                            value={roomData.setType || "なし"}
                            onChange={(e) => handleInputChange(roomNumber, "setType", e.target.value)}
                          >
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
                            value={roomData.notes || ""}
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
