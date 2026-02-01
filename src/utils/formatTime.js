// utils/formatTime.js（建議抽成 util，之後很多地方會用）
export function formatLastLogin(time) {
  if (!time) return '-'

  const now = Date.now()
  const target = new Date(time).getTime()
  const diffMs = now - target

  const MINUTE = 60 * 1000
  const HOUR = 60 * MINUTE
  const DAY = 24 * HOUR
  const DAYS_30 = 30 * DAY

  if (diffMs < MINUTE) {
    return '剛剛'
  }

  if (diffMs < HOUR) {
    return `${Math.floor(diffMs / MINUTE)} 分鐘前`
  }

  if (diffMs < DAY) {
    return `${Math.floor(diffMs / HOUR)} 小時前`
  }

  if (diffMs < DAYS_30) {
    return `${Math.floor(diffMs / DAY)} 天前`
  }

  // 超過 30 天 → 顯示日期
  const d = new Date(target)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

/**
 * 格式化日期（只顯示日期部分）
 * @param {string} datetime - 日期時間字串
 * @returns {string} - 格式化後的日期 (YYYY-MM-DD)
 */
export function formatDate(datetime) {
  if (!datetime) return '-'
  // 如果已經是純日期格式，直接返回
  if (datetime.length === 10 && datetime.includes('-')) {
    return datetime
  }
  // 取出日期部分（YYYY-MM-DD）
  return datetime.split(' ')[0] || datetime
}
