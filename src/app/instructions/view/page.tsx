"use client"

import { useEffect } from "react"

import { useState, useMemo } from "react"
import HeaderWithMenu from "../../components/layout/header-with-menu"
import DateDisplay from "../../components/date-display"
import RoomSearch from "../../components/room-search"
import FloorSelector from "../../components/floor-selector"
import RoomCard from "../../components/room-card"
import RoomDetailModal from "../../components/room-detail-modal"

// 固定のモックデータを使用（Math.randomを使わない）
// すべての階（1～14階）の部屋データを含む
const mockRooms = [
    // 1階
    {
        roomNumber: "101",
        cleaningStatus: "〇",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "窓側希望",
    },
    // 2階
    {
        roomNumber: "201",
        cleaningStatus: "〇",
        checkInTime: "14:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "202",
        cleaningStatus: "×",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "清掃不要",
    },
    {
        roomNumber: "203",
        cleaningStatus: "連泊:清掃あり",
        checkInTime: "16:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "204",
        cleaningStatus: "連泊:清掃なし",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    // 3階
    {
        roomNumber: "301",
        cleaningStatus: "〇",
        checkInTime: "17:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "アレルギー対応",
    },
    {
        roomNumber: "302",
        cleaningStatus: "〇",
        checkInTime: "15:30",
        guestCount: 1,
        setType: "なし",
        notes: "",
    },
    {
        roomNumber: "303",
        cleaningStatus: "×",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    {
        roomNumber: "304",
        cleaningStatus: "〇",
        checkInTime: "14:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    // 4階
    {
        roomNumber: "401",
        cleaningStatus: "〇",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "402",
        cleaningStatus: "×",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    {
        roomNumber: "403",
        cleaningStatus: "連泊:清掃あり",
        checkInTime: "16:30",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "404",
        cleaningStatus: "〇",
        checkInTime: "14:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    // 5階
    {
        roomNumber: "501",
        cleaningStatus: "〇",
        checkInTime: "15:30",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "502",
        cleaningStatus: "連泊:清掃なし",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    {
        roomNumber: "503",
        cleaningStatus: "〇",
        checkInTime: "17:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "504",
        cleaningStatus: "×",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    // 6階
    {
        roomNumber: "601",
        cleaningStatus: "〇",
        checkInTime: "14:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "602",
        cleaningStatus: "〇",
        checkInTime: "16:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "603",
        cleaningStatus: "×",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    {
        roomNumber: "604",
        cleaningStatus: "連泊:清掃あり",
        checkInTime: "15:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    // 7階
    {
        roomNumber: "701",
        cleaningStatus: "〇",
        checkInTime: "16:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "702",
        cleaningStatus: "連泊:清掃なし",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    {
        roomNumber: "703",
        cleaningStatus: "〇",
        checkInTime: "14:30",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "704",
        cleaningStatus: "×",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    // 8階
    {
        roomNumber: "801",
        cleaningStatus: "〇",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "802",
        cleaningStatus: "×",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    {
        roomNumber: "803",
        cleaningStatus: "連泊:清掃あり",
        checkInTime: "16:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "804",
        cleaningStatus: "〇",
        checkInTime: "14:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    // 9階（3部屋）
    {
        roomNumber: "901",
        cleaningStatus: "〇",
        checkInTime: "15:30",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "902",
        cleaningStatus: "×",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    {
        roomNumber: "903",
        cleaningStatus: "連泊:清掃あり",
        checkInTime: "17:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    // 10階
    {
        roomNumber: "1001",
        cleaningStatus: "〇",
        checkInTime: "16:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "1002",
        cleaningStatus: "連泊:清掃あり",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1003",
        cleaningStatus: "〇",
        checkInTime: "14:30",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "特別清掃必要",
    },
    {
        roomNumber: "1004",
        cleaningStatus: "×",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    // 11階
    {
        roomNumber: "1101",
        cleaningStatus: "〇",
        checkInTime: "15:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1102",
        cleaningStatus: "×",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    {
        roomNumber: "1103",
        cleaningStatus: "連泊:清掃あり",
        checkInTime: "16:30",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "1104",
        cleaningStatus: "〇",
        checkInTime: "14:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    // 12階
    {
        roomNumber: "1201",
        cleaningStatus: "〇",
        checkInTime: "15:30",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    {
        roomNumber: "1202",
        cleaningStatus: "連泊:清掃なし",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    {
        roomNumber: "1203",
        cleaningStatus: "〇",
        checkInTime: "17:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1204",
        cleaningStatus: "×",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    // 13階
    {
        roomNumber: "1301",
        cleaningStatus: "〇",
        checkInTime: "14:30",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
    {
        roomNumber: "1302",
        cleaningStatus: "〇",
        checkInTime: "16:00",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1303",
        cleaningStatus: "×",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    {
        roomNumber: "1304",
        cleaningStatus: "連泊:清掃あり",
        checkInTime: "15:00",
        guestCount: 4,
        setType: "ソファ・和布団",
        notes: "",
    },
    // 14階（3部屋）
    {
        roomNumber: "1401",
        cleaningStatus: "〇",
        checkInTime: "16:30",
        guestCount: 2,
        setType: "ソファ",
        notes: "",
    },
    {
        roomNumber: "1402",
        cleaningStatus: "連泊:清掃なし",
        checkInTime: undefined,
        guestCount: undefined,
        setType: "なし",
        notes: "",
    },
    {
        roomNumber: "1403",
        cleaningStatus: "〇",
        checkInTime: "14:00",
        guestCount: 3,
        setType: "和布団",
        notes: "",
    },
]

export default function ViewInstructions() {
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
    const [headerHeight, setHeaderHeight] = useState(0)

    // 選択された階とフィルタリングされた部屋を管理
    const filteredRooms = useMemo(() => {
        return mockRooms.filter((room) => {
            // 検索クエリによるフィルタリング
            const matchesSearch = searchQuery.trim() === "" || room.roomNumber.includes(searchQuery.trim())
            if (!matchesSearch) return false

            // 階層によるフィルタリング
            if (selectedFloor === null) {
                return true // すべての階を表示
            }

            // 部屋番号から階数を抽出
            const floorFromRoomNumber = Number.parseInt(room.roomNumber.substring(0, room.roomNumber.length - 2))

            // 選択された階と部屋の階数が一致するかチェック
            return floorFromRoomNumber === selectedFloor
        })
    }, [selectedFloor, searchQuery])

    // ヘッダーの高さを取得
    useEffect(() => {
        const header = document.querySelector("header")
        if (header) {
            setHeaderHeight(header.offsetHeight)
        }
    }, [])

    // 部屋の状態に基づいて枠の色を決定
    const getBorderColor = (roomNumber: string) => {
        const room = mockRooms.find((r) => r.roomNumber === roomNumber)
        if (room?.cleaningStatus === "×" || room?.cleaningStatus === "連泊:清掃なし") {
            return "border-gray-300"
        }
        // 選択された部屋は強調表示
        if (roomNumber === selectedRoom) {
            return "border-blue-500"
        }
        // ここに状態に応じた色を設定（後で調整可能）
        return "border-green-400"
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <HeaderWithMenu title="指示書閲覧" />
            <main className="flex-1 container mx-auto px-4 py-8 pt-0" style={{ paddingTop: `${headerHeight + 32}px` }}>
                <DateDisplay />
                <div className="flex justify-between items-center mb-6">
                    <div className="w-full max-w-md">
                        <RoomSearch onSearch={setSearchQuery} />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* 左側：階層選択 */}
                    <div className="md:w-64">
                        <FloorSelector selectedFloor={selectedFloor} onFloorSelect={setSelectedFloor} />
                    </div>

                    {/* 右側：部屋一覧 */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {filteredRooms.map((room) => (
                                <RoomCard
                                    key={room.roomNumber}
                                    roomNumber={room.roomNumber}
                                    checkInTime={room.checkInTime}
                                    guestCount={room.guestCount}
                                    cleaningStatus={room.cleaningStatus}
                                    isDisabled={false} // すべての部屋をクリック可能にする
                                    borderColor={getBorderColor(room.roomNumber)}
                                    onClick={() => setSelectedRoom(room.roomNumber)}
                                />
                            ))}
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
                            cleaningStatus: "",
                        }
                    }
                />
            </main>
        </div>
    )
}

