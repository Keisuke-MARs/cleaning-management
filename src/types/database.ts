// データベースのテーブルに対応する型定義

export interface RoomType {
    room_type_id: number
    type_name: string
    description?: string
}

export interface Room {
    room_number: string
    capacity: number
    room_type_id: number
}

export type CleaningStatus = "清掃不要" | "ゴミ回収" | "ベッドメイク" | "掃除機" | "最終チェック" | "未チェックアウト"
export type CleaningAvailability = "〇" | "×" | "連泊:清掃あり" | "連泊:清掃なし"
export type SetType = "なし" | "ソファ" | "和布団" | "ソファ・和布団"

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

// APIレスポンス用の型
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
    notFound?: boolean // 404エラー用のフラグを追加
}

// 部屋と清掃情報を結合した型
export interface RoomWithCleaning extends Room {
    type_name: string
    cleaning_status: CleaningStatus
    cleaning_availability: CleaningAvailability
    check_in_time: string | null
    guest_count: number | null
    set_type: SetType
    notes: string | null
}
