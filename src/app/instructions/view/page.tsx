"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { HelpCircle } from "lucide-react"
import HeaderWithMenu from "../../components/layout/header-with-menu"
import DateDisplay from "../../components/date-display"
import RoomSearch from "../../components/room-search"
import FloorSelector from "../../components/floor-selector"
import RoomCard from "../../components/room-card"
import RoomDetailModal from "../../components/room-detail-modal"
import HelpModal from "../../components/help-modal"

// 清掃状態の種類を定義
type CleaningStatus = "清掃不要" | "ゴミ回収" | "ベッドメイク" | "掃除機" | "最終チェック"

// モックデータの型を更新
interface RoomData {
    roomNumber: string
    cleaningStatus: CleaningStatus
    checkInTime?: string
    guestCount?: number
    setType?: string
    notes?: string
}

// 固定のモックデータを使用（新しい清掃状態に基づいて更新）
const mockRooms: RoomData[] = [
    // 1階
    {
        roomNumber: "101",
        cleaningStatus: "清掃不要",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    // 2階
    {
        roomNumber: "201",
        cleaningStatus: "ゴミ回収",
        checkInTime: "14:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "202",
        cleaningStatus: "ベッドメイク",
        checkInTime: "15:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "203",
        cleaningStatus: "掃除機",
        checkInTime: "16:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "204",
        cleaningStatus: "最終チェック",
        checkInTime: "14:30",
        guestCount: 1,
        setType: "なし",
        notes: "",
    },
    // 3階
    {
        roomNumber: "301",
        cleaningStatus: "掃除機",
        checkInTime: "16:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "302",
        cleaningStatus: "最終チェック",
        checkInTime: "14:30",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "303",
        cleaningStatus: "ゴミ回収",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "304",
        cleaningStatus: "ベッドメイク",
        checkInTime: "17:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    // 4階
    {
        roomNumber: "401",
        cleaningStatus: "ゴミ回収",
        checkInTime: "15:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "402",
        cleaningStatus: "最終チェック",
        checkInTime: "16:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "403",
        cleaningStatus: "ベッドメイク",
        checkInTime: "14:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "404",
        cleaningStatus: "掃除機",
        checkInTime: "15:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    // 5階
    {
        roomNumber: "501",
        cleaningStatus: "清掃不要",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    {
        roomNumber: "502",
        cleaningStatus: "ゴミ回収",
        checkInTime: "14:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "503",
        cleaningStatus: "ベッドメイク",
        checkInTime: "16:30",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "504",
        cleaningStatus: "掃除機",
        checkInTime: "15:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    // 6階
    {
        roomNumber: "601",
        cleaningStatus: "最終チェック",
        checkInTime: "14:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "602",
        cleaningStatus: "清掃不要",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    {
        roomNumber: "603",
        cleaningStatus: "ゴミ回収",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "604",
        cleaningStatus: "ベッドメイク",
        checkInTime: "16:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    // 7階
    {
        roomNumber: "701",
        cleaningStatus: "掃除機",
        checkInTime: "14:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "702",
        cleaningStatus: "最終チェック",
        checkInTime: "15:30",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "703",
        cleaningStatus: "清掃不要",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    {
        roomNumber: "704",
        cleaningStatus: "ゴミ回収",
        checkInTime: "16:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    // 8階
    {
        roomNumber: "801",
        cleaningStatus: "ベッドメイク",
        checkInTime: "14:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "802",
        cleaningStatus: "掃除機",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "803",
        cleaningStatus: "最終チェック",
        checkInTime: "16:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "804",
        cleaningStatus: "清掃不要",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    // 9階（3部屋）
    {
        roomNumber: "901",
        cleaningStatus: "ゴミ回収",
        checkInTime: "14:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "902",
        cleaningStatus: "ベッドメイク",
        checkInTime: "15:30",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "903",
        cleaningStatus: "掃除機",
        checkInTime: "16:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    // 10階
    {
        roomNumber: "1001",
        cleaningStatus: "最終チェック",
        checkInTime: "14:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "1002",
        cleaningStatus: "清掃不要",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    {
        roomNumber: "1003",
        cleaningStatus: "ゴミ回収",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1004",
        cleaningStatus: "ベッドメイク",
        checkInTime: "16:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    // 11階
    {
        roomNumber: "1101",
        cleaningStatus: "掃除機",
        checkInTime: "14:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1102",
        cleaningStatus: "最終チェック",
        checkInTime: "15:30",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "1103",
        cleaningStatus: "清掃不要",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    {
        roomNumber: "1104",
        cleaningStatus: "ゴミ回収",
        checkInTime: "16:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    // 12階
    {
        roomNumber: "1201",
        cleaningStatus: "ベッドメイク",
        checkInTime: "14:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "1202",
        cleaningStatus: "掃除機",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1203",
        cleaningStatus: "最終チェック",
        checkInTime: "16:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "1204",
        cleaningStatus: "清掃不要",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    // 13階
    {
        roomNumber: "1301",
        cleaningStatus: "ゴミ回収",
        checkInTime: "14:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1302",
        cleaningStatus: "ベッドメイク",
        checkInTime: "15:30",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "1303",
        cleaningStatus: "掃除機",
        checkInTime: "16:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1304",
        cleaningStatus: "最終チェック",
        checkInTime: "17:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    // 14階（3部屋）
    {
        roomNumber: "1401",
        cleaningStatus: "清掃不要",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    {
        roomNumber: "1402",
        cleaningStatus: "ゴミ回収",
        checkInTime: "14:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1403",
        cleaningStatus: "ベッドメイク",
        checkInTime: "15:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
]

export default function ViewInstructions() {
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [isFloorSelectorOpen, setIsFloorSelectorOpen] = useState(false)
    const [isSticky, setIsSticky] = useState(false)
    const stickyRef = useRef<HTMLDivElement>(null)
    const topRef = useRef<HTMLDivElement>(null)

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

    // 選択された階とフィルタリングされた部屋を管理
    const filteredRooms = useMemo(() => {
        return mockRooms.filter((room) => {
            const matchesSearch = searchQuery.trim() === "" || room.roomNumber.includes(searchQuery.trim())
            if (!matchesSearch) return false

            if (selectedFloor === null) {
                return true
            }

            const floorFromRoomNumber = Number.parseInt(room.roomNumber.substring(0, room.roomNumber.length - 2))
            return floorFromRoomNumber === selectedFloor
        })
    }, [selectedFloor, searchQuery])

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
                        <div className={`md:w-64 ${isMobile ? "hidden" : ""}`}>
                            <FloorSelector selectedFloor={selectedFloor} onFloorSelect={setSelectedFloor} />
                        </div>

                        {/* 右側：部屋一覧 */}
                        <div className="flex-1">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredRooms.map((room) => (
                                    <RoomCard
                                        key={room.roomNumber}
                                        roomNumber={room.roomNumber}
                                        checkInTime={room.checkInTime}
                                        guestCount={room.guestCount}
                                        cleaningStatus={room.cleaningStatus}
                                        isDisabled={false}
                                        borderColor={getBorderColor(room.cleaningStatus)}
                                        onClick={() => setSelectedRoom(room.roomNumber)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 詳細モーダル */}
                <RoomDetailModal
                    isOpen={!!selectedRoom}
                    onClose={() => setSelectedRoom(null)}
                    roomData={
                        mockRooms.find((room) => room.roomNumber === selectedRoom) || {
                            roomNumber: "",
                            cleaningStatus: "清掃不要",
                        }
                    }
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
        </div>
    )
}

