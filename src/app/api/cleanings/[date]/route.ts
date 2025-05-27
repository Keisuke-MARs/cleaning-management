import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { Cleaning, ApiResponse, CleaningStatus, CleaningAvailability } from "@/types/database";

export async function GET(request: NextRequest,context: { params: Promise<{ date: string }> }
): Promise<NextResponse<ApiResponse<Cleaning[]>>> {
    try {
        const {params} = await context
        const date = (await params).date
        console.log("GETリクエストボディ:", date)
        const result = await query<Cleaning>(
            `SELECT cleaning_date,
            room_number,
            cleaning_status,
            cleaning_availability,
            to_char(check_in_time, 'HH24:MI') AS check_in_time,
            guest_count,
            set_type,notes
            FROM cleanings
            WHERE cleaning_date = $1
            ORDER BY room_number`,
            [date]
        )
        if (result.rows.length === 0) {
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
    } catch (error) {
        console.error("[cleanings/[date]]清掃情報の取得中のエラー:", error)
        return NextResponse.json({
            success: false,
            error: "清掃情報の取得中にエラーが発生しました",
            status: 500,
        })
    }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Cleaning>>> {
    try {
        //リクエストボディを取得
        const body = await request.json()
        console.log("POSTリクエストボディ:", body)

        const {
            cleaning_date,
            room_number,
            cleaning_status,
            cleaning_availability,
            check_in_time,
            guest_count,
            set_type,
            notes
        } = body

        //以下バリテーションチェック(居るかわからないけど一応)
        if (!cleaning_date || !room_number || !cleaning_status || !cleaning_availability) {
            console.error("バリテーションエラー:", { cleaning_date, room_number, cleaning_status, cleaning_availability })
            return NextResponse.json(
                {
                    success: false,
                    error: "バリデーションエラー、清掃日、部屋番号、清掃状態、清掃可否は必須です",
                    status: 400,
                }
            )
        }

        //清掃状態の値(型)を検証
        const validCleaningStatuses: CleaningStatus[] = [
            "清掃不要",
            "未チェックアウト",
            "ゴミ回収",
            "掃除機",
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
            `INSERT INTO cleanings
            (cleaning_date,room_number,cleaning_status,cleaning_availability,check_in_time,guest_count,set_type,notes)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *`,
            [
                cleaning_date,
                room_number,
                cleaning_status,
                cleaning_availability,
                check_in_time,
                guest_count,
                set_type,
                notes
            ],
        )
        return NextResponse.json({
            success: true,
            data: result.rows[0],
            status: 201,
        })
    } catch (error) {
        console.error("清掃情報の保存中にエラー発生:", error)
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

        // 清掃可否が「〇」の場合、清掃状態を「未チェックアウト」に設定
        let finalCleaningStatus = cleaning_status
        if (cleaning_availability === "〇" || cleaning_availability === "連泊:清掃あり") {
            finalCleaningStatus = "未チェックアウト"
            console.log(`清掃可否が「〇」のため、清掃状態を「未チェックアウト」に設定: 部屋${body.room_number}`)
        }

        //データベースに保存
        const result = await query<Cleaning>(
            `UPDATE cleanings
            SET cleaning_status = $1,
            cleaning_availability = $2,
            check_in_time  = $3,
            guest_count = $4,
            set_type = $5,
            notes = $6
            where cleaning_date = $7
            and room_number = $8
            RETURNING *`,
            [
                finalCleaningStatus,
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