import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { RoomType, ApiResponse } from "@/types/database";

//すべての部屋タイプを取得
export async function GET(): Promise<NextResponse<ApiResponse<RoomType[]>>> {
    try {
        const result = await query<RoomType>('SELECT * FROM room_types ORDER BY room_type_id');

        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error("部屋タイプの取得中にエラーが発生:", error);
        return NextResponse.json(
            {
                success: false,
                error: "部屋タイプの取得中にエラーが発生しました"
            },
            { status: 500 }
        )
    }
}

