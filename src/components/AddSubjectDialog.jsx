import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, Grid, Chip, Typography, IconButton, Divider,
} from '@mui/material'
import { FaPlus, FaTimes } from 'react-icons/fa'
import IconPicker from './IconPicker'
import ColorPicker from './ColorPicker'
import { WEEKDAYS } from '../utils/attendanceUtils'

const EMPTY_FORM = {
  name: '', code: '', faculty: '',
  icon: 'book', color: ['#3b82f6', '#8b5cf6'],
  present: 0, total: 0,
  timetable: [],
}

export default function AddSubjectDialog({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [slotDay, setSlotDay] = useState('Monday')
  const [slotTime, setSlotTime] = useState('09:00')

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM)
    }
  }, [open, initialData])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const addSlot = () => {
    setForm((f) => ({ ...f, timetable: [...f.timetable, { day: slotDay, time: slotTime }] }))
  }

  const removeSlot = (idx) => {
    setForm((f) => ({ ...f, timetable: f.timetable.filter((_, i) => i !== idx) }))
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim()) return
    onSave({
      ...form,
      present: Number(form.present) || 0,
      total: Number(form.total) || 0,
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '22px' } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{initialData ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField label="Subject Name" fullWidth value={form.name} onChange={set('name')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Subject Code" fullWidth value={form.code} onChange={set('code')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Faculty Name" fullWidth value={form.faculty} onChange={set('faculty')} />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Initial Present Classes" type="number" fullWidth
              value={form.present} onChange={set('present')} inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Initial Total Classes" type="number" fullWidth
              value={form.total} onChange={set('total')} inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>

        <IconPicker value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} />
        <ColorPicker value={form.color} onChange={(color) => setForm((f) => ({ ...f, color }))} />

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Timetable</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            <TextField
              select size="small" label="Day" value={slotDay}
              onChange={(e) => setSlotDay(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 130 }}
            >
              {WEEKDAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </TextField>
            <TextField
              size="small" label="Time" type="time" value={slotTime}
              onChange={(e) => setSlotTime(e.target.value)}
              sx={{ minWidth: 130 }}
            />
            <Button startIcon={<FaPlus size={11} />} onClick={addSlot} sx={{ borderRadius: '12px' }}>
              Add slot
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {form.timetable.length === 0 && (
              <Typography variant="caption" sx={{ opacity: 0.5 }}>No lecture slots added yet.</Typography>
            )}
            {form.timetable.map((slot, idx) => (
              <Chip
                key={idx}
                label={`${slot.day.slice(0, 3)} · ${slot.time}`}
                onDelete={() => removeSlot(idx)}
                deleteIcon={<FaTimes size={11} />}
                size="small"
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: '12px' }}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" sx={{ borderRadius: '12px', px: 3 }}>
          {initialData ? 'Save Changes' : 'Add Subject'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
