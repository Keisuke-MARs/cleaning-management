// いらんくねこれ
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { RoomType, ApiResponse } from "@/types/database";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<RoomType>>> {
    try {
        const id = params.id;
        const result = await query<RoomType>(
            'SELECT * FROM room_types WHERE room_type_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: '指定された部屋タイプが見つかりません'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error("部屋タイプの取得中にエラーが発生しました:", error);
        return NextResponse.json(
            {
                success: false,
                error: "部屋タイプの取得中にエラーが発生しました"
            },
            { status: 500 }
        );
    }
}