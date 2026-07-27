import React, { useMemo, useState, useEffect } from 'react'
import { Box, Typography, Grid, Chip, LinearProgress, Button, Avatar, Divider } from '@mui/material'
import {
  MdCheckCircle, MdCancel, MdListAlt, MdEventAvailable,
  MdLocalFireDepartment, MdArrowForward, MdSchool,
  MdTrendingUp, MdTrendingDown, MdStar, MdWarning
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
  computeStreak,
  getPercentage,
  getHighestLowestAverage,
  STATUS_COLORS,
  getStatus,
} from '../utils/attendanceUtils'

export default function Dashboard() {
  const { subjects, history, markAttendance } = useAttendance()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t) }, [])

  // Live computed stats from real subject data
  const stats = useMemo(() => getOverallStats(subjects), [subjects])
  const streak = useMemo(() => computeStreak(history), [history])
  const bunkAdvice = useMemo(() => calculateBunkAdvice(stats.present, stats.total, 75), [stats])
  const { highest, lowest, average } = useMemo(() => getHighestLowestAverage(subjects), [subjects])
  const attendanceSafe = stats.percentage >= 75
  const attendanceExcellent = stats.percentage >= 90

  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'

  // Weekly trend bars (last 7 days from history)
  const weekly = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - i)); const key = date.toISOString().slice(0, 10)
    const logs = history.filter((entry) => entry.date === key)
    return logs.length ? Math.max(18, (logs.filter((entry) => entry.status === 'present').length / logs.length) * 100) : 20
  }), [history])

  // ALL subjects sorted by % descending
  const topSubjects = useMemo(() =>
    [...subjects].sort((a, b) => getPercentage(b.present, b.total) - getPercentage(a.present, a.total)),
    [subjects]
  )

  // Recent critical subjects (< 75%)
  const criticalSubjects = useMemo(() =>
    subjects.filter(s => s.total > 0 && getPercentage(s.present, s.total) < 75),
    [subjects]
  )

  return (
    <Box>
      {/* ── Hero Banner ── */}
      <GlassCard sx={{ p: { xs: 2.5, sm: 3.25 }, mb: 3 }}>
        <Box className="dashboard-hero" sx={{
          mx: { xs: -2.5, sm: -3.25 }, my: { xs: -2.5, sm: -3.25 },
          p: { xs: 2.5, sm: 3.5 }, borderRadius: '22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 2, minHeight: 160, position: 'relative', overflow: 'hidden'
        }}>
          {/* Background blur orbs */}
          <Box sx={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'rgba(99,102,241,.15)', filter: 'blur(40px)', top: -40, right: 60, pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(16,185,129,.12)', filter: 'blur(30px)', bottom: -20, left: 40, pointerEvents: 'none' }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="overline" sx={{ color: 'primary.light', letterSpacing: '.12em', fontWeight: 700, fontSize: '.68rem' }}>
              ATTENDANCE OVERVIEW
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: .25, letterSpacing: '-.02em' }}>
              {greeting}, Anshu 👋
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: .75, maxWidth: 380, lineHeight: 1.65 }}>
              {attendanceExcellent
                ? '🌟 Outstanding! Keep this momentum going all semester.'
                : attendanceSafe
                  ? 'You\'re on track. Stay consistent to finish strong.'
                  : '⚠️ Attendance is below target. Time to catch up!'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1.75, flexWrap: 'wrap' }}>
              {attendanceExcellent && <Chip icon={<MdStar />} label="Excellent attendance" size="small" sx={{ bgcolor: 'rgba(16,185,129,.18)', color: '#6ee7b7', fontWeight: 700, fontSize: '.7rem' }} />}
              {streak >= 5 && <Chip icon={<MdLocalFireDepartment />} label={`${streak}-class streak 🔥`} size="small" sx={{ bgcolor: 'rgba(251,146,60,.18)', color: '#fdba74', fontWeight: 700, fontSize: '.7rem' }} />}
              {criticalSubjects.length > 0 && <Chip icon={<MdWarning />} label={`${criticalSubjects.length} subject${criticalSubjects.length > 1 ? 's' : ''} below 75%`} size="small" sx={{ bgcolor: 'rgba(244,63,94,.18)', color: '#fb7185', fontWeight: 700, fontSize: '.7rem', cursor: 'pointer' }} onClick={() => navigate('/subjects')} />}
            </Box>
          </Box>
          <Box sx={{ position: 'relative', zIndex: 1, display: { xs: 'none', sm: 'flex' }, width: 76, height: 76, borderRadius: '24px', alignItems: 'center', justifyContent: 'center', background: 'var(--aurora)', color: '#fff', fontSize: 36, boxShadow: '0 16px 32px rgba(59,130,246,.28)' }}>
            <MdSchool />
          </Box>
        </Box>
      </GlassCard>

      {/* ── Main Stats Grid ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>

        {/* Aurora Gauge — Clean responsive layout (no text collision) */}
        <Grid item xs={12} lg={4}>
          <GlassCard sx={{ p: 2.75, height: '100%', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row', lg: 'column', xl: 'row' }, alignItems: 'center', gap: 2.5, width: '100%', justifyContent: 'center' }}>
              <AuroraGauge percentage={stats.percentage} label="Overall attendance" />
              <Box sx={{ width: '100%', flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, textAlign: { xs: 'center', sm: 'left', lg: 'center', xl: 'left' } }}>
                  Semester progress
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: .75 }}>
                  <Typography variant="body2" color="text.secondary">Present</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#10b981' }}>{stats.present}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: .75 }}>
                  <Typography variant="body2" color="text.secondary">Absent</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#f43f5e' }}>{stats.absent}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Total</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#3b82f6' }}>{stats.total}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(stats.percentage, 100)}
                  sx={{ height: 8, borderRadius: 8, bgcolor: 'rgba(148,163,184,.18)', mb: 1.5, '& .MuiLinearProgress-bar': { borderRadius: 8, background: 'var(--aurora)' } }}
                />
                <Box sx={{ textAlign: { xs: 'center', sm: 'left', lg: 'center', xl: 'left' } }}>
                  <Chip
                    size="small"
                    label={attendanceSafe ? '✅ On track' : '⚠️ Needs attention'}
                    sx={{ fontWeight: 700, fontSize: '.72rem', bgcolor: attendanceSafe ? 'rgba(16,185,129,.14)' : 'rgba(244,63,94,.14)', color: attendanceSafe ? '#34d399' : '#fb7185' }}
                  />
                </Box>
              </Box>
            </Box>
          </GlassCard>
        </Grid>

        {/* Right Stats */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={2.5}>
            {/* 4 Live Stat Cards */}
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={<MdCheckCircle />}
                label="Present"
                value={stats.present}
                description={`of ${stats.total} classes`}
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
            <Grid item xs={6} sm={3}>
              <GlassCard delay={.2} sx={{ p: 2.25, minHeight: 122 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff', background: attendanceSafe ? 'linear-gradient(135deg,#8b5cf6,#7c3aed)' : 'linear-gradient(135deg,#f59e0b,#d97706)', flexShrink: 0 }}>
                    <MdEventAvailable />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ opacity: 0.65 }} noWrap>
                      {attendanceSafe ? 'Can Bunk' : 'Must Attend'}
                    </Typography>
                    <Typography className="mono-num" variant="h5" sx={{ fontWeight: 700 }}>
                      {attendanceSafe ? bunkAdvice.canBunk : bunkAdvice.mustAttend}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.52, display: 'block', mt: 0.2 }} noWrap>
                      {attendanceSafe ? 'more classes safely' : 'classes to reach 75%'}
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>
            </Grid>

            {/* Weekly Trend */}
            <Grid item xs={12} sm={6}>
              <GlassCard delay={.25} sx={{ p: 2.5, minHeight: 132 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Weekly trend</Typography>
                    <Typography variant="caption" color="text.secondary">Your recent attendance rhythm</Typography>
                  </Box>
                </Box>
                <Box className="trend-bars" sx={{ mt: 1.25 }}>
                  {weekly.map((height, i) => <span key={i} style={{ height: `${height}%`, animationDelay: `${i * 45}ms` }} />)}
                </Box>
              </GlassCard>
            </Grid>

            {/* Streak */}
            <Grid item xs={12} sm={6}>
              <GlassCard delay={.3} sx={{ p: 2.5, minHeight: 132, display: 'flex', alignItems: 'center', gap: 1.75 }}>
                <Box sx={{ width: 52, height: 52, borderRadius: '18px', display: 'grid', placeItems: 'center', fontSize: 28, color: '#fb923c', bgcolor: 'rgba(249,115,22,.13)', animation: 'pulse 1.6s ease-in-out infinite', flexShrink: 0 }}>
                  <MdLocalFireDepartment />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Attendance streak</Typography>
                  <Typography className="mono-num" variant="h4" sx={{ fontWeight: 800, mt: .25, lineHeight: 1.1 }}>
                    {streak}
                    <Box component="span" sx={{ fontFamily: 'var(--font-body)', fontSize: '.8rem', fontWeight: 400, color: 'text.secondary', ml: .75 }}>
                      classes without absence
                    </Box>
                  </Typography>
                </Box>
              </GlassCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* ── Highest / Lowest cards ── */}
      {(highest || lowest) && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {highest && (
            <Grid item xs={12} sm={4}>
              <GlassCard delay={.35} sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 46, height: 46, borderRadius: '14px', display: 'grid', placeItems: 'center', fontSize: 22, color: '#fff', background: 'linear-gradient(135deg,#10b981,#059669)', flexShrink: 0 }}>
                    <MdTrendingUp />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Highest</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>{highest.name}</Typography>
                    <Typography className="mono-num" variant="h6" sx={{ fontWeight: 800, color: '#10b981', lineHeight: 1.1 }}>
                      {getPercentage(highest.present, highest.total).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>
            </Grid>
          )}
          {lowest && (
            <Grid item xs={12} sm={4}>
              <GlassCard delay={.4} sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 46, height: 46, borderRadius: '14px', display: 'grid', placeItems: 'center', fontSize: 22, color: '#fff', background: 'linear-gradient(135deg,#f43f5e,#e11d48)', flexShrink: 0 }}>
                    <MdTrendingDown />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Lowest</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>{lowest.name}</Typography>
                    <Typography className="mono-num" variant="h6" sx={{ fontWeight: 800, color: '#f43f5e', lineHeight: 1.1 }}>
                      {getPercentage(lowest.present, lowest.total).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>
            </Grid>
          )}
          {average > 0 && (
            <Grid item xs={12} sm={4}>
              <GlassCard delay={.45} sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 46, height: 46, borderRadius: '14px', display: 'grid', placeItems: 'center', fontSize: 22, color: '#fff', background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', flexShrink: 0 }}>
                    <MdStar />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Average</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>All subjects</Typography>
                    <Typography className="mono-num" variant="h6" sx={{ fontWeight: 800, color: '#a78bfa', lineHeight: 1.1 }}>
                      {average.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>
            </Grid>
          )}
        </Grid>
      )}

      {/* ── Subject Snapshot — live from real data ── */}
      {topSubjects.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Subject snapshot</Typography>
              <Typography variant="body2" color="text.secondary">Live attendance across all your courses</Typography>
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
                  <GlassCard delay={index * .05} sx={{ p: 2.25 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '.62rem', letterSpacing: '.06em' }}>
                          {subject.code || 'N/A'}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: .15, lineHeight: 1.25 }} noWrap>
                          {subject.name}
                        </Typography>
                      </Box>
                      {/* Live % badge */}
                      <Box sx={{
                        px: 1.25, py: .5, borderRadius: '10px', ml: 1, flexShrink: 0,
                        background: `${statusColor}22`, border: `1px solid ${statusColor}44`
                      }}>
                        <Typography className="mono-num" variant="body2" sx={{ fontWeight: 800, color: statusColor, fontSize: '.85rem' }}>
                          {pct.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>

                    {/* Progress bar */}
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, pct)}
                      sx={{ height: 7, borderRadius: 8, bgcolor: 'rgba(148,163,184,.14)', mb: 1.25, '& .MuiLinearProgress-bar': { borderRadius: 8, background: `linear-gradient(90deg, ${colorStart}, ${colorEnd})` } }}
                    />

                    {/* Stats row */}
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
                      <Chip
                        label={status === 'safe' ? 'Safe' : status === 'warning' ? 'Warning' : 'Critical'}
                        size="small"
                        sx={{ fontSize: '.62rem', fontWeight: 700, height: 20, bgcolor: `${statusColor}18`, color: statusColor }}
                      />
                    </Box>
                  </GlassCard>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}

      {/* ── Empty state if no subjects ── */}
      {subjects.length === 0 && !loading && (
        <EmptyState
          icon="📚"
          title="No subjects yet"
          subtitle="Add your subjects to start tracking attendance."
        />
      )}
    </Box>
  )
}
