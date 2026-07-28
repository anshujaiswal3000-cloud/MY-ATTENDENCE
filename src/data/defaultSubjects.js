// UCER CSE 2nd Year (Sec B) Official Timetable & Subject Data
// Facilitator: AJAI KUMAR MAURYA (Mobile: 9335833415, Room D104, W.E.F 26/07/2026)
// Aligned 100% with Official Timetable PDF

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
    present: 4, total: 4,
    timetable: [
      { day: 'Monday', period: 'P3', periodOrder: 3, time: '10:40 AM - 11:30 AM' },
      { day: 'Tuesday', period: 'P9', periodOrder: 9, time: '03:40 PM - 04:30 PM' },
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
    present: 12, total: 12,
    timetable: [
      { day: 'Monday', period: 'P2', periodOrder: 2, time: '09:50 AM - 10:40 AM' },
      { day: 'Tuesday', period: 'P3', periodOrder: 3, time: '10:40 AM - 11:30 AM' },
      { day: 'Wednesday', period: 'P4', periodOrder: 4, time: '11:30 AM - 12:20 PM' },
      { day: 'Thursday', period: 'P1', periodOrder: 1, time: '09:00 AM - 09:50 AM' },
      { day: 'Friday', period: 'P3', periodOrder: 3, time: '10:40 AM - 11:30 AM' },
      { day: 'Saturday', period: 'P5', periodOrder: 5, time: '02:00 PM - 03:00 PM' }
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
    present: 12, total: 12,
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
      { day: 'Friday', period: 'P7', periodOrder: 7, time: '02:00 PM - 02:50 PM' },
      { day: 'Saturday', period: 'P2', periodOrder: 2, time: '10:00 AM - 11:00 AM' }
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
    present: 6, total: 6,
    timetable: [
      { day: 'Tuesday', period: 'P4-P5', periodOrder: 4, time: '11:30 AM - 01:10 PM' }
    ]
  },
  {
    id: 'subj_colab',
    name: 'COMPUTER ORGANIZATION LAB (CO_LAB)',
    code: 'BCS-352',
    faculty: 'Manoj Yadav',
    icon: 'flask',
    isLab: true,
    color: ['#10b981', '#f59e0b'],
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
    icon: 'flask',
    isLab: true,
    color: ['#f59e0b', '#ef4444'],
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
    color: ['#ec4899', '#8b5cf6'],
    present: 15, total: 15,
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
    icon: 'heart',
    isLab: false,
    color: ['#f43f5e', '#ec4899'],
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
    faculty: 'Arun Samuel Lawrence',
    icon: 'language',
    isLab: false,
    color: ['#06b6d4', '#3b82f6'],
    present: 4, total: 4,
    timetable: [
      { day: 'Thursday', period: 'P8', periodOrder: 8, time: '02:50 PM - 03:40 PM' },
      { day: 'Friday', period: 'P1', periodOrder: 1, time: '09:00 AM - 09:50 AM' }
    ]
  },
  {
    id: 'subj_lib',
    name: 'LIBRARY (LIB)',
    code: 'LIBRARY-2',
    faculty: 'Library Staff',
    icon: 'library',
    isLab: false,
    isIgnored: true,
    color: ['#64748b', '#94a3b8'],
    present: 2, total: 2,
    timetable: [
      { day: 'Saturday', period: 'P7', periodOrder: 7, time: '03:00 PM - 04:00 PM' }
    ]
  },
  {
    id: 'subj_lr',
    name: 'LOGICAL REASONING (LR)',
    code: 'LR-2',
    faculty: 'Gaurav Goswami',
    icon: 'brain',
    isLab: false,
    color: ['#a855f7', '#ec4899'],
    present: 2, total: 2,
    timetable: [
      { day: 'Monday', period: 'P8', periodOrder: 8, time: '02:50 PM - 03:40 PM' }
    ]
  },
  {
    id: 'subj_psd',
    name: 'PSD (PSD)',
    code: 'PSD-2',
    faculty: 'Shalini Tripathi',
    icon: 'user-check',
    isLab: false,
    color: ['#14b8a6', '#06b6d4'],
    present: 8, total: 8,
    timetable: [
      { day: 'Tuesday', period: 'P8', periodOrder: 8, time: '02:50 PM - 03:40 PM' },
      { day: 'Wednesday', period: 'P7', periodOrder: 7, time: '02:00 PM - 02:50 PM' },
      { day: 'Thursday', period: 'P7', periodOrder: 7, time: '02:00 PM - 02:50 PM' },
      { day: 'Saturday', period: 'P3', periodOrder: 3, time: '11:00 AM - 12:00 PM' }
    ]
  },
  {
    id: 'subj_quants',
    name: 'QUANTS (QUANTS)',
    code: 'QUANTS-2',
    faculty: 'Shivanand Dubey',
    icon: 'calculator',
    isLab: false,
    color: ['#f97316', '#eab308'],
    present: 2, total: 2,
    timetable: [
      { day: 'Wednesday', period: 'P8', periodOrder: 8, time: '02:50 PM - 03:40 PM' }
    ]
  },
  {
    id: 'subj_skillai',
    name: 'SKILL AI (SKILL_AI)',
    code: 'SKILL-2',
    faculty: 'Nishat Bano',
    icon: 'sparkles',
    isLab: false,
    color: ['#8b5cf6', '#ec4899'],
    present: 4, total: 4,
    timetable: [
      { day: 'Thursday', period: 'P9', periodOrder: 9, time: '03:40 PM - 04:30 PM' },
      { day: 'Friday', period: 'P2', periodOrder: 2, time: '09:50 AM - 10:40 AM' }
    ]
  }
]

