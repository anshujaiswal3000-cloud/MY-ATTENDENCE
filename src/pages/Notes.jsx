import React, { useState } from 'react'
import {
  Box, Typography, Grid, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select,
  MenuItem, Chip, IconButton, InputAdornment, Checkbox
} from '@mui/material'
import { MdAdd, MdSearch, MdDelete, MdEvent, MdBookmark, MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md'
import GlassCard from '../components/GlassCard'
import EmptyState from '../components/EmptyState'
import { useAttendance } from '../context/AttendanceContext'

const CATEGORIES = ['General', 'Exam', 'Assignment', 'Lab', 'Important']

export default function Notes() {
  const { subjects, notes, addNote, toggleNoteComplete, deleteNote } = useAttendance()
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [dialogOpen, setDialogOpen] = useState(false)

  // New Note Form State
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '')
  const [category, setCategory] = useState('General')
  const [content, setContent] = useState('')

  const handleCreate = (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    const sub = subjects.find(s => s.id === subjectId)
    addNote({
      title,
      subjectId,
      subjectName: sub ? sub.name : 'General',
      category,
      content,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    })
    setTitle('')
    setContent('')
    setDialogOpen(false)
  }

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
    const matchesSubject = selectedSubject === 'all' || n.subjectId === selectedSubject
    const matchesCategory = categoryFilter === 'All' || n.category === categoryFilter
    return matchesSearch && matchesSubject && matchesCategory
  })

  return (
    <Box>
      {/* Header bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Subject Notes & Tasks</Typography>
          <Typography variant="body2" color="text.secondary">Manage lecture notes, assignments, and task completions</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<MdAdd />}
          onClick={() => setDialogOpen(true)}
          sx={{ background: 'var(--aurora)', borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 2.5, py: 1 }}
        >
          Add Note / Task
        </Button>
      </Box>

      {/* Filters row */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            placeholder="Search notes, assignments, or tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch size={20} style={{ opacity: 0.6 }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '14px' }
            }}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Subject</InputLabel>
            <Select
              value={selectedSubject}
              label="Filter by Subject"
              onChange={(e) => setSelectedSubject(e.target.value)}
              sx={{ borderRadius: '14px' }}
            >
              <MenuItem value="all">All Subjects</MenuItem>
              {subjects.map(s => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Category Pills Bar */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 3 }}>
        {['All', ...CATEGORIES].map((cat) => {
          const isSelected = (cat === 'All' && categoryFilter === 'All') || categoryFilter === cat
          return (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setCategoryFilter(cat)}
              sx={{
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '.75rem',
                cursor: 'pointer',
                bgcolor: isSelected ? 'var(--aurora)' : 'rgba(255,255,255,0.06)',
                color: isSelected ? '#fff' : 'text.primary',
                border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)'
              }}
            />
          )
        })}
      </Box>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No notes found"
          subtitle={search ? 'No notes match your search term.' : 'Click "Add Note / Task" to create your first note or task!'}
        />
      ) : (
        <Grid container spacing={2.5}>
          {filteredNotes.map((note, i) => (
            <Grid item xs={12} sm={6} md={4} key={note.id || i}>
              <GlassCard delay={i * 0.05} sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: note.completed ? 0.75 : 1 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip
                      icon={<MdBookmark size={12} />}
                      label={note.category}
                      size="small"
                      sx={{ fontSize: '.68rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,.18)', color: '#818cf8' }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" onClick={() => deleteNote(note.id)} sx={{ color: 'text.secondary', opacity: 0.7, '&:hover': { color: '#f43f5e', opacity: 1 } }}>
                        <MdDelete size={18} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Task Completion Toggle Row */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                    <IconButton size="small" onClick={() => toggleNoteComplete(note.id)} sx={{ color: note.completed ? '#10b981' : 'text.secondary', p: .5, mt: -.2 }}>
                      {note.completed ? <MdCheckCircle size={22} /> : <MdRadioButtonUnchecked size={22} />}
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3, textDecoration: note.completed ? 'line-through' : 'none', color: note.completed ? 'text.secondary' : 'text.primary' }}>
                      {note.title}
                    </Typography>
                  </Box>

                  <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700, display: 'block', mb: 1.5, ml: 3.8 }}>
                    📚 {note.subjectName}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85, whiteSpace: 'pre-wrap', lineHeight: 1.6, ml: 3.8, textDecoration: note.completed ? 'line-through' : 'none' }}>
                    {note.content}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: '1px solid rgba(148,163,184,.12)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: .8 }}>
                    <MdEvent size={14} style={{ opacity: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      {note.date}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => toggleNoteComplete(note.id)}
                    sx={{ textTransform: 'none', fontSize: '.72rem', fontWeight: 700, color: note.completed ? '#10b981' : 'text.secondary' }}
                  >
                    {note.completed ? 'Completed ✓' : 'Mark Done'}
                  </Button>
                </Box>
              </GlassCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Note Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add New Subject Note / Task</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Note / Task Title"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={subjectId}
                    label="Subject"
                    onChange={(e) => setSubjectId(e.target.value)}
                  >
                    {subjects.map(s => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    label="Category"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              label="Details / Task Instructions"
              fullWidth
              required
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter task details, assignment instructions, or lecture notes..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ background: 'var(--aurora)', borderRadius: '10px' }}>
            Save Task / Note
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
