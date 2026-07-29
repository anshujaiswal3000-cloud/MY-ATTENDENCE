import React, { useMemo, useState } from 'react'
import {
  Box, Typography, TextField, MenuItem, IconButton, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select
} from '@mui/material'
import { FaTrash, FaCheck, FaTimes, FaPlusCircle, FaCalendarAlt } from 'react-icons/fa'
import GlassCard from '../components/GlassCard'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAttendance } from '../context/AttendanceContext'

/** Parse DD/MM/YYYY → Date object for sorting */
function parseDDMMYYYY(str) {
  if (!str) return new Date(0)
  const [d, m, y] = str.split('/')
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
}

/** Format DD/MM/YYYY → "Monday, 14 July 2026" */
function formatDateLabel(ddmmyyyy) {
  const dt = parseDDMMYYYY(ddmmyyyy)
  return dt.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

/** Today's date as DD/MM/YYYY */
function todayDDMMYYYY() {
  const n = new Date()
  return `${String(n.getDate()).padStart(2,'0')}/${String(n.getMonth()+1).padStart(2,'0')}/${n.getFullYear()}`
}

export default function History() {
  const { history, subjects, deleteHistoryEntry, markAttendance, isUnlocked, notify } = useAttendance()
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toDelete, setToDelete] = useState(null)

  // ── Manual Mark Dialog state ──
  const [manualOpen, setManualOpen] = useState(false)
  const [manualSubjectId, setManualSubjectId] = useState('')
  const [manualStatus, setManualStatus] = useState('present')
  const [manualDate, setManualDate] = useState(() => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`
  })

  const handleManualSubmit = () => {
    if (!manualSubjectId) { notify('Select a subject first!', 'warning'); return }
    if (!isUnlocked)  { notify('Login required 🔒', 'warning'); return }
    // Convert YYYY-MM-DD (HTML input) → DD/MM/YYYY
    const [y, m, d] = manualDate.split('-')
    const ddmmyyyy = `${d}/${m}/${y}`
    markAttendance(manualSubjectId, manualStatus, ddmmyyyy)
    setManualOpen(false)
    notify(`✅ Manual ${manualStatus} added for ${ddmmyyyy}`, 'success')
  }

  const filtered = useMemo(() => {
    return history.filter((h) =>
      (subjectFilter === 'all' || h.subjectId === subjectFilter) &&
      (statusFilter === 'all' || h.status === statusFilter)
    )
  }, [history, subjectFilter, statusFilter])

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach((h) => {
      map[h.date] = map[h.date] || []
      map[h.date].push(h)
    })
    // Sort by parsed date descending (latest first)
    return Object.entries(map).sort((a, b) => parseDDMMYYYY(b[0]) - parseDDMMYYYY(a[0]))
  }, [filtered])

  return (
    <Box>
      {/* ── Filters + Manual Mark Button Row ── */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField select size="small" label="Subject" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="all">All subjects</MenuItem>
          {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="present">Present</MenuItem>
          <MenuItem value="absent">Absent</MenuItem>
        </TextField>

        {/* Manual Mark with Date Button */}
        <Button
          onClick={() => setManualOpen(true)}
          startIcon={<FaCalendarAlt size={13} />}
          variant="outlined"
          size="small"
          sx={{
            ml: 'auto',
            borderRadius: '12px',
            borderColor: 'rgba(167,139,250,0.5)',
            color: '#a78bfa',
            fontWeight: 700,
            textTransform: 'none',
            px: 2,
            '&:hover': { borderColor: '#a78bfa', bgcolor: 'rgba(167,139,250,0.08)' }
          }}
        >
          + Manual Entry
        </Button>
      </Box>

      {/* ── Log Groups ── */}
      {grouped.length === 0 ? (
        <EmptyState icon="🗂️" title="No history yet" subtitle="Mark attendance from the Dashboard or Subjects page to build your log." />
      ) : (
        grouped.map(([date, entries]) => (
          <Box key={date} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.6, mb: 1.5, fontWeight: 700 }}>
              {formatDateLabel(date)}
            </Typography>
            <GlassCard sx={{ p: 1 }}>
              {entries.map((h, idx) => (
                <Box
                  key={h.id}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                    borderBottom: idx < entries.length - 1 ? '1px solid rgba(148,163,184,0.14)' : 'none',
                  }}
                >
                  <Chip
                    size="small"
                    icon={h.status === 'present' ? <FaCheck size={10} /> : <FaTimes size={10} />}
                    label={h.status === 'present' ? 'Present' : 'Absent'}
                    sx={{
                      bgcolor: h.status === 'present' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                      color: h.status === 'present' ? '#10b981' : '#f43f5e',
                      fontWeight: 600,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{h.subjectName}</Typography>
                    {h.isManual && (
                      <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 600, fontSize: '0.68rem' }}>
                        📝 Manual Entry
                      </Typography>
                    )}
                  </Box>
                  {h.increment > 1 && (
                    <Chip size="small" label={`+${h.increment}`} sx={{ bgcolor: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 700, fontSize: '0.7rem' }} />
                  )}
                  {/* Delete only this specific log */}
                  <IconButton
                    size="small"
                    color="error"
                    title="Delete only this log entry"
                    onClick={() => setToDelete(h)}
                    sx={{ '&:hover': { bgcolor: 'rgba(244,63,94,0.12)' } }}
                  >
                    <FaTrash size={13} />
                  </IconButton>
                </Box>
              ))}
            </GlassCard>
          </Box>
        ))
      )}

      {/* ── Delete Confirm Dialog ── */}
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this log entry?"
        message={`Only "${toDelete?.subjectName}" log for ${toDelete?.date} will be removed. All other subjects remain untouched.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => { deleteHistoryEntry(toDelete.id); setToDelete(null) }}
        onClose={() => setToDelete(null)}
      />

      {/* ── Manual Mark with Date Dialog ── */}
      <Dialog
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#0f172a', border: '1px solid rgba(167,139,250,0.25)',
            borderRadius: '20px', minWidth: 340, backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#f1f5f9', pb: 1 }}>
          📅 Manual Attendance Entry
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Add attendance for a past or custom date. It will appear in the history log with the selected date.
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: '#94a3b8' }}>Subject</InputLabel>
            <Select
              value={manualSubjectId}
              label="Subject"
              onChange={(e) => setManualSubjectId(e.target.value)}
              sx={{ color: '#f1f5f9' }}
            >
              {subjects.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: '#94a3b8' }}>Status</InputLabel>
            <Select
              value={manualStatus}
              label="Status"
              onChange={(e) => setManualStatus(e.target.value)}
              sx={{ color: '#f1f5f9' }}
            >
              <MenuItem value="present">✅ Present</MenuItem>
              <MenuItem value="absent">❌ Absent</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Date"
            type="date"
            size="small"
            fullWidth
            value={manualDate}
            onChange={(e) => setManualDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: new Date().toISOString().split('T')[0] }}
            sx={{ '& input': { color: '#f1f5f9' }, '& label': { color: '#94a3b8' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setManualOpen(false)} sx={{ color: '#94a3b8', textTransform: 'none' }}>Cancel</Button>
          <Button
            onClick={handleManualSubmit}
            variant="contained"
            disabled={!manualSubjectId}
            sx={{
              background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
              borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 3
            }}
          >
            Save Entry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
