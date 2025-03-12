/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import ScrollToTopButton from "../../components/scroll-to-top-button"
import LoadingSpinner from "../../components/loading-spinner"

// 清掃状態の種類を定義
type CleaningStatus = "清掃不要" | "ゴミ回収" | "ベッドメイク" | "掃除機" | "最終チェック"

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

// 固定のモックデータを使用（新しい清掃状態に基づいて更新）
const mockRooms: RoomData[] = [
    // 1階
    {
        roomNumber: "101",
        roomType: "ユニバーサルルーム",
        cleaningStatus: "清掃不要",
        cleaningAvailability: "連泊:清掃なし",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    // 2階
    {
        roomNumber: "201",
        roomType: "スタンダード",
        cleaningStatus: "ゴミ回収",
        cleaningAvailability: "〇",
        checkInTime: "14:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "202",
        roomType: "スタンダード",
        cleaningStatus: "ベッドメイク",
        cleaningAvailability: "〇",
        checkInTime: "15:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "203",
        roomType: "デラックス",
        cleaningStatus: "掃除機",
        cleaningAvailability: "〇",
        checkInTime: "16:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "204",
        roomType: "スイート",
        cleaningStatus: "最終チェック",
        cleaningAvailability: "〇",
        checkInTime: "14:30",
        guestCount: 1,
        setType: "なし",
        notes: "",
    },
    // 3階
    {
        roomNumber: "301",
        roomType: "スタンダード",
        cleaningStatus: "掃除機",
        cleaningAvailability: "〇",
        checkInTime: "16:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "302",
        roomType: "デラックス",
        cleaningStatus: "最終チェック",
        cleaningAvailability: "〇",
        checkInTime: "14:30",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "303",
        roomType: "スタンダード",
        cleaningStatus: "ゴミ回収",
        cleaningAvailability: "〇",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "304",
        roomType: "デラックス",
        cleaningStatus: "ベッドメイク",
        cleaningAvailability: "〇",
        checkInTime: "17:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    // 4階
    {
        roomNumber: "401",
        roomType: "スタンダード",
        cleaningStatus: "ゴミ回収",
        cleaningAvailability: "〇",
        checkInTime: "15:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "402",
        roomType: "デラックス",
        cleaningStatus: "最終チェック",
        cleaningAvailability: "〇",
        checkInTime: "16:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "403",
        roomType: "スタンダード",
        cleaningStatus: "ベッドメイク",
        cleaningAvailability: "〇",
        checkInTime: "14:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "404",
        roomType: "デラックス",
        cleaningStatus: "掃除機",
        cleaningAvailability: "〇",
        checkInTime: "15:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    // 5階
    {
        roomNumber: "501",
        roomType: "ユニバーサルルーム",
        cleaningStatus: "清掃不要",
        cleaningAvailability: "連泊:清掃なし",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    {
        roomNumber: "502",
        roomType: "スタンダード",
        cleaningStatus: "ゴミ回収",
        cleaningAvailability: "〇",
        checkInTime: "14:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "503",
        roomType: "スタンダード",
        cleaningStatus: "ベッドメイク",
        cleaningAvailability: "〇",
        checkInTime: "16:30",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "504",
        roomType: "デラックス",
        cleaningStatus: "掃除機",
        cleaningAvailability: "〇",
        checkInTime: "15:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    // 6階
    {
        roomNumber: "601",
        roomType: "デラックス",
        cleaningStatus: "最終チェック",
        cleaningAvailability: "〇",
        checkInTime: "14:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "602",
        roomType: "ユニバーサルルーム",
        cleaningStatus: "清掃不要",
        cleaningAvailability: "連泊:清掃なし",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    {
        roomNumber: "603",
        roomType: "スタンダード",
        cleaningStatus: "ゴミ回収",
        cleaningAvailability: "〇",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "604",
        roomType: "スタンダード",
        cleaningStatus: "ベッドメイク",
        cleaningAvailability: "〇",
        checkInTime: "16:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    // 7階
    {
        roomNumber: "701",
        roomType: "スタンダード",
        cleaningStatus: "掃除機",
        cleaningAvailability: "〇",
        checkInTime: "14:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "702",
        roomType: "デラックス",
        cleaningStatus: "最終チェック",
        cleaningAvailability: "〇",
        checkInTime: "15:30",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "703",
        roomType: "ユニバーサルルーム",
        cleaningStatus: "清掃不要",
        cleaningAvailability: "連泊:清掃なし",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    {
        roomNumber: "704",
        roomType: "スタンダード",
        cleaningStatus: "ゴミ回収",
        cleaningAvailability: "〇",
        checkInTime: "16:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    // 8階
    {
        roomNumber: "801",
        roomType: "スタンダード",
        cleaningStatus: "ベッドメイク",
        cleaningAvailability: "〇",
        checkInTime: "14:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "802",
        roomType: "スタンダード",
        cleaningStatus: "掃除機",
        cleaningAvailability: "〇",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "803",
        roomType: "デラックス",
        cleaningStatus: "最終チェック",
        cleaningAvailability: "〇",
        checkInTime: "16:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "804",
        roomType: "ユニバーサルルーム",
        cleaningStatus: "清掃不要",
        cleaningAvailability: "連泊:清掃なし",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    // 9階（3部屋）
    {
        roomNumber: "901",
        roomType: "スタンダード",
        cleaningStatus: "ゴミ回収",
        cleaningAvailability: "〇",
        checkInTime: "14:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "902",
        roomType: "スタンダード",
        cleaningStatus: "ベッドメイク",
        cleaningAvailability: "〇",
        checkInTime: "15:30",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "903",
        roomType: "スタンダード",
        cleaningStatus: "掃除機",
        cleaningAvailability: "〇",
        checkInTime: "16:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    // 10階
    {
        roomNumber: "1001",
        roomType: "デラックス",
        cleaningStatus: "最終チェック",
        cleaningAvailability: "〇",
        checkInTime: "14:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "1002",
        roomType: "ユニバーサルルーム",
        cleaningStatus: "清掃不要",
        cleaningAvailability: "連泊:清掃なし",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    {
        roomNumber: "1003",
        roomType: "スタンダード",
        cleaningStatus: "ゴミ回収",
        cleaningAvailability: "〇",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1004",
        roomType: "スタンダード",
        cleaningStatus: "ベッドメイク",
        cleaningAvailability: "〇",
        checkInTime: "16:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    // 11階
    {
        roomNumber: "1101",
        roomType: "スタンダード",
        cleaningStatus: "掃除機",
        cleaningAvailability: "〇",
        checkInTime: "14:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1102",
        roomType: "デラックス",
        cleaningStatus: "最終チェック",
        cleaningAvailability: "〇",
        checkInTime: "15:30",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "1103",
        roomType: "ユニバーサルルーム",
        cleaningStatus: "清掃不要",
        cleaningAvailability: "連泊:清掃なし",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    {
        roomNumber: "1104",
        roomType: "スタンダード",
        cleaningStatus: "ゴミ回収",
        cleaningAvailability: "〇",
        checkInTime: "16:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    // 12階
    {
        roomNumber: "1201",
        roomType: "スタンダード",
        cleaningStatus: "ベッドメイク",
        cleaningAvailability: "〇",
        checkInTime: "14:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "1202",
        roomType: "スタンダード",
        cleaningStatus: "掃除機",
        cleaningAvailability: "〇",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1203",
        roomType: "デラックス",
        cleaningStatus: "最終チェック",
        cleaningAvailability: "〇",
        checkInTime: "16:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "1204",
        roomType: "ユニバーサルルーム",
        cleaningStatus: "清掃不要",
        cleaningAvailability: "連泊:清掃なし",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    // 13階
    {
        roomNumber: "1301",
        roomType: "スタンダード",
        cleaningStatus: "ゴミ回収",
        cleaningAvailability: "〇",
        checkInTime: "14:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1302",
        roomType: "スタンダード",
        cleaningStatus: "ベッドメイク",
        cleaningAvailability: "〇",
        checkInTime: "15:30",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "1303",
        roomType: "スタンダード",
        cleaningStatus: "掃除機",
        cleaningAvailability: "〇",
        checkInTime: "16:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1304",
        roomType: "デラックス",
        cleaningStatus: "最終チェック",
        cleaningAvailability: "〇",
        checkInTime: "17:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    // 14階（3部屋）
    {
        roomNumber: "1401",
        roomType: "ユニバーサルルーム",
        cleaningStatus: "清掃不要",
        cleaningAvailability: "連泊:清掃なし",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "連泊のため清掃不要",
    },
    {
        roomNumber: "1402",
        roomType: "スタンダード",
        cleaningStatus: "ゴミ回収",
        cleaningAvailability: "〇",
        checkInTime: "14:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1403",
        roomType: "スタンダード",
        cleaningStatus: "ベッドメイク",
        cleaningAvailability: "〇",
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
    const [isLoading, setIsLoading] = useState(true)
    const stickyRef = useRef<HTMLDivElement>(null)
    const topRef = useRef<HTMLDivElement>(null)
    const floorSelectorContainerRef = useRef<HTMLDivElement>(null)
    const floorSelectorRef = useRef<HTMLDivElement>(null)

    // 部屋データを更新する関数
    const updateRoomData = (roomNumber: string, updatedData: Partial<RoomData>) => {
        const updatedRooms = mockRooms.map((room) => {
            if (room.roomNumber === roomNumber) {
                return { ...room, ...updatedData }
            }
            return room
        })

        // 実際のアプリケーションではここでAPIを呼び出してデータを保存します
        console.log("部屋データを更新:", roomNumber, updatedData)

        // モックデータを更新（実際のアプリケーションでは不要）
        for (let i = 0; i < mockRooms.length; i++) {
            if (mockRooms[i].roomNumber === roomNumber) {
                mockRooms[i] = { ...mockRooms[i], ...updatedData }
                break
            }
        }

        // 状態を更新して再レンダリングを強制
        setSelectedRoom(null) // モーダルを閉じる
        // 画面を更新するためのトリガー
        setSearchQuery(searchQuery + " ")
        setTimeout(() => setSearchQuery(searchQuery.trim()), 10)
    }

    // 読み込み状態をシミュレート
    useEffect(() => {
        // 実際のアプリケーションでは、ここでデータフェッチを行い、
        // 完了したらsetIsLoading(false)を呼び出します
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1500) // 1.5秒後に読み込み完了とする

        return () => clearTimeout(timer)
    }, [])

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
        }
    }, [isMobile])

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
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredRooms.map((room) => (
                                        <RoomCard
                                            key={room.roomNumber}
                                            roomNumber={room.roomNumber}
                                            roomType={room.roomType}
                                            checkInTime={room.checkInTime}
                                            guestCount={room.guestCount}
                                            cleaningStatus={room.cleaningStatus}
                                            cleaningAvailability={room.cleaningAvailability}
                                            isDisabled={false}
                                            borderColor={getBorderColor(room.cleaningStatus)}
                                            onClick={() => setSelectedRoom(room.roomNumber)}
                                        />
                                    ))}
                                </div>
                            )}

                            {!isLoading && filteredRooms.length === 0 && (
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
                        mockRooms.find((room) => room.roomNumber === selectedRoom) || {
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

