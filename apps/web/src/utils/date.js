export function currentBeYear() {
    return new Date().getFullYear() + 543;
}
export function getTodayString() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
export function beToCe(beYear) {
    return beYear - 543;
}
export function ceToBe(ceYear) {
    return ceYear + 543;
}
export function getYearRange(beYear, mode) {
    const ceYear = beToCe(beYear);
    if (mode === 'fiscal') {
        return {
            startDate: `${ceYear - 1}-10-01`,
            endDate: `${ceYear}-09-30`
        };
    }
    return {
        startDate: `${ceYear}-01-01`,
        endDate: `${ceYear}-12-31`
    };
}
export function formatThaiDate(value) {
    if (!value)
        return '';
    // Handle YYYY-MM-DD format manually to avoid timezone shift
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split('-').map(Number);
        return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y + 543}`;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return value;
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear() + 543;
    return `${d}/${m}/${y}`;
}
const THAI_MONTH_SHORT = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];
export function formatThaiDateShort(value) {
    if (!value)
        return '';
    const dateStr = value.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr))
        return value;
    const [y, m, d] = dateStr.split('-').map(Number);
    return `${d} ${THAI_MONTH_SHORT[m - 1]} ${y + 543}`;
}
export function formatThaiDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return value;
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear() + 543;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${d}/${m}/${y} ${hours}:${minutes}`;
}
export function getVersionDate() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
}
