import React, { useMemo, useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Chip, LinearProgress, Button, Avatar,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, TextField, Tabs, Tab
} from '@mui/material'
import {
  MdCheckCircle, MdCancel, MdListAlt, MdEventAvailable,
  MdArrowForward, MdSchool, MdTrendingUp, MdTrendingDown,
  MdStar, MdWarning, MdDoorBack, MdAdd, MdSchedule, MdLocationOn,
  MdTimer, MdClass, MdCalendarToday, MdDelete, MdHistory, MdLock
} from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import AuroraGauge from '../components/AuroraGauge'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import { useAttendance } from '../context/AttendanceContext'
import {
  calculateBunkAdvice,
  getOverallStats,
  getPercentage,
  getHighestLowestAverage,
  STATUS_COLORS,
  getStatus,
  WEEKDAYS,
  getTodayName
} from '../utils/attendanceUtils'

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

function parseEndTime(timeRangeStr) {
  try {
    const parts = timeRangeStr.split('-')
    if (parts.length < 2) return null
    const endStr = parts[1].trim()
    const [timeVal, modifier] = endStr.split(' ')
    let [hours, minutes] = timeVal.split(':').map(Number)
    if (modifier === 'PM' && hours < 12) hours += 12
    if (modifier === 'AM' && hours === 12) hours = 0
    return { hours, minutes }
  } catch (err) {
    return null
  }
}

