import { type NextRequest, NextResponse } from "next/server"
import { query, testConnection } from "@/lib/db"
import type { Cleaning, ApiResponse, CleaningStatus, CleaningAvailability } from "@/types/database"

// モックデータ - データベース接続に失敗した場合に使用
const mockCleanings: Cleaning[] = []

// 清掃情報を取得（日付でフィルタリング可能）
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Cleaning[]>>> {
    try {
        const searchParams = request.nextUrl.searchParams
        const date = searchParams.get("date")

        // データベース接続をテスト
        const isConnected = await testConnection().catch(() => false)

        if (!isConnected) {
            console.warn("データベース接続に失敗しました。モックデータを使用します。")

            // モックデータを返す
            return NextResponse.json({
                success: true,
                data: mockCleanings,
                message: "注意: データベース接続に失敗したため、テスト用データを表示しています。",
            })
        }

        let sql = "SELECT * FROM cleanings"
        const params: any[] = []

        if (date) {
            sql += " WHERE cleaning_date = $1"
            params.push(date)
        }

        sql += " ORDER BY room_number"

        const result = await query<Cleaning>(sql, params)

        return NextResponse.json({
            success: true,
            data: result.rows,
        })
    } catch (error) {
        console.error("清掃情報の取得中にエラーが発生しました:", error)

        // エラー時もモックデータを返す
        return NextResponse.json({
            success: true,
            data: mockCleanings,
            message: "注意: エラーが発生したため、テスト用データを表示しています。",
        })
    }
}

// 新しい清掃情報を作成または更新
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Cleaning>>> {
    try {
        // リクエストボディを取得
        const body = await request.json()
        console.log("リクエストボディ:", body) // デバッグ用ログ

        const {
            cleaning_date,
            room_number,
            cleaning_status,
            cleaning_availability,
            check_in_time,
            guest_count,
            set_type,
            notes,
        } = body

        // バリデーション
        if (!cleaning_date || !room_number || !cleaning_status || !cleaning_availability) {
            console.error("バリデーションエラー:", { cleaning_date, room_number, cleaning_status, cleaning_availability })
            return NextResponse.json(
                {
                    success: false,
                    error: "清掃日、部屋番号、清掃状態、清掃可否は必須です",
                },
                { status: 400 },
            )
        }

        // 清掃状態の値を検証
        const validCleaningStatuses: CleaningStatus[] = [
            "清掃不要",
            "ゴミ回収",
            "ベッドメイク",
            "掃除機",
            "最終チェック",
            "未チェックアウト",
        ]

        if (!validCleaningStatuses.includes(cleaning_status as CleaningStatus)) {
            console.error("無効な清掃状態:", cleaning_status)
            return NextResponse.json(
                {
                    success: false,
                    error: `無効な清掃状態です: ${cleaning_status}`,
                    details: `有効な値: ${validCleaningStatuses.join(", ")}`,
                },
                { status: 400 },
            )
        }

        // 清掃可否の値を検証
        const validCleaningAvailabilities: CleaningAvailability[] = ["〇", "×", "連泊:清掃あり", "連泊:清掃なし"]

        if (!validCleaningAvailabilities.includes(cleaning_availability as CleaningAvailability)) {
            console.error("無効な清掃可否:", cleaning_availability)
            return NextResponse.json(
                {
                    success: false,
                    error: `無効な清掃可否です: ${cleaning_availability}`,
                    details: `有効な値: ${validCleaningAvailabilities.join(", ")}`,
                },
                { status: 400 },
            )
        }

        // データベース接続をテスト
        const isConnected = await testConnection().catch((err) => {
            console.error("データベース接続テストエラー:", err)
            return false
        })

        if (!isConnected) {
            console.error("データベース接続に失敗しました")
            return NextResponse.json(
                {
                    success: false,
                    error: "データベース接続に失敗しました。現在、データの保存はできません。",
                },
                { status: 503 },
            )
        }

        // 部屋の存在確認
        try {
            const roomCheck = await query("SELECT * FROM rooms WHERE room_number = $1", [room_number])

            if (roomCheck.rows.length === 0) {
                console.error("指定された部屋が存在しません:", room_number)
                return NextResponse.json(
                    {
                        success: false,
                        error: "指定された部屋が存在しません",
                    },
                    { status: 400 },
                )
            }
        } catch (error) {
            console.error("部屋の存在確認中にエラーが発生しました:", error)
            return NextResponse.json(
                {
                    success: false,
                    error: "部屋の存在確認中にエラーが発生しました",
                },
                { status: 500 },
            )
        }

        // 既存の清掃情報を確認
        let existingCheck
        try {
            existingCheck = await query<Cleaning>("SELECT * FROM cleanings WHERE cleaning_date = $1 AND room_number = $2", [
                cleaning_date,
                room_number,
            ])
        } catch (error) {
            console.error("既存の清掃情報確認中にエラーが発生しました:", error)
            return NextResponse.json(
                {
                    success: false,
                    error: "既存の清掃情報確認中にエラーが発生しました",
                },
                { status: 500 },
            )
        }

        let result
        try {
            if (existingCheck.rows.length > 0) {
                // 既存のレコードを更新
                console.log("既存レコードを更新:", { cleaning_date, room_number })
                result = await query<Cleaning>(
                    `UPDATE cleanings 
           SET cleaning_status = $1, cleaning_availability = $2, check_in_time = $3, 
               guest_count = $4, set_type = $5, notes = $6
           WHERE cleaning_date = $7 AND room_number = $8
           RETURNING *`,
                    [
                        cleaning_status,
                        cleaning_availability,
                        check_in_time,
                        guest_count,
                        set_type || "なし",
                        notes,
                        cleaning_date,
                        room_number,
                    ],
                )
            } else {
                // 新しいレコードを作成
                console.log("新規レコードを作成:", { cleaning_date, room_number })
                result = await query<Cleaning>(
                    `INSERT INTO cleanings 
           (cleaning_date, room_number, cleaning_status, cleaning_availability, 
            check_in_time, guest_count, set_type, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
                    [
                        cleaning_date,
                        room_number,
                        cleaning_status,
                        cleaning_availability,
                        check_in_time,
                        guest_count,
                        set_type || "なし",
                        notes,
                    ],
                )
            }
        } catch (error) {
            console.error("清掃情報の保存中にエラーが発生しました:", error)
            return NextResponse.json(
                {
                    success: false,
                    error: "清掃情報の保存中にエラーが発生しました",
                    details: error instanceof Error ? error.message : String(error),
                },
                { status: 500 },
            )
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0],
            message: "清掃情報が正常に保存されました",
        })
    } catch (error) {
        console.error("清掃情報の保存中に予期せぬエラーが発生しました:", error)
        return NextResponse.json(
            {
                success: false,
                error: "清掃情報の保存中にエラーが発生しました",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        )
    }
}
