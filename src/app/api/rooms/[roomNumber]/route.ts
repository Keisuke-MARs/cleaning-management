import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Room, ApiResponse } from "@/types/database"

//特定の部屋の取得
export async function GET(request: NextRequest, context: { params: { roomNumber: string } },): Promise<NextResponse<ApiResponse<Room & { type_name: string }>>> {
    const { params } = context
    const roomNumber = params.roomNumber
    try {
        const result = await query<Room & { type_name: string }>(
            "SELECT r.*,rt.type_name FROM rooms r JOIN room_types rt ON r.room_type_id = rt.room_type_id WHERE r.room_number = $1",
            [roomNumber],
        )
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                error: "部屋が見つかりませんでした",
                status: 404,
            })
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0],
            status: 200,
        })
    } catch (error) {
        console.error("部屋の取得中にエラーが発生:", error)
        return NextResponse.json({
            success: false,
            error: "部屋の取得中にエラーが発生",
            status: 500,
        })
    }
}