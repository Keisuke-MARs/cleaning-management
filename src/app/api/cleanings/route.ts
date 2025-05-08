import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { Cleaning, ApiResponse, CleaningStatus, CleaningAvailability } from "@/types/database";

//清掃状況を取得(日付でフィルタリング可能)
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Cleaning[]>>> {
    try {
        const searchParams = request.nextUrl.searchParams;
        const date = searchParams.get("date")

        let sql = `SELECT 
            cleaning_date,
            room_number,
            cleaning_status,
            cleaning_availability,
            to_char(check_in_time, 'HH24:MI') AS check_in_time,
            guest_count, 
            set_type,notes 
            FROM cleanings`
        const params: any[] = []
        if (date) {
            sql += "WHERE cleaning_date = $1"
            params.push(date)
        }

        sql += "ORDER BY room_number"

        const result = await query<Cleaning>(sql, params)

        return NextResponse.json({
            success: true,
            data: result.rows,
            status: 200,
        })
    } catch (error) {
        console.error("清掃情報の取得中にエラーが発生しました", error)
        return NextResponse.json({
            success: false,
            error: "清掃情報の取得中にエラーが発生しました",
            status: 500,
        })
    }
}

//清掃情報の作成、更新
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Cleaning>>> {
    try {
        //リクエストボディを取得
        const body = await request.json()
        console.log("リクエストボディ:", body)
        const {
            cleaning_date,
            room_number,
            cleaning_status,
            cleaning_availability,
            check_in_time,
            guest_count,
            set_type,
            notes,
        } = body
        //データのバリデーション
        if (!cleaning_date || !room_number || !cleaning_status || !cleaning_availability) {
            console.error("必須フィールドが不足しています", { cleaning_date, room_number, cleaning_status, cleaning_availability })
            return NextResponse.json({
                success: false,
                error: "必須フィールドが不足しています",
                status: 400,
            })
        }

        //清掃状態の値を検証
        const validCleaningStatus: CleaningStatus[] = ["清掃不要", "未チェックアウト", "ゴミ回収", "ベッドメイク", "掃除機", "最終チェック"]
        if (!validCleaningStatus.includes(cleaning_status as CleaningStatus)) {
            return NextResponse.json({
                success: false,
                error: "無効な清掃状態です",
                status: 400,
            })
        }

        //清掃可否の値を検証
        const validCleaningAvailability: CleaningAvailability[] = ["〇", "×", "連泊:清掃あり", "連泊:清掃なし"]
        if (!validCleaningAvailability.includes(cleaning_availability as CleaningAvailability)) {
            return NextResponse.json({
                success: false,
                error: "無効な清掃可否です",
                status: 400,
            })
        }

        //部屋の存在確認　問題なかったら消す
        // try {
        //     const roomCheck = await query("SELECT * FROM rooms WHERE room_number = $1", [room_number])
        //     if (roomCheck.rows.length === 0) {
        //         return NextResponse.json({
        //             success: false,
        //             error: "指定された部屋は存在しません",
        //             status: 404,
        //         })
        //     }
        // } catch (error) {
        //     console.error("部屋の存在確認中にエラーが発生しました", error)
        //     return NextResponse.json({
        //         success: false,
        //         error: "部屋の存在確認中にエラーが発生しました",
        //         status: 500,
        //     })
        // }

        //既存の清掃情報を確認　問題なかったら消す
        // let existingCheck
        // try {
        //     existingCheck = await query<Cleaning>("SELECT * FROM cleanings WHERE cleaning_date = $1 AND room_number = $2", [cleaning_date, room_number])
        // } catch (error) {
        //     console.error("既存の清掃情報の確認中にエラーが発生しました", error)
        //     return NextResponse.json({
        //         success: false,
        //         error: "既存の清掃情報の確認中にエラーが発生しました",
        //         status: 500,
        //     })
        // }

        let result
        try {
            // if (existingCheck.rows.length > 0) {
                //既存のレコードを更新
                // console.log("既存のレコードを更新", { cleaning_date, room_number })
                // result = await query<Cleaning>(
                //     `UPDATE cleanings
                //     SET cleaning_status = $1,
                //     cleaning_availability = $2,
                //     check_in_time = $3,
                //     guest_count = $4,
                //     set_type = $5,
                //     notes = $6
                //     WHERE cleaning_date = $7 AND room_number = $8
                //     RETURNING *`,
                //     [
                //         cleaning_status,
                //         cleaning_availability,
                //         check_in_time || null,
                //         guest_count || null,
                //         set_type || null,
                //         notes || null,
                //         cleaning_date,
                //         room_number,
                //     ],
                // )
            // } else {
                //新しいレコードを作成
                console.log("新しいレコードを作成", { cleaning_date, room_number })
                result = await query<Cleaning>(
                    `INSERT INTO cleanings(
                        cleaning_date,
                        room_number,
                        cleaning_status,
                        cleaning_availability,
                        check_in_time,
                        guest_count,
                        set_type,
                        notes
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *`,
                    [
                        cleaning_date,
                        room_number,
                        cleaning_status,
                        cleaning_availability,
                        check_in_time || null,
                        guest_count || null,
                        set_type || null,
                        notes || null,
                    ],)
            // }
        } catch (error) {
            console.error("清掃情報の保存中にエラーが発生しました", error)
            return NextResponse.json({
                success: false,
                error: "清掃情報の保存中にエラーが発生しました",
                status: 500,
            })
        }

        //成功時のレスポンス
        return NextResponse.json({
            success: true,
            data: result.rows[0],
        })
    } catch (error) {
        console.error("清掃情報の保存中にエラーが発生しました", error)
        return NextResponse.json({
            success: false,
            error: "清掃情報の保存中にエラーが発生しました",
            status: 500,
        })
    }
}
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse<Cleaning>>> {
    try {
        //リクエストボディを取得
        const body = await request.json()
        const {
            cleaning_status,
            cleaning_availability,
            check_in_time,
            guest_count,
            set_type,
            notes
        } = body

        //以下バリテーションチェック(居るかわからないけど一応)
        if (!cleaning_status || !cleaning_availability) {
            console.error("バリテーションエラー:", { cleaning_status, cleaning_availability })
            return NextResponse.json(
                {
                    success: false,
                    error: "バリデーションエラー、清掃状態、清掃可否は必須です",
                    status: 400,
                }
            )
        }

        //清掃状態の値(型)を検証
        const validCleaningStatuses: CleaningStatus[] = [
            "清掃不要",
            "未チェックアウト",
            "ゴミ回収",
            "ベッドメイク",
            "掃除機",
            "最終チェック",
        ]
        if (!validCleaningStatuses.includes(cleaning_status as CleaningStatus)) {
            console.error("無効な清掃状態", cleaning_status)
            return NextResponse.json({
                success: false,
                error: `無効な清掃状態です:${cleaning_status}`,
                status: 400,
            })
        }

        //清掃可否の値(型)を検証
        const validCleaningAvailability = ["〇", "×", "連泊:清掃あり", "連泊:清掃なし"]
        if (!validCleaningAvailability.includes(cleaning_availability as CleaningAvailability)) {
            console.error("無効な清掃可否", cleaning_availability)
            return NextResponse.json({
                success: false,
                error: `無効な清掃可否です:${cleaning_availability}`,
                status: 400,
            })
        }

        //データベースに保存
        const result = await query<Cleaning>(
            `UPDATE cleanings 
            SET cleaning_status = $1,
            cleaning_availability = $2,
            checkcheck_in_time  = $3,
            guest_count = $4,
            set_type = $5,
            notes = $6 
            where cleaning_date = $7 
            and room_number = $8
            RETURNING *`,
            [
                cleaning_status,
                cleaning_availability,
                check_in_time,
                guest_count,
                set_type,
                notes,
                body.cleaning_date,
                body.room_number
            ]
        )
        return NextResponse.json({
            success: true,
            data: result.rows[0],
            status: 204,
        })
    }catch (error) {
        console.error("清掃情報の更新中にエラー発生:", error)
        return NextResponse.json({
            success: false,
            error: "清掃情報の更新中にエラーが発生しました",
            status: 500,
        })
    }
}
