import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Cleaning, ApiResponse } from "@/types/database"

// 清掃情報を取得（日付でフィルタリング可能）
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Cleaning[]>>> {
    try {
        const searchParams = request.nextUrl.searchParams
        const date = searchParams.get("date")

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
        return NextResponse.json(
            {
                success: false,
                error: "清掃情報の取得中にエラーが発生しました",
            },
            { status: 500 },
        )
    }
}

// 新しい清掃情報を作成または更新
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Cleaning>>> {
    try {
        const body = await request.json()
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
            return NextResponse.json(
                {
                    success: false,
                    error: "清掃日、部屋番号、清掃状態、清掃可否は必須です",
                },
                { status: 400 },
            )
        }

        // 部屋の存在確認
        const roomCheck = await query("SELECT * FROM rooms WHERE room_number = $1", [room_number])

        if (roomCheck.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "指定された部屋が存在しません",
                },
                { status: 400 },
            )
        }

        // 既存の清掃情報を確認
        const existingCheck = await query<Cleaning>(
            "SELECT * FROM cleanings WHERE cleaning_date = $1 AND room_number = $2",
            [cleaning_date, room_number],
        )

        let result

        if (existingCheck.rows.length > 0) {
            // 既存のレコードを更新
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

        return NextResponse.json({
            success: true,
            data: result.rows[0],
            message: "清掃情報が正常に保存されました",
        })
    } catch (error) {
        console.error("清掃情報の保存中にエラーが発生しました:", error)
        return NextResponse.json(
            {
                success: false,
                error: "清掃情報の保存中にエラーが発生しました",
            },
            { status: 500 },
        )
    }
}
