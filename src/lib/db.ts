/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/db.ts
import { Pool, QueryResult, QueryResultRow } from 'pg';

// 環境変数からデータベース接続情報を取得
const pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// クエリ実行関数
export async function query<T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    console.log('実行されたクエリ:', { text, params, duration, rows: res.rowCount });

    return res;
}

// データベース接続テスト関数
export async function testConnection(): Promise<boolean> {
    try {
        const result = await query('SELECT NOW()');
        console.log('データベース接続成功:', result.rows[0]);
        return true;
    } catch (error) {
        console.error('データベース接続エラー:', error);
        return false;
    }
}