import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
  Button, MenuItem, Select, FormControl, InputLabel, TextField, IconButton, Alert
} from '@mui/material'
import { MdSwapHoriz, MdClose, MdCheckCircle, MdAutoAwesome } from 'react-icons/md'
import { useAttendance } from '../context/AttendanceContext'
import { triggerHaptic } from '../utils/hapticUtils'

export default function ProxyClassDialog({ open, onClose }) {
  const { subjects, markAttendance, updateSubject, pushToCloud, notify, isUnlocked, history, setHistory } = useAttendance()

  const [absentSubjId, setAbsentSubjId] = useState('')
  const [proxySubjId, setProxySubjId] = useState('')
  const [lecturesCount, setLecturesCount] = useState(1)
  const [reasonNote, setReasonNote] = useState('Teacher Absent — Proxy Class Taken')

  const activeSubjects = (subjects || []).filter(s => !s.isIgnored && s.code !== 'LIBRARY-2')

  const handleApplyProxy = () => {
    if (!isUnlocked) {
      return notify('Login required to make proxy changes 🔒', 'warning')
    }

    if (!absentSubjId || !proxySubjId) {
      return notify('Please select both Absent Subject and Substitute Subject!', 'warning')
    }

    if (absentSubjId === proxySubjId) {
      return notify('Absent subject and substitute subject must be different!', 'warning')
    }

    triggerHaptic([30, 50, 30])

    const absentSubj = activeSubjects.find(s => s.id === absentSubjId)
    const proxySubj = activeSubjects.find(s => s.id === proxySubjId)

    if (!proxySubj) return

    const count = parseInt(lecturesCount, 10) || 1

    // 1. Credit Present count to proxy subject
    const updatedProxy = {
      ...proxySubj,
      present: (proxySubj.present || 0) + count,
      total: (proxySubj.total || 0) + count
    }
    updateSubject(updatedProxy)

    // 2. Add log entry in history
    const dateFormatted = `${String(new Date().getDate()).padStart(2, '0')}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`
    const proxyLog = {
      id: `proxy_${Math.random().toString(36).slice(2, 10)}`,
      subjectId: proxySubj.id,
      subjectName: proxySubj.name,
      status: 'present',
      auto: false,
      proxySwap: true,
      absentSubjectName: absentSubj?.name || 'Absent Teacher',
      increment: count,
      date: dateFormatted,
      timestamp: Date.now()
    }

    // Push log entry into history
    setHistory(prev => [proxyLog, ...(prev || [])])

    // Push updated state immediately to MongoDB Atlas Cloud
    pushToCloud()

    notify(`🔄 Proxy Swap Applied! ${proxySubj.name} credited +${count} Present live in Cloud! ☁️`, 'success')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '12px', bgcolor: 'rgba(96,165,250,0.2)', color: '#60a5fa', display: 'grid', placeItems: 'center', fontSize: 20 }}>
            🔄
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Substitute / Proxy Class Swap
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <MdClose size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '.84rem' }}>
          If a professor is absent today, assign their slot to the substitute teacher taking proxy class to keep your cloud attendance 100% up to date live!
        </Typography>

        {/* 1. Absent Scheduled Subject */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Absent Scheduled Subject (Teacher Absent)</InputLabel>
          <Select
            value={absentSubjId}
            label="Absent Scheduled Subject (Teacher Absent)"
            onChange={(e) => setAbsentSubjId(e.target.value)}
            sx={{ borderRadius: '12px' }}
          >
            {activeSubjects.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                ❌ {s.name} ({s.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 2. Substitute Subject Taking Class */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Substitute Subject Taking Class (Proxy)</InputLabel>
          <Select
            value={proxySubjId}
            label="Substitute Subject Taking Class (Proxy)"
            onChange={(e) => setProxySubjId(e.target.value)}
            sx={{ borderRadius: '12px' }}
          >
            {activeSubjects.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                ✅ {s.name} ({s.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 3. Number of Lectures */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Number of Lectures Taken</InputLabel>
          <Select
            value={lecturesCount}
            label="Number of Lectures Taken"
            onChange={(e) => setLecturesCount(e.target.value)}
            sx={{ borderRadius: '12px' }}
          >
            <MenuItem value={1}>1 Class (+1 Present)</MenuItem>
            <MenuItem value={2}>2 Classes (+2 Present / Lab)</MenuItem>
            <MenuItem value={3}>3 Classes (+3 Present / Mass Proxy)</MenuItem>
          </Select>
        </FormControl>

        <Alert severity="info" sx={{ borderRadius: '12px', bgcolor: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', color: '#93c5fd', fontSize: '.78rem' }}>
          ✨ Credit will be added to substitute subject and synced live to MongoDB Atlas cloud!
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleApplyProxy}
          disabled={!isUnlocked}
          sx={{ background: 'var(--aurora)', borderRadius: '12px', fontWeight: 800 }}
        >
          {isUnlocked ? 'Apply Substitute Swap Live 🔄' : 'Login Required 🔒'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
