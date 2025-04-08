// src/app/api/rooms-with-cleaning/[date]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse, RoomWithCleaning } from '@/types/database';

// 特定の日付の部屋と清掃情報を結合して取得
export async function GET(
    request: NextRequest,
    { params }: { params: { date: string } }
): Promise<NextResponse<ApiResponse<RoomWithCleaning[]>>> {
    try {
        const { date } = params;

        const result = await query(`
      SELECT r.*, rt.type_name, c.cleaning_status, c.cleaning_availability, 
             c.check_in_time, c.guest_count, c.set_type, c.notes
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.room_type_id
      LEFT JOIN cleanings c ON r.room_number = c.room_number AND c.cleaning_date = $1
      ORDER BY r.room_number
    `, [date]);

        // 清掃情報がない場合のデフォルト値を設定
        const roomsWithCleaning = result.rows.map(row => ({
            room_number: row.room_number,
            capacity: row.capacity,
            room_type_id: row.room_type_id,
            type_name: row.type_name,
            cleaning_status: row.cleaning_status || '清掃不要',
            cleaning_availability: row.cleaning_availability || '〇',
            set_type: row.set_type || 'なし',
            check_in_time: row.check_in_time || null,
            guest_count: row.guest_count || null,
            notes: row.notes || null
        }));

        return NextResponse.json({
            success: true,
            data: roomsWithCleaning
        }, {
            status: 200
        });
    } catch (error) {
        console.error('部屋と清掃情報の取得中にエラーが発生しました:', error);
        return NextResponse.json(
            {
                success: false,
                error: '部屋と清掃情報の取得中にエラーが発生しました'
            },
            { status: 500 }
        );
    }
}