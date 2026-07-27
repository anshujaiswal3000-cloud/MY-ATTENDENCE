import React, { useMemo, useState } from 'react'
import { Box, Typography, Chip, Button, LinearProgress, Tooltip, Grid } from '@mui/material'
import { MdCheckCircle, MdCancel, MdSchedule, MdChevronLeft, MdChevronRight, MdToday } from 'react-icons/md'
import GlassCard from '../components/GlassCard'
import EmptyState from '../components/EmptyState'
import { getSubjectIcon } from '../utils/iconRegistry'
import { useAttendance } from '../context/AttendanceContext'
import { WEEKDAYS, getTodayName, getPercentage } from '../utils/attendanceUtils'

export default function Timetable() {
  const { subjects, markAttendance } = useAttendance()
  const today = getTodayName()
  const defaultTab = WEEKDAYS.includes(today) ? WEEKDAYS.indexOf(today) : 0
  const [tab, setTab] = useState(defaultTab)
  const activeDay = WEEKDAYS[tab]
  const isToday = activeDay === today

  const daySlots = useMemo(() => {
    const slots = []
    subjects.forEach((s) => {
      ;(s.timetable || []).forEach((slot) => {
        if (slot.day === activeDay) slots.push({ subject: s, time: slot.time })
      })
    })
    return slots.sort((a, b) => a.time.localeCompare(b.time))
  }, [subjects, activeDay])

  const goLeft = () => setTab((t) => (t - 1 + WEEKDAYS.length) % WEEKDAYS.length)
  const goRight = () => setTab((t) => (t + 1) % WEEKDAYS.length)
  const goToday = () => setTab(defaultTab)

  return (
    <Box>
      {/* ── Day Selector Header ── */}
      <GlassCard sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Button
            size="small"
            onClick={goLeft}
            sx={{ minWidth: 36, width: 36, height: 36, borderRadius: '50%', p: 0, color: 'text.secondary', flexShrink: 0 }}
          >
            <MdChevronLeft size={22} />
          </Button>

          {/* Smooth scrollable days bar */}
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: .5, px: .5, flex: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            {WEEKDAYS.map((d, i) => {
              const isActive = tab === i
              const isTodayDay = d === today
              return (
                <Box
                  key={d}
                  onClick={() => setTab(i)}
                  sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: .3, cursor: 'pointer', minWidth: 52, px: 1, py: 1,
                    borderRadius: '14px', flexShrink: 0, transition: 'all 200ms ease',
                    background: isActive ? 'var(--aurora)' : 'transparent',
                    boxShadow: isActive ? '0 6px 18px rgba(99,102,241,.35)' : 'none',
                    border: isTodayDay && !isActive ? '1px solid rgba(96,165,250,.4)' : '1px solid transparent',
                    '&:hover': { background: isActive ? 'var(--aurora)' : 'rgba(148,163,184,.1)' }
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '.64rem', letterSpacing: '.06em', color: isActive ? '#fff' : 'text.secondary', textTransform: 'uppercase' }}>
                    {d.slice(0, 3)}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: isActive ? '#fff' : isTodayDay ? '#60a5fa' : 'text.primary', fontSize: '.88rem' }}>
                    Day {i + 1}
                  </Typography>
                  {isTodayDay && (
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: isActive ? '#fff' : '#60a5fa', mt: .2 }} />
                  )}
                </Box>
              )
            })}
          </Box>

          <Button
            size="small"
            onClick={goRight}
            sx={{ minWidth: 36, width: 36, height: 36, borderRadius: '50%', p: 0, color: 'text.secondary', flexShrink: 0 }}
          >
            <MdChevronRight size={22} />
          </Button>
        </Box>

        {/* Day title info */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: '1px solid rgba(148,163,184,.12)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {activeDay}
            </Typography>
            {isToday && <Chip label="Today" size="small" sx={{ bgcolor: 'rgba(96,165,250,.18)', color: '#60a5fa', fontWeight: 700, fontSize: '.68rem' }} />}
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              • {daySlots.length === 0 ? 'No lectures' : `${daySlots.length} lecture${daySlots.length > 1 ? 's' : ''}`}
            </Typography>
          </Box>
          {!isToday && (
            <Button size="small" startIcon={<MdToday />} onClick={goToday} sx={{ textTransform: 'none', fontSize: '.78rem', color: '#60a5fa', fontWeight: 700 }}>
              Today
            </Button>
          )}
        </Box>
      </GlassCard>

      {/* ── Lecture Cards Grid ── */}
      {daySlots.length === 0 ? (
        <EmptyState icon="🗓️" title={`No lectures on ${activeDay}`} subtitle="Add lecture slots from a subject's edit dialog." />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {daySlots.map(({ subject, time }, i) => {
            const Icon = getSubjectIcon(subject.icon)
            const [colorStart, colorEnd] = Array.isArray(subject.color) ? subject.color : ['#6366f1', '#8b5cf6']
            const pct = getPercentage(subject.present, subject.total)
            const statusColor = pct >= 85 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#f43f5e'

            return (
              <GlassCard key={`${subject.id}-${time}`} delay={i * 0.05} sx={{ p: 0, overflow: 'hidden' }}>
                {/* Colored top accent bar */}
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${colorStart}, ${colorEnd})` }} />
                <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                  
                  {/* Top row: Subject Code & Time */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={<MdSchedule size={13} />}
                        label={time}
                        size="small"
                        className="mono-num"
                        sx={{ fontSize: '.72rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,.16)', color: '#818cf8', px: .5 }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        {subject.code}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: statusColor }}>
                      Attendance: {subject.present}/{subject.total} ({pct.toFixed(0)}%)
                    </Typography>
                  </Box>

                  {/* Main row: Icon + Subject & Faculty + Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, minWidth: 0, flex: 1 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${colorStart}, ${colorEnd})`, color: '#fff', fontSize: 22, flexShrink: 0 }}>
                        <Icon />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.25 }} noWrap>
                          {subject.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: .2 }}>
                          Prof. {subject.faculty || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Present / Absent Mark Buttons */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                      <Tooltip title="Mark Present">
                        <IconButton
                          onClick={() => markAttendance(subject.id, 'present')}
                          sx={{
                            width: 40, height: 40, borderRadius: '12px',
                            background: 'rgba(16,185,129,.18)', color: '#10b981',
                            '&:hover': { background: 'rgba(16,185,129,.35)' }
                          }}
                        >
                          <MdCheckCircle size={22} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Mark Absent">
                        <IconButton
                          onClick={() => markAttendance(subject.id, 'absent')}
                          sx={{
                            width: 40, height: 40, borderRadius: '12px',
                            background: 'rgba(244,63,94,.18)', color: '#f43f5e',
                            '&:hover': { background: 'rgba(244,63,94,.35)' }
                          }}
                        >
                          <MdCancel size={22} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Attendance Progress bar */}
                  <Box sx={{ mt: 1.75 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, pct)}
                      sx={{ height: 6, borderRadius: 8, bgcolor: 'rgba(148,163,184,.14)', '& .MuiLinearProgress-bar': { borderRadius: 8, background: `linear-gradient(90deg, ${colorStart}, ${colorEnd})` } }}
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
