/**
 * Date 객체 또는 날짜 문자열을 `yyyyMMdd` 형식의 문자열로 변환합니다.
 *
 * @param date - 변환할 Date 객체 또는 날짜 문자열
 * @returns `yyyyMMdd` 형식의 문자열 (예: "20260606")
 *
 * @example
 * formatDateToYYYYMMDD(new Date('2026-06-06'))  // "20260606"
 * formatDateToYYYYMMDD('2026-01-05')            // "20260105"
 */
export function formatDateToYYYYMMDD(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const yyyy = d.getFullYear().toString();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${MM}${dd}`;
}

/**
 * `yyyyMMdd` 형식의 문자열을 Date 객체로 변환합니다.
 *
 * @param yyyyMMdd - `yyyyMMdd` 형식의 날짜 문자열 (예: "20260606")
 * @returns 변환된 Date 객체
 *
 * @example
 * parseYYYYMMDD('20260606')  // Date { 2026-06-06 }
 */
export function parseYYYYMMDD(yyyyMMdd: string): Date {
  const yyyy = yyyyMMdd.slice(0, 4);
  const MM = yyyyMMdd.slice(4, 6);
  const dd = yyyyMMdd.slice(6, 8);
  return new Date(`${yyyy}-${MM}-${dd}`);
}

/**
 * `yyyyMMddHHmmss` 형식의 문자열을 Date 객체로 변환합니다.
 *
 * @param yyyyMMddHHmmss - `yyyyMMddHHmmss` 형식의 날짜 문자열 (예: "20260816150000")
 * @returns 변환된 Date 객체
 *
 * @example
 * parseYYYYMMDDHHmmss('20260816150000')  // Date { 2026-08-16 15:00:00 }
 */
export function parseYYYYMMDDHHmmss(yyyyMMddHHmmss: string): Date {
  const yyyy = Number(yyyyMMddHHmmss.slice(0, 4));
  const MM = Number(yyyyMMddHHmmss.slice(4, 6));
  const dd = Number(yyyyMMddHHmmss.slice(6, 8));
  const HH = Number(yyyyMMddHHmmss.slice(8, 10));
  const mm = Number(yyyyMMddHHmmss.slice(10, 12));
  const ss = Number(yyyyMMddHHmmss.slice(12, 14));
  return new Date(yyyy, MM - 1, dd, HH, mm, ss);
}

/**
 * Date 객체 또는 날짜 문자열을 `yyyyMMddHHmmss` 형식의 문자열로 변환합니다.
 *
 * @param date - 변환할 Date 객체 또는 날짜 문자열
 * @returns `yyyyMMddHHmmss` 형식의 문자열 (예: "20260816150000")
 *
 * @example
 * formatDateToYYYYMMDDHHmmss(new Date(2026, 7, 16, 15, 0, 0))  // "20260816150000"
 */
export function formatDateToYYYYMMDDHHmmss(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const yyyy = d.getFullYear().toString();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

/**
 * `yyyyMMdd` 형식의 문자열을 한국어 날짜로 변환합니다.
 *
 * @example
 * formatDateToKorean('20260626')  // "6월 26일"
 */
export function formatDateToKorean(yyyyMMdd: string): string {
  const month = parseInt(yyyyMMdd.slice(4, 6), 10);
  const day = parseInt(yyyyMMdd.slice(6, 8), 10);
  return `${month}월 ${day}일`;
}

/**
 * 오늘 기준 D-day 계산 (양수면 남은 날, 음수면 지난 날)
 *
 * @example
 * calcDday('20260626')  // "D-3" | "D-Day" | "D+5"
 */
export function calcDday(yyyyMMdd: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = parseYYYYMMDD(yyyyMMdd);
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff === 0) return "D-Day";
  if (diff > 0) return `D-${diff}`;
  return "expired";
}