export default function Dashboard() {
  const {
    subjects, timetableSubjects, history, bunks, logBunkClass, deleteBunkClass, deleteHistoryEntry, timetableHeader, isUnlocked, notify, settings
  } = useAttendance()
  
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 200); return () => clearTimeout(t) }, [])

  // Bunk Modal State
  const [bunkDialogOpen, setBunkDialogOpen] = useState(false)
  const [bunkTab, setBunkTab] = useState(0)
  const [bunkSubjectId, setBunkSubjectId] = useState(subjects[0]?.id || '')
  const [bunkReason, setBunkReason] = useState('Personal / Event')

  // Subject Detail History Modal State
  const [selectedSubjectHistory, setSelectedSubjectHistory] = useState(null)

  const activeSemester = settings?.semester || 'Semester 3'

  const handleBunkSubmit = (e) => {
    e.preventDefault()
    if (!isUnlocked) {
      notify('Login required to edit 🔒', 'warning')
      return
    }
    if (!bunkSubjectId) return
    logBunkClass(bunkSubjectId, bunkReason)
    setBunkTab(1)
  }

  // Live computed stats
  const stats = useMemo(() => getOverallStats(subjects), [subjects])
  const { highest, lowest, average } = useMemo(() => getHighestLowestAverage(subjects), [subjects])
  const attendanceSafe = stats.percentage >= 75
  const attendanceExcellent = stats.percentage >= 90

  const today = getTodayName()
  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'
  const wishMessage = greetingHour < 12 
    ? '🌅 Wishing you an energetic and productive morning ahead!' 
    : greetingHour < 17 
      ? '☀️ Hope your afternoon classes are going great!' 
      : '🌙 Wishing you a peaceful evening & successful day completion!'

  const topSubjects = useMemo(() =>
    [...subjects].sort((a, b) => getPercentage(b.present, b.total) - getPercentage(a.present, a.total)),
    [subjects]
  )

  const criticalSubjects = useMemo(() =>
    subjects.filter(s => !s.isIgnored && s.total > 0 && getPercentage(s.present, s.total) < 75),
    [subjects]
  )

  // ── Calculate Live Upcoming Lecture (ALWAYS uses Sem 3 timetable) ──
  const upcomingClass = useMemo(() => {
    const now = new Date()
    const curMins = now.getHours() * 60 + now.getMinutes()

    const todaySlots = []
    timetableSubjects.forEach((s) => {
      ;(s.timetable || []).forEach((slot) => {
        if (slot.day === today && !s.isIgnored && s.code !== 'LIBRARY-2') {
          const endMins = parseEndTime(slot.time)
          const startMins = getStartMinutes(slot.time)
          todaySlots.push({ subject: s, time: slot.time, period: slot.period, startMins, endMins })
        }
      })
    })
    todaySlots.sort((a, b) => a.startMins - b.startMins)

    const nextToday = todaySlots.find(s => !s.endMins || curMins < (s.endMins.hours * 60 + s.endMins.minutes))
    if (nextToday) {
      return { slot: nextToday, dayLabel: `Today (${today})` }
    }

    const todayIdx = WEEKDAYS.indexOf(today)
    for (let offset = 1; offset <= 6; offset++) {
      const nextDay = WEEKDAYS[(todayIdx + offset) % WEEKDAYS.length]
      const nextSlots = []
      timetableSubjects.forEach((s) => {
        ;(s.timetable || []).forEach((slot) => {
          if (slot.day === nextDay && !s.isIgnored && s.code !== 'LIBRARY-2') {
            nextSlots.push({ subject: s, time: slot.time, period: slot.period, startMins: getStartMinutes(slot.time) })
          }
        })
      })
      if (nextSlots.length > 0) {
        nextSlots.sort((a, b) => a.startMins - b.startMins)
        return { slot: nextSlots[0], dayLabel: `Upcoming (${nextDay})` }
      }
    }

    return null
  }, [timetableSubjects, today])

  const subjectLogs = useMemo(() => {
    if (!selectedSubjectHistory) return []
    return history.filter(h => h.subjectId === selectedSubjectHistory.id || h.subjectName === selectedSubjectHistory.name)
  }, [history, selectedSubjectHistory])

  return (
    <Box>
      {/* ── Wish & Hero Banner with Date & Day Chip ── */}
      <GlassCard sx={{ p: { xs: 2.5, sm: 3.25 }, mb: 3 }}>
        <Box className="dashboard-hero" sx={{
          mx: { xs: -2.5, sm: -3.25 }, my: { xs: -2.5, sm: -3.25 },
          p: { xs: 2.5, sm: 3.5 }, borderRadius: '22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 2, minHeight: 150, position: 'relative', overflow: 'hidden'
        }}>
          <Box sx={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'rgba(99,102,241,.15)', filter: 'blur(40px)', top: -40, right: 60, pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(16,185,129,.12)', filter: 'blur(30px)', bottom: -20, left: 40, pointerEvents: 'none' }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: .5, flexWrap: 'wrap' }}>
              <Typography variant="overline" sx={{ color: 'primary.light', letterSpacing: '.12em', fontWeight: 700, fontSize: '.68rem' }}>
                ATTENDANCE OVERVIEW ({activeSemester.toUpperCase()})
              </Typography>
              <Chip
                icon={<MdCalendarToday size={12} />}
                label={todayFormatted}
                size="small"
                sx={{ fontSize: '.68rem', fontWeight: 700, bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
              />
              <Chip
                label={activeSemester}
                size="small"
                sx={{ fontSize: '.68rem', fontWeight: 800, bgcolor: 'var(--aurora)', color: '#fff' }}
              />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, mt: .25, letterSpacing: '-.02em' }}>
              {greeting}, Anshu 👋
            </Typography>
            <Typography variant="body2" sx={{ color: '#a5b4fc', mt: .5, fontWeight: 700 }}>
              {wishMessage}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
              {attendanceExcellent && <Chip icon={<MdStar />} label="Excellent attendance" size="small" sx={{ bgcolor: 'rgba(16,185,129,.18)', color: '#6ee7b7', fontWeight: 700, fontSize: '.7rem' }} />}
              {criticalSubjects.length > 0 && <Chip icon={<MdWarning />} label={`${criticalSubjects.length} subject${criticalSubjects.length > 1 ? 's' : ''} below 75%`} size="small" sx={{ bgcolor: 'rgba(244,63,94,.18)', color: '#fb7185', fontWeight: 700, fontSize: '.7rem', cursor: 'pointer' }} onClick={() => navigate('/subjects')} />}
            </Box>
          </Box>
          <Box sx={{ position: 'relative', zIndex: 1, display: { xs: 'none', sm: 'flex' }, width: 76, height: 76, borderRadius: '24px', alignItems: 'center', justifyContent: 'center', background: 'var(--aurora)', color: '#fff', fontSize: 36, boxShadow: '0 16px 32px rgba(59,130,246,.28)' }}>
            <MdSchool />
          </Box>
        </Box>
      </GlassCard>

      {/* ── Overall Attendance & Live Upcoming Lecture Grid ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>

        <Grid item xs={12} md={5} lg={4}>
          <GlassCard sx={{ p: 2.75, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <AuroraGauge percentage={stats.percentage} label={`${activeSemester} Attendance`} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontWeight: 600 }}>
              {stats.present} present out of {stats.total} total lectures
            </Typography>
            <Chip
              size="small"
              label={attendanceSafe ? '✅ On Track (≥ 75%)' : '⚠️ Below Target (< 75%)'}
              sx={{ mt: 1.25, fontWeight: 700, fontSize: '.72rem', bgcolor: attendanceSafe ? 'rgba(16,185,129,.14)' : 'rgba(244,63,94,.14)', color: attendanceSafe ? '#34d399' : '#fb7185' }}
            />
          </GlassCard>
        </Grid>

        {/* 🌟 Upcoming Lecture Card (Sem 3 Active Timetable) 🌟 */}
        <Grid item xs={12} md={7} lg={8}>
          <GlassCard sx={{ p: 2.75, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdTimer size={22} color="#60a5fa" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Upcoming Lecture
                  </Typography>
                </Box>
                <Chip
                  label={upcomingClass ? upcomingClass.dayLabel : 'No Classes'}
                  size="small"
                  sx={{ bgcolor: 'rgba(96,165,250,.18)', color: '#60a5fa', fontWeight: 700, fontSize: '.7rem' }}
                />
              </Box>

              {upcomingClass ? (
                <Box sx={{ p: 2.25, borderRadius: '18px', background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.25)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: .8 }}>
                        {upcomingClass.slot.period && (
                          <Chip
                            label={upcomingClass.slot.period}
                            size="small"
                            sx={{ fontSize: '.72rem', fontWeight: 800, bgcolor: 'var(--aurora)', color: '#fff' }}
                          />
                        )}
                        <Chip
                          icon={<MdSchedule size={12} />}
                          label={upcomingClass.slot.time}
                          size="small"
                          className="mono-num"
                          sx={{ fontSize: '.72rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,.25)', color: '#a5b4fc' }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25 }}>
                        {upcomingClass.slot.subject.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 700 }}>
                        Code: {upcomingClass.slot.subject.code}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2.5, mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,.1)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: .5, fontWeight: 600 }}>
                      <MdLocationOn size={15} color="#f43f5e" /> {timetableHeader.room}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: .5, fontWeight: 600 }}>
                      <MdClass size={15} color="#10b981" /> Prof. {upcomingClass.slot.subject.faculty}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    🎉 All classes completed for today! Check timetable for full schedule.
                  </Typography>
                </Box>
              )}
            </Box>

            <Button
              size="small"
              endIcon={<MdArrowForward />}
              onClick={() => navigate('/timetable')}
              sx={{ textTransform: 'none', mt: 2, fontWeight: 700, alignSelf: 'flex-start', color: '#60a5fa' }}
            >
              View Full Timetable Schedule
            </Button>
          </GlassCard>
        </Grid>
      </Grid>

      {/* ── 4 Main Stat Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<MdCheckCircle />}
            label="Present"
            value={stats.present}
            description={`of ${stats.total} classes (${stats.percentage.toFixed(1)}%)`}
            accent="#10b981"
            delay={.05}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<MdCancel />}
            label="Absent"
            value={stats.absent}
            description={`${stats.total > 0 ? ((stats.absent / stats.total) * 100).toFixed(1) : 0}% missed`}
            accent="#f43f5e"
            delay={.1}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<MdListAlt />}
            label="Total classes"
            value={stats.total}
            description={activeSemester}
            accent="#3b82f6"
            delay={.15}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <GlassCard delay={.2} sx={{ p: 2.25, minHeight: 122, cursor: 'pointer' }} onClick={() => setBunkDialogOpen(true)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', flexShrink: 0 }}>
                <MdDoorBack />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ opacity: 0.65 }} noWrap>
                  Bunked Classes
                </Typography>
                <Typography className="mono-num" variant="h5" sx={{ fontWeight: 800 }}>
                  {bunks.length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 700, display: 'flex', alignItems: 'center', gap: .3, mt: 0.2 }}>
                  <MdHistory size={13} /> View / Add Bunks
                </Typography>
              </Box>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>

      {/* ── Subject Snapshot — Tap any subject to view Date-wise History ── */}
      {topSubjects.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Subject snapshot ({activeSemester})</Typography>
              <Typography variant="body2" color="text.secondary">Tap any subject to view attendance details</Typography>
            </Box>
            <Button size="small" endIcon={<MdArrowForward />} onClick={() => navigate('/subjects')} sx={{ textTransform: 'none' }}>
              All subjects
            </Button>
          </Box>

          <Grid container spacing={2}>
            {topSubjects.map((subject, index) => {
              const pct = getPercentage(subject.present, subject.total)
              const status = getStatus(pct)
              const statusColor = STATUS_COLORS[status]
              const [colorStart, colorEnd] = Array.isArray(subject.color) ? subject.color : ['#6366f1', '#8b5cf6']

              return (
                <Grid item xs={12} sm={6} md={4} key={subject.id}>
                  <GlassCard delay={index * .05} sx={{ p: 2.25, cursor: 'pointer' }} onClick={() => setSelectedSubjectHistory(subject)}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '.62rem', letterSpacing: '.06em' }}>
                          {subject.code || 'N/A'}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: .15, lineHeight: 1.25 }} noWrap>
                          {subject.name}
                        </Typography>
                      </Box>
                      <Box sx={{
                        px: 1.25, py: .5, borderRadius: '10px', ml: 1, flexShrink: 0,
                        background: `${statusColor}22`, border: `1px solid ${statusColor}44`
                      }}>
                        <Typography className="mono-num" variant="body2" sx={{ fontWeight: 800, color: statusColor, fontSize: '.85rem' }}>
                          {subject.isIgnored ? 'N/A' : `${pct.toFixed(1)}%`}
                        </Typography>
                      </Box>
                    </Box>

                    {!subject.isIgnored && (
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, pct)}
                        sx={{ height: 7, borderRadius: 8, bgcolor: 'rgba(148,163,184,.14)', mb: 1.25, '& .MuiLinearProgress-bar': { borderRadius: 8, background: `linear-gradient(90deg, ${colorStart}, ${colorEnd})` } }}
                      />
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: subject.isIgnored ? 2 : 0 }}>
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>
                          ✓ {subject.present}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#f43f5e', fontWeight: 700 }}>
                          ✗ {subject.total - subject.present}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          / {subject.total}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700, fontSize: '.7rem', display: 'flex', alignItems: 'center', gap: .3 }}>
                        <MdHistory size={12} /> View Log
                      </Typography>
                    </Box>
                  </GlassCard>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}

      {/* ── Date-wise Subject Attendance History Modal ── */}
      <Dialog open={Boolean(selectedSubjectHistory)} onClose={() => setSelectedSubjectHistory(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '22px', p: 1 } }}>
        {selectedSubjectHistory && (
          <>
            <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {selectedSubjectHistory.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Code: {selectedSubjectHistory.code} • Prof. {selectedSubjectHistory.faculty}
                </Typography>
              </Box>
              <Chip
                label={selectedSubjectHistory.isIgnored ? 'Library' : `${getPercentage(selectedSubjectHistory.present, selectedSubjectHistory.total).toFixed(1)}%`}
                sx={{ fontWeight: 800, bgcolor: 'rgba(16,185,129,.18)', color: '#10b981' }}
              />
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdHistory color="#60a5fa" /> Class Attendance Log ({selectedSubjectHistory.present} / {selectedSubjectHistory.total})
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, maxHeight: 340, overflowY: 'auto' }}>
                {subjectLogs.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(148,163,184,.08)', borderRadius: '14px' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Official ERP Record: {selectedSubjectHistory.present} Present / {selectedSubjectHistory.total - selectedSubjectHistory.present} Absent out of {selectedSubjectHistory.total} Total
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: .5 }}>
                      Percentage: {getPercentage(selectedSubjectHistory.present, selectedSubjectHistory.total).toFixed(2)}%
                    </Typography>
                  </Box>
                ) : (
                  subjectLogs.map((log) => (
                    <Box
                      key={log.id}
                      sx={{
                        p: 1.75, borderRadius: '14px', bgcolor: 'rgba(148,163,184,.1)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          width: 34, height: 34, borderRadius: '10px', display: 'grid', placeItems: 'center',
                          bgcolor: log.status === 'present' ? 'rgba(16,185,129,.18)' : 'rgba(244,63,94,.18)',
                          color: log.status === 'present' ? '#10b981' : '#f43f5e'
                        }}>
                          {log.status === 'present' ? <MdCheckCircle size={20} /> : <MdCancel size={20} />}
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {log.date}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Status: <strong style={{ color: log.status === 'present' ? '#10b981' : '#f43f5e' }}>{log.status.toUpperCase()}</strong> {log.auto ? '(Auto-logged)' : ''}
                          </Typography>
                        </Box>
                      </Box>
                      {isUnlocked && (
                        <IconButton size="small" onClick={() => deleteHistoryEntry(log.id)} sx={{ color: 'text.secondary', opacity: .7, '&:hover': { color: '#f43f5e' } }}>
                          <MdDelete size={16} />
                        </IconButton>
                      )}
                    </Box>
                  ))
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setSelectedSubjectHistory(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── Bunked Classes Log & History Manager Modal ── */}
      <Dialog open={bunkDialogOpen} onClose={() => setBunkDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '22px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          🚪 Bunked Classes Tracker
        </DialogTitle>
        <Box sx={{ px: 3 }}>
          <Tabs value={bunkTab} onChange={(_, v) => setBunkTab(v)} sx={{ mb: 2 }}>
            <Tab label="Log New Bunk" sx={{ fontWeight: 700, textTransform: 'none' }} />
            <Tab label={`Bunk History (${bunks.length})`} sx={{ fontWeight: 700, textTransform: 'none' }} />
          </Tabs>
        </Box>

        <DialogContent sx={{ pt: 0 }}>
          {bunkTab === 0 ? (
            <Box component="form" onSubmit={handleBunkSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Select the subject class you bunked for personal tracking.
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Select Bunked Subject</InputLabel>
                <Select
                  value={bunkSubjectId}
                  label="Select Bunked Subject"
                  onChange={(e) => setBunkSubjectId(e.target.value)}
                >
                  {subjects.map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.name} ({s.code})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Reason (Optional)"
                value={bunkReason}
                onChange={(e) => setBunkReason(e.target.value)}
                placeholder="e.g. Festival / Event / Sick / College Fest"
                fullWidth
                size="small"
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 320, overflowY: 'auto' }}>
              {bunks.length === 0 ? (
                <EmptyState icon="🚪" title="No bunks recorded" subtitle="Logged bunks will appear here with dates and reasons." />
              ) : (
                bunks.map((b) => (
                  <Box
                    key={b.id}
                    sx={{
                      p: 2, borderRadius: '14px', bgcolor: 'rgba(148,163,184,.1)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {b.subjectName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Reason: {b.reason} • Date: {b.date}
                      </Typography>
                    </Box>
                    {isUnlocked && (
                      <IconButton size="small" onClick={() => deleteBunkClass(b.id)} sx={{ color: '#f43f5e' }}>
                        <MdDelete size={18} />
                      </IconButton>
                    )}
                  </Box>
                ))
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setBunkDialogOpen(false)}>Close</Button>
          {bunkTab === 0 && (
            <Button
              variant="contained"
              onClick={handleBunkSubmit}
              disabled={!isUnlocked}
              sx={{ background: 'var(--aurora)', borderRadius: '10px', px: 3 }}
            >
              {isUnlocked ? 'Save Bunk Record' : 'Login Required 🔒'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}
