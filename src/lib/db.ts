/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool, type QueryResult, type QueryResultRow } from "pg"

// 環境変数からデータベース接続情報を取得
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    // 接続タイムアウトを設定
    connectionTimeoutMillis: 10000,
})

// クエリ実行関数 - 型パラメータに制約を追加
export async function query<T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now()
    try {
        const res = await pool.query<T>(text, params)
        const duration = Date.now() - start

        console.log("実行されたクエリ:", { text, params, duration, rows: res.rowCount })

        return res
    } catch (error) {
        const duration = Date.now() - start
        console.error("クエリ実行エラー:", { text, params, duration, error })

        // エラーを再スロー
        throw error
    }
}

// データベース接続テスト関数
export async function testConnection(): Promise<boolean> {
    try {
        const result = await query("SELECT NOW()")
        console.log("データベース接続成功:", result.rows[0])
        return true
    } catch (error) {
        console.error("データベース接続エラー:", error)
        return false
    }
}
