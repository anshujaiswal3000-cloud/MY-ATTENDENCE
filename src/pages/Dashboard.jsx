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
  MdTimer, MdClass, MdCalendarToday, MdDelete, MdHistory, MdInfo
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

export default function Dashboard() {
  const {
    subjects, history, bunks, logBunkClass, deleteBunkClass, deleteHistoryEntry, timetableHeader
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

  const handleBunkSubmit = (e) => {
    e.preventDefault()
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

  // ALL subjects sorted by % descending
  const topSubjects = useMemo(() =>
    [...subjects].sort((a, b) => getPercentage(b.present, b.total) - getPercentage(a.present, a.total)),
    [subjects]
  )

  const criticalSubjects = useMemo(() =>
    subjects.filter(s => s.total > 0 && getPercentage(s.present, s.total) < 75),
    [subjects]
  )

  // ── Calculate Upcoming / Current Class Status ──
  const upcomingClass = useMemo(() => {
    const todaySlots = []
    subjects.forEach((s) => {
      ;(s.timetable || []).forEach((slot) => {
        if (slot.day === today) todaySlots.push({ subject: s, time: slot.time, period: slot.period })
      })
    })

    if (todaySlots.length > 0) {
      return { slot: todaySlots[0], dayLabel: `Today (${today})` }
    }

    const todayIdx = WEEKDAYS.indexOf(today)
    const nextDay = WEEKDAYS[(todayIdx + 1) % WEEKDAYS.length]
    const nextSlots = []
    subjects.forEach((s) => {
      ;(s.timetable || []).forEach((slot) => {
        if (slot.day === nextDay) nextSlots.push({ subject: s, time: slot.time, period: slot.period })
      })
    })

    if (nextSlots.length > 0) {
      return { slot: nextSlots[0], dayLabel: `Next Class (${nextDay})` }
    }

    return null
  }, [subjects, today])

  // Get date-wise logs for selected subject modal
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
          {/* Background blur orbs */}
          <Box sx={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'rgba(99,102,241,.15)', filter: 'blur(40px)', top: -40, right: 60, pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(16,185,129,.12)', filter: 'blur(30px)', bottom: -20, left: 40, pointerEvents: 'none' }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: .5, flexWrap: 'wrap' }}>
              <Typography variant="overline" sx={{ color: 'primary.light', letterSpacing: '.12em', fontWeight: 700, fontSize: '.68rem' }}>
                ATTENDANCE OVERVIEW
              </Typography>
              <Chip
                icon={<MdCalendarToday size={12} />}
                label={todayFormatted}
                size="small"
                sx={{ fontSize: '.68rem', fontWeight: 700, bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
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

      {/* ── Overall Attendance & Upcoming Class Grid ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>

        {/* Overall Attendance Widget */}
        <Grid item xs={12} md={5} lg={4}>
          <GlassCard sx={{ p: 2.75, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <AuroraGauge percentage={stats.percentage} label="Overall Attendance" />
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

        {/* Live Upcoming Class Status Card */}
        <Grid item xs={12} md={7} lg={8}>
          <GlassCard sx={{ p: 2.75, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdTimer size={22} color="#60a5fa" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Upcoming Class Status
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
            description="This semester"
            accent="#3b82f6"
            delay={.15}
          />
        </Grid>

        {/* Bunked Classes Logger Card */}
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
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Subject snapshot</Typography>
              <Typography variant="body2" color="text.secondary">Tap any subject to view date-wise attendance history</Typography>
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
                          {pct.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, pct)}
                      sx={{ height: 7, borderRadius: 8, bgcolor: 'rgba(148,163,184,.14)', mb: 1.25, '& .MuiLinearProgress-bar': { borderRadius: 8, background: `linear-gradient(90deg, ${colorStart}, ${colorEnd})` } }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                label={`${getPercentage(selectedSubjectHistory.present, selectedSubjectHistory.total).toFixed(1)}%`}
                sx={{ fontWeight: 800, bgcolor: 'rgba(16,185,129,.18)', color: '#10b981' }}
              />
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdHistory color="#60a5fa" /> Date-Wise Class History ({subjectLogs.length} entries)
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, maxHeight: 340, overflowY: 'auto' }}>
                {subjectLogs.length === 0 ? (
                  <EmptyState icon="📅" title="No history logs recorded" subtitle="Attendance logs will appear here date-wise as you mark classes." />
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
                      <IconButton size="small" onClick={() => deleteHistoryEntry(log.id)} sx={{ color: 'text.secondary', opacity: .7, '&:hover': { color: '#f43f5e' } }}>
                        <MdDelete size={16} />
                      </IconButton>
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
                    <IconButton size="small" onClick={() => deleteBunkClass(b.id)} sx={{ color: '#f43f5e' }}>
                      <MdDelete size={18} />
                    </IconButton>
                  </Box>
                ))
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setBunkDialogOpen(false)}>Close</Button>
          {bunkTab === 0 && (
            <Button variant="contained" onClick={handleBunkSubmit} sx={{ background: 'var(--aurora)', borderRadius: '10px', px: 3 }}>
              Save Bunk Record
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}
