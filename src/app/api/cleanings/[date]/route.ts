import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { Cleaning, ApiResponse } from "@/types/database";

export async function GET(request: NextRequest, { params }: { params: { date: string } }): Promise<NextResponse<ApiResponse<Cleaning>>> {
    try {
        const date = params.date
        const result = await query<Cleaning>(
            "SELECT * FROM cleanings WHERE cleaning_date = $1 ORDER BY room_number",
            [date]
        )
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                data: result.rows[0],
                status: 404,
            })
        }
        return NextResponse.json({
            success: true,
            data: result.rows[0],
        })
    } catch (error) {
        console.error("[cleanings/[date]]清掃情報の取得中のエラー:", error)
        return NextResponse.json({
            success: false,
            error: "清掃情報の取得中にエラーが発生しました",
            status: 500,
        })
    }
}