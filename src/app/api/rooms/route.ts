import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { Room, ApiResponse } from "@/types/database";

//すべての部屋取得
export async function GET(): Promise<NextResponse<ApiResponse<(Room & { type_name: string })[]>>> {
    try {
        const result = await query<Room & { type_name: string }>(
            `SELECT r.*,rt.type_name
            FROM rooms r
            JOIN room_types rt ON r.room_type_id = rt.room_type_id
            ORDER BY r.room_number`
        );
        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('部屋の取得中にエラーが発生しました:', error);
        return NextResponse.json(
            {
                success: false,
                error: "部屋の取得中にエラーが発生しました"
            },
            { status: 500 }
        );
    }
}
