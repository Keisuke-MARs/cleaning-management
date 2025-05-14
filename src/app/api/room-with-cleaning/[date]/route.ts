import { NextRequest,NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { RoomWithCleaning,ApiResponse,CleaningStatus,CleaningAvailability } from "@/types/database";

export async function GET(request:NextRequest,context:{params:Promise<{date:string}>}):Promise<NextResponse<ApiResponse<RoomWithCleaning[]>>>{
    try{
        const { params } = context;
        const { date } = await params;
        console.log("GETリクエストボディ:", date);
        const result = await query<RoomWithCleaning>(
            `SELECT c.cleaning_date,
            c.room_number,
            c.cleaning_status,
            c.cleaning_availability,
            to_char(c.check_in_time, 'HH24:MI') AS check_in_time,
            c.guest_count,
            c.set_type,
            c.notes,
            rt.type_name
            FROM cleanings c 
            JOIN rooms r ON c.room_number = r.room_number
            JOIN room_types rt ON r.room_type_id  = rt.room_type_id
            WHERE c.cleaning_date  = $1
            ORDER BY c.room_number`,
            [date]
        )

        if(result.rows.length === 0){
            return NextResponse.json({
                success: false,
                data: result.rows,
                status: 404,
            })
        }

        return NextResponse.json({
            success: true,
            data: result.rows,
            status: 200,
        })
    }catch(error){
        console.error("[rooms-with-cleanings/[date]]部屋と清掃状況の取得中のエラー:", error)
        return NextResponse.json({
            success: false,
            error: "部屋と清掃状況の取得中にエラーが発生しました",
            status: 500,
        })
    }
}