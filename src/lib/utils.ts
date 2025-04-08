// src/lib/utils.ts
// 日付フォーマット用のユーティリティ関数
export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 日本語の曜日を取得する関数
export function getJapaneseWeekday(date: Date): string {
    const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    return weekdays[date.getDay()];
}

// 日付を「YYYY年MM月DD日」形式にフォーマットする関数
export function formatJapaneseDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}