import { MdDashboard, MdMenuBook, MdSchedule, MdNoteAlt, MdSettings } from 'react-icons/md'

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', Icon: MdDashboard },
  { label: 'Subjects', path: '/subjects', Icon: MdMenuBook },
  { label: 'Timetable', path: '/timetable', Icon: MdSchedule },
  { label: 'Notes', path: '/notes', Icon: MdNoteAlt },
  { label: 'Settings', path: '/settings', Icon: MdSettings },
]
