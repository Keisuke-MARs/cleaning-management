"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { HelpCircle, PlusCircle } from "lucide-react"
import Link from "next/link"
import HeaderWithMenu from "@/app/components/layout/header-with-menu"
import DateDisplay from "@/app/components/date-display"
import RoomSearch from "@/app/components/room-search"
import FloorSelector from "@/app/components/floor-selector"
import RoomCard from "@/app/components/room-card"
import RoomDetailModal from "@/app/components/room-detail-modal"
import HelpModal from "@/app/components/help-modal"
import ScrollToTopButton from "@/app/components/scroll-to-top-button"
import LoadingSpinner from "@/app/components/loading-spinner"

//APIクライアント
import { cleaningsApi, RoomWithCleaningApi } from "@/lib/api-client"

//util
import { formatDate } from "@/lib/utils"

//清掃状態の種類の定義
import type { RoomWithCleaning, SetType, CleaningStatus, CleaningAvailability } from "@/types/database"

interface CleaningData {
  roomNumber: string
  roomType?: string
  cleaningStatus: CleaningStatus
  cleaningAvailability?: CleaningAvailability
  checkInTime?: string
  guestCount?: number
  setType?: string
  notes?: string
}

export default function ViewInstructions() {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isFloorSelectorOpen, setIsFloorSelectorOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [rooms, setRooms] = useState<RoomWithCleaning[]>([])
  const [dataNotFound, setDataNotFound] = useState(false)
  const stickyRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const floorSelectorContainerRef = useRef<HTMLDivElement>(null)
  const floorSelectorRef = useRef<HTMLDivElement>(null)
  const [windowWidth, setWindowWidth] = useState<number | null>(null)

  //部屋データを更新する関数
  const updateRoomData = async (roomNumber: string, updateData: Partial<RoomWithCleaning>) => {
    console.log("部屋データの更新:", roomNumber, updateData)
    try {
      //今日の日付の取得
      const today = new Date()
      const formattedDate = formatDate(today)

      //APIを呼び出して清掃情報を更新
      const cleaningResponse = await cleaningsApi.updateByDate({
        cleaning_date: formattedDate,
        room_number: roomNumber,
        cleaning_status: updateData.cleaning_status || "清掃不要",
        cleaning_availability: updateData.cleaning_availability || "×",
        check_in_time: updateData.check_in_time || null,
        guest_count: updateData.guest_count || null,
        set_type: updateData.set_type || "なし",
        notes: updateData.notes || null,
      })
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.room_number === roomNumber
            ? {
                ...room,
                cleaning_status: updateData.cleaning_status || room.cleaning_status,
                cleaning_availability: updateData.cleaning_availability || room.cleaning_availability,
                check_in_time: updateData.check_in_time || room.check_in_time,
                guest_count: updateData.guest_count !== undefined ? updateData.guest_count : room.guest_count,
                set_type: (updateData.set_type as SetType) || room.set_type,
                notes: updateData.notes !== undefined ? updateData.notes : room.notes,
              }
            : room,
        ),
      )

      setSelectedRoom(null)
    } catch (error) {
      console.error("部屋データの更新中にエラーが発生しました:", error)
    }
  }

  useEffect(() => {
    async function fetchRooms() {
      try {
        setIsLoading(true)
        // 今日の日付を取得
        const today = new Date()
        const formattedDate = formatDate(today)

        // APIから部屋と清掃情報を取得
        const response = await RoomWithCleaningApi.getAll(formattedDate)

        if (response.success && response.data) {
          setRooms(response.data)
          setDataNotFound(false)
        } else if (response.status === 404) {
          // 404エラーの場合は指示書が作成されていないと判断
          setDataNotFound(true)
          setRooms([])
        } else {
          console.error("部屋データの取得に失敗しました:", response.error)
        }
      } catch (error) {
        console.error("部屋データの取得中にエラーが発生しました:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRooms()
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // 初期ロード時とリサイズ時にウィンドウ幅を取得
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // コンポーネントのマウント時にウィンドウ幅を取得
    handleResize()

    checkMobile()
    window.addEventListener("resize", checkMobile)
    window.addEventListener("resize", handleResize)

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
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [isMobile, windowWidth])

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch = searchQuery.trim() === "" || room.room_number.includes(searchQuery.trim())
      if (!matchesSearch) return false

      if (selectedFloor === null) {
        return true
      }

      const floorFromRoomNumber = Number.parseInt(room.room_number.substring(0, room.room_number.length - 2))
      return floorFromRoomNumber === selectedFloor
    })
  }, [selectedFloor, searchQuery, rooms])

  const getBorderColor = (status: CleaningStatus) => {
    switch (status) {
      case "清掃不要":
        return "border-gray-300"
      case "チェックアウト済":
        return "border-purple-400"
      case "ゴミ・シーツ回収":
        return "border-yellow-400"
      case "ベッドメイク・水回り":
        return "border-green-400"
      case "掃除機":
        return "border-blue-400"
      case "最終チェック":
        return "border-cyan-400"
      case "未チェックアウト":
        return "border-red-400"
      default:
        return "border-gray-200"
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderWithMenu title="指示書閲覧" />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div ref={topRef}>
          <DateDisplay />
        </div>
        <div
          ref={stickyRef}
          className={`${
            isSticky ? "fixed top-0 left-0 right-0 bg-gray-50 shadow-md z-50 p-4 transform-gpu" : ""
          } transition-transform duration-200 ease-out will-change-transform`}
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
                <button
                  onClick={() => setIsHelpModalOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="ヘルプを表示"
                >
                  <HelpCircle className="w-6 h-6" />
                </button>
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
            {/* 右側：部屋一覧 */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <LoadingSpinner size="large" text="部屋データを読み込み中..." />
                </div>
              ) : dataNotFound ? (
                <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="text-xl font-bold mb-4">今日の指示書はまだ作成されていません</div>
                  <p className="text-gray-600 mb-6">指示書を作成してから閲覧してください。</p>
                  <Link
                    href="/instructions/create"
                    className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    <PlusCircle className="mr-2" size={20} />
                    指示書を作成する
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredRooms.map((room) => (
                    <RoomCard
                      key={room.room_number}
                      roomNumber={room.room_number}
                      roomType={room.type_name}
                      checkInTime={room.check_in_time || undefined}
                      guestCount={room.guest_count || undefined}
                      cleaningStatus={room.cleaning_status}
                      cleaningAvailability={room.cleaning_availability}
                      isDisabled={false}
                      borderColor={getBorderColor(room.cleaning_status as CleaningStatus)}
                      onClick={() => setSelectedRoom(room.room_number)}
                    />
                  ))}
                </div>
              )}
              {!isLoading && !dataNotFound && filteredRooms.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">該当する部屋がありません</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* 詳細モーダル */}
        <RoomDetailModal
          key={selectedRoom}
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          roomData={
            rooms.find((room) => room.room_number === selectedRoom)
              ? {
                  roomNumber: selectedRoom || "",
                  roomType: rooms.find((room) => room.room_number === selectedRoom)?.type_name,
                  cleaningStatus: (rooms.find((room) => room.room_number === selectedRoom)?.cleaning_status ||
                    "清掃不要") as CleaningStatus,
                  cleaningAvailability: (rooms.find((room) => room.room_number === selectedRoom)
                    ?.cleaning_availability || "〇") as CleaningAvailability,
                  checkInTime: rooms.find((room) => room.room_number === selectedRoom)?.check_in_time || undefined,
                  guestCount: rooms.find((room) => room.room_number === selectedRoom)?.guest_count || undefined,
                  setType: rooms.find((room) => room.room_number === selectedRoom)?.set_type || "なし",
                  notes: rooms.find((room) => room.room_number === selectedRoom)?.notes || "",
                }
              : {
                  roomNumber: "",
                  roomType: undefined,
                  cleaningStatus: "清掃不要",
                  cleaningAvailability: "×",
                  checkInTime: undefined,
                  guestCount: undefined,
                  setType: "なし",
                  notes: "",
                }
          }
          onUpdate={updateRoomData}
        />{" "}
        {/* ヘルプモーダル */}
        <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
        {/* モバイル用階層選択モーダル */}
        {isMobile && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isFloorSelectorOpen ? "flex" : "hidden"} items-center justify-center p-6`}
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
