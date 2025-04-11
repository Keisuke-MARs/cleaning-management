import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Room, ApiResponse } from "@/types/database"

// 特定の部屋を取得
export async function GET(
    request: NextRequest,
    { params }: { params: { roomNumber: string } },
): Promise<NextResponse<ApiResponse<Room & { type_name: string }>>> {
    try {
        const roomNumber = params.roomNumber

        const result = await query<Room & { type_name: string }>(
            `
      SELECT r.*, rt.type_name 
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.room_type_id
      WHERE r.room_number = $1
    `,
            [roomNumber],
        )

        if (result.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "指定された部屋が見つかりません",
                },
                { status: 404 },
            )
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0],
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

// 部屋を更新
export async function PUT(
    request: NextRequest,
    { params }: { params: { roomNumber: string } },
): Promise<NextResponse<ApiResponse<Room>>> {
    try {
        const roomNumber = params.roomNumber
        const body = await request.json()
        const { capacity, room_type_id } = body

        // バリデーション
        if (!capacity || !room_type_id) {
            return NextResponse.json(
                {
                    success: false,
                    error: "収容人数、部屋タイプIDは必須です",
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

        const result = await query<Room>(
            "UPDATE rooms SET capacity = $1, room_type_id = $2 WHERE room_number = $3 RETURNING *",
            [capacity, room_type_id, roomNumber],
        )

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "指定された部屋が見つかりません",
                },
                { status: 404 },
            )
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0],
            message: "部屋が正常に更新されました",
        })
    } catch (error) {
        console.error("部屋の更新中にエラーが発生しました:", error)
        return NextResponse.json(
            {
                success: false,
                error: "部屋の更新中にエラーが発生しました",
            },
            { status: 500 },
        )
    }
}

// 部屋を削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: { roomNumber: string } },
): Promise<NextResponse<ApiResponse<null>>> {
    try {
        const roomNumber = params.roomNumber

        // 清掃テーブルで使用されているか確認
        const checkResult = await query("SELECT COUNT(*) FROM cleanings WHERE room_number = $1", [roomNumber])

        if (Number.parseInt(checkResult.rows[0].count) > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "この部屋は清掃情報で使用されているため削除できません",
                },
                { status: 400 },
            )
        }

        const result = await query("DELETE FROM rooms WHERE room_number = $1", [roomNumber])

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "指定された部屋が見つかりません",
                },
                { status: 404 },
            )
        }

        return NextResponse.json({
            success: true,
            message: "部屋が正常に削除されました",
        })
    } catch (error) {
        console.error("部屋の削除中にエラーが発生しました:", error)
        return NextResponse.json(
            {
                success: false,
                error: "部屋の削除中にエラーが発生しました",
            },
            { status: 500 },
        )
    }
}
