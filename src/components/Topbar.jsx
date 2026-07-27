import React, { useState } from 'react'
import {
  Box, Typography, IconButton, Tooltip, Avatar, Popover,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert
} from '@mui/material'
import { MdLightMode, MdDarkMode, MdLock, MdLockOpen, MdVerified, MdCloudDone, MdCloudOff } from 'react-icons/md'
import confetti from 'canvas-confetti'
import { useLocation } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { useThemeMode } from '../context/ThemeContext'
import { NAV_ITEMS } from '../data/navConfig'
import { useAttendance } from '../context/AttendanceContext'
import { getOverallStats } from '../utils/attendanceUtils'

export default function Topbar() {
  const { mode, toggleMode } = useThemeMode()
  const theme = useTheme()
  const location = useLocation()
  const current = NAV_ITEMS.find((n) => n.path === location.pathname)
  const { subjects, isUnlocked, unlockApp, lockApp, bunks, dbSynced } = useAttendance()
  const stats = getOverallStats(subjects)

  // Profile popover
  const [anchorEl, setAnchorEl] = useState(null)

  const openProfile = (e) => {
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate([40, 60, 40])
    
    // 🎆 Fire Confetti / Fireworks Patakha Celebration if Attendance >= 90%!
    if (stats.percentage >= 90) {
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { x: 0.85, y: 0.12 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
        })
      } catch (err) {}
    }

    setAnchorEl(e.currentTarget)
  }

  const closeProfile = () => setAnchorEl(null)
  const profileOpen = Boolean(anchorEl)

  // Login Dialog
  const [loginOpen, setLoginOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    setLoginError('')
    const success = unlockApp(userId, password)
    if (success) {
      setUserId('')
      setPassword('')
      setLoginOpen(false)
    } else {
      setLoginError('Invalid User ID or Password. Try ID: anshu / Pass: 123456')
    }
  }

  const statusColor = stats.percentage >= 85 ? '#10b981' : stats.percentage >= 75 ? '#f59e0b' : '#f43f5e'
  const statusLabel = stats.percentage >= 85 ? 'Safe' : stats.percentage >= 75 ? 'Warning' : 'Critical'

  return (
    <Box
      sx={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: { xs: 2, md: 4 }, py: 1.5,
        backdropFilter: 'blur(16px)',
        background: theme.palette.mode === 'dark' ? 'rgba(11,17,32,0.65)' : 'rgba(242,245,251,0.75)',
        borderBottom: `1px solid ${theme.custom.glassBorder}`,
      }}
    >
      {/* Left: Page Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-.02em' }}>
          {current?.label || 'AttendX'}
        </Typography>
      </Box>

      {/* Right Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

        {/* MongoDB Cloud Sync Indicator */}
        <Tooltip title={dbSynced ? "Live MongoDB Cloud Synced (Phone & Laptop connected)" : "Local Storage Mode"}>
          <Chip
            icon={dbSynced ? <MdCloudDone size={14} color="#10b981" /> : <MdCloudOff size={14} color="#f59e0b" />}
            label={dbSynced ? "Cloud Live" : "Local"}
            size="small"
            sx={{
              bgcolor: dbSynced ? 'rgba(16,185,129,.16)' : 'rgba(245,158,11,.16)',
              color: dbSynced ? '#10b981' : '#f59e0b',
              fontWeight: 700, fontSize: '.68rem', px: .3
            }}
          />
        </Tooltip>

        {/* Lock / Unlock Toggle Button */}
        {isUnlocked ? (
          <Tooltip title="Owner Mode Active (Click to Lock)">
            <Chip
              icon={<MdLockOpen size={14} color="#34d399" />}
              label="Editing"
              onClick={() => {
                if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(20)
                lockApp()
              }}
              size="small"
              sx={{
                bgcolor: 'rgba(16,185,129,.16)', color: '#34d399', fontWeight: 700,
                fontSize: '.7rem', cursor: 'pointer', border: '1px solid rgba(16,185,129,.3)'
              }}
            />
          </Tooltip>
        ) : (
          <Tooltip title="View-Only Mode (Click to Login)">
            <Chip
              icon={<MdLock size={14} color="#60a5fa" />}
              label="Login"
              onClick={() => {
                if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(20)
                setLoginOpen(true)
              }}
              size="small"
              sx={{
                bgcolor: 'rgba(96,165,250,.16)', color: '#60a5fa', fontWeight: 700,
                fontSize: '.7rem', cursor: 'pointer', border: '1px solid rgba(96,165,250,.3)'
              }}
            />
          </Tooltip>
        )}

        {/* Dark / Light Toggle */}
        <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <IconButton onClick={() => {
            if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(15)
            toggleMode()
          }} sx={{ borderRadius: '12px' }}>
            {mode === 'dark' ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </IconButton>
        </Tooltip>

        {/* Profile Avatar with Live Attendance Badge */}
        <Tooltip title="Anshu Jaiswal (Profile)">
          <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={openProfile}>
            <Avatar
              src="/profile.jpg"
              alt="Anshu Jaiswal"
              sx={{
                width: 38, height: 38,
                border: '2px solid transparent',
                background: `linear-gradient(white, white) padding-box, var(--aurora) border-box`,
                boxShadow: '0 4px 14px rgba(99,102,241,.3)',
                transition: 'transform 200ms ease',
                '&:hover': { transform: 'scale(1.08)' }
              }}
            />
            {/* Live % Dot Indicator */}
            <Box
              sx={{
                position: 'absolute', bottom: -2, right: -2,
                width: 12, height: 12, borderRadius: '50%',
                bgcolor: statusColor, border: '2px solid #0b1120',
                boxShadow: `0 0 8px ${statusColor}`
              }}
            />
          </Box>
        </Tooltip>

        {/* Profile Popover */}
        <Popover
          open={profileOpen}
          anchorEl={anchorEl}
          onClose={closeProfile}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              mt: 1, borderRadius: '22px', minWidth: 260, p: 0, overflow: 'hidden',
              background: theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.custom.glassBorder}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2.25, display: 'flex', alignItems: 'center', gap: 1.75, background: 'var(--aurora)' }}>
            <Avatar src="/profile.jpg" alt="Anshu Jaiswal" sx={{ width: 48, height: 48, border: '2px solid #fff' }} />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
                <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '.95rem', lineHeight: 1.2 }}>
                  Anshu Jaiswal
                </Typography>
                <MdVerified size={15} color="#60a5fa" />
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.8)' }}>
                UCER CSE 2nd Year (Sec B)
              </Typography>
            </Box>
          </Box>

          {/* Live Stats */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Live Attendance
              </Typography>
              <Chip
                label={statusLabel}
                size="small"
                sx={{ fontSize: '.64rem', fontWeight: 700, height: 20, bgcolor: `${statusColor}18`, color: statusColor }}
              />
            </Box>
            <Typography className="mono-num" variant="h5" sx={{ fontWeight: 800, color: statusColor }}>
              {stats.percentage.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: .5 }}>
              {stats.present} present out of {stats.total} total lectures
            </Typography>
            <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 700, display: 'block', mt: .5 }}>
              🚪 Personal Bunks Logged: {bunks.length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700, display: 'block', mt: .2 }}>
              ☁️ MongoDB Cloud: {dbSynced ? 'Connected & Synced' : 'Connecting...'}
            </Typography>
          </Box>
        </Popover>

        {/* Owner Login Dialog */}
        <Dialog open={loginOpen} onClose={() => setLoginOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '22px', p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>
            🔐 Owner Login
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              Enter User ID & Password to unlock editing features.
            </Typography>
            {loginError && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{loginError}</Alert>}
            <Box component="form" onSubmit={handleLoginSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="User ID"
                placeholder="anshu"
                fullWidth
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                placeholder="123456"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
            <Button onClick={() => setLoginOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleLoginSubmit} sx={{ background: 'var(--aurora)', borderRadius: '10px', px: 3 }}>
              Login & Unlock
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}
