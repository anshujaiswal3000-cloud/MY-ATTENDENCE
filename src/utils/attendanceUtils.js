// Core attendance math shared across the app.

export const STATUS_THRESHOLDS = { safe: 85, warning: 75 }

/** Attendance % = (Present / Total) × 100 */
export function getPercentage(present, total) {
  if (!total) return 0
  return (present / total) * 100
}

export function formatPercent(value, decimals = 2) {
  return `${value.toFixed(decimals)}%`
}

/** Safe / Warning / Critical classification used for chips, bars, borders */
export function getStatus(percentage) {
  if (percentage >= STATUS_THRESHOLDS.safe) return 'safe'
  if (percentage >= STATUS_THRESHOLDS.warning) return 'warning'
  return 'critical'
}

export const STATUS_COLORS = {
  safe: '#10b981',
  warning: '#f59e0b',
  critical: '#f43f5e',
}

export const STATUS_LABELS = {
  safe: 'Safe',
  warning: 'Warning',
  critical: 'Critical',
}

export function calculateBunkAdvice(present, total, targetPercent) {
  const target = targetPercent / 100

  if (total === 0) {
    return { canBunk: 0, mustAttend: 0, message: 'Mark a class to see advice.' }
  }

  const currentPct = present / total

  if (currentPct >= target) {
    const rawBunk = target > 0 ? present / target - total : Infinity
    const canBunk = Math.max(0, Math.floor(rawBunk))
    return {
      canBunk,
      mustAttend: 0,
      message: canBunk > 0
        ? `You can safely miss ${canBunk} more class${canBunk === 1 ? '' : 'es'}.`
        : `Right at the edge — missing another class will drop you below ${targetPercent}%.`,
    }
  }

  if (target >= 1) {
    return { canBunk: 0, mustAttend: Infinity, message: 'Target of 100% requires attending every remaining class.' }
  }
  const rawAttend = (target * total - present) / (1 - target)
  const mustAttend = Math.max(0, Math.ceil(rawAttend))
  return {
    canBunk: 0,
    mustAttend,
    message: `Attend the next ${mustAttend} class${mustAttend === 1 ? '' : 'es'} to reach ${targetPercent}%.`,
  }
}

/** Check if subject is Library or excluded from total stats */
export function isLibrarySubject(s) {
  if (!s) return false
  const sid = (s.id || '').toLowerCase()
  const sname = (s.name || '').toLowerCase()
  const scode = (s.code || '').toLowerCase()
  return s.isIgnored || s.excludeFromTotal || sname.includes('library') || sid.includes('lib') || scode.includes('lib')
}

/** Overall stats across all subjects (Excluding LIBRARY) */
export function getOverallStats(subjects) {
  const activeSubjects = (subjects || []).filter(s => !isLibrarySubject(s))
  const present = activeSubjects.reduce((sum, s) => sum + (s.present || 0), 0)
  const total = activeSubjects.reduce((sum, s) => sum + (s.total || 0), 0)
  const absent = total - present
  return { present, absent, total, percentage: getPercentage(present, total) }
}

export function getHighestLowestAverage(subjects) {
  const withClasses = (subjects || []).filter((s) => !isLibrarySubject(s) && (s.total || 0) > 0)
  if (withClasses.length === 0) {
    return { highest: null, lowest: null, average: 0 }
  }
  const withPct = withClasses.map((s) => ({ ...s, pct: getPercentage(s.present, s.total) }))
  const highest = withPct.reduce((a, b) => (b.pct > a.pct ? b : a))
  const lowest = withPct.reduce((a, b) => (b.pct < a.pct ? b : a))
  const average = withPct.reduce((sum, s) => sum + s.pct, 0) / withPct.length
  return { highest, lowest, average }
}

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function getTodayName() {
  const idx = new Date().getDay()
  const map = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return map[idx]
}

/**
 * Returns true if the given date (default = today) is a 1st or 3rd Saturday (college holiday).
 * 1st Saturday = date 1-7 and is Saturday
 * 3rd Saturday = date 15-21 and is Saturday
 */
export function isHolidaySaturday(date = new Date()) {
  if (date.getDay() !== 6) return false // not Saturday
  const day = date.getDate()
  return (day >= 1 && day <= 7) || (day >= 15 && day <= 21)
}

/** Returns true if today is Sunday */
export function isSunday(date = new Date()) {
  return date.getDay() === 0
}

/** Returns holiday info for a given Date object */
export function getHolidayInfo(date = new Date()) {
  if (date.getDay() === 0) return { isHoliday: true, reason: '🌙 Sunday — No Classes Today' }
  if (isHolidaySaturday(date)) {
    const day = date.getDate()
    const which = day <= 7 ? '1st' : '3rd'
    return { isHoliday: true, reason: `🏖️ ${which} Saturday — College Holiday! No Classes Today` }
  }
  return { isHoliday: false, reason: null }
}



export function computeStreak(history) {
  if (!history || history.length === 0) return 0
  const byDate = {}
  history.forEach((h) => {
    byDate[h.date] = byDate[h.date] || []
    byDate[h.date].push(h.status)
  })
  const dates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a))
  let streak = 0
  for (const date of dates) {
    const statuses = byDate[date]
    const allPresent = statuses.every((s) => s === 'present')
    if (allPresent) streak += 1
    else break
  }
  return streak
}

export function getSummary(history, days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  const relevant = history.filter((h) => h.timestamp >= cutoff)
  const present = relevant.filter((h) => h.status === 'present').length
  const absent = relevant.filter((h) => h.status === 'absent').length
  return { present, absent, total: present + absent }
}
