// UCER CSE 2nd Year (Sec B) Official Timetable & Subject Data
// Facilitator: AJAI KUMAR MAURYA (Mobile: 9335833415, Room D104, W.E.F 26/07/2026)
// Aligned with official Timetable PDF
// Classes Start Date: 14/07/2026 (Tue)
// Holidays: Every Sunday, 1st & 3rd Saturday of the month (Strictly Excluded!)

export const DEFAULT_TIMETABLE_HEADER = {
  title: 'United College CSE 2nd Year (Sec B) Timetable',
  room: 'Room D104',
  wef: '26/07/2026',
  facilitator: 'Ajai Kumar Maurya',
  facilitatorMobile: '9335833415'
}

export const defaultSubjects = [
  {
    id: 'subj_python',
    name: 'PYTHON',
    code: 'BCC-302',
    faculty: 'Ajai Kumar Maurya',
    icon: 'python',
    isLab: false,
    color: ['#10b981', '#3b82f6'],
    present: 3, total: 3,
    timetable: [
      { day: 'Monday', period: 'P3', periodOrder: 3, time: '10:40 AM - 11:30 AM' },
      { day: 'Saturday', period: 'P7', periodOrder: 7, time: '03:00 PM - 04:00 PM' }
    ]
  },
  {
    id: 'subj_ds',
    name: 'DATA STRUCTURE (DS)',
    code: 'BCS-301',
    faculty: 'Sunil Kumar Khare',
    icon: 'book',
    isLab: false,
    color: ['#3b82f6', '#8b5cf6'],
    present: 11, total: 11,
    timetable: [
      { day: 'Monday', period: 'P2', periodOrder: 2, time: '09:50 AM - 10:40 AM' },
      { day: 'Tuesday', period: 'P3', periodOrder: 3, time: '10:40 AM - 11:30 AM' },
      { day: 'Wednesday', period: 'P4', periodOrder: 4, time: '11:30 AM - 12:20 PM' },
      { day: 'Thursday', period: 'P1', periodOrder: 1, time: '09:00 AM - 09:50 AM' },
      { day: 'Friday', period: 'P3', periodOrder: 3, time: '10:40 AM - 11:30 AM' },
      { day: 'Saturday', period: 'P2', periodOrder: 2, time: '10:00 AM - 11:00 AM' }
    ]
  },
  {
    id: 'subj_co',
    name: 'COMPUTER ORGANIZATION (CO)',
    code: 'BCS-302',
    faculty: 'Chitranjan Dwivedi',
    icon: 'cpu',
    isLab: false,
    color: ['#10b981', '#3b82f6'],
    present: 11, total: 11,
    timetable: [
      { day: 'Monday', period: 'P1', periodOrder: 1, time: '09:00 AM - 09:50 AM' },
      { day: 'Tuesday', period: 'P1', periodOrder: 1, time: '09:00 AM - 09:50 AM' },
      { day: 'Wednesday', period: 'P2', periodOrder: 2, time: '09:50 AM - 10:40 AM' },
      { day: 'Thursday', period: 'P2', periodOrder: 2, time: '09:50 AM - 10:40 AM' },
      { day: 'Friday', period: 'P5', periodOrder: 5, time: '12:20 PM - 01:10 PM' },
      { day: 'Saturday', period: 'P1', periodOrder: 1, time: '09:00 AM - 10:00 AM' }
    ]
  },
  {
    id: 'subj_dstl',
    name: 'DISCRETE STRUCTURES THEORY LOGIC (DSTL)',
    code: 'BCS-303',
    faculty: 'Dharmendra Kumar',
    icon: 'logic',
    isLab: false,
    color: ['#8b5cf6', '#10b981'],
    present: 11, total: 11,
    timetable: [
      { day: 'Monday', period: 'P9', periodOrder: 9, time: '03:40 PM - 04:30 PM' },
      { day: 'Tuesday', period: 'P7', periodOrder: 7, time: '02:00 PM - 02:50 PM' },
      { day: 'Wednesday', period: 'P1', periodOrder: 1, time: '09:00 AM - 09:50 AM' },
      { day: 'Thursday', period: 'P4', periodOrder: 4, time: '11:30 AM - 12:20 PM' },
      { day: 'Friday', period: 'P1', periodOrder: 1, time: '09:00 AM - 09:50 AM' },
      { day: 'Saturday', period: 'P6', periodOrder: 6, time: '02:00 PM - 03:00 PM' }
    ]
  },
  {
    id: 'subj_dslab',
    name: 'DATA STRUCTURES LAB (DS_LAB)',
    code: 'BCS-351',
    faculty: 'Shyam Bahadur Verma, Sunil Kumar Khare',
    icon: 'flask',
    isLab: true,
    color: ['#3b82f6', '#10b981'],
    present: 4, total: 4,
    timetable: [
      { day: 'Tuesday', period: 'P4-P5', periodOrder: 4, time: '11:30 AM - 01:10 PM' }
    ]
  },
  {
    id: 'subj_colab',
    name: 'COMPUTER ORGANIZATION LAB (CO_LAB)',
    code: 'BCS-352',
    faculty: 'Manoj Yadav',
    icon: 'code',
    isLab: true,
    color: ['#8b5cf6', '#3b82f6'],
    present: 4, total: 4,
    timetable: [
      { day: 'Monday', period: 'P4-P5', periodOrder: 4, time: '11:30 AM - 01:10 PM' }
    ]
  },
  {
    id: 'subj_wdwlab',
    name: 'WEB DESIGNING WORKSHOP LAB (WDW_LAB)',
    code: 'BCS-353',
    faculty: 'Nitish Kumar, Sachin Kumar Sonkar',
    icon: 'globe',
    isLab: true,
    color: ['#8b5cf6', '#10b981'],
    present: 4, total: 4,
    timetable: [
      { day: 'Friday', period: 'P8-P9', periodOrder: 8, time: '02:50 PM - 04:30 PM' }
    ]
  },
  {
    id: 'subj_dld',
    name: 'DIGITAL LOGIC DESIGN (DLD)',
    code: 'BOE-310',
    faculty: 'Santosh Dubey',
    icon: 'chip',
    isLab: false,
    color: ['#10b981', '#8b5cf6'],
    present: 14, total: 14,
    timetable: [
      { day: 'Monday', period: 'P7', periodOrder: 7, time: '02:00 PM - 02:50 PM' },
      { day: 'Tuesday', period: 'P2', periodOrder: 2, time: '09:50 AM - 10:40 AM' },
      { day: 'Wednesday', period: 'P3', periodOrder: 3, time: '10:40 AM - 11:30 AM' },
      { day: 'Wednesday', period: 'P9', periodOrder: 9, time: '03:40 PM - 04:30 PM' },
      { day: 'Thursday', period: 'P5', periodOrder: 5, time: '12:20 PM - 01:10 PM' },
      { day: 'Friday', period: 'P4', periodOrder: 4, time: '11:30 AM - 12:20 PM' },
      { day: 'Saturday', period: 'P4', periodOrder: 4, time: '12:00 PM - 01:00 PM' }
    ]
  },
  {
    id: 'subj_uhv',
    name: 'UNIVERSAL HUMAN VALUES (UHV)',
    code: 'BVE-301',
    faculty: 'Pooja Sharma',
    icon: 'book',
    isLab: false,
    color: ['#f59e0b', '#ec4899'],
    present: 4, total: 4,
    timetable: [
      { day: 'Wednesday', period: 'P5', periodOrder: 5, time: '12:20 PM - 01:10 PM' },
      { day: 'Thursday', period: 'P3', periodOrder: 3, time: '10:40 AM - 11:30 AM' }
    ]
  },
  {
    id: 'subj_enghs',
    name: 'ENG HARD SKILL (ENG_HS)',
    code: 'ENG[HS]-2',
    faculty: 'Prem Kumar',
    icon: 'terminal',
    isLab: false,
    color: ['#10b981', '#3b82f6'],
    present: 2, total: 2,
    timetable: [
      { day: 'Friday', period: 'P7', periodOrder: 7, time: '02:00 PM - 02:50 PM' }
    ]
  },
  {
    id: 'subj_engss',
    name: 'ENG SOFT SKILL (ENG_SS)',
    code: 'ENG[SS]-2',
    faculty: 'Prem Kumar',
    icon: 'terminal',
    isLab: false,
    color: ['#3b82f6', '#8b5cf6'],
    present: 2, total: 2,
    timetable: [
      { day: 'Thursday', period: 'P8', periodOrder: 8, time: '02:50 PM - 03:40 PM' }
    ]
  },
  {
    id: 'subj_lib',
    name: 'LIBRARY (LIB)',
    code: 'LIBRARY-2',
    faculty: 'Library',
    icon: 'book',
    isLab: false,
    isIgnored: true, // EXCLUDED FROM ATTENDANCE STATS
    color: ['#64748b', '#94a3b8'],
    present: 0, total: 0,
    timetable: [
      { day: 'Tuesday', period: 'P8', periodOrder: 8, time: '02:50 PM - 03:40 PM' }
    ]
  },
  {
    id: 'subj_lr',
    name: 'LOGICAL REASONING (LR)',
    code: 'LR-2',
    faculty: 'Gaurav Goswami',
    icon: 'brain',
    isLab: false,
    color: ['#8b5cf6', '#3b82f6'],
    present: 2, total: 2,
    timetable: [
      { day: 'Monday', period: 'P8', periodOrder: 8, time: '02:50 PM - 03:40 PM' }
    ]
  },
  {
    id: 'subj_psd',
    name: 'P S D (PSD)',
    code: 'PSD-2',
    faculty: 'Shalini Tripathi',
    icon: 'terminal',
    isLab: false,
    color: ['#10b981', '#8b5cf6'],
    present: 7, total: 7,
    timetable: [
      { day: 'Tuesday', period: 'P9', periodOrder: 9, time: '03:40 PM - 04:30 PM' },
      { day: 'Wednesday', period: 'P7', periodOrder: 7, time: '02:00 PM - 02:50 PM' },
      { day: 'Thursday', period: 'P7', periodOrder: 7, time: '02:00 PM - 02:50 PM' },
      { day: 'Saturday', period: 'P3', periodOrder: 3, time: '11:00 AM - 12:00 PM' }
    ]
  },
  {
    id: 'subj_quants',
    name: 'Q U A N T S (QUANTS)',
    code: 'QUANTS-2',
    faculty: 'Shivanand Dubey',
    icon: 'calc',
    isLab: false,
    color: ['#3b82f6', '#10b981'],
    present: 2, total: 2,
    timetable: [
      { day: 'Wednesday', period: 'P8', periodOrder: 8, time: '02:50 PM - 03:40 PM' }
    ]
  },
  {
    id: 'subj_skillai',
    name: 'S K I L L _ A I (SKILL_AI)',
    code: 'SKILL-2',
    faculty: 'Nishat Bano',
    icon: 'robot',
    isLab: false,
    color: ['#8b5cf6', '#10b981'],
    present: 4, total: 4,
    timetable: [
      { day: 'Thursday', period: 'P9', periodOrder: 9, time: '03:40 PM - 04:30 PM' },
      { day: 'Friday', period: 'P2', periodOrder: 2, time: '09:50 AM - 10:40 AM' }
    ]
  }
]

