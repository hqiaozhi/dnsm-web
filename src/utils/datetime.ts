/**
 * 格式化日期时间到分钟级别 (YYYY-MM-DD HH:mm)
 * @param date - 日期字符串或时间戳
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTimeToMinute(date: string | number | Date): string {
  if (!date) return ''

  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date) // 如果日期无效，返回原始字符串

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 格式化日期时间到秒级别 (YYYY-MM-DD HH:mm:ss)
 * @param date - 日期字符串或时间戳
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTimeToSecond(date: string | number | Date): string {
  if (!date) return ''

  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date) // 如果日期无效，返回原始字符串

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化时间戳到分钟级别 (YYYY-MM-DD HH:mm)
 * @param timestamp - 时间戳（秒）
 * @returns 格式化后的日期时间字符串
 */
export function formatTimestampToMinute(timestamp?: number): string {
  if (!timestamp) return ''
  return formatDateTimeToMinute(timestamp * 1000)
}

/**
 * 格式化时间戳到秒级别 (YYYY-MM-DD HH:mm:ss)
 * @param timestamp - 时间戳（秒）
 * @returns 格式化后的日期时间字符串
 */
export function formatTimestampToSecond(timestamp?: number): string {
  if (!timestamp) return ''
  return formatDateTimeToSecond(timestamp * 1000)
}
