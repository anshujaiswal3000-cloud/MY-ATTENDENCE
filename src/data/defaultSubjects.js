// Default subject list. Icon keys map to react-icons components via
// src/utils/iconRegistry.js. Colors are [start, end] gradient stops drawn
// from the app's emerald/azure/violet palette family.

export const DEFAULT_TIMETABLE_SLOT = null // subjects start with no scheduled slots

export const defaultSubjects = [
  { name: 'Computer Organization & Architecture', code: 'COA', faculty: 'Dr. R. Sharma', icon: 'cpu', color: ['#10b981', '#3b82f6'] },
  { name: 'COA Lab', code: 'COA-L', faculty: 'Dr. R. Sharma', icon: 'flask', color: ['#3b82f6', '#10b981'] },
  { name: 'Data Structure', code: 'DS', faculty: 'Prof. A. Verma', icon: 'book', color: ['#3b82f6', '#8b5cf6'] },
  { name: 'Data Structure Lab', code: 'DS-L', faculty: 'Prof. A. Verma', icon: 'code', color: ['#8b5cf6', '#3b82f6'] },
  { name: 'Digital Electronics', code: 'DE', faculty: 'Dr. N. Gupta', icon: 'chip', color: ['#10b981', '#8b5cf6'] },
  { name: 'Discrete Structures & Theory of Logic', code: 'DSTL', faculty: 'Dr. S. Iyer', icon: 'logic', color: ['#8b5cf6', '#10b981'] },
  { name: 'Programming Skill Development', code: 'PSD', faculty: 'Ms. K. Rao', icon: 'terminal', color: ['#3b82f6', '#10b981'] },
  { name: 'Python Programming', code: 'PY', faculty: 'Ms. K. Rao', icon: 'python', color: ['#10b981', '#3b82f6'] },
  { name: 'Quant', code: 'QNT', faculty: 'Mr. D. Chandra', icon: 'calc', color: ['#8b5cf6', '#3b82f6'] },
  { name: 'Reasoning', code: 'RSN', faculty: 'Mr. D. Chandra', icon: 'brain', color: ['#3b82f6', '#8b5cf6'] },
  { name: 'Skill Based AI', code: 'AI', faculty: 'Dr. P. Mehta', icon: 'robot', color: ['#10b981', '#8b5cf6'] },
  { name: 'Web Designing Workshop', code: 'WDW', faculty: 'Ms. T. Nair', icon: 'globe', color: ['#8b5cf6', '#10b981'] },
]

// Builds a fresh subject object with runtime fields (id, counters, timetable)
export function buildSubject(seed, idOverride) {
  return {
    id: idOverride || `subj_${Math.random().toString(36).slice(2, 10)}`,
    name: seed.name,
    code: seed.code,
    faculty: seed.faculty || '',
    icon: seed.icon || 'book',
    color: seed.color || ['#3b82f6', '#8b5cf6'],
    present: seed.present || 0,
    total: seed.total || 0,
    timetable: seed.timetable || [], // [{ day: 'Monday', time: '09:00' }, ...]
    createdAt: Date.now(),
  }
}
