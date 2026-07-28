import React, { useState } from 'react'
import {
  Box, Typography, IconButton, Tooltip, Avatar, Popover,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, InputAdornment, Link
} from '@mui/material'
import { MdLightMode, MdDarkMode, MdLock, MdLockOpen, MdVerified, MdCloudDone, MdCloudOff, MdEmail, MdVpnKey } from 'react-icons/md'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { useThemeMode } from '../context/ThemeContext'
import { NAV_ITEMS } from '../data/navConfig'
import { useAttendance } from '../context/AttendanceContext'
import { getOverallStats } from '../utils/attendanceUtils'
import { triggerHaptic } from '../utils/hapticUtils'
import MascotProfileModal from './MascotProfileModal'

export default function Topbar() {
  const { mode, toggleMode } = useThemeMode()
  const theme = useTheme()
  const location = useLocation()
  const current = NAV_ITEMS.find((n) => n.path === location.pathname)
  const { subjects, isUnlocked, unlockApp, lockApp, bunks, dbSynced, notify } = useAttendance()
  const stats = getOverallStats(subjects)

  // Animated Mascot Celebration Profile Modal
  const [mascotModalOpen, setMascotModalOpen] = useState(false)

  const openProfile = () => {
    triggerHaptic([30, 50, 30])
    setMascotModalOpen(true)
  }

  // Login Dialog
  const [loginOpen, setLoginOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Forgot Password & OTP Dialog
  const [forgotOpen, setForgotOpen] = useState(false)
  const [otpStep, setOtpStep] = useState(1)
  const [email, setEmail] = useState('anshujaiswal3000@gmail.com')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [otpMsg, setOtpMsg] = useState('')
  const [otpError, setOtpError] = useState('')
  const [loadingOtp, setLoadingOtp] = useState(false)

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    const success = await unlockApp(userId, password)
    if (success) {
      setUserId('')
      setPassword('')
      setLoginOpen(false)
    } else {
      setLoginError('Invalid User ID or Password!')
    }
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setOtpError('')
    setOtpMsg('')
    setLoadingOtp(true)

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const json = await res.json()
      if (json.success) {
        setOtpStep(2)
        setOtpMsg(`6-Digit OTP sent to ${email}. Please check your Gmail Inbox / Spam folder.`)
        notify(`📧 6-Digit OTP sent to ${email}`, 'success')
      } else {
        setOtpError(json.message || 'Failed to send OTP')
      }
    } catch (err) {
      setOtpError('Network error — ensure backend server is running')
    } finally {
      setLoadingOtp(false)
    }
  }

  const handleVerifyOtpReset = async (e) => {
    e.preventDefault()
    setOtpError('')
    setOtpMsg('')
    setLoadingOtp(true)

    try {
      const res = await fetch('/api/auth/verify-otp-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode, newPassword })
      })
      const json = await res.json()
      if (json.success) {
        notify('Password reset successfully! Unlocking Owner Mode 🔓', 'success')
        await unlockApp('anshu', newPassword)
        setForgotOpen(false)
        setLoginOpen(false)
        setOtpStep(1)
        setOtpCode('')
        setNewPassword('')
      } else {
        setOtpError(json.message || 'Invalid OTP code. Please check your Gmail.')
      }
    } catch (err) {
      setOtpError('Network error during OTP verification')
    } finally {
      setLoadingOtp(false)
    }
  }

  const statusColor = stats.percentage >= 85 ? '#10b981' : stats.percentage >= 75 ? '#f59e0b' : '#f43f5e'

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>

        {/* Cloud Live Status Badge */}
        <Tooltip title={dbSynced ? "Live MongoDB Cloud Synced" : "Local Storage Mode"}>
          <Chip
            icon={dbSynced ? <MdCloudDone size={12} color="#10b981" /> : <MdCloudOff size={12} color="#f59e0b" />}
            label={dbSynced ? "Cloud Live" : "Local"}
            size="small"
            sx={{
              bgcolor: dbSynced ? 'rgba(16,185,129,.16)' : 'rgba(245,158,11,.16)',
              color: dbSynced ? '#10b981' : '#f59e0b',
              fontWeight: 700, fontSize: '.62rem', height: 20, px: .4
            }}
          />
        </Tooltip>

        {/* Dark / Light Toggle */}
        <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <IconButton onClick={() => {
            triggerHaptic(15)
            toggleMode()
          }} sx={{ borderRadius: '12px', width: 36, height: 36 }}>
            {mode === 'dark' ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
          </IconButton>
        </Tooltip>

        {/* 🌟 Profile Avatar with Live Attendance Badge (Triggers Opening Ball Mascot Modal) 🌟 */}
        <Tooltip title="Anshu Jaiswal (Profile Celebration)">
          <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={openProfile}>
            <Avatar
              src="/profile.jpg"
              alt="Anshu Jaiswal"
              sx={{
                width: 38, height: 38,
                border: '2px solid transparent',
                background: `linear-gradient(white, white) padding-box, var(--aurora) border-box`,
                boxShadow: '0 4px 14px rgba(99,102,241,.35)',
                transition: 'transform 200ms ease',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            />
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

        {/* 🤖 Animated 3D Mascot Celebration Modal 🤖 */}
        <MascotProfileModal
          open={mascotModalOpen}
          onClose={() => setMascotModalOpen(false)}
        />

        {/* 🔐 Owner Login Dialog 🔐 */}
        <Dialog open={loginOpen} onClose={() => setLoginOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '22px', p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>
            🔐 Owner Mode Login
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              Only Owner can edit attendance. Guests remain in View-Only Mode.
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
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                <Link
                  component="button"
                  type="button"
                  variant="caption"
                  underline="hover"
                  onClick={() => {
                    setLoginOpen(false)
                    setForgotOpen(true)
                  }}
                  sx={{ color: '#60a5fa', fontWeight: 700 }}
                >
                  Forgot Password? 🔑
                </Link>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
            <Button onClick={() => setLoginOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleLoginSubmit} sx={{ background: 'var(--aurora)', borderRadius: '10px', px: 3 }}>
              Login & Unlock
            </Button>
          </DialogActions>
        </Dialog>

        {/* 📧 Forgot Password & OTP Reset Dialog 📧 */}
        <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '22px', p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <MdEmail color="#60a5fa" /> Reset Password via Gmail OTP
          </DialogTitle>
          <DialogContent>
            {otpMsg && <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>{otpMsg}</Alert>}
            {otpError && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{otpError}</Alert>}

            {otpStep === 1 ? (
              <Box component="form" onSubmit={handleSendOtp} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Send a 6-digit OTP code to your Gmail inbox to reset your password.
                </Typography>
                <TextField
                  label="Registered Gmail Address"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Box>
            ) : (
              <Box component="form" onSubmit={handleVerifyOtpReset} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Enter the 6-digit OTP code received in your <strong>Gmail Inbox / Spam folder ({email})</strong>:
                </Typography>
                <TextField
                  label="6-Digit OTP Code"
                  placeholder="Check Gmail Inbox"
                  fullWidth
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
                <TextField
                  label="New Owner Password"
                  type={showNewPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                          {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
            <Button onClick={() => { setForgotOpen(false); setOtpStep(1); setOtpCode(''); }}>Cancel</Button>
            {otpStep === 1 ? (
              <Button
                variant="contained"
                onClick={handleSendOtp}
                disabled={loadingOtp}
                sx={{ background: 'var(--aurora)', borderRadius: '10px', px: 3 }}
              >
                {loadingOtp ? 'Sending OTP...' : 'Send OTP to Gmail'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleVerifyOtpReset}
                disabled={loadingOtp}
                sx={{ background: 'var(--aurora)', borderRadius: '10px', px: 3 }}
              >
                {loadingOtp ? 'Verifying...' : 'Verify & Reset Password'}
              </Button>
            )}
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  )
}
