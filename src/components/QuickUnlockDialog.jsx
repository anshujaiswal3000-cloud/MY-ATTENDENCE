import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, InputAdornment, IconButton
} from '@mui/material'
import { MdLock, MdVisibility, MdVisibilityOff, MdVpnKey } from 'react-icons/md'
import { useAttendance } from '../context/AttendanceContext'

export default function QuickUnlockDialog({ open, onClose }) {
  const { unlockApp } = useAttendance()
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleUnlock = async () => {
    if (!password.trim()) return
    setLoading(true)
    const success = await unlockApp(password)
    setLoading(false)
    if (success) {
      setPassword('')
      onClose()
    }
  }

  const handleQuickDefault = async () => {
    setPassword('anshu123')
    setLoading(true)
    const success = await unlockApp('anshu123')
    setLoading(false)
    if (success) {
      setPassword('')
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          p: 1.5,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.92))',
          border: '1px solid rgba(99,102,241,0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'rgba(99,102,241,0.15)', color: '#818cf8', display: 'flex' }}>
          <MdLock size={32} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>
          Unlock Editing Mode 🔓
        </Typography>
        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '.78rem', textAlign: 'center' }}>
          App is currently in View-Only mode. Enter your Owner Password to make changes.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            type={showPass ? 'text' : 'password'}
            label="Owner Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPass(!showPass)} sx={{ color: '#94a3b8' }}>
                    {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            size="small"
            variant="text"
            startIcon={<MdVpnKey size={15} />}
            onClick={handleQuickDefault}
            sx={{ color: '#818cf8', fontSize: '.75rem', fontWeight: 700, textTransform: 'none', alignSelf: 'center' }}
          >
            Quick Unlock (anshu123)
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} sx={{ color: '#94a3b8', textTransform: 'none', fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={loading || !password.trim()}
          onClick={handleUnlock}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 800,
            px: 3
          }}
        >
          {loading ? 'Verifying...' : 'Unlock Now 🚀'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
