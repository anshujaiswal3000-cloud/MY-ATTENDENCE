import React, { useMemo, useState } from 'react'
import { Box, Typography, Tabs, Tab, Chip } from '@mui/material'
import GlassCard from '../components/GlassCard'
import EmptyState from '../components/EmptyState'
import { getSubjectIcon } from '../utils/iconRegistry'
import { useAttendance } from '../context/AttendanceContext'
import { WEEKDAYS, getTodayName } from '../utils/attendanceUtils'

export default function Timetable() {
  const { subjects, markAttendance } = useAttendance()
  const today = getTodayName()
  const defaultTab = WEEKDAYS.includes(today) ? WEEKDAYS.indexOf(today) : 0
  const [tab, setTab] = useState(defaultTab)
  const activeDay = WEEKDAYS[tab]

  const daySlots = useMemo(() => {
    const slots = []
    subjects.forEach((s) => {
      ;(s.timetable || []).forEach((slot) => {
        if (slot.day === activeDay) slots.push({ subject: s, time: slot.time })
      })
    })
    return slots.sort((a, b) => a.time.localeCompare(b.time))
  }, [subjects, activeDay])

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, '& .MuiTabs-indicator': { height: 3, borderRadius: 3 } }}
      >
        {WEEKDAYS.map((d, i) => (
          <Tab key={d} label={d === today ? `${d} · Today` : d} value={i} sx={{ fontWeight: 600 }} />
        ))}
      </Tabs>

      {daySlots.length === 0 ? (
        <EmptyState icon="🗓️" title={`No lectures on ${activeDay}`} subtitle="Add lecture slots from a subject's edit dialog." />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {daySlots.map(({ subject, time }, i) => {
            const Icon = getSubjectIcon(subject.icon)
            const [start, end] = subject.color
            return (
              <GlassCard key={`${subject.id}-${time}`} delay={i * 0.05} sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip label={time} className="mono-num" sx={{ fontWeight: 700, minWidth: 70 }} />
                  <Box
                    sx={{
                      width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `linear-gradient(135deg, ${start}, ${end})`, color: '#fff',
                    }}
                  >
                    <Icon />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }} noWrap>{subject.name}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>{subject.faculty || subject.code}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      size="small"
                      label="Present"
                      onClick={() => markAttendance(subject.id, 'present')}
                      sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 600, cursor: 'pointer' }}
                    />
                    <Chip
                      size="small"
                      label="Absent"
                      onClick={() => markAttendance(subject.id, 'absent')}
                      sx={{ bgcolor: 'rgba(244,63,94,0.15)', color: '#f43f5e', fontWeight: 600, cursor: 'pointer' }}
                    />
                  </Box>
                </Box>
              </GlassCard>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
