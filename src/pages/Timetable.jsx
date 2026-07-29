import React, { useMemo, useState } from 'react'
import { Box, Typography, Chip, Button, LinearProgress, Tooltip, IconButton } from '@mui/material'
import { MdCheckCircle, MdCancel, MdSchedule, MdChevronLeft, MdChevronRight, MdToday, MdLock, MdLockOpen, MdSchool, MdPhone, MdLocationOn } from 'react-icons/md'
import GlassCard from '../components/GlassCard'
import EmptyState from '../components/EmptyState'
import OCRScannerDialog from '../components/OCRScannerDialog'
import ProxyClassDialog from '../components/ProxyClassDialog'
import { getSubjectIcon } from '../utils/iconRegistry'
import { useAttendance } from '../context/AttendanceContext'
import { WEEKDAYS, getTodayName, getPercentage, getHolidayInfo } from '../utils/attendanceUtils'

/** Parses start minutes from range like "09:00 AM - 09:50 AM" -> 540 */
function getStartMinutes(timeRangeStr) {
  try {
    if (!timeRangeStr) return 0
    const startStr = timeRangeStr.split('-')[0].trim()
    const [timeVal, modifier] = startStr.split(' ')
    let [hours, minutes] = timeVal.split(':').map(Number)

    if (modifier === 'PM' && hours < 12) hours += 12
    if (modifier === 'AM' && hours === 12) hours = 0

    return hours * 60 + minutes
  } catch (e) {
    return 0
  }
}

