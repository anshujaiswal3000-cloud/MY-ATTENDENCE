import React, { useMemo, useState } from 'react'
import { Box, Typography, TextField, MenuItem, IconButton, Chip } from '@mui/material'
import { FaTrash, FaCheck, FaTimes } from 'react-icons/fa'
import GlassCard from '../components/GlassCard'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAttendance } from '../context/AttendanceContext'

export default function History() {
  const { history, subjects, deleteHistoryEntry } = useAttendance()
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toDelete, setToDelete] = useState(null)

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
    return Object.entries(map).sort((a, b) => new Date(b[0]) - new Date(a[0]))
  }, [filtered])

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <TextField select size="small" label="Subject" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="all">All subjects</MenuItem>
          {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="present">Present</MenuItem>
          <MenuItem value="absent">Absent</MenuItem>
        </TextField>
      </Box>

      {grouped.length === 0 ? (
        <EmptyState icon="🗂️" title="No history yet" subtitle="Mark attendance from the Dashboard or Subjects page to build your log." />
      ) : (
        grouped.map(([date, entries]) => (
          <Box key={date} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.6, mb: 1.5, fontWeight: 700 }}>
              {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                  <Typography variant="body2" sx={{ flex: 1, fontWeight: 600 }} noWrap>{h.subjectName}</Typography>
                  <Typography variant="caption" className="mono-num" sx={{ opacity: 0.6 }}>{h.time}</Typography>
                  <IconButton size="small" color="error" onClick={() => setToDelete(h)}>
                    <FaTrash size={13} />
                  </IconButton>
                </Box>
              ))}
            </GlassCard>
          </Box>
        ))
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this entry?"
        message="This will remove the log entry and reverse its effect on the subject's attendance count."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteHistoryEntry(toDelete.id)}
        onClose={() => setToDelete(null)}
      />
    </Box>
  )
}
