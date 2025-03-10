/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

interface RoomCardProps {
    roomNumber: string
    checkInTime?: string
    guestCount?: number
    cleaningStatus: string
    isDisabled: boolean
    borderColor?: string
    onClick: () => void
}

export default function RoomCard({
    roomNumber,
    checkInTime,
    guestCount,
    cleaningStatus,
    isDisabled,
    borderColor = "border-gray-200", // デフォルトの枠色（後で調整可能）
    onClick,
}: RoomCardProps) {
    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`w-full p-4 rounded-lg ${borderColor} border-2 bg-white shadow-sm
            transition-all duration-200 
            ${isDisabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "hover:shadow-md hover:scale-105"}`}
        >
            <div className="text-2xl font-bold mb-2">{roomNumber}</div>
            {(checkInTime || guestCount) && (
                <div className="text-sm text-gray-600">
                    {guestCount && <div>{guestCount}人</div>}
                    {checkInTime && <div>{checkInTime}</div>}
                </div>
            )}
        </button>
    )
}

