import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { RoomType, ApiResponse } from "@/types/database"

// 全ての部屋タイプを取得
export async function GET(): Promise<NextResponse<ApiResponse<RoomType[]>>> {
    try {
        const result = await query<RoomType>("SELECT * FROM room_types ORDER BY room_type_id")

        return NextResponse.json({
            success: true,
            data: result.rows,
        })
    } catch (error) {
        console.error("部屋タイプの取得中にエラーが発生しました:", error)
        return NextResponse.json(
            {
                success: false,
                error: "部屋タイプの取得中にエラーが発生しました",
            },
            { status: 500 },
        )
    }
}

// 新しい部屋タイプを作成
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<RoomType>>> {
    try {
        const body = await request.json()
        const { type_name, description } = body

        if (!type_name) {
            return NextResponse.json(
                {
                    success: false,
                    error: "部屋タイプ名は必須です",
                },
                { status: 400 },
            )
        }

        const result = await query<RoomType>(
            "INSERT INTO room_types (type_name, description) VALUES ($1, $2) RETURNING *",
            [type_name, description || null],
        )

        return NextResponse.json({
            success: true,
            data: result.rows[0],
            message: "部屋タイプが正常に作成されました",
        })
    } catch (error) {
        console.error("部屋タイプの作成中にエラーが発生しました:", error)
        return NextResponse.json(
            {
                success: false,
                error: "部屋タイプの作成中にエラーが発生しました",
            },
            { status: 500 },
        )
    }
}
