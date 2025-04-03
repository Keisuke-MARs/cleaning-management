/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool, PoolClient } from 'pg';

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
export async function query<T>(text: string, params?: any[]): Promise<{
    rows: T[];
    rowCount: number;
}> {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        const { rowCount } = result;
        if (rowCount !== null) {
            const count: number = rowCount; // 安全に割り当て可能
            console.log(`Row count is ${count}`);
        } else {
            console.log('Row count is null');
        }
        return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
    } finally {
        client.release();
    }
}

// トランザクション実行関数
export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}