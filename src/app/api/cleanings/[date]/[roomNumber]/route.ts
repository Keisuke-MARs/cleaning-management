import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Cleaning, ApiResponse } from '@/types/database';

// 特定の日付と部屋の清掃情報を取得
export async function GET(
    request: NextRequest,
    { params }: { params: { date: string; roomNumber: string } }
): Promise<NextResponse<ApiResponse<Cleaning>>> {
    try {
        const { date, roomNumber } = params;

        const result = await query<Cleaning>(
            'SELECT * FROM cleanings WHERE cleaning_date = $1 AND room_number = $2',
            [date, roomNumber]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: '指定された清掃情報が見つかりません'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('清掃情報の取得中にエラーが発生しました:', error);
        return NextResponse.json(
            {
                success: false,
                error: '清掃情報の取得中にエラーが発生しました'
            },
            { status: 500 }
        );

    }
}

// 特定の日付と部屋の清掃情報を削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: { date: string; roomNumber: string } }
): Promise<NextResponse<ApiResponse<null>>> {
    try {
        const { date, roomNumber } = params;

        const result = await query(
            'DELETE FROM cleanings WHERE cleaning_date = $1 AND room_number = $2',
            [date, roomNumber]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: '指定された清掃情報が見つかりません'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '清掃情報が正常に削除されました'
        });
    } catch (error) {
        console.error('清掃情報の削除中にエラーが発生しました:', error);
        return NextResponse.json(
            {
                success: false,
                error: '清掃情報の削除中にエラーが発生しました'
            },
            { status: 500 }
        );
    }
}