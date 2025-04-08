import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { RoomType, ApiResponse } from "@/types/database"

// 特定の部屋タイプを取得
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<RoomType>>> {
    try {
        const id = params.id
        const result = await query<RoomType>("SELECT * FROM room_types WHERE room_type_id = $1", [id])

        if (result.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "指定された部屋タイプが見つかりません",
                },
                { status: 404 },
            )
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0],
        })
    } catch (error) {
        console.error("部屋タイプの取得中にエラーが発生しました:", error)
        return NextResponse.json(
            {
                success: false,
                error: "部屋タイプの取得中にエラーが発生しました",
            },
            { status: 500 },
        )
    }
}

// 部屋タイプを更新
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<RoomType>>> {
    try {
        const id = params.id
        const body = await request.json()
        const { type_name, description } = body

        if (!type_name) {
            return NextResponse.json(
                {
                    success: false,
                    error: "部屋タイプ名は必須です",
                },
                { status: 400 },
            )
        }

        const result = await query<RoomType>(
            "UPDATE room_types SET type_name = $1, description = $2 WHERE room_type_id = $3 RETURNING *",
            [type_name, description || null, id],
        )

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "指定された部屋タイプが見つかりません",
                },
                { status: 404 },
            )
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0],
            message: "部屋タイプが正常に更新されました",
        })
    } catch (error) {
        console.error("部屋タイプの更新中にエラーが発生しました:", error)
        return NextResponse.json(
            {
                success: false,
                error: "部屋タイプの更新中にエラーが発生しました",
            },
            { status: 500 },
        )
    }
}

// 部屋タイプを削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<null>>> {
    try {
        const id = params.id

        // 部屋テーブルで使用されているか確認
        const checkResult = await query("SELECT COUNT(*) FROM rooms WHERE room_type_id = $1", [id])

        if (Number.parseInt(checkResult.rows[0].count) > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "この部屋タイプは部屋で使用されているため削除できません",
                },
                { status: 400 },
            )
        }

        const result = await query("DELETE FROM room_types WHERE room_type_id = $1", [id])

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "指定された部屋タイプが見つかりません",
                },
                { status: 404 },
            )
        }

        return NextResponse.json({
            success: true,
            message: "部屋タイプが正常に削除されました",
        })
    } catch (error) {
        console.error("部屋タイプの削除中にエラーが発生しました:", error)
        return NextResponse.json(
            {
                success: false,
                error: "部屋タイプの削除中にエラーが発生しました",
            },
            { status: 500 },
        )
    }
}
