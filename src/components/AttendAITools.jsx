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

function findMatchingSubject(queryStr, subjectsList) {
  const q = queryStr.toLowerCase().trim()
  if (!q) return null

  // 1. Direct match on subject code or full name
  const exact = subjectsList.find(s => 
    s.name.toLowerCase() === q || (s.code && s.code.toLowerCase() === q)
  )
  if (exact) return exact

  // 2. Alias / Keyword match
  for (const s of subjectsList) {
    const name = s.name.toLowerCase()
    const code = (s.code || '').toLowerCase()

    if ((q.includes('digital') || q.includes('dld') || q.includes('electronic')) && (name.includes('digital') || code.includes('dld') || name.includes('electronic'))) {
      return s
    }
    if (q.includes('python') && name.includes('python')) {
      return s
    }
    if ((q.includes('computer organization') || q.includes(' co ') || q.endsWith(' co') || q.startsWith('co ')) && (name.includes('computer organization') || code.includes('co'))) {
      return s
    }
    if ((q.includes('math') || q.includes('m1') || q.includes('m2') || q.includes('m3')) && name.includes('math')) {
      return s
    }
    if ((q.includes('structure') || q.includes('dsa') || q.includes(' ds ')) && (name.includes('structure') || name.includes('ds'))) {
      return s
    }
    if ((q.includes('chem') || q.includes('chemistry')) && name.includes('chemistry')) {
      return s
    }
    if ((q.includes('physics') || q.includes('phy')) && name.includes('physics')) {
      return s
    }
  }

  // 3. Fallback token inclusion match
  const words = q.split(' ').filter(w => w.length > 2 && !['class', 'aaj', 'kal', 'toh', 'kitne', 'percent', 'attendance', 'ho', 'jayega', 'kru', 'na', 'kare', 'karein', 'karu', 'drop', 'miss', 'bunk', 'if', 'not'].includes(w))
  
  for (const w of words) {
    const match = subjectsList.find(s => s.name.toLowerCase().includes(w) || (s.code && s.code.toLowerCase().includes(w)))
    if (match) return match
  }

  return null
}

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

  // Ultra-Accurate Natural Language Simulation Handler
  const handleAiAsk = (e) => {
    e?.preventDefault()
    if (!query.trim()) return

    triggerHaptic(20)
    setLoadingAi(true)

    setTimeout(() => {
      const q = query.toLowerCase()
      const matchedSubject = findMatchingSubject(q, subjects)

      const isBunkAction = q.includes('na') || q.includes('nhi') || q.includes('bunk') || q.includes('miss') || q.includes('absent') || q.includes('chhod') || q.includes('skip') || q.includes('leave')

      if (matchedSubject) {
        const isLab = matchedSubject.isLab || matchedSubject.name.toLowerCase().includes('lab')
        const count = isLab ? 2 : 1

        if (isBunkAction) {
          // Bunk / Miss scenario calculation
          const newSubjP = matchedSubject.present
          const newSubjT = matchedSubject.total + count
          const curSubjPct = getPercentage(matchedSubject.present, matchedSubject.total)
          const newSubjPct = getPercentage(newSubjP, newSubjT)

          const newOverallP = stats.present
          const newOverallT = stats.total + count
          const newOverallPct = getPercentage(newOverallP, newOverallT)

          setAiResponse({
            type: 'simulation',
            subjectName: matchedSubject.name,
            action: 'bunk',
            curSubjPct,
            newSubjPct,
            newSubjP,
            newSubjT,
            curOverallPct: stats.percentage,
            newOverallPct,
            newOverallP,
            newOverallT,
            safe: newOverallPct >= targetGoal
          })
        } else {
          // Attend / Present scenario calculation
          const newSubjP = matchedSubject.present + count
          const newSubjT = matchedSubject.total + count
          const curSubjPct = getPercentage(matchedSubject.present, matchedSubject.total)
          const newSubjPct = getPercentage(newSubjP, newSubjT)

          const newOverallP = stats.present + count
          const newOverallT = stats.total + count
          const newOverallPct = getPercentage(newOverallP, newOverallT)

          setAiResponse({
            type: 'simulation',
            subjectName: matchedSubject.name,
            action: 'attend',
            curSubjPct,
            newSubjPct,
            newSubjP,
            newSubjT,
            curOverallPct: stats.percentage,
            newOverallPct,
            newOverallP,
            newOverallT,
            safe: newOverallPct >= targetGoal
          })
        }
      } else if (q.includes('bunk') || q.includes('miss') || q.includes('absent')) {
        const safeSubj = subjectAnalytics.filter(s => !s.isIgnored && s.safeBunks > 0)
        setAiResponse({
          type: 'text',
          content: safeSubj.length > 0
            ? `🤖 **AttendAI Bunk Analysis**: Aap in subjects mein safely bunk kar sakte ho: ${safeSubj.map(s => `${s.name} (${s.safeBunks} classes)`).join(', ')} while keeping attendance above ${targetGoal}%!`
            : `🤖 **AttendAI Warning**: Abhi kisi subject mein extra bunk safe nahi hai. Current attendance ${stats.percentage.toFixed(1)}% hai, target goal ${targetGoal}% tak pahocho!`
        })
      } else if (q.includes('target') || q.includes('75') || q.includes('80') || q.includes('reach')) {
        const lowSubj = subjectAnalytics.filter(s => !s.isIgnored && s.requiredLectures > 0)
        setAiResponse({
          type: 'text',
          content: lowSubj.length > 0
            ? `🤖 **AttendAI Goal Predictor**: Target ${targetGoal}% hit karne ke liye in classes ko continuously attend karo: ${lowSubj.map(s => `${s.name} (+${s.requiredLectures} lectures)`).join(', ')}!`
            : `🤖 **AttendAI Celebration**: Woohoo! Aapke saare subjects already ${targetGoal}% Target Goal ke upar hain!`
        })
      } else if (q.includes('library')) {
        setAiResponse({
          type: 'text',
          content: `📚 **Library Attendance Summary**: Abhi tak total **${libraryTotalSessions} Library Sessions** record huye hain (${libraryPresentSessions} Attended) across ${librarySubjects.length} library slots.`
        })
      } else {
        setAiResponse({
          type: 'text',
          content: `🤖 **AttendAI Live Overview**: Total Attendance ${stats.percentage.toFixed(1)}% (${stats.present}/${stats.total} lectures) in ${activeSemester}. Overall Status: ${stats.percentage >= targetGoal ? '✅ On Track' : '⚠️ Warning Area'}.`
        })
      }

      setLoadingAi(false)
    }, 300)
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
              AttendAI Real-Time Assistant & Predictor
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Poocho: "agr mai digital electronic ki class aaj na kru toh kitne % attendance ho jayega?"
            </Typography>
          </Box>
        </Box>

        {/* Quick Suggestion Chips */}
        <Box sx={{ display: 'flex', gap: 1, my: 1.5, flexWrap: 'wrap' }}>
          {[
            'agr mai digital electronic ki class aaj na kru toh kitne % attendance ho jayega?',
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
            placeholder="Ask anything in Hinglish or English..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loadingAi || !query.trim()}
            sx={{ background: 'var(--aurora)', borderRadius: '12px', px: 2.5, flexShrink: 0 }}
          >
            {loadingAi ? 'Calculating...' : <MdSend size={18} />}
          </Button>
        </Box>

        {/* AI Answer Box */}
        {aiResponse && (
          <Box sx={{ mt: 2, p: 2.25, borderRadius: '16px', bgcolor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)' }}>
            {aiResponse.type === 'simulation' ? (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#a5b4fc', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdAutoAwesome color="#34d399" /> AttendAI Real-Time Simulation Result
                </Typography>
                
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff', mb: 1.5 }}>
                  Agar aap aaj <strong>{aiResponse.subjectName}</strong> ki class {aiResponse.action === 'bunk' ? 'bunk karte hain (Absent)' : 'attend karte hain (Present)'}:
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                        SUBJECT ATTENDANCE ({aiResponse.subjectName})
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: .5 }}>
                        <Typography className="mono-num" variant="body2" sx={{ opacity: .6, textDecoration: 'line-through' }}>
                          {aiResponse.curSubjPct.toFixed(1)}%
                        </Typography>
                        <Typography className="mono-num" variant="h6" sx={{ fontWeight: 800, color: aiResponse.action === 'bunk' ? '#f43f5e' : '#34d399' }}>
                          ➔ {aiResponse.newSubjPct.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        ({aiResponse.newSubjP}/{aiResponse.newSubjT} lectures)
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                        OVERALL ATTENDANCE IMPACT
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: .5 }}>
                        <Typography className="mono-num" variant="body2" sx={{ opacity: .6, textDecoration: 'line-through' }}>
                          {aiResponse.curOverallPct.toFixed(1)}%
                        </Typography>
                        <Typography className="mono-num" variant="h6" sx={{ fontWeight: 800, color: aiResponse.safe ? '#34d399' : '#f43f5e' }}>
                          ➔ {aiResponse.newOverallPct.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        ({aiResponse.newOverallP}/{aiResponse.newOverallT} total lectures)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Chip
                  size="small"
                  label={aiResponse.safe ? `✅ Target Safe (≥ ${targetGoal}%)` : `⚠️ Target Warning (< ${targetGoal}%)`}
                  sx={{
                    mt: 1.5, fontWeight: 800, fontSize: '.72rem',
                    bgcolor: aiResponse.safe ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)',
                    color: aiResponse.safe ? '#34d399' : '#fb7185'
                  }}
                />
              </Box>
            ) : (
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#e0e7ff', lineHeight: 1.5 }}>
                {aiResponse.content}
              </Typography>
            )}
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
