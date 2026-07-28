import React, { useState, useMemo } from 'react'
import { Box, Typography, Grid, TextField, InputAdornment, MenuItem, Fab } from '@mui/material'
import { FaSearch, FaPlus } from 'react-icons/fa'
import { useTheme } from '@mui/material/styles'
import SubjectCard from '../components/SubjectCard'
import EmptyState from '../components/EmptyState'
import AddSubjectDialog from '../components/AddSubjectDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAttendance } from '../context/AttendanceContext'
import { getPercentage, getStatus } from '../utils/attendanceUtils'

export default function Subjects() {
  const { subjects, markAttendance, addSubject, updateSubject, deleteSubject, isUnlocked, settings } = useAttendance()
  const theme = useTheme()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('name')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const filtered = useMemo(() => {
    let list = subjects.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
    )
    if (filter !== 'all') {
      list = list.filter((s) => getStatus(getPercentage(s.present, s.total)) === filter)
    }
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'attendance-desc') list = [...list].sort((a, b) => getPercentage(b.present, b.total) - getPercentage(a.present, a.total))
    if (sort === 'attendance-asc') list = [...list].sort((a, b) => getPercentage(a.present, a.total) - getPercentage(b.present, b.total))
    return list
  }, [subjects, search, filter, sort])

  const handleSave = (data) => {
    if (editing) updateSubject(editing.id, data)
    else addSubject(data)
    setEditing(null)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search subject or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><FaSearch size={13} /></InputAdornment> }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <TextField select size="small" label="Filter" value={filter} onChange={(e) => setFilter(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="safe">Safe</MenuItem>
          <MenuItem value="warning">Warning</MenuItem>
          <MenuItem value="critical">Critical</MenuItem>
        </TextField>
        <TextField select size="small" label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ minWidth: 170 }}>
          <MenuItem value="name">Name (A–Z)</MenuItem>
          <MenuItem value="attendance-desc">Attendance (High–Low)</MenuItem>
          <MenuItem value="attendance-asc">Attendance (Low–High)</MenuItem>
        </TextField>
      </Box>

      {filtered.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center', borderRadius: '24px', bgcolor: 'rgba(15,23,42,0.6)', border: '1px dashed rgba(167,139,250,0.4)', my: 3, backdropFilter: 'blur(12px)' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#fff' }}>
            📤 Upload Attendance Record for {settings?.semester || 'this Semester'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, maxWidth: 480, mx: 'auto', fontSize: '.88rem' }}>
            You haven't uploaded your college ERP marksheet or attendance record screenshot for <strong>{settings?.semester || 'this Semester'}</strong> yet. Upload it now to auto-parse all subjects!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/settings')}
            sx={{ background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)', borderRadius: '14px', fontWeight: 800, px: 3, py: 1.3, textTransform: 'none', boxShadow: '0 8px 24px rgba(167,139,250,0.35)' }}
          >
            📸 Upload ERP Marksheet in Onboarding Portal
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((s, i) => (
            <Grid item xs={12} sm={6} lg={4} key={s.id}>
              <SubjectCard
                subject={s}
                variant="full"
                delay={i * 0.04}
                onPresent={(id) => markAttendance(id, 'present')}
                onAbsent={(id) => markAttendance(id, 'absent')}
                onEdit={(subj) => { setEditing(subj); setDialogOpen(true); }}
                onDelete={(subj) => setToDelete(subj)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Fixed FAB Button in Bottom Right Corner */}
      {isUnlocked && (
        <Fab
          onClick={() => { setEditing(null); setDialogOpen(true); }}
          sx={{
            position: 'fixed', bottom: { xs: 78, md: 28 }, right: { xs: 20, md: 28 },
            zIndex: 30, background: theme.custom.aurora, color: '#fff',
            boxShadow: '0 8px 24px rgba(99,102,241,.4)'
          }}
        >
          <FaPlus size={18} />
        </Fab>
      )}

      <AddSubjectDialog
        open={dialogOpen}
        initialData={editing}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete subject?"
        message={`This will permanently remove "${toDelete?.name}" and all of its attendance history.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteSubject(toDelete.id)}
        onClose={() => setToDelete(null)}
      />
    </Box>
  )
}