export default function Timetable() {
  const { timetableSubjects, markAttendance, isUnlocked, lockApp, timetableHeader } = useAttendance()
  const today = getTodayName()
  const defaultTab = WEEKDAYS.includes(today) ? WEEKDAYS.indexOf(today) : 0
  const [tab, setTab] = useState(defaultTab)
  const [ocrOpen, setOcrOpen] = useState(false)
  const [proxyOpen, setProxyOpen] = useState(false)
  const activeDay = WEEKDAYS[tab]
  const isToday = activeDay === today

  // Holiday detection for today and for the currently viewed tab
  const todayHoliday = getHolidayInfo(new Date())
  // For selected tab: build a representative date for that day name
  const getTabDate = (dayName) => {
    const now = new Date()
    const dayIdx = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(dayName)
    const diff = dayIdx - now.getDay()
    const d = new Date(now)
    d.setDate(now.getDate() + diff)
    return d
  }
  const activeDayHoliday = getHolidayInfo(getTabDate(activeDay))

  // Guaranteed chronological time sorting (09:00 AM -> 09:50 AM -> 10:40 AM -> 11:30 AM ...)
  const daySlots = useMemo(() => {
    const activeList = Array.isArray(timetableSubjects) ? timetableSubjects : []
    const slots = []
    activeList.forEach((s) => {
      ;(s.timetable || []).forEach((slot) => {
        if (slot.day === activeDay) {
          slots.push({ ...slot, subject: s })
        }
      })
    })

    return slots.sort((a, b) => {
      const startA = getStartMinutes(a.time)
      const startB = getStartMinutes(b.time)
      if (startA !== startB) return startA - startB
      const orderA = a.periodOrder || 99
      const orderB = b.periodOrder || 99
      return orderA - orderB
    })
  }, [timetableSubjects, activeDay])

  return (
    <Box sx={{ pb: 4 }}>
      {/* ── Overflow-Proof Official Timetable Header Card ── */}
      <GlassCard sx={{ p: { xs: 2.25, sm: 3 }, mb: 3, border: '1px solid rgba(99,102,241,.3)', background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.85))' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
          
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: .5, flexWrap: 'wrap' }}>
              <Chip
                icon={<MdSchool color="#60a5fa" size={13} />}
                label="CSE 2nd Year (Sec B)"
                size="small"
                sx={{ fontSize: '.68rem', fontWeight: 800, bgcolor: 'rgba(96,165,250,.18)', color: '#60a5fa', border: '1px solid rgba(96,165,250,.3)' }}
              />
              <Chip
                label={`W.E.F ${timetableHeader.wef}`}
                size="small"
                sx={{ fontSize: '.68rem', fontWeight: 700, bgcolor: 'rgba(16,185,129,.18)', color: '#34d399' }}
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-.01em', wordBreak: 'break-word' }}>
              {timetableHeader.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: .5, flexWrap: 'wrap', fontWeight: 600 }}>
              <span><MdLocationOn color="#f43f5e" inline /> {timetableHeader.room}</span>
              <span>•</span>
              <span>Facilitator: <strong>{timetableHeader.facilitator}</strong> ({timetableHeader.facilitatorMobile})</span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setProxyOpen(true)}
              sx={{ borderColor: 'rgba(96,165,250,0.4)', color: '#60a5fa', borderRadius: '10px', textTransform: 'none', fontWeight: 800, fontSize: '.75rem' }}
            >
              🔄 Substitute / Proxy Swap
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={() => setOcrOpen(true)}
              sx={{ background: 'var(--aurora)', borderRadius: '10px', textTransform: 'none', fontWeight: 800, fontSize: '.75rem' }}
            >
              📸 Scan Photo
            </Button>
          </Box>

        </Box>
      </GlassCard>

      {/* ── Day Navigation Bar (100% Smooth Touch-Scrollable PWA Rail) ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 0.5 }}>
        <IconButton size="small" onClick={() => setTab((t) => Math.max(0, t - 1))} disabled={tab === 0} sx={{ flexShrink: 0, bgcolor: 'rgba(255,255,255,0.06)' }}>
          <MdChevronLeft size={20} />
        </IconButton>

        <Box sx={{
          display: 'flex', gap: 1, overflowX: 'auto', py: 0.75, px: 0.5, flex: 1,
          scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(99,102,241,0.3)', borderRadius: 2 }
        }}>
          {WEEKDAYS.map((day, idx) => {
            const active = idx === tab
            const dayIsToday = day === today
            return (
              <Chip
                key={day}
                label={dayIsToday ? `${day} (Today)` : day}
                onClick={() => setTab(idx)}
                sx={{
                  fontWeight: active ? 800 : 600,
                  fontSize: '.78rem',
                  px: 1.25, py: 1.85,
                  flexShrink: 0,
                  scrollSnapAlign: 'start',
                  cursor: 'pointer',
                  bgcolor: active ? 'var(--aurora)' : dayIsToday ? 'rgba(99,102,241,.22)' : 'rgba(148,163,184,.12)',
                  color: active ? '#fff' : dayIsToday ? '#a5b4fc' : 'text.primary',
                  border: dayIsToday ? '1.5px solid rgba(99,102,241,.4)' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: active ? '0 6px 18px rgba(99,102,241,.4)' : 'none'
                }}
              />
            )
          })}
        </Box>

        <IconButton size="small" onClick={() => setTab((t) => Math.min(WEEKDAYS.length - 1, t + 1))} disabled={tab === WEEKDAYS.length - 1} sx={{ flexShrink: 0, bgcolor: 'rgba(255,255,255,0.06)' }}>
          <MdChevronRight size={20} />
        </IconButton>
      </Box>

      {/* ── Holiday Banner (1st/3rd Sat or Sunday) ── */}
      {isToday && todayHoliday.isHoliday && (
        <Box sx={{
          mb: 3, p: 2.5, borderRadius: '18px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))',
          border: '1px solid rgba(245,158,11,0.35)',
          backdropFilter: 'blur(12px)'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#fbbf24', mb: 0.5 }}>
            {todayHoliday.reason}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>
            Enjoy your holiday! No auto-attendance will be logged today. 🎉
          </Typography>
        </Box>
      )}

      {/* ── Timetable Slots Grid ── */}
      {activeDayHoliday.isHoliday ? (
        <Box sx={{
          p: 3.5, borderRadius: '20px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.07))',
          border: '1px dashed rgba(245,158,11,0.35)'
        }}>
          <Typography variant="h4" sx={{ mb: 1 }}>🏖️</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#fbbf24', mb: 0.5 }}>
            {activeDayHoliday.reason}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>
            No classes scheduled — college holiday!
          </Typography>
        </Box>
      ) : daySlots.length === 0 ? (
        <EmptyState icon="🎉" title={`No classes on ${activeDay}`} subtitle="Enjoy your holiday or self-study time!" />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {daySlots.map((slot, idx) => {
            const subject = slot.subject
            const pct = getPercentage(subject.present, subject.total)
            const [colorStart, colorEnd] = Array.isArray(subject.color) ? subject.color : ['#6366f1', '#8b5cf6']
            const Icon = getSubjectIcon(subject.icon)

            return (
              <GlassCard key={`${slot.day}_${slot.period}_${idx}`} delay={idx * 0.04} sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minWidth: 0, flex: 1 }}>
                    <Box
                      sx={{
                        width: 48, height: 48, borderRadius: '14px', flexShrink: 0,
                        display: 'grid', placeItems: 'center', color: '#fff', fontSize: 22,
                        background: `linear-gradient(135deg, ${colorStart}, ${colorEnd})`,
                        boxShadow: `0 6px 18px ${colorStart}44`
                      }}
                    >
                      <Icon />
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: .5, flexWrap: 'wrap' }}>
                        {slot.period && (
                          <Chip
                            label={slot.period}
                            size="small"
                            sx={{ fontSize: '.7rem', fontWeight: 800, bgcolor: 'var(--aurora)', color: '#fff' }}
                          />
                        )}
                        <Chip
                          icon={<MdSchedule size={12} />}
                          label={slot.time}
                          size="small"
                          className="mono-num"
                          sx={{ fontSize: '.7rem', fontWeight: 700, bgcolor: 'rgba(148,163,184,.14)' }}
                        />
                        {subject.isLab && (
                          <Chip label="2 Counts Lab" size="small" sx={{ fontSize: '.64rem', fontWeight: 800, bgcolor: 'rgba(16,185,129,.18)', color: '#34d399' }} />
                        )}
                        {subject.isIgnored && (
                          <Chip label="Excluded" size="small" sx={{ fontSize: '.64rem', fontWeight: 700, bgcolor: 'rgba(148,163,184,.2)' }} />
                        )}
                      </Box>

                      <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.25 }}>
                        {subject.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: .25, fontWeight: 600 }}>
                        Code: {subject.code} • Prof. {subject.faculty}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Attendance Stats & Quick Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography className="mono-num" variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {subject.isIgnored ? 'N/A' : `${pct.toFixed(1)}%`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {subject.present} / {subject.total} Present
                      </Typography>
                    </Box>

                    {!subject.isIgnored && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={isUnlocked ? "Mark Present" : "Login to make any change"}>
                          <IconButton
                            size="small"
                            onClick={() => markAttendance(subject.id, 'present')}
                            sx={{
                              bgcolor: 'rgba(16,185,129,.16)', color: '#10b981',
                              '&:hover': { bgcolor: 'rgba(16,185,129,.3)' }
                            }}
                          >
                            <MdCheckCircle size={20} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={isUnlocked ? "Mark Absent" : "Login to make any change"}>
                          <IconButton
                            size="small"
                            onClick={() => markAttendance(subject.id, 'absent')}
                            sx={{
                              bgcolor: 'rgba(244,63,94,.16)', color: '#f43f5e',
                              '&:hover': { bgcolor: 'rgba(244,63,94,.3)' }
                            }}
                          >
                            <MdCancel size={20} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>

                </Box>
              </GlassCard>
            )
          })}
        </Box>
      )}

      {/* 📸 Timetable Photo OCR Scanner Dialog 📸 */}
      <OCRScannerDialog open={ocrOpen} onClose={() => setOcrOpen(false)} />

      {/* 🔄 Substitute / Proxy Class Swap Dialog 🔄 */}
      <ProxyClassDialog open={proxyOpen} onClose={() => setProxyOpen(false)} />
    </Box>
  )
}
