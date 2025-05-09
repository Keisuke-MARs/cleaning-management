"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { HelpCircle, PlusCircle } from "lucide-react"
import Link from "next/link"
import HeaderWithMenu from "../../components/layout/header-with-menu"
import DateDisplay from "../../components/date-display"
import RoomSearch from "../../components/room-search"
import FloorSelector from "../../components/floor-selector"
import RoomCard from "../../components/room-card"
import RoomDetailModal from "../../components/room-detail-modal"
import HelpModal from "../../components/help-modal"
import ScrollToTopButton from "../../components/scroll-to-top-button"
import LoadingSpinner from "../../components/loading-spinner"

// 代わりにAPIクライアントをインポート
import { roomsWithCleaningApi, cleaningsApi, formatDate } from "@/lib/api-client"
import type { RoomWithCleaning, SetType } from "@/types/database"

// 清掃状態の種類を定義
type CleaningStatus = "清掃不要" | "未チェックアウト" | "ゴミ回収" | "ベッドメイク" | "掃除機" | "最終チェック"

// 清掃可否の種類を定義
type CleaningAvailability = "〇" | "×" | "連泊:清掃あり" | "連泊:清掃なし"

// モックデータの型を更新
interface RoomData {
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
    const [dataNotFound, setDataNotFound] = useState(false) // 指示書が作成されていない場合のフラグ
    const stickyRef = useRef<HTMLDivElement>(null)
    const topRef = useRef<HTMLDivElement>(null)
    const floorSelectorContainerRef = useRef<HTMLDivElement>(null)
    const floorSelectorRef = useRef<HTMLDivElement>(null)
    const [windowWidth, setWindowWidth] = useState<number | null>(null)

    // 部屋データを更新する関数を修正
    const updateRoomData = async (roomNumber: string, updatedData: Partial<RoomData>) => {
        try {
            // 今日の日付を取得
            const today = new Date()
            const formattedDate = formatDate(today)

            // APIを呼び出して清掃情報を更新
            const response = await cleaningsApi.saveOrUpdate({
                cleaning_date: formattedDate,
                room_number: roomNumber,
                cleaning_status: updatedData.cleaningStatus || "清掃不要",
                cleaning_availability: updatedData.cleaningAvailability || "〇",
                check_in_time: updatedData.checkInTime || null,
                guest_count: updatedData.guestCount || null,
                set_type: updatedData.setType || "なし",
                notes: updatedData.notes || null,
            })

            if (response.success) {
                // 成功したら、部屋リストを更新
                setRooms((prevRooms) =>
                    prevRooms.map((room) =>
                        room.room_number === roomNumber
                            ? {
                                ...room,
                                cleaning_status: updatedData.cleaningStatus || room.cleaning_status,
                                cleaning_availability: updatedData.cleaningAvailability || room.cleaning_availability,
                                check_in_time: updatedData.checkInTime || room.check_in_time,
                                guest_count: updatedData.guestCount !== undefined ? updatedData.guestCount : room.guest_count,
                                set_type: (updatedData.setType as SetType) || room.set_type,
                                notes: updatedData.notes !== undefined ? updatedData.notes : room.notes,
                            }
                            : room,
                    ),
                )

                // モーダルを閉じる
                setSelectedRoom(null)
            } else {
                console.error("部屋データの更新に失敗しました:", response.error)
            }
        } catch (error) {
            console.error("部屋データの更新中にエラーが発生しました:", error)
        }
    }

    // useEffectでAPIからデータを取得するように変更
    useEffect(() => {
        async function fetchRooms() {
            try {
                setIsLoading(true)
                // 今日の日付を取得
                const today = new Date()
                const formattedDate = formatDate(today)

                // APIから部屋と清掃情報を取得
                const response = await roomsWithCleaningApi.getByDate(formattedDate)

                if (response.success && response.data) {
                    setRooms(response.data)
                    setDataNotFound(false)
                } else if (response.notFound) {
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

    // filteredRooms の useMemo を修正
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

    // 部屋の状態に基づいて枠の色を決定
    const getBorderColor = (status: CleaningStatus) => {
        switch (status) {
            case "清掃不要":
                return "border-gray-300"
            case "ゴミ回収":
                return "border-red-400"
            case "ベッドメイク":
                return "border-green-400"
            case "掃除機":
                return "border-blue-400"
            case "最終チェック":
                return "border-yellow-400"
            case "未チェックアウト":
                return "border-purple-400"
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
                    className={`${isSticky ? "fixed top-0 left-0 right-0 bg-gray-50 shadow-md z-10 p-4" : ""
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
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
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
                                cleaningStatus: "清掃不要",
                            }
                    }
                    onUpdate={updateRoomData}
                />

                {/* ヘルプモーダル */}
                <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />

                {/* モバイル用階層選択モーダル */}
                {isMobile && (
                    <div
                        className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isFloorSelectorOpen ? "flex" : "hidden"} items-center justify-center`}
                    >
                        <div className="bg-white rounded-lg p-4 w-11/12 max-w-md">
                            <FloorSelector
                                selectedFloor={selectedFloor}
                                onFloorSelect={(floor) => {
                                    setSelectedFloor(floor)
                                    setIsFloorSelectorOpen(false)
                                }}
                            />
                            <button
                                onClick={() => setIsFloorSelectorOpen(false)}
                                className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
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
