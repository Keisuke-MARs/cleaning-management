//部屋タイプの型
export interface RoomType {
    room_type_id: number
    type_name: string
}

//部屋の型 /cretate
export interface Room {
    room_number: string
    capacity: number
    room_type_id: number
}

//CHECK制約あるやつの型
export type CleaningStatus = "清掃不要" | "未チェックアウト" | "ゴミ回収" | "ベッドメイク" | "掃除機" | "最終チェック"
export type CleaningAvailability = "〇" | "×" | "連泊:清掃あり" | "連泊:清掃なし"
export type SetType = "なし" | "あり" | "ソファ" | "和布団1組" | "和布団2組" | "ソファ・和布団"

//清掃状況の型 /view
export interface Cleaning {
    cleaning_date: string
    room_number: string
    cleaning_status: CleaningStatus
    cleaning_availability: CleaningAvailability
    check_in_time: string | null
    guest_count: number | null
    set_type: SetType
    notes: string | null
}
//APIレスポンスの型 全部
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
    status?: number
}

//部屋と清掃状況の結合 /view
export interface RoomWithCleaning extends Room {
    cleaning_date: string
    room_number: string
    type_name: string
    cleaning_status: CleaningStatus
    cleaning_availability: CleaningAvailability
    check_in_time: string | null
    guest_count: number | null
    set_type: SetType
    notes: string | null
}