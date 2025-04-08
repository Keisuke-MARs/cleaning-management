import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Room, ApiResponse } from "@/types/database"

// 全ての部屋を取得
export async function GET(): Promise<NextResponse<ApiResponse<(Room & { type_name: string })[]>>> {
    try {
        // データベース接続をテスト
        try {
            await query("SELECT 1")
        } catch (dbError) {
            console.error("データベース接続エラー:", dbError)
            return NextResponse.json(
                {
                    success: false,
                    error: "データベース接続に失敗しました",
                },
                { status: 500 },
            )
        }

        const result = await query<Room & { type_name: string }>(`
      SELECT r.*, rt.type_name 
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.room_type_id
      ORDER BY r.room_number
    `)

        return NextResponse.json({
            success: true,
            data: result.rows,
        })
    } catch (error) {
        console.error("部屋の取得中にエラーが発生しました:", error)
        return NextResponse.json(
            {
                success: false,
                error: "部屋の取得中にエラーが発生しました",
            },
            { status: 500 },
        )
    }
}

// 新しい部屋を作成
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Room>>> {
    try {
        const body = await request.json()
        const { room_number, capacity, room_type_id } = body

        // バリデーション
        if (!room_number || !capacity || !room_type_id) {
            return NextResponse.json(
                {
                    success: false,
                    error: "部屋番号、収容人数、部屋タイプIDは必須です",
                },
                { status: 400 },
            )
        }

        // 部屋タイプの存在確認
        const typeCheck = await query("SELECT * FROM room_types WHERE room_type_id = $1", [room_type_id])

        if (typeCheck.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "指定された部屋タイプが存在しません",
                },
                { status: 400 },
            )
        }

        // 部屋番号の重複確認
        const roomCheck = await query("SELECT * FROM rooms WHERE room_number = $1", [room_number])

        if (roomCheck.rows.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "この部屋番号は既に使用されています",
                },
                { status: 400 },
            )
        }

        const result = await query<Room>(
            "INSERT INTO rooms (room_number, capacity, room_type_id) VALUES ($1, $2, $3) RETURNING *",
            [room_number, capacity, room_type_id],
        )

        return NextResponse.json({
            success: true,
            data: result.rows[0],
            message: "部屋が正常に作成されました",
        })
    } catch (error) {
        console.error("部屋の作成中にエラーが発生しました:", error)
        return NextResponse.json(
            {
                success: false,
                error: "部屋の作成中にエラーが発生しました",
            },
            { status: 500 },
        )
    }
}
