import { MdDashboard, MdMenuBook, MdHistory, MdSchedule, MdInsights, MdSettings } from 'react-icons/md'

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', Icon: MdDashboard },
  { label: 'Subjects', path: '/subjects', Icon: MdMenuBook },
  { label: 'History', path: '/history', Icon: MdHistory },
  { label: 'Timetable', path: '/timetable', Icon: MdSchedule },
  { label: 'Analytics', path: '/analytics', Icon: MdInsights },
  { label: 'Settings', path: '/settings', Icon: MdSettings },
]