export function buildSubject(data) {
  return {
    id: data.id || `subj_${Math.random().toString(36).slice(2, 9)}`,
    name: data.name || 'Untitled Subject',
    code: data.code || 'SUBJ-000',
    faculty: data.faculty || 'Faculty Member',
    icon: data.icon || 'book',
    isLab: Boolean(data.isLab),
    isIgnored: Boolean(data.isIgnored),
    color: data.color || ['#3b82f6', '#8b5cf6'],
    present: Number(data.present) || 0,
    total: Number(data.total) || 0,
    timetable: data.timetable || []
  }
}

/** Generates date-stamped history logs from 14/07/2026 to 28/07/2026 */
export function generateSeedHistory(subjectsList) {
  const historyLogs = []
  const startDate = new Date('2026-07-14T09:00:00')
  const endDate = new Date('2026-07-28T13:10:00')

  let cur = new Date(startDate)

  while (cur <= endDate) {
    const dayOfWeek = cur.getDay() // 0 = Sun, 1 = Mon, ...
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = dayNames[dayOfWeek]
    const dayNum = cur.getDate()

    // Exclude Sundays and 1st/3rd Saturdays
    const isSunday = dayOfWeek === 0
    const isFirstSaturday = dayOfWeek === 6 && dayNum <= 7
    const isThirdSaturday = dayOfWeek === 6 && dayNum >= 15 && dayNum <= 21

    if (!isSunday && !isFirstSaturday && !isThirdSaturday) {
      const dFormatted = `${String(cur.getDate()).padStart(2, '0')}/${String(cur.getMonth() + 1).padStart(2, '0')}/${cur.getFullYear()}`

      subjectsList.forEach((subj) => {
        ;(subj.timetable || []).forEach((slot) => {
          if (slot.day === dayName) {
            // For 28/07/2026 (today), include lectures up to 01:10 PM
            if (dFormatted === '28/07/2026') {
              if (['P1', 'P2', 'P3', 'P4-P5'].includes(slot.period)) {
                historyLogs.push({
                  id: `hist_${Math.random().toString(36).slice(2, 9)}`,
                  subjectId: subj.id,
                  subjectName: subj.name,
                  status: 'present',
                  auto: true,
                  isLab: subj.isLab,
                  increment: subj.isLab ? 2 : 1,
                  date: dFormatted,
                  timestamp: cur.getTime()
                })
              }
            } else {
              historyLogs.push({
                id: `hist_${Math.random().toString(36).slice(2, 9)}`,
                subjectId: subj.id,
                subjectName: subj.name,
                status: 'present',
                auto: true,
                isLab: subj.isLab,
                increment: subj.isLab ? 2 : 1,
                date: dFormatted,
                timestamp: cur.getTime()
              })
            }
          }
        })
      })
    }

    cur.setDate(cur.getDate() + 1)
  }

  return historyLogs.reverse()
}
