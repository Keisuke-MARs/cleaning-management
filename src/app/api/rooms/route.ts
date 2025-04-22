import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Room, ApiResponse } from "@/types/database"

//全部屋の取得
export async function GET(): Promise<NextResponse<ApiResponse<(Room & { type_name: string })[]>>> {
    try {
        //DB接続テスト
        try {
            await query("SELECT 1")
        } catch (error) {
            console.error("DB接続エラー:", error)
            return NextResponse.json({
                success: false,
                error: "DB接続エラー",
            }, {
                status: 500,
            })
        }

        //クエリ実行
        const result = await query<Room & { type_name: string }>(`
            SELECT r.*,rt.type_name 
            FROM rooms r 
            JOIN room_types rt 
            ON r.room_type_id = rt.room_type_id 
            ORDER BY r.room_number`)

        //クエリ結果を返す
        return NextResponse.json({
            success: true,
            data: result.rows,
        }, {
            status: 200,
        })
    } catch (error) {
        console.error("部屋の取得中にエラーが発生:", error)
        return NextResponse.json({
            success: false,
            error: "部屋の取得中にエラーが発生",
        }, {
            status: 500,
        })
    }
}   