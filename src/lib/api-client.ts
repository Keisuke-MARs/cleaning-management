import type { ApiResponse, Room, RoomType, Cleaning, RoomWithCleaning } from "@/types/database"

// APIリクエスト用の基本関数を修正
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    }

    // 絶対パスを使用するように修正
    const baseUrl = window.location.origin
    const url = `${baseUrl}/api/${endpoint}`

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        })

        // 404エラーの場合は特別に処理
        if (response.status === 404) {
            return {
                success: false,
                error: "データが見つかりません",
                notFound: true,
            }
        }

        if (!response.ok) {
            const errorData = await response.text()
            console.error(`API Error (${response.status}):`, errorData)
            return {
                success: false,
                error: `APIリクエストエラー: ${response.status}`,
            }
        }

        const data = await response.json()
        return data as ApiResponse<T>
    } catch (error) {
        console.error("API呼び出しエラー:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "APIリクエスト中にエラーが発生しました",
        }
    }
}

// 部屋タイプAPI
export const roomTypesApi = {
    getAll: () => fetchAPI<RoomType[]>("room-types"),
    getById: (id: number) => fetchAPI<RoomType>(`room-types/${id}`),
    create: (data: { type_name: string; description?: string }) =>
        fetchAPI<RoomType>("room-types", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: number, data: { type_name: string; description?: string }) =>
        fetchAPI<RoomType>(`room-types/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: number) =>
        fetchAPI<null>(`room-types/${id}`, {
            method: "DELETE",
        }),
}

// 部屋API
export const roomsApi = {
    getAll: () => fetchAPI<(Room & { type_name: string })[]>("rooms"),
    getByRoomNumber: (roomNumber: string) => fetchAPI<Room & { type_name: string }>(`rooms/${roomNumber}`),
    create: (data: { room_number: string; capacity: number; room_type_id: number }) =>
        fetchAPI<Room>("rooms", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (roomNumber: string, data: { capacity: number; room_type_id: number }) =>
        fetchAPI<Room>(`rooms/${roomNumber}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (roomNumber: string) =>
        fetchAPI<null>(`rooms/${roomNumber}`, {
            method: "DELETE",
        }),
}

// 清掃情報API
export const cleaningsApi = {
    getByDate: (date: string) => fetchAPI<Cleaning[]>(`cleanings?date=${date}`),
    getByDateAndRoom: (date: string, roomNumber: string) => fetchAPI<Cleaning>(`cleanings/${date}/${roomNumber}`),
    saveOrUpdate: (data: {
        cleaning_date: string
        room_number: string
        cleaning_status: string
        cleaning_availability: string
        check_in_time?: string | null
        guest_count?: number | null
        set_type?: string
        notes?: string | null
    }) =>
        fetchAPI<Cleaning>("cleanings", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    delete: (date: string, roomNumber: string) =>
        fetchAPI<null>(`cleanings/${date}/${roomNumber}`, {
            method: "DELETE",
        }),
}

// 部屋と清掃情報を結合して取得
export const roomsWithCleaningApi = {
    getByDate: (date: string) => fetchAPI<RoomWithCleaning[]>(`rooms-with-cleaning/${date}`),
}

// 日付フォーマット用のユーティリティ関数
export function formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}
