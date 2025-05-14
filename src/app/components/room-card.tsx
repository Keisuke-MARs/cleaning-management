"use client"

type CleaningAvailability = "〇" | "×" | "連泊:清掃あり" | "連泊:清掃なし"

interface RoomCardProps {
    roomNumber: string
    roomType?: string
    checkInTime?: string
    guestCount?: number
    cleaningStatus: string
    cleaningAvailability?: CleaningAvailability
    isDisabled: boolean
    borderColor?: string
    onClick: () => void
}

export default function RoomCard({
    roomNumber,
    roomType,
    checkInTime,
    guestCount,
    cleaningStatus,
    cleaningAvailability,
    isDisabled,
    borderColor = "border-gray-200",
    onClick,
}: RoomCardProps) {
    // 清掃不可の状態を判定
    const isCleaningUnavailable = cleaningAvailability === "×" || cleaningAvailability === "連泊:清掃なし"

    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`w-full p-4 rounded-lg ${borderColor} border-2 ${isCleaningUnavailable ? "bg-gray-200" : "bg-white"
                } shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105`}
        >
            <div className="text-2xl font-bold mb-1">{roomNumber}</div>
            {roomType && <div className="text-sm text-gray-600 mb-2">{roomType}</div>}
            {(checkInTime || guestCount) && (
                <div className="text-sm text-gray-600">
                    {guestCount && <div>{guestCount}人</div>}
                    {checkInTime && <div>{checkInTime}</div>}
                </div>
            )}
        </button>
    )
}

