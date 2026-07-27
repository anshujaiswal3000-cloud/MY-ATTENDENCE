// UCER CSE 2nd Year (Sec B) Official Timetable & Subject Data
// Facilitator: AJAI KUMAR MAURYA (Room D104, W.E.F 26/07/2026)

export const DEFAULT_TIMETABLE_HEADER = {
  title: 'United College CSE 2nd Year (Sec B) Timetable',
  room: 'Room D104',
  wef: '26/07/2026',
  facilitator: 'Ajai Kumar Maurya',
  facilitatorMobile: '9335833415'
}

export const defaultSubjects = [
  {
    name: 'Python Programming',
    code: 'BCC-302',
    faculty: 'Ajai Kumar Maurya',
    icon: 'python',
    color: ['#10b981', '#3b82f6'],
    present: 14, total: 14,
    timetable: [
      { day: 'Monday', time: '10:40 AM - 11:30 AM' },
      { day: 'Tuesday', time: '03:40 PM - 04:30 PM' }
    ]
  },
  {
    name: 'Data Structure (DS)',
    code: 'BCS-301',
    faculty: 'Sunil Kumar Khare',
    icon: 'book',
    color: ['#3b82f6', '#8b5cf6'],
    present: 22, total: 22,
    timetable: [
      { day: 'Monday', time: '09:50 AM - 10:40 AM' },
      { day: 'Tuesday', time: '10:40 AM - 11:30 AM' },
      { day: 'Wednesday', time: '11:30 AM - 12:20 PM' },
      { day: 'Thursday', time: '09:00 AM - 09:50 AM' },
      { day: 'Friday', time: '10:40 AM - 11:30 AM' },
      { day: 'Saturday', time: '01:00 PM - 02:00 PM' }
    ]
  },
  {
    name: 'Computer Organization (CO)',
    code: 'BCS-302',
    faculty: 'Chitranjan Dwivedi',
    icon: 'cpu',
    color: ['#10b981', '#3b82f6'],
    present: 20, total: 20,
    timetable: [
      { day: 'Monday', time: '09:00 AM - 09:50 AM' },
      { day: 'Tuesday', time: '09:00 AM - 09:50 AM' },
      { day: 'Wednesday', time: '09:50 AM - 10:40 AM' },
      { day: 'Thursday', time: '09:50 AM - 10:40 AM' },
      { day: 'Friday', time: '12:20 PM - 01:10 PM' },
      { day: 'Saturday', time: '09:00 AM - 10:00 AM' }
    ]
  },
  {
    name: 'Discrete Structures & Logic (DSTL)',
    code: 'BCS-303',
    faculty: 'Dharmendra Kumar',
    icon: 'logic',
    color: ['#8b5cf6', '#10b981'],
    present: 18, total: 18,
    timetable: [
      { day: 'Monday', time: '03:40 PM - 04:30 PM' },
      { day: 'Tuesday', time: '02:00 PM - 02:50 PM' },
      { day: 'Wednesday', time: '09:00 AM - 09:50 AM' },
      { day: 'Thursday', time: '11:30 AM - 12:20 PM' },
      { day: 'Friday', time: '02:00 PM - 02:50 PM' },
      { day: 'Saturday', time: '10:00 AM - 11:00 AM' }
    ]
  },
  {
    name: 'Digital Logic Design (DLD)',
    code: 'BOE-310',
    faculty: 'Santosh Dubey',
    icon: 'chip',
    color: ['#10b981', '#8b5cf6'],
    present: 24, total: 24,
    timetable: [
      { day: 'Monday', time: '02:00 PM - 02:50 PM' },
      { day: 'Tuesday', time: '09:50 AM - 10:40 AM' },
      { day: 'Wednesday', time: '10:40 AM - 11:30 AM' },
      { day: 'Wednesday', time: '03:40 PM - 04:30 PM' },
      { day: 'Thursday', time: '12:20 PM - 01:10 PM' },
      { day: 'Friday', time: '11:30 AM - 12:20 PM' },
      { day: 'Saturday', time: '12:00 PM - 01:00 PM' }
    ]
  },
  {
    name: 'Data Structures Lab (DS_LAB)',
    code: 'BCS-351',
    faculty: 'Shyam B. Verma & Sunil K. Khare',
    icon: 'flask',
    color: ['#3b82f6', '#10b981'],
    present: 6, total: 6,
    timetable: [
      { day: 'Tuesday', time: '11:30 AM - 01:10 PM' }
    ]
  },
  {
    name: 'Computer Organization Lab (CO_LAB)',
    code: 'BCS-352',
    faculty: 'Manoj Yadav',
    icon: 'code',
    color: ['#8b5cf6', '#3b82f6'],
    present: 6, total: 6,
    timetable: [
      { day: 'Monday', time: '11:30 AM - 01:10 PM' }
    ]
  },
  {
    name: 'Web Designing Workshop (WDW_LAB)',
    code: 'BCS-353',
    faculty: 'Nitish Kumar & Sachin Sonkar',
    icon: 'globe',
    color: ['#8b5cf6', '#10b981'],
    present: 6, total: 6,
    timetable: [
      { day: 'Friday', time: '02:50 PM - 04:30 PM' }
    ]
  },
  {
    name: 'Universal Human Values (UHV)',
    code: 'BVE-301',
    faculty: 'Pooja Sharma',
    icon: 'brain',
    color: ['#3b82f6', '#8b5cf6'],
    present: 8, total: 8,
    timetable: [
      { day: 'Wednesday', time: '12:20 PM - 01:10 PM' },
      { day: 'Thursday', time: '10:40 AM - 11:30 AM' }
    ]
  },
  {
    name: 'ENG Hard Skill (ENG_HS)',
    code: 'ENG[HS]-2',
    faculty: 'Arun Samuel Lawrence',
    icon: 'terminal',
    color: ['#10b981', '#3b82f6'],
    present: 8, total: 8,
    timetable: [
      { day: 'Thursday', time: '02:50 PM - 03:40 PM' },
      { day: 'Friday', time: '09:00 AM - 09:50 AM' }
    ]
  },
  {
    name: 'Logical Reasoning (LR)',
    code: 'LR-2',
    faculty: 'Gaurav Goswami',
    icon: 'brain',
    color: ['#8b5cf6', '#3b82f6'],
    present: 4, total: 4,
    timetable: [
      { day: 'Monday', time: '02:50 PM - 03:40 PM' }
    ]
  },
  {
    name: 'Programming Skill Dev (PSD)',
    code: 'PSD-2',
    faculty: 'Shalini Tripathi',
    icon: 'terminal',
    color: ['#10b981', '#8b5cf6'],
    present: 14, total: 14,
    timetable: [
      { day: 'Tuesday', time: '02:50 PM - 03:40 PM' },
      { day: 'Wednesday', time: '02:00 PM - 02:50 PM' },
      { day: 'Thursday', time: '02:00 PM - 02:50 PM' },
      { day: 'Saturday', time: '11:00 AM - 12:00 PM' }
    ]
  },
  {
    name: 'Quants',
    code: 'QUANTS-2',
    faculty: 'Shivanand Dubey',
    icon: 'calc',
    color: ['#3b82f6', '#10b981'],
    present: 4, total: 4,
    timetable: [
      { day: 'Wednesday', time: '02:50 PM - 03:40 PM' }
    ]
  },
  {
    name: 'Skill AI',
    code: 'SKILL-2',
    faculty: 'Nishat Bano',
    icon: 'robot',
    color: ['#8b5cf6', '#10b981'],
    present: 8, total: 8,
    timetable: [
      { day: 'Thursday', time: '03:40 PM - 04:30 PM' },
      { day: 'Friday', time: '09:50 AM - 10:40 AM' }
    ]
  },
  {
    name: 'Library',
    code: 'LIBRARY-2',
    faculty: 'Staff',
    icon: 'book',
    color: ['#3b82f6', '#8b5cf6'],
    present: 4, total: 4,
    timetable: [
      { day: 'Saturday', time: '02:00 PM - 03:00 PM' }
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