export function buildSubject(seed, idOverride) {
  return {
    id: idOverride || seed.id || `subj_${Math.random().toString(36).slice(2, 10)}`,
    name: seed.name,
    code: seed.code,
    faculty: seed.faculty || '',
    icon: seed.icon || 'book',
    isLab: seed.isLab || false,
    isIgnored: seed.isIgnored || false,
    color: seed.color || ['#3b82f6', '#8b5cf6'],
    present: seed.present !== undefined ? seed.present : 0,
    total: seed.total !== undefined ? seed.total : 0,
    timetable: seed.timetable || [],
    createdAt: Date.now(),
  }
}

/** Generates realistic ERP date-wise attendance logs from 14/07/2026 to 27/07/2026 (Excludes ALL Sundays & 1st/3rd Saturdays) */
export function generateSeedHistory(subjectsList) {
  const logs = []
  const startDate = new Date(2026, 6, 14) // 14 July 2026
  const endDate = new Date(2026, 6, 27)   // 27 July 2026

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayName = DAY_NAMES[d.getDay()]
    const dateNum = d.getDate()
    const dayOfWeek = d.getDay()

    // ❌ EXCLUDE ALL SUNDAYS
    if (dayOfWeek === 0) continue

    // ❌ EXCLUDE 1st & 3rd SATURDAYS
    if (dayOfWeek === 6) {
      const weekOfMonth = Math.ceil(dateNum / 7)
      if (weekOfMonth === 1 || weekOfMonth === 3) continue
    }

    const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

    subjectsList.forEach((subj) => {
      // Exclude LIBRARY
      if (subj.isIgnored || subj.code === 'LIBRARY-2') return

      ;(subj.timetable || []).forEach((slot) => {
        if (slot.day === dayName) {
          // Lab = 2 count
          const count = subj.isLab || (slot.period && slot.period.includes('-')) ? 2 : 1
          for (let c = 1; c <= count; c++) {
            logs.push({
              id: `log_${subj.code}_${formattedDate.replace(/\//g, '')}_${slot.period || 'P1'}_${c}`,
              subjectId: subj.id,
              subjectName: subj.name,
              code: subj.code,
              status: 'present',
              date: formattedDate,
              timestamp: d.getTime()
            })
          }
        }
      })
    })
  }

  // Reverse so newest date (27/07/2026) comes first
  return logs.reverse()
}
