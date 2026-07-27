import React, { useMemo, useState } from 'react'
import { Box, Typography, Chip, Button, LinearProgress, Tooltip } from '@mui/material'
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
      <GlassCard sx={{ p: 2.5, mb: 3 }}>
        {/* Mobile-style day pill scroll */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Button
            size="small"
            onClick={goLeft}
            sx={{ minWidth: 36, width: 36, height: 36, borderRadius: '50%', p: 0, color: 'text.secondary' }}
          >
            <MdChevronLeft size={20} />
          </Button>
          <Box sx={{ flex: 1, display: 'flex', gap: 1, overflowX: 'auto', justifyContent: 'center', pb: .5 }}>
            {WEEKDAYS.map((d, i) => {
              const isActive = tab === i
              const isTodayDay = d === today
              return (
                <Box
                  key={d}
                  onClick={() => setTab(i)}
                  sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: .4, cursor: 'pointer', minWidth: 48, px: .5, py: .75,
                    borderRadius: '16px', flexShrink: 0, transition: 'all 220ms ease',
                    background: isActive ? 'var(--aurora)' : 'transparent',
                    boxShadow: isActive ? '0 6px 20px rgba(99,102,241,.3)' : 'none',
                    '&:hover': { background: isActive ? 'var(--aurora)' : 'rgba(148,163,184,.08)' }
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '.62rem', letterSpacing: '.06em', color: isActive ? '#fff' : 'text.secondary', textTransform: 'uppercase' }}>
                    {d.slice(0, 3)}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: isActive ? '#fff' : isTodayDay ? '#60a5fa' : 'text.primary', fontSize: '.9rem' }}>
                    {i + 1}
                  </Typography>
                  {isTodayDay && (
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: isActive ? '#fff' : '#60a5fa' }} />
                  )}
                </Box>
              )
            })}
          </Box>
          <Button
            size="small"
            onClick={goRight}
            sx={{ minWidth: 36, width: 36, height: 36, borderRadius: '50%', p: 0, color: 'text.secondary' }}
          >
            <MdChevronRight size={20} />
          </Button>
        </Box>

        {/* Day title row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {activeDay}
              {isToday && <Chip label="Today" size="small" sx={{ ml: 1.25, bgcolor: 'rgba(96,165,250,.18)', color: '#60a5fa', fontWeight: 700, fontSize: '.68rem' }} />}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {daySlots.length === 0 ? 'No lectures scheduled' : `${daySlots.length} lecture${daySlots.length > 1 ? 's' : ''} scheduled`}
            </Typography>
          </Box>
          {!isToday && (
            <Button size="small" startIcon={<MdToday />} onClick={goToday} sx={{ textTransform: 'none', fontSize: '.8rem', color: '#60a5fa' }}>
              Today
            </Button>
          )}
        </Box>
      </GlassCard>

      {/* ── Lecture Cards ── */}
      {daySlots.length === 0 ? (
        <EmptyState icon="🗓️" title={`No lectures on ${activeDay}`} subtitle="Add lecture slots from a subject's edit dialog." />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {daySlots.map(({ subject, time }, i) => {
            const Icon = getSubjectIcon(subject.icon)
            const [colorStart, colorEnd] = Array.isArray(subject.color) ? subject.color : ['#6366f1', '#8b5cf6']
            const pct = getPercentage(subject.present, subject.total)
            const statusColor = pct >= 85 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#f43f5e'

            return (
              <GlassCard key={`${subject.id}-${time}`} delay={i * 0.06} sx={{ p: 0, overflow: 'hidden' }}>
                {/* Colored top accent bar */}
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${colorStart}, ${colorEnd})` }} />
                <Box sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Time */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 54 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${colorStart}, ${colorEnd})`, color: '#fff', fontSize: 20, mb: .5, flexShrink: 0 }}>
                        <Icon />
                      </Box>
                      <Chip
                        icon={<MdSchedule size={11} />}
                        label={time}
                        size="small"
                        className="mono-num"
                        sx={{ fontSize: '.66rem', fontWeight: 700, height: 20, bgcolor: 'rgba(148,163,184,.12)', px: .5 }}
                      />
                    </Box>

                    {/* Subject Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: .3 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '.62rem', letterSpacing: '.05em' }}>
                          {subject.code}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 800, lineHeight: 1.2, mb: .3 }} noWrap>
                        {subject.name}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.58 }}>
                        {subject.faculty}
                      </Typography>
                      {/* Attendance progress */}
                      <Box sx={{ mt: 1.25 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: .4 }}>
                          <Typography variant="caption" color="text.secondary">Attendance</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: statusColor }}>
                            {subject.present}/{subject.total} ({pct.toFixed(0)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, pct)}
                          sx={{ height: 5, borderRadius: 8, bgcolor: 'rgba(148,163,184,.14)', '& .MuiLinearProgress-bar': { borderRadius: 8, background: `linear-gradient(90deg, ${colorStart}, ${colorEnd})` } }}
                        />
                      </Box>
                    </Box>

                    {/* Mark Attendance Buttons */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
                      <Tooltip title="Mark Present">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => markAttendance(subject.id, 'present')}
                          sx={{
                            minWidth: 42, width: 42, height: 38, p: 0, borderRadius: '12px',
                            background: 'rgba(16,185,129,.18)', color: '#10b981',
                            boxShadow: 'none', fontSize: 18,
                            '&:hover': { background: 'rgba(16,185,129,.32)', boxShadow: '0 4px 14px rgba(16,185,129,.3)' }
                          }}
                        >
                          <MdCheckCircle />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Mark Absent">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => markAttendance(subject.id, 'absent')}
                          sx={{
                            minWidth: 42, width: 42, height: 38, p: 0, borderRadius: '12px',
                            background: 'rgba(244,63,94,.18)', color: '#f43f5e',
                            boxShadow: 'none', fontSize: 18,
                            '&:hover': { background: 'rgba(244,63,94,.32)', boxShadow: '0 4px 14px rgba(244,63,94,.3)' }
                          }}
                        >
                          <MdCancel />
                        </Button>
                      </Tooltip>
                    </Box>
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
