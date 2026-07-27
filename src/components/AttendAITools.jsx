import React, { useState, useMemo } from 'react'
import {
  Box, Typography, TextField, Button, Chip, Grid, Divider, Alert, LinearProgress
} from '@mui/material'
import {
  MdSmartToy, MdSend, MdTrendingUp, MdDoorBack, MdCheckCircle,
  MdWarning, MdFunctions, MdAnalytics, MdLibraryBooks, MdAutoAwesome
} from 'react-icons/md'
import GlassCard from './GlassCard'
import { useAttendance } from '../context/AttendanceContext'
import { getOverallStats, getPercentage, calculateBunkAdvice } from '../utils/attendanceUtils'
import { triggerHaptic } from '../utils/hapticUtils'

export default function AttendAITools() {
  const { subjects, history, bunks, settings } = useAttendance()
  const activeSemester = settings?.semester || 'Semester 3'
  const targetGoal = settings?.targetPercentage || 75

  const stats = useMemo(() => getOverallStats(subjects), [subjects])

  // Custom Query State
  const [query, setQuery] = useState('')
  const [aiResponse, setAiResponse] = useState(null)
  const [loadingAi, setLoadingAi] = useState(false)

  // Live Subject Analytics Breakdown (0 Fake Data)
  const subjectAnalytics = useMemo(() => {
    return subjects.map((sub) => {
      const pct = getPercentage(sub.present, sub.total)
      const advice = calculateBunkAdvice(sub.present, sub.total, targetGoal)
      
      // Calculate how many continuous classes to attend to reach targetGoal
      let requiredLectures = 0
      if (!sub.isIgnored && pct < targetGoal) {
        let p = sub.present
        let t = sub.total
        while (t > 0 && (p / t) * 100 < targetGoal && requiredLectures < 50) {
          p += 1
          t += 1
          requiredLectures += 1
        }
      }

      // Calculate how many continuous classes can be bunked while staying above targetGoal
      let safeBunks = 0
      if (!sub.isIgnored && pct >= targetGoal) {
        let p = sub.present
        let t = sub.total
        while (t > 0 && (p / (t + 1)) * 100 >= targetGoal && safeBunks < 50) {
          t += 1
          safeBunks += 1
        }
      }

      return {
        ...sub,
        pct,
        advice,
        requiredLectures,
        safeBunks
      }
    })
  }, [subjects, targetGoal])

  // Library Classes Tracker
  const librarySubjects = useMemo(() => {
    return subjects.filter((s) => s.isIgnored || s.code === 'LIBRARY-2' || s.name.toLowerCase().includes('library'))
  }, [subjects])

  const libraryTotalSessions = useMemo(() => {
    return librarySubjects.reduce((acc, curr) => acc + (curr.total || 0), 0)
  }, [librarySubjects])

  const libraryPresentSessions = useMemo(() => {
    return librarySubjects.reduce((acc, curr) => acc + (curr.present || 0), 0)
  }, [librarySubjects])

  // Handle AI Assistant Prompt Query
  const handleAiAsk = (e) => {
    e?.preventDefault()
    if (!query.trim()) return

    triggerHaptic(20)
    setLoadingAi(true)

    setTimeout(() => {
      const q = query.toLowerCase()
      let answer = ''

      if (q.includes('bunk') || q.includes('miss') || q.includes('absent')) {
        const safeSubj = subjectAnalytics.filter(s => !s.isIgnored && s.safeBunks > 0)
        if (safeSubj.length > 0) {
          answer = `🤖 **AttendAI Bunk Analysis**: Aap in subjects mein safely bunk kar sakte ho: ${safeSubj.map(s => `${s.name} (${s.safeBunks} classes)`).join(', ')} while keeping attendance above ${targetGoal}%!`
        } else {
          answer = `🤖 **AttendAI Warning**: Abhi kisi subject mein extra bunk safe nahi hai. Current attendance ${stats.percentage.toFixed(1)}% hai, target goal ${targetGoal}% tak pahocho!`
        }
      } else if (q.includes('target') || q.includes('75') || q.includes('80') || q.includes('reach')) {
        const lowSubj = subjectAnalytics.filter(s => !s.isIgnored && s.requiredLectures > 0)
        if (lowSubj.length > 0) {
          answer = `🤖 **AttendAI Goal Predictor**: Target ${targetGoal}% hit karne ke liye in classes ko continuously attend karo: ${lowSubj.map(s => `${s.name} (+${s.requiredLectures} lectures)`).join(', ')}!`
        } else {
          answer = `🤖 **AttendAI Celebration**: Woohoo! Aapke saare subjects already ${targetGoal}% Target Goal ke upar hain!`
        }
      } else if (q.includes('library')) {
        answer = `📚 **Library Attendance Summary**: Abhi tak total **${libraryTotalSessions} Library Sessions** record huye hain (${libraryPresentSessions} Attended) across ${librarySubjects.length} library slots.`
      } else {
        answer = `🤖 **AttendAI Live Overview**: Total Attendance ${stats.percentage.toFixed(1)}% (${stats.present}/${stats.total} lectures) in ${activeSemester}. Overall Status: ${stats.percentage >= targetGoal ? '✅ On Track' : '⚠️ Warning Area'}.`
      }

      setAiResponse(answer)
      setLoadingAi(false)
    }, 400)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* 🤖 AttendAI Smart Natural Assistant Card 🤖 */}
      <GlassCard sx={{ p: 3, border: '1px solid rgba(99,102,241,0.4)', background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(99,102,241,0.2)', color: '#818cf8', display: 'grid', placeItems: 'center', fontSize: 24 }}>
            <MdSmartToy />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              AttendAI Real-Time Assistant
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ask AI about safe bunks, target goals, or attendance predictions using real cloud data
            </Typography>
          </Box>
        </Box>

        {/* Quick Suggestion Chips */}
        <Box sx={{ display: 'flex', gap: 1, my: 1.5, flexWrap: 'wrap' }}>
          {[
            'Kin-kin subjects mein safe bunks hain?',
            '75% target pahochnay ke liye kitni classes chahiye?',
            'Library classes count kitne hue hain?'
          ].map((prompt) => (
            <Chip
              key={prompt}
              label={prompt}
              size="small"
              onClick={() => {
                setQuery(prompt)
                setAiResponse(null)
              }}
              sx={{ fontSize: '.7rem', fontWeight: 700, bgcolor: 'rgba(148,163,184,0.12)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(99,102,241,0.2)' } }}
            />
          ))}
        </Box>

        {/* Search / Ask Input */}
        <Box component="form" onSubmit={handleAiAsk} sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask AttendAI anything about your attendance..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loadingAi || !query.trim()}
            sx={{ background: 'var(--aurora)', borderRadius: '12px', px: 2.5, flexShrink: 0 }}
          >
            {loadingAi ? 'Analyzing...' : <MdSend size={18} />}
          </Button>
        </Box>

        {/* AI Answer Box */}
        {aiResponse && (
          <Box sx={{ mt: 2, p: 2, borderRadius: '16px', bgcolor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#e0e7ff', lineHeight: 1.5 }}>
              {aiResponse}
            </Typography>
          </Box>
        )}
      </GlassCard>

      {/* 📚 Library Classes Counter & History Tracker 📚 */}
      <GlassCard sx={{ p: 3, border: '1px solid rgba(16,185,129,0.35)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: 'rgba(16,185,129,0.18)', color: '#34d399', display: 'grid', placeItems: 'center', fontSize: 22 }}>
              <MdLibraryBooks />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                Library Classes Cumulative Counter
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Track exact total library sessions held over 1-2 months
              </Typography>
            </Box>
          </Box>

          <Chip
            label={`${libraryTotalSessions} Total Sessions`}
            sx={{ fontWeight: 800, bgcolor: 'rgba(16,185,129,0.18)', color: '#34d399' }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={4}>
            <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                TOTAL HELD
              </Typography>
              <Typography className="mono-num" variant="h5" sx={{ fontWeight: 800, color: '#3b82f6' }}>
                {libraryTotalSessions}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                In {activeSemester}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                ATTENDED / PRESENT
              </Typography>
              <Typography className="mono-num" variant="h5" sx={{ fontWeight: 800, color: '#10b981' }}>
                {libraryPresentSessions}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Library Sessions
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                LIBRARY SUBJECTS
              </Typography>
              <Typography className="mono-num" variant="h5" sx={{ fontWeight: 800, color: '#a78bfa' }}>
                {librarySubjects.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Configured Slots
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </GlassCard>

      {/* 📊 Real-Time Bunk Predictor Matrix (0 Fake Data) 📊 */}
      <GlassCard sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MdAnalytics color="#60a5fa" size={20} /> Real-Time Bunk & Goal Predictor Matrix
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Live mathematical analysis calculated against your {targetGoal}% target goal
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {subjectAnalytics.filter(s => !s.isIgnored).map((s) => (
            <Box key={s.id} sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.12)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {s.name} ({s.code})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Present: {s.present}/{s.total} • Current: <strong>{s.pct.toFixed(1)}%</strong>
                  </Typography>
                </Box>
                <Chip
                  label={s.pct >= targetGoal ? `Safe (${s.pct.toFixed(1)}%)` : `Warning (${s.pct.toFixed(1)}%)`}
                  size="small"
                  sx={{
                    fontWeight: 800, fontSize: '.68rem',
                    bgcolor: s.pct >= targetGoal ? 'rgba(16,185,129,0.18)' : 'rgba(244,63,94,0.18)',
                    color: s.pct >= targetGoal ? '#34d399' : '#fb7185'
                  }}
                />
              </Box>

              {/* Status Message */}
              {s.pct >= targetGoal ? (
                <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700, display: 'block' }}>
                  ✓ You can safely bunk {s.safeBunks} class{s.safeBunks > 1 ? 'es' : ''} continuously while staying above {targetGoal}%!
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ color: '#fb7185', fontWeight: 700, display: 'block' }}>
                  ⚠️ Attend next {s.requiredLectures} continuous lecture{s.requiredLectures > 1 ? 's' : ''} to reach {targetGoal}% target goal!
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </GlassCard>

    </Box>
  )
}
