/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool, QueryResult } from 'pg';

// 環境変数から接続情報を取得
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false
});

// クエリ実行関数
export async function query(text: string, params?: any[]): Promise<QueryResult> {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("実行されたクエリ:", { text, params, duration, rows: res.rowCount })
    return res
}

//DB接続テスト関数
export async function testConnection(): Promise<boolean> {
    try {
        const result = await query('SELECT NOW()')
        console.log("DB接続成功:", result.rows[0])
        return true
    } catch (error) {
        console.error("DB接続失敗:", error)
        return false
    }
}