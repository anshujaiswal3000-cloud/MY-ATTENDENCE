import React, { useMemo, useState } from 'react'
import { Box, Typography, Grid, TextField, MenuItem, ToggleButtonGroup, ToggleButton } from '@mui/material'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import GlassCard from '../components/GlassCard'
import EmptyState from '../components/EmptyState'
import { useAttendance } from '../context/AttendanceContext'
import {
  getOverallStats, getPercentage, getHighestLowestAverage, calculateBunkAdvice,
} from '../utils/attendanceUtils'

const AURORA = ['#10b981', '#3b82f6', '#8b5cf6']

export default function Analytics() {
  const { subjects, history } = useAttendance()
  const [bunkSubjectId, setBunkSubjectId] = useState(subjects[0]?.id || '')
  const [target, setTarget] = useState(75)

  const stats = useMemo(() => getOverallStats(subjects), [subjects])
  const { highest, lowest, average } = useMemo(() => getHighestLowestAverage(subjects), [subjects])

  const pieData = [
    { name: 'Present', value: stats.present },
    { name: 'Absent', value: stats.absent },
  ]

  const barData = useMemo(
    () => subjects.map((s) => ({ name: s.code, pct: Number(getPercentage(s.present, s.total).toFixed(1)) })),
    [subjects]
  )

  const trendData = useMemo(() => {
    const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp)
    let present = 0
    let total = 0
    const byDate = {}
    sorted.forEach((h) => {
      total += 1
      if (h.status === 'present') present += 1
      byDate[h.date] = Number(((present / total) * 100).toFixed(2))
    })
    return Object.entries(byDate).map(([date, pct]) => ({ date: date.slice(5), pct }))
  }, [history])

  const bunkSubject = subjects.find((s) => s.id === bunkSubjectId)
  const bunkAdvice = bunkSubject
    ? calculateBunkAdvice(bunkSubject.present, bunkSubject.total, target)
    : null

  if (subjects.length === 0) {
    return <EmptyState icon="📊" title="Nothing to analyze yet" subtitle="Add subjects and mark attendance to unlock analytics." />
  }

  return (
    <Box>
      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={4}>
          <GlassCard sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ opacity: 0.65 }}>Highest Attendance</Typography>
            <Typography className="mono-num" variant="h5" sx={{ fontWeight: 700, color: '#10b981' }}>
              {highest ? `${highest.pct.toFixed(1)}%` : '—'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.55 }} noWrap>{highest?.name || 'No data'}</Typography>
          </GlassCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <GlassCard delay={0.05} sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ opacity: 0.65 }}>Lowest Attendance</Typography>
            <Typography className="mono-num" variant="h5" sx={{ fontWeight: 700, color: '#f43f5e' }}>
              {lowest ? `${lowest.pct.toFixed(1)}%` : '—'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.55 }} noWrap>{lowest?.name || 'No data'}</Typography>
          </GlassCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <GlassCard delay={0.1} sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ opacity: 0.65 }}>Average Attendance</Typography>
            <Typography className="mono-num" variant="h5" sx={{ fontWeight: 700, color: '#3b82f6' }}>
              {average.toFixed(1)}%
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.55 }}>Across {subjects.length} subjects</Typography>
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={5}>
          <GlassCard delay={0.1} sx={{ p: 3, height: 340 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Present vs Absent</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4} animationDuration={900}>
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>
        </Grid>

        <Grid item xs={12} md={7}>
          <GlassCard delay={0.15} sx={{ p: 3, height: 340 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Subject-wise Attendance %</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="pct" radius={[8, 8, 0, 0]} animationDuration={900}>
                  {barData.map((_, i) => <Cell key={i} fill={AURORA[i % AURORA.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </Grid>

        <Grid item xs={12}>
          <GlassCard delay={0.2} sx={{ p: 3, height: 320 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Attendance Trend</Typography>
            {trendData.length === 0 ? (
              <EmptyState icon="📈" title="Not enough data yet" subtitle="Trend appears once you start marking attendance." />
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="pct" stroke="#8b5cf6" strokeWidth={3} dot={false} animationDuration={900} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Can I Bunk?</Typography>
        <GlassCard sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Subject" value={bunkSubjectId} onChange={(e) => setBunkSubjectId(e.target.value)}>
                {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ opacity: 0.65, display: 'block', mb: 1 }}>Target attendance</Typography>
              <ToggleButtonGroup exclusive value={target} onChange={(_, v) => v !== null && setTarget(v)} size="small">
                {[75, 80, 85, 90].map((t) => (
                  <ToggleButton key={t} value={t} sx={{ fontWeight: 600, px: 2 }}>{t}%</ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
          </Grid>

          {bunkSubject && (
            <Box
              sx={{
                p: 2.5, borderRadius: '16px',
                background: 'var(--aurora-soft)',
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {bunkAdvice.message}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.65 }}>
                Current: {getPercentage(bunkSubject.present, bunkSubject.total).toFixed(2)}% ({bunkSubject.present}/{bunkSubject.total})
              </Typography>
            </Box>
          )}
        </GlassCard>
      </Box>
    </Box>
  )
}
