import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { Cleaning, ApiResponse } from "@/types/database";

//特定の日付と部屋の清掃情報を取得
export async function GET(request: NextRequest, { params }: { params: { date: string, roomNumber: string } }): Promise<NextResponse<ApiResponse<Cleaning>>> {
    try {
        const { date, roomNumber } = params
        const result = await query<Cleaning>(
            "SELECT * FROM cleanings WHERE cleaning_date = $1 AND room_number != $2 order by room_number"
            , [date, roomNumber]
        )
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                data: result.rows[0],
                error: "清掃情報が見つかりませんでした",
                status: 404,
            })

        }
        return NextResponse.json({
            success: true,
            data: result.rows[0],
        })
    } catch (error) {
        console.error("清掃情報の取得中にエラーが発生しました:", error)
        return NextResponse.json(
            {
                success: false,
                error: "清掃情報の取得中にエラーが発生しました",
                status: 500,
            }
        )
    }
}
