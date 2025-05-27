//postgleSQLのライブラリからインポート
import { Pool, type QueryResult, type QueryResultRow } from "pg";

//環境変数からデータベース接続情報を取得
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    // 接続プールの設定
    max: 100, // 最大接続数（デフォルト: 10）
    min: 5,   // 最小接続数（デフォルト: 0）
    idleTimeoutMillis: 30000, // アイドル接続のタイムアウト（30秒）
    connectionTimeoutMillis: 60000, // 接続取得のタイムアウト（60秒）
})


//クエリ実行関数
export async function query<T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
    try {
        //クエリ実行
        const res = await pool.query<T>(text, params)
        console.log("実行されたクエリ:", text, params)
        //実行結果を返す
        return res
    } catch (error) {
        console.error("クエリ実行中にエラーが発生しました:", error)
        throw error
    }
}