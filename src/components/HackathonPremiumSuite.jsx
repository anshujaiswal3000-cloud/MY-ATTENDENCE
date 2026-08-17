import React, { useMemo, useState } from 'react'
import {
  Box, Typography, Grid, Chip, Button, TextField, MenuItem, Tooltip
} from '@mui/material'
import {
  MdAnalytics, MdEventAvailable, MdFlightTakeoff, MdWarning, MdCheckCircle,
  MdHelpOutline, MdCalendarToday, MdTrendingUp, MdPsychology, MdSchool
} from 'react-icons/md'
import GlassCard from './GlassCard'
import { useAttendance } from '../context/AttendanceContext'
import { getPercentage, isHolidaySaturday, isSunday } from '../utils/attendanceUtils'

/** Parse DD/MM/YYYY to Date */
function parseDDMMYYYY(str) {
  if (!str) return new Date(0)
  const [d, m, y] = str.split('/')
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
}

export default function HackathonPremiumSuite() {
  const { subjects, history } = useAttendance()

  // ── 1. TRIP PLANNER STATE ──
  const [tripStartDate, setTripStartDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })
  const [tripEndDate, setTripEndDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  })
  const [targetPct, setTargetPct] = useState(75)

  // ── HEATMAP DATA GENERATION (Last 60 Days Calendar Grid) ──
  const heatmapData = useMemo(() => {
    const days = []
    const today = new Date()

    // Map history entries by date string
    const historyMap = {}
    ;(history || []).forEach((h) => {
      historyMap[h.date] = historyMap[h.date] || []
      historyMap[h.date].push(h)
    })

    // Generate last 60 days
    for (let i = 59; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dayFormatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
      const entries = historyMap[dayFormatted] || []

      let status = 'empty' // no classes
      if (isSunday(d) || isHolidaySaturday(d)) {
        status = 'holiday'
      } else if (entries.length > 0) {
        const presents = entries.filter((e) => e.status === 'present').length
        const ratio = presents / entries.length
        if (ratio >= 0.8) status = 'great'
        else if (ratio >= 0.5) status = 'good'
        else status = 'poor'
      }

      days.push({
        dateStr: dayFormatted,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        status,
        entriesCount: entries.length,
      })
    }
    return days
  }, [history])

  // ── PREDICTIVE RADAR STATS ──
  const predictions = useMemo(() => {
    return subjects.map((subj) => {
      const currentPct = getPercentage(subj.present, subj.total)
      // Estimated remaining classes in semester (~15 lectures per subject)
      const remainingEst = 15
      const projectedTotal = subj.total + remainingEst

      // If user attends 80% of remaining lectures
      const projectedAttended80 = subj.present + Math.floor(remainingEst * 0.8)
      const projectedPct80 = (projectedAttended80 / projectedTotal) * 100

      // Classes needed to reach targetPct
      const neededTotal = Math.ceil((targetPct * projectedTotal) / 100)
      const neededRemaining = Math.max(0, neededTotal - subj.present)

      let riskLevel = 'safe' // safe | warning | danger
      if (currentPct < 65 || projectedPct80 < 70) riskLevel = 'danger'
      else if (currentPct < 75 || projectedPct80 < 78) riskLevel = 'warning'

      return {
        ...subj,
        currentPct,
        projectedPct80,
        neededRemaining,
        remainingEst,
        riskLevel,
      }
    })
  }, [subjects, targetPct])

  // ── SMART TRIP PLANNER CALCULATION ──
  const tripAnalysis = useMemo(() => {
    if (!tripStartDate || !tripEndDate) return null
    const start = new Date(tripStartDate)
    const end = new Date(tripEndDate)

    if (end < start) return { error: 'End date must be after start date.' }

    // Collect day names missed
    const missedDayNames = []
    let cur = new Date(start)
    while (cur <= end) {
      if (!isSunday(cur) && !isHolidaySaturday(cur)) {
        missedDayNames.push(cur.toLocaleDateString('en-US', { weekday: 'long' }))
      }
      cur.setDate(cur.getDate() + 1)
    }

    // Calculate missed lectures per subject
    const subjectImpact = subjects.map((s) => {
      let missedCount = 0
      ;(s.timetable || []).forEach((slot) => {
        if (missedDayNames.includes(slot.day)) {
          missedCount += s.isLab ? 2 : 1
        }
      })

      const currentPresent = s.present
      const currentTotal = s.total
      const newTotal = currentTotal + missedCount
      const newPct = (currentPresent / newTotal) * 100
      const currentPct = getPercentage(currentPresent, currentTotal)

      return {
        name: s.name,
        code: s.code,
        missedCount,
        currentPct,
        newPct,
        drop: currentPct - newPct,
        isSafeAfterTrip: newPct >= targetPct,
      }
    })

    const unsafeSubjects = subjectImpact.filter((i) => !i.isSafeAfterTrip)
    const isSafeOverall = unsafeSubjects.length === 0

    return {
      totalDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1,
      workingDaysMissed: missedDayNames.length,
      subjectImpact,
      unsafeSubjects,
      isSafeOverall,
    }
  }, [tripStartDate, tripEndDate, subjects, targetPct])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>

      {/* ─────────────────────────────────────────────────────────────
          1. GITHUB-STYLE SEMESTER ATTENDANCE HEATMAP
      ───────────────────────────────────────────────────────────── */}
      <GlassCard sx={{ p: 2.75, borderRadius: '24px', border: '1px solid rgba(16,185,129,0.3)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: '14px', bgcolor: 'rgba(16,185,129,0.18)', color: '#34d399', display: 'grid', placeItems: 'center', fontSize: 22 }}>
              🟩
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                Semester Attendance Activity Heatmap
              </Typography>
              <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700, fontSize: '.76rem' }}>
                GitHub-style daily visual tracker (Last 60 Days)
              </Typography>
            </Box>
          </Box>
          <Chip label="Live Tracker 🟢" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.18)', color: '#34d399', fontWeight: 800, fontSize: '.7rem' }} />
        </Box>

        {/* Heatmap Grid */}
        <Box sx={{ overflowX: 'auto', pb: 1, pt: 0.5 }}>
          <Box sx={{ display: 'flex', gap: 0.75, minWidth: 540, flexWrap: 'wrap' }}>
            {heatmapData.map((day, idx) => {
              let bg = 'rgba(255,255,255,0.06)'
              let border = '1px solid rgba(255,255,255,0.08)'

              if (day.status === 'great') { bg = '#10b981'; border = 'none' }
              else if (day.status === 'good') { bg = '#f59e0b'; border = 'none' }
              else if (day.status === 'poor') { bg = '#f43f5e'; border = 'none' }
              else if (day.status === 'holiday') { bg = 'rgba(96,165,250,0.25)'; border = '1px dashed rgba(96,165,250,0.5)' }

              return (
                <Tooltip
                  key={idx}
                  title={`${day.dateStr} (${day.dayName}): ${day.status === 'holiday' ? 'College Holiday 🏖️' : day.entriesCount > 0 ? `${day.entriesCount} classes logged` : 'No logs'}`}
                  arrow
                >
                  <Box
                    sx={{
                      width: 22, height: 22, borderRadius: '6px',
                      bgcolor: bg, border: border,
                      display: 'grid', placeItems: 'center',
                      fontSize: '0.62rem', fontWeight: 700, color: '#fff',
                      transition: 'transform 150ms ease',
                      '&:hover': { transform: 'scale(1.25)', zIndex: 2 }
                    }}
                  >
                    {day.dayNum}
                  </Box>
                </Tooltip>
              )
            })}
          </Box>
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', fontSize: '.72rem', color: '#94a3b8' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#10b981' }} />
            <span>High Attendance (≥80%)</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#f59e0b' }} />
            <span>Partial (50-79%)</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#f43f5e' }} />
            <span>Low / Bunked</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: 'rgba(96,165,250,0.3)', border: '1px dashed #60a5fa' }} />
            <span>Holiday</span>
          </Box>
        </Box>
      </GlassCard>

      {/* ─────────────────────────────────────────────────────────────
          2. PREDICTIVE RADAR & EXAM ELIGIBILITY FORECASTER
      ───────────────────────────────────────────────────────────── */}
      <GlassCard sx={{ p: 2.75, borderRadius: '24px', border: '1px solid rgba(139,92,246,0.35)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box sx={{ width: 42, height: 42, borderRadius: '14px', bgcolor: 'rgba(139,92,246,0.18)', color: '#c084fc', display: 'grid', placeItems: 'center', fontSize: 22 }}>
            🔮
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
              Predictive End-Sem Exam Eligibility Radar
            </Typography>
            <Typography variant="caption" sx={{ color: '#c084fc', fontWeight: 700, fontSize: '.76rem' }}>
              AI projection based on remaining lectures & target criteria ({targetPct}%)
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={1.75}>
          {predictions.map((pred) => {
            const isDanger = pred.riskLevel === 'danger'
            const isWarning = pred.riskLevel === 'warning'
            const statusColor = isDanger ? '#f43f5e' : isWarning ? '#f59e0b' : '#34d399'

            return (
              <Grid item xs={12} sm={6} md={4} key={pred.id}>
                <Box
                  sx={{
                    p: 2, borderRadius: '16px',
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${statusColor}44`,
                    height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }} noWrap>
                        {pred.code}
                      </Typography>
                      <Chip
                        label={isDanger ? 'Critical Risk ⚠️' : isWarning ? 'Watch Needed 👁️' : 'Eligible Safe ✅'}
                        size="small"
                        sx={{ fontSize: '.64rem', fontWeight: 800, bgcolor: `${statusColor}22`, color: statusColor }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 1.5 }} noWrap>
                      {pred.name}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Current:</Typography>
                      <Typography variant="caption" className="mono-num" sx={{ fontWeight: 800, color: '#fff' }}>
                        {pred.currentPct.toFixed(1)}% ({pred.present}/{pred.total})
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Forecast (80% attend):</Typography>
                      <Typography variant="caption" className="mono-num" sx={{ fontWeight: 800, color: statusColor }}>
                        {pred.projectedPct80.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <Typography variant="caption" sx={{ color: statusColor, fontWeight: 700, fontSize: '.72rem' }}>
                      {pred.neededRemaining > 0
                        ? `Must attend ${pred.neededRemaining} of next ~${pred.remainingEst} lectures to guarantee ${targetPct}%`
                        : `Target ${targetPct}% reached! Safe zone.`}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </GlassCard>

      {/* ─────────────────────────────────────────────────────────────
          3. SMART TRIP & LEAVE BUNK PLANNER
      ───────────────────────────────────────────────────────────── */}
      <GlassCard sx={{ p: 2.75, borderRadius: '24px', border: '1px solid rgba(56,189,248,0.35)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box sx={{ width: 42, height: 42, borderRadius: '14px', bgcolor: 'rgba(56,189,248,0.18)', color: '#38bdf8', display: 'grid', placeItems: 'center', fontSize: 22 }}>
            🏖️
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
              Smart Vacation & Trip Bunk Simulator
            </Typography>
            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, fontSize: '.76rem' }}>
              Simulate trip dates to check attendance drop before taking leave
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Trip Start Date"
              type="date"
              size="small"
              fullWidth
              value={tripStartDate}
              onChange={(e) => setTripStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& input': { color: '#f1f5f9' }, '& label': { color: '#94a3b8' } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Trip End Date"
              type="date"
              size="small"
              fullWidth
              value={tripEndDate}
              onChange={(e) => setTripEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& input': { color: '#f1f5f9' }, '& label': { color: '#94a3b8' } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              size="small"
              fullWidth
              label="Target Threshold"
              value={targetPct}
              onChange={(e) => setTargetPct(Number(e.target.value))}
              sx={{ '& label': { color: '#94a3b8' } }}
            >
              <MenuItem value={75}>75% Criteria (Mandatory)</MenuItem>
              <MenuItem value={80}>80% Criteria (Safe Target)</MenuItem>
              <MenuItem value={85}>85% Criteria (Scholarship Level)</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Simulator Results */}
        {tripAnalysis && (
          <Box>
            {tripAnalysis.error ? (
              <Typography variant="caption" sx={{ color: '#f43f5e' }}>{tripAnalysis.error}</Typography>
            ) : (
              <Box>
                <Box
                  sx={{
                    p: 2, borderRadius: '16px', mb: 2,
                    bgcolor: tripAnalysis.isSafeOverall ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                    border: `1px solid ${tripAnalysis.isSafeOverall ? '#10b981' : '#f43f5e'}`
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: tripAnalysis.isSafeOverall ? '#34d399' : '#f43f5e', mb: 0.5 }}>
                    {tripAnalysis.isSafeOverall
                      ? `✅ TRIP APPROVED! Safe to travel for ${tripAnalysis.totalDays} days (${tripAnalysis.workingDaysMissed} class days).`
                      : `⚠️ TRIP DANGER WARNING! Taking leave will drop ${tripAnalysis.unsafeSubjects.length} subject(s) below ${targetPct}%.`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                    Total days away: {tripAnalysis.totalDays} • Working class days missed: {tripAnalysis.workingDaysMissed}
                  </Typography>
                </Box>

                {/* Detailed Subject Impact Grid */}
                <Grid container spacing={1.5}>
                  {tripAnalysis.subjectImpact.map((item, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#fff' }}>{item.code}</Typography>
                          <Chip
                            label={item.missedCount === 0 ? 'No Classes Missed' : `Misses ${item.missedCount} class(es)`}
                            size="small"
                            sx={{ fontSize: '.62rem', fontWeight: 700, bgcolor: item.missedCount === 0 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: item.missedCount === 0 ? '#34d399' : '#fbbf24' }}
                          />
                        </Box>
                        <Typography variant="caption" className="mono-num" sx={{ display: 'block', color: item.isSafeAfterTrip ? '#34d399' : '#f43f5e', fontWeight: 700 }}>
                          {item.currentPct.toFixed(1)}% → {item.newPct.toFixed(1)}% ({item.drop > 0 ? `-${item.drop.toFixed(1)}%` : 'No drop'})
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </GlassCard>

    </Box>
  )
}
