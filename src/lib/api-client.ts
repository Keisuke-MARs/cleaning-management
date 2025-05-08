//型をインポート
import type { ApiResponse, Room, RoomType, Cleaning, RoomWithCleaning } from "@/types/database";

//APIリクエスト用の関数
export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    //APIのURLを指定
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    }
    console.log("エンドポイント:", endpoint)
    //絶対パスを指定
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/api/${endpoint}`

    //APIリクエストを実行
    try {
        //ログ
        console.log("APIリクエスト:", url, options.method || "GET")

        //リクエストする際のデータがあるとき(GETメソッド以外)
        if (options.body) {
            console.log("リクエストボディ:", options.body)
        }

        //API実行、responseに戻り値を格納
        const response = await fetch(url, { ...options, headers })

        //404エラーの時の処理
        if (response.status === 404) {
            return {
                success: false,
                error: "404エラー。データが見つかりませんでした。",
            }
        }

        //戻り値をテキストに変換
        const responseText = await response.text()

        //JSONを格納する変数
        let data
        try {
            data = JSON.parse(responseText)
        } catch (error) {
            console.error("JSONパースエラー:", error)
            return {
                success: false,
                error: `JSONパースに失敗:${responseText.substring(0, 100)}`,
            }
        }

        //レスポンスエラーの際の処理
        if (!response.ok) {
            console.error(`APIエラー:${response.status}`, data)
            return {
                success: false,
                error: data.error || `APIレスポンスエラー:${response.status}`,
            }
        }

        //成功時、値を返す
        return data as ApiResponse<T>
    } catch (error) {
        console.error("API呼び出しエラー:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "APIリクエスト中にエラーが発生",
        }
    }
}
//部屋タイプAPI
export const roomTypesApi = {
    //全部屋タイプを取得
    getAll: () => fetchAPI<RoomType[]>("room-types"),
}

//部屋API
export const roomsApi = {
    //全部屋の取得
    getAll: () => fetchAPI<Room[] & { type_name: string }>("rooms"),
    //部屋1つの取得
    getByRoomNumber: (roomNumber: string) => fetchAPI<Room & { type_name: string }[]>(`rooms/${roomNumber}`)
}

//清掃状況API
export const cleaningsApi = {
    //全清掃状況の取得
    getAll: () => fetchAPI<Cleaning[]>("cleanings"),
    //部屋番号と日付の清掃状況を取得 
    getByDateAndRoomNumber: (date: string, roomNumber: string) => fetchAPI<Cleaning[]>(`cleanings/${date}/${roomNumber}`),

    //特定の日付の清掃状況を取得
    getByDate: (date: string) => fetchAPI<Cleaning[]>(`cleanings/${date}`),

    //清掃状況の更新PUTメソッド(後で作成する)
    updateByDate: (data: {
        cleaning_date: string
        room_number: string
        cleaning_status: string
        cleaning_availability: string
        check_in_time?: string | null
        guest_count?: number | null
        set_type?: string | null
        notes?: string | null
    }) => {
        fetchAPI<Cleaning>(`cleanings/${data.cleaning_date}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    },

    //今日の清掃情報を作成するPOSTメソッド
    createTodayCleaning: (data: {
        cleaning_date: string
        room_number: string
        cleaning_status: string
        cleaning_availability: string
        check_in_time?: string | null
        guest_count?: number | null
        set_type?: string | null
        notes?: string | null
    }) => {
        fetchAPI<Cleaning>("cleanings", {
            method: "POST",
            body: JSON.stringify(data),
        })
    }
}