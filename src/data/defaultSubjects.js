// UCER CSE 2nd Year (Sec B) Official Timetable & Subject Data
// Facilitator: AJAI KUMAR MAURYA (Room D104, W.E.F 26/07/2026)
// Aligned with official ERP Portal data (student.icampuserp.in)

export const DEFAULT_TIMETABLE_HEADER = {
  title: 'United College CSE 2nd Year (Sec B) Timetable',
  room: 'Room D104',
  wef: '26/07/2026',
  facilitator: 'Ajai Kumar Maurya',
  facilitatorMobile: '9335833415'
}

export const defaultSubjects = [
  {
    name: 'Computer Organization & Architecture',
    code: 'BCS302',
    faculty: 'Chitranjan Dwivedi',
    icon: 'cpu',
    color: ['#10b981', '#3b82f6'],
    present: 8, total: 8,
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
    name: 'Computer Organization Lab',
    code: 'BCS352',
    faculty: 'Manoj Yadav',
    icon: 'code',
    color: ['#8b5cf6', '#3b82f6'],
    present: 4, total: 4,
    timetable: [
      { day: 'Monday', period: 'P4-P5', periodOrder: 4, time: '11:30 AM - 01:10 PM' }
    ]
  },
  {
    name: 'Data Structure',
    code: 'BCS301',
    faculty: 'Sunil Kumar Khare',
    icon: 'book',
    color: ['#3b82f6', '#8b5cf6'],
    present: 9, total: 9,
    timetable: [
      { day: 'Monday', period: 'P2', periodOrder: 2, time: '09:50 AM - 10:40 AM' },
      { day: 'Tuesday', period: 'P3', periodOrder: 3, time: '10:40 AM - 11:30 AM' },
      { day: 'Wednesday', period: 'P4', periodOrder: 4, time: '11:30 AM - 12:20 PM' },
      { day: 'Thursday', period: 'P1', periodOrder: 1, time: '09:00 AM - 09:50 AM' },
      { day: 'Friday', period: 'P3', periodOrder: 3, time: '10:40 AM - 11:30 AM' },
      { day: 'Saturday', period: 'P5', periodOrder: 5, time: '01:00 PM - 02:00 PM' }
    ]
  },
  {
    name: 'Data Structure Lab',
    code: 'BCS351',
    faculty: 'Shyam B. Verma & Sunil K. Khare',
    icon: 'flask',
    color: ['#3b82f6', '#10b981'],
    present: 4, total: 4,
    timetable: [
      { day: 'Tuesday', period: 'P4-P5', periodOrder: 4, time: '11:30 AM - 01:10 PM' }
    ]
  },
  {
    name: 'Digital Electronics',
    code: 'BOE310',
    faculty: 'Santosh Dubey',
    icon: 'chip',
    color: ['#10b981', '#8b5cf6'],
    present: 13, total: 13,
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
    name: 'Discrete Structures & Theory of Logic',
    code: 'BCS303',
    faculty: 'Dharmendra Kumar',
    icon: 'logic',
    color: ['#8b5cf6', '#10b981'],
    present: 10, total: 10,
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
    name: 'Programming Skill Development',
    code: 'PSD',
    faculty: 'Shalini Tripathi',
    icon: 'terminal',
    color: ['#10b981', '#8b5cf6'],
    present: 4, total: 4,
    timetable: [
      { day: 'Tuesday', period: 'P8', periodOrder: 8, time: '02:50 PM - 03:40 PM' },
      { day: 'Wednesday', period: 'P7', periodOrder: 7, time: '02:00 PM - 02:50 PM' },
      { day: 'Thursday', period: 'P7', periodOrder: 7, time: '02:00 PM - 02:50 PM' },
      { day: 'Saturday', period: 'P3', periodOrder: 3, time: '11:00 AM - 12:00 PM' }
    ]
  },
  {
    name: 'Python Programming',
    code: 'BCC302',
    faculty: 'Ajai Kumar Maurya',
    icon: 'python',
    color: ['#10b981', '#3b82f6'],
    present: 3, total: 3,
    timetable: [
      { day: 'Monday', period: 'P3', periodOrder: 3, time: '10:40 AM - 11:30 AM' },
      { day: 'Tuesday', period: 'P9', periodOrder: 9, time: '03:40 PM - 04:30 PM' }
    ]
  },
  {
    name: 'Quant.',
    code: 'QUANT.',
    faculty: 'Shivanand Dubey',
    icon: 'calc',
    color: ['#3b82f6', '#10b981'],
    present: 2, total: 2,
    timetable: [
      { day: 'Wednesday', period: 'P8', periodOrder: 8, time: '02:50 PM - 03:40 PM' }
    ]
  },
  {
    name: 'Reasoning',
    code: 'REAS',
    faculty: 'Gaurav Goswami',
    icon: 'brain',
    color: ['#8b5cf6', '#3b82f6'],
    present: 1, total: 1,
    timetable: [
      { day: 'Monday', period: 'P8', periodOrder: 8, time: '02:50 PM - 03:40 PM' }
    ]
  },
  {
    name: 'Skill Based AI',
    code: 'SBA',
    faculty: 'Nishat Bano',
    icon: 'robot',
    color: ['#8b5cf6', '#10b981'],
    present: 1, total: 1,
    timetable: [
      { day: 'Thursday', period: 'P9', periodOrder: 9, time: '03:40 PM - 04:30 PM' },
      { day: 'Friday', period: 'P2', periodOrder: 2, time: '09:50 AM - 10:40 AM' }
    ]
  },
  {
    name: 'Web Designing Workshop',
    code: 'BCS353',
    faculty: 'Nitish Kumar & Sachin Sonkar',
    icon: 'globe',
    color: ['#8b5cf6', '#10b981'],
    present: 4, total: 4,
    timetable: [
      { day: 'Friday', period: 'P8-P9', periodOrder: 8, time: '02:50 PM - 04:30 PM' }
    ]
  }
]

export function buildSubject(seed, idOverride) {
  return {
    id: idOverride || `subj_${Math.random().toString(36).slice(2, 10)}`,
    name: seed.name,
    code: seed.code,
    faculty: seed.faculty || '',
    icon: seed.icon || 'book',
    color: seed.color || ['#3b82f6', '#8b5cf6'],
    present: seed.present !== undefined ? seed.present : 0,
    total: seed.total !== undefined ? seed.total : 0,
    timetable: seed.timetable || [],
    createdAt: Date.now(),
  }
}
