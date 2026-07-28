import React, { useRef, useState } from 'react'
import {
  Box, Typography, Button, Switch, TextField, Grid, Chip,
  Divider, Alert, InputAdornment, IconButton
} from '@mui/material'
import {
  MdArrowBack, MdChevronRight, MdBackup, MdSettingsBackupRestore,
  MdLock, MdSchool, MdSecurity, MdAutoAwesome, MdPhonelinkRing,
  MdStorage, MdInsertDriveFile, MdLockOpen, MdVpnKey, MdMail, MdCheckCircle
} from 'react-icons/md'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import GlassCard from '../components/GlassCard'
import ConfirmDialog from '../components/ConfirmDialog'
import WhatsAppPDFSection from '../components/WhatsAppPDFSection'
import { useAttendance } from '../context/AttendanceContext'
import { readJSONFile } from '../utils/storageUtils'
import { triggerHaptic } from '../utils/hapticUtils'

export default function Settings() {
  const {
    subjects, history, bunks, notes, settings, setSettings,
    resetData, exportBackup, importBackup, pushToCloud, notify,
    isUnlocked, lockApp, unlockApp
  } = useAttendance()

  // Active Sub-Page View State (null = Main Menu, 'permissions' | 'reset-password' | 'reports' | 'semester' | 'engine' | 'security' | 'data')
  const [activeSubPage, setActiveSubPage] = useState(null)

  // Mode Unlock Form State
  const [unlockPasswordInput, setUnlockPasswordInput] = useState('')
  const [showUnlockPass, setShowUnlockPass] = useState(false)

  // OTP Forgot Password Reset Flow State (Step 1: Send/Verify OTP, Step 2: New Password)
  const [resetStep, setResetStep] = useState(1)
  const [targetEmail, setTargetEmail] = useState('anshujaiswal3000@gmail.com')
  const [otpInput, setOtpInput] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpMsg, setOtpMsg] = useState('')
  const [otpErr, setOtpErr] = useState('')
  const [resetNewPass, setResetNewPass] = useState('')
  const [resetConfirmPass, setResetConfirmPass] = useState('')
  const [showResetPass, setShowResetPass] = useState(false)

  // Security Form State
  const [oldUserId, setOldUserId] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newUserId, setNewUserId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [secMsg, setSecMsg] = useState('')
  const [secErr, setSecErr] = useState('')

  // Dialog State
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const fileInputRef = useRef(null)

  const activeSemester = settings?.semester || 'Semester 3'

  const handleOwnerUnlockSubmit = (e) => {
    e.preventDefault()
    if (!unlockPasswordInput.trim()) return
    triggerHaptic(20)
    const success = unlockApp(unlockPasswordInput)
    if (success) {
      triggerHaptic(40)
      setUnlockPasswordInput('')
      notify('Editing Mode Unlocked 🔓', 'success')
    } else {
      triggerHaptic([40, 60, 40])
      notify('Incorrect Owner Password ❌ — Try Forgot Password OTP Reset below', 'error')
    }
  }

  // OTP Send Code Handler
  const handleSendOtp = async () => {
    triggerHaptic(20)
    setOtpSending(true)
    setOtpMsg('')
    setOtpErr('')
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      })
      const json = await res.json()
      setOtpSending(false)
      if (json.success) {
        triggerHaptic(30)
        setOtpMsg(`6-Digit OTP code dispatched to ${targetEmail}! Check your Gmail inbox/spam.`)
      } else {
        triggerHaptic([40, 60, 40])
        setOtpErr(json.message || 'Failed to send OTP')
      }
    } catch (err) {
      setOtpSending(false)
      setOtpErr('Network error — ensure backend server is running.')
    }
  }

  // OTP Verification Step 1 Handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otpInput.trim()) return
    triggerHaptic(20)
    setOtpMsg('')
    setOtpErr('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, otp: otpInput })
      })
      const json = await res.json()
      if (json.success) {
        triggerHaptic(40)
        setOtpVerified(true)
        setResetStep(2)
        setOtpMsg('OTP Verified! Enter your new password below for User ID 21250770.')
      } else {
        triggerHaptic([40, 60, 40])
        setOtpErr(json.message || 'Incorrect OTP code')
      }
    } catch (err) {
      setOtpErr('Network error — try again.')
    }
  }

  // OTP Reset Password Step 2 Submission Handler
  const handleFinalPasswordReset = async (e) => {
    e.preventDefault()
    if (!resetNewPass || resetNewPass.length < 3) {
      return setOtpErr('Password must be at least 3 characters long.')
    }
    if (resetNewPass !== resetConfirmPass) {
      return setOtpErr('Passwords do not match! Please verify both fields.')
    }

    triggerHaptic(20)
    setOtpMsg('')
    setOtpErr('')
    try {
      const res = await fetch('/api/auth/verify-otp-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, otp: otpInput, newPassword: resetNewPass })
      })
      const json = await res.json()
      if (json.success) {
        triggerHaptic([50, 70, 50])
        unlockApp(resetNewPass)
        setOtpMsg('🎉 Password encrypted & saved to cloud! User ID: 21250770. Editing unlocked!')
        setResetNewPass('')
        setResetConfirmPass('')
        notify('🎉 Password updated in MongoDB Atlas Cloud! User ID: 21250770', 'success')
      } else {
        triggerHaptic([40, 60, 40])
        setOtpErr(json.message || 'Failed to save password')
      }
    } catch (err) {
      setOtpErr('Network error — failed to update password.')
    }
  }

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault()
    if (!isUnlocked) return notify('Login required to change credentials 🔒', 'warning')

    triggerHaptic(20)
    setSecMsg('')
    setSecErr('')
    try {
      const res = await fetch('/api/auth/change-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldUserId, oldPassword, newUserId: '21250770', newPassword })
      })
      const json = await res.json()
      if (json.success) {
        triggerHaptic(40)
        setSecMsg('Private User ID (21250770) & Password updated in MongoDB Atlas Cloud 🔒')
        setOldPassword('')
        setNewPassword('')
      } else {
        triggerHaptic([40, 60, 40])
        setSecErr(json.message || 'Failed to update credentials')
      }
    } catch (err) {
      setSecErr('Network error — ensure MongoDB server is connected')
    }
  }

  const handleBackup = () => {
    triggerHaptic(30)
    exportBackup()
  }

  const handleRestoreBackup = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    triggerHaptic(30)
    try {
      const data = await readJSONFile(file)
      importBackup(data)
    } catch (err) {
      notify('Failed to restore backup file', 'error')
    }
  }

  // ── MENU LIST CONFIGURATION ──
  const menuItems = [
    {
      id: 'permissions',
      icon: '🔑',
      color: isUnlocked ? '#34d399' : '#60a5fa',
      bg: isUnlocked ? 'rgba(16,185,129,0.18)' : 'rgba(96,165,250,0.18)',
      border: isUnlocked ? 'rgba(16,185,129,0.3)' : 'rgba(96,165,250,0.3)',
      title: 'App Mode & Permissions',
      subtitle: isUnlocked ? 'Status: Unlocked (Editing Mode 🔓)' : 'Status: View Only Mode (Locked 🔒)'
    },
    {
      id: 'reset-password',
      icon: '📩',
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.18)',
      border: 'rgba(167,139,250,0.3)',
      title: 'Forgot Password? Gmail OTP Reset',
      subtitle: 'Reset password via 6-Digit Gmail OTP (User ID: 21250770)'
    },
    {
      id: 'reports',
      icon: '📲',
      color: '#34d399',
      bg: 'rgba(16,185,129,0.18)',
      border: 'rgba(16,185,129,0.3)',
      title: '1-Click PDF Report & ATTIX WhatsApp Alerts',
      subtitle: 'Download PDF report & test WhatsApp alert (+91 9125469499)'
    },
    {
      id: 'semester',
      icon: '🎓',
      color: '#60a5fa',
      bg: 'rgba(96,165,250,0.18)',
      border: 'rgba(96,165,250,0.3)',
      title: 'Academic Semester Management',
      subtitle: `Active: ${activeSemester} • Switch Semester 1, 2, or 3 ERP data`
    },
    {
      id: 'engine',
      icon: '⚡',
      color: '#34d399',
      bg: 'rgba(16,185,129,0.18)',
      border: 'rgba(16,185,129,0.3)',
      title: '24/7 Autonomous Server Engine & Protection',
      subtitle: 'Auto-Attendance, Mass Bunk & Holiday Protection Guards'
    },
    {
      id: 'security',
      icon: '🔒',
      color: '#818cf8',
      bg: 'rgba(99,102,241,0.18)',
      border: 'rgba(99,102,241,0.3)',
      title: 'Owner Security Credentials & Password',
      subtitle: 'Update MongoDB Atlas Owner User ID (21250770) & Password'
    },
    {
      id: 'data',
      icon: '💾',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.18)',
      border: 'rgba(245,158,11,0.3)',
      title: 'Data Maintenance & JSON Backups',
      subtitle: 'Export JSON backup, restore files, or reset app state'
    }
  ]

  return (
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto', pb: 6, overflowX: 'hidden' }}>

      {/* ─────────────────────────────────────────────────────────────
          MAIN SETTINGS MENU PAGE (Native Mobile Settings Menu)
      ───────────────────────────────────────────────────────────── */}
      {!activeSubPage && (
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Settings & Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select any section below to open its dedicated management page
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {menuItems.map((item) => (
              <GlassCard
                key={item.id}
                onClick={() => {
                  triggerHaptic(20)
                  setActiveSubPage(item.id)
                }}
                sx={{
                  p: 2.25,
                  borderRadius: '22px',
                  cursor: 'pointer',
                  border: `1px solid ${item.border}`,
                  transition: 'all 200ms ease',
                  '&:hover': { transform: 'translateY(-2px)', bgcolor: item.bg }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                    <Box
                      sx={{
                        width: 46, height: 46, borderRadius: '16px',
                        bgcolor: item.bg, color: item.color,
                        display: 'grid', placeItems: 'center', fontSize: 24, flexShrink: 0
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', fontSize: '.96rem', lineHeight: 1.2 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '.76rem', display: 'block', mt: 0.25 }}>
                        {item.subtitle}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton size="small" sx={{ color: item.color, ml: 1, flexShrink: 0 }}>
                    <MdChevronRight size={26} />
                  </IconButton>
                </Box>
              </GlassCard>
            ))}
          </Box>
        </Box>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED SUB-PAGE: FORGOT PASSWORD GMAIL OTP RESET
      ───────────────────────────────────────────────────────────── */}
      {activeSubPage === 'reset-password' && (
        <Box>
          <Button
            startIcon={<MdArrowBack />}
            onClick={() => {
              triggerHaptic(15)
              setActiveSubPage(null)
            }}
            sx={{ mb: 2.5, color: '#60a5fa', fontWeight: 800, textTransform: 'none', fontSize: '.88rem' }}
          >
            Back to Settings
          </Button>

          <GlassCard sx={{ p: 2.75, borderRadius: '24px', border: '1px solid rgba(167,139,250,0.4)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(167,139,250,0.2)', color: '#a78bfa', display: 'grid', placeItems: 'center', fontSize: 24 }}>
                📩
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                  Gmail OTP Password Reset
                </Typography>
                <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 700, fontSize: '.78rem' }}>
                  Target User ID: <strong>21250770</strong> • Email: {targetEmail}
                </Typography>
              </Box>
            </Box>

            {otpMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{otpMsg}</Alert>}
            {otpErr && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{otpErr}</Alert>}

            {resetStep === 1 ? (
              /* Step 1: Send & Verify OTP */
              <form onSubmit={handleVerifyOtp}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                  <TextField
                    fullWidth
                    label="Owner Email Address"
                    size="small"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><MdMail color="#a78bfa" /></InputAdornment> }}
                  />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={handleSendOtp}
                      disabled={otpSending}
                      sx={{ borderRadius: '12px', color: '#a78bfa', borderColor: 'rgba(167,139,250,0.4)', fontWeight: 800, textTransform: 'none', px: 2 }}
                    >
                      {otpSending ? 'Sending OTP...' : 'Send OTP Code 📩'}
                    </Button>
                  </Box>

                  <TextField
                    fullWidth
                    label="Enter 6-Digit OTP Code"
                    size="small"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="e.g. 849201"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ background: 'var(--aurora)', borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none' }}
                  >
                    Verify OTP Code ✨
                  </Button>
                </Box>
              </form>
            ) : (
              /* Step 2: New Password & Encrypt to Cloud */
              <form onSubmit={handleFinalPasswordReset}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                  <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MdCheckCircle color="#34d399" size={20} />
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#34d399', fontSize: '.84rem' }}>
                      OTP Verified! User ID set to <strong>21250770</strong>
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Enter New Password"
                    size="small"
                    type={showResetPass ? 'text' : 'password'}
                    value={resetNewPass}
                    onChange={(e) => setResetNewPass(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowResetPass(!showResetPass)}>
                            {showResetPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    size="small"
                    type={showResetPass ? 'text' : 'password'}
                    value={resetConfirmPass}
                    onChange={(e) => setResetConfirmPass(e.target.value)}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)', borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none' }}
                  >
                    🔒 Encrypt & Save to Cloud
                  </Button>
                </Box>
              </form>
            )}
          </GlassCard>
        </Box>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED SUB-PAGE: APP MODE & PERMISSIONS (Editing / View Only)
      ───────────────────────────────────────────────────────────── */}
      {activeSubPage === 'permissions' && (
        <Box>
          <Button
            startIcon={<MdArrowBack />}
            onClick={() => {
              triggerHaptic(15)
              setActiveSubPage(null)
            }}
            sx={{ mb: 2.5, color: '#60a5fa', fontWeight: 800, textTransform: 'none', fontSize: '.88rem' }}
          >
            Back to Settings
          </Button>

          <GlassCard sx={{ p: 2.75, borderRadius: '24px', border: isUnlocked ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(96,165,250,0.4)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: isUnlocked ? 'rgba(16,185,129,0.2)' : 'rgba(96,165,250,0.2)', color: isUnlocked ? '#34d399' : '#60a5fa', display: 'grid', placeItems: 'center', fontSize: 24 }}>
                {isUnlocked ? <MdLockOpen size={26} /> : <MdLock size={26} />}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                  App Mode & Permissions
                </Typography>
                <Typography variant="caption" sx={{ color: isUnlocked ? '#34d399' : '#60a5fa', fontWeight: 700, fontSize: '.78rem' }}>
                  Current Status: <strong>{isUnlocked ? 'Unlocked (Editing Mode 🔓)' : 'Locked (View Only Mode 🔒)'}</strong>
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '.86rem', lineHeight: 1.5 }}>
              {isUnlocked
                ? 'Editing Mode is currently UNLOCKED. You have full owner permissions to edit subjects, mark attendance, and configure settings.'
                : 'Editing Mode is currently LOCKED in View Only mode. Enter your owner password to enable editing rights, or use Gmail OTP Reset below.'}
            </Typography>

            {isUnlocked ? (
              <Box sx={{ p: 2, borderRadius: '18px', bgcolor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Chip
                  icon={<MdLockOpen size={14} color="#34d399" />}
                  label="Editing Mode Active 🔓"
                  size="small"
                  sx={{ bgcolor: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: 800, fontSize: '.75rem', alignSelf: 'flex-start' }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  startIcon={<MdLock />}
                  onClick={() => {
                    triggerHaptic(20)
                    lockApp()
                    notify('Editing Mode Locked (Switched to View Only) 🔒', 'info')
                  }}
                  sx={{ borderRadius: '14px', py: 1.2, fontWeight: 800, textTransform: 'none' }}
                >
                  🔒 Lock Editing Mode (Switch to View Only)
                </Button>
              </Box>
            ) : (
              <form onSubmit={handleOwnerUnlockSubmit}>
                <Box sx={{ p: 2, borderRadius: '18px', bgcolor: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Chip
                    icon={<MdLock size={14} color="#60a5fa" />}
                    label="View Only Mode Active 🔒"
                    size="small"
                    sx={{ bgcolor: 'rgba(96,165,250,0.2)', color: '#60a5fa', fontWeight: 800, fontSize: '.75rem', alignSelf: 'flex-start' }}
                  />

                  <TextField
                    fullWidth
                    label="Enter Owner Password"
                    size="small"
                    type={showUnlockPass ? 'text' : 'password'}
                    value={unlockPasswordInput}
                    onChange={(e) => setUnlockPasswordInput(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowUnlockPass(!showUnlockPass)}>
                            {showUnlockPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    startIcon={<MdLockOpen />}
                    sx={{ background: 'var(--aurora)', borderRadius: '14px', py: 1.2, fontWeight: 800, textTransform: 'none' }}
                  >
                    🔓 Unlock Editing Mode (Owner Login)
                  </Button>

                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => {
                      triggerHaptic(15)
                      setActiveSubPage('reset-password')
                    }}
                    sx={{ color: '#a78bfa', fontWeight: 800, textTransform: 'none', fontSize: '.82rem' }}
                  >
                    🔑 Forgot Password? Reset via Gmail OTP
                  </Button>
                </Box>
              </form>
            )}
          </GlassCard>
        </Box>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED SUB-PAGE: 1-CLICK PDF REPORT & ATTIX ALERTS
      ───────────────────────────────────────────────────────────── */}
      {activeSubPage === 'reports' && (
        <Box>
          <Button
            startIcon={<MdArrowBack />}
            onClick={() => {
              triggerHaptic(15)
              setActiveSubPage(null)
            }}
            sx={{ mb: 2.5, color: '#60a5fa', fontWeight: 800, textTransform: 'none', fontSize: '.88rem' }}
          >
            Back to Settings
          </Button>

          <GlassCard sx={{ p: 2.75, borderRadius: '24px', border: '1px solid rgba(16,185,129,0.4)' }}>
            <WhatsAppPDFSection />
          </GlassCard>
        </Box>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED SUB-PAGE: ACADEMIC SEMESTER SELECTOR
      ───────────────────────────────────────────────────────────── */}
      {activeSubPage === 'semester' && (
        <Box>
          <Button
            startIcon={<MdArrowBack />}
            onClick={() => {
              triggerHaptic(15)
              setActiveSubPage(null)
            }}
            sx={{ mb: 2.5, color: '#60a5fa', fontWeight: 800, textTransform: 'none', fontSize: '.88rem' }}
          >
            Back to Settings
          </Button>

          <GlassCard sx={{ p: 2.75, borderRadius: '24px', border: '1px solid rgba(96,165,250,0.4)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(96,165,250,0.2)', color: '#60a5fa', display: 'grid', placeItems: 'center', fontSize: 24 }}>
                🎓
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                  Academic Semester Management
                </Typography>
                <Typography variant="caption" sx={{ color: '#93c5fd', fontWeight: 600, fontSize: '.78rem' }}>
                  Currently Active: <strong>{activeSemester}</strong>
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '.84rem' }}>
              Select a semester to instantly load its official ERP attendance history across Dashboard, Subjects, and PDF Reports:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              {[
                { id: 'Semester 1', label: 'Semester 1', subtitle: 'Load Semester 1 Official ERP Attendance Records' },
                { id: 'Semester 2', label: 'Semester 2', subtitle: 'Load Semester 2 Official ERP Attendance Records' },
                { id: 'Semester 3', label: 'Semester 3', subtitle: 'Load Semester 3 Active ERP Attendance Records' },
              ].map((sem) => {
                const isSelected = activeSemester === sem.id
                return (
                  <Box
                    key={sem.id}
                    onClick={() => {
                      triggerHaptic(20)
                      const updated = { ...settings, semester: sem.id }
                      setSettings(updated)
                      pushToCloud({ settings: updated })
                      notify(`Switched to ${sem.label} official attendance records!`, 'success')
                    }}
                    sx={{
                      p: 2.25, borderRadius: '18px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      border: isSelected ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
                      bgcolor: isSelected ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.03)',
                      transition: 'all 200ms ease',
                      '&:hover': { bgcolor: 'rgba(96,165,250,0.2)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 40, height: 40, borderRadius: '12px', display: 'grid', placeItems: 'center',
                        bgcolor: isSelected ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.08)',
                        color: isSelected ? '#60a5fa' : '#94a3b8', fontWeight: 800, fontSize: 18
                      }}>
                        🎓
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isSelected ? '#fff' : 'text.primary' }}>
                          {sem.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isSelected ? '#93c5fd' : '#94a3b8', fontSize: '.78rem' }}>
                          {sem.subtitle}
                        </Typography>
                      </Box>
                    </Box>
                    {isSelected && (
                      <Chip label="Active ✨" size="small" sx={{ bgcolor: 'var(--aurora)', color: '#fff', fontWeight: 800, fontSize: '.72rem' }} />
                    )}
                  </Box>
                )
              })}
            </Box>
          </GlassCard>
        </Box>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED SUB-PAGE: 24/7 AUTONOMOUS SERVER ENGINE
      ───────────────────────────────────────────────────────────── */}
      {activeSubPage === 'engine' && (
        <Box>
          <Button
            startIcon={<MdArrowBack />}
            onClick={() => {
              triggerHaptic(15)
              setActiveSubPage(null)
            }}
            sx={{ mb: 2.5, color: '#60a5fa', fontWeight: 800, textTransform: 'none', fontSize: '.88rem' }}
          >
            Back to Settings
          </Button>

          <GlassCard sx={{ p: 2.75, borderRadius: '24px', border: '1px solid rgba(16,185,129,0.4)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(16,185,129,0.2)', color: '#34d399', display: 'grid', placeItems: 'center', fontSize: 24 }}>
                ⚡
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                  24/7 Server Autonomous Engine
                </Typography>
                <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 600, fontSize: '.78rem' }}>
                  Runs 24/7 in IST timezone • Render Self-Pinger Keep-Alive Active
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Box sx={{ p: 2, borderRadius: '18px', bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }}>
                    24/7 Server Auto-Attendance Engine
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '.75rem' }}>
                    Automatically logs Present (+1) when class end minute is reached
                  </Typography>
                </Box>
                <Switch
                  checked={settings.serverAutoAttendanceEnabled !== false}
                  disabled={!isUnlocked}
                  onChange={(e) => {
                    triggerHaptic(20)
                    const updated = { ...settings, serverAutoAttendanceEnabled: e.target.checked }
                    setSettings(updated)
                    pushToCloud({ settings: updated })
                  }}
                />
              </Box>

              <Box sx={{ p: 2, borderRadius: '18px', bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }}>
                    Mass Bunk Protection Guard
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '.75rem' }}>
                    Pauses auto-logging when class has a declared mass bunk
                  </Typography>
                </Box>
                <Switch
                  checked={Boolean(settings.massBunkActive)}
                  disabled={!isUnlocked}
                  onChange={(e) => {
                    triggerHaptic(20)
                    const updated = { ...settings, massBunkActive: e.target.checked }
                    setSettings(updated)
                    pushToCloud({ settings: updated })
                  }}
                />
              </Box>

              <Box sx={{ p: 2, borderRadius: '18px', bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }}>
                    Official College Holiday Guard
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '.75rem' }}>
                    Pauses auto-attendance on declared college holidays
                  </Typography>
                </Box>
                <Switch
                  checked={Boolean(settings.officialHolidayActive)}
                  disabled={!isUnlocked}
                  onChange={(e) => {
                    triggerHaptic(20)
                    const updated = { ...settings, officialHolidayActive: e.target.checked }
                    setSettings(updated)
                    pushToCloud({ settings: updated })
                  }}
                />
              </Box>
            </Box>
          </GlassCard>
        </Box>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED SUB-PAGE: OWNER SECURITY CREDENTIALS
      ───────────────────────────────────────────────────────────── */}
      {activeSubPage === 'security' && (
        <Box>
          <Button
            startIcon={<MdArrowBack />}
            onClick={() => {
              triggerHaptic(15)
              setActiveSubPage(null)
            }}
            sx={{ mb: 2.5, color: '#60a5fa', fontWeight: 800, textTransform: 'none', fontSize: '.88rem' }}
          >
            Back to Settings
          </Button>

          <GlassCard sx={{ p: 2.75, borderRadius: '24px', border: '1px solid rgba(99,102,241,0.4)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(99,102,241,0.2)', color: '#818cf8', display: 'grid', placeItems: 'center', fontSize: 24 }}>
                🔒
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                  Security Credentials & Password Change
                </Typography>
                <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 600, fontSize: '.78rem' }}>
                  Update Owner User ID (21250770) & Private Password in MongoDB Atlas
                </Typography>
              </Box>
            </Box>

            {secMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{secMsg}</Alert>}
            {secErr && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{secErr}</Alert>}

            <form onSubmit={handleCredentialsSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField
                  fullWidth
                  label="Enter Current User ID"
                  size="small"
                  value={oldUserId}
                  onChange={(e) => setOldUserId(e.target.value)}
                  placeholder="21250770"
                />

                <TextField
                  fullWidth
                  label="Enter Current Password"
                  size="small"
                  type={showOldPass ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowOldPass(!showOldPass)}>
                          {showOldPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  label="New User ID"
                  size="small"
                  value="21250770"
                  disabled
                />

                <TextField
                  fullWidth
                  label="Enter New Password"
                  size="small"
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowNewPass(!showNewPass)}>
                          {showNewPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isUnlocked}
                  sx={{ background: 'var(--aurora)', borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none', mt: 1 }}
                >
                  Save Encrypted Credentials to Cloud 🔒
                </Button>
              </Box>
            </form>
          </GlassCard>
        </Box>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED SUB-PAGE: DATA MAINTENANCE & BACKUPS
      ───────────────────────────────────────────────────────────── */}
      {activeSubPage === 'data' && (
        <Box>
          <Button
            startIcon={<MdArrowBack />}
            onClick={() => {
              triggerHaptic(15)
              setActiveSubPage(null)
            }}
            sx={{ mb: 2.5, color: '#60a5fa', fontWeight: 800, textTransform: 'none', fontSize: '.88rem' }}
          >
            Back to Settings
          </Button>

          <GlassCard sx={{ p: 2.75, borderRadius: '24px', border: '1px solid rgba(245,158,11,0.4)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(245,158,11,0.2)', color: '#f59e0b', display: 'grid', placeItems: 'center', fontSize: 24 }}>
                💾
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                  Data Maintenance & JSON Backups
                </Typography>
                <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600, fontSize: '.78rem' }}>
                  Export JSON backups, restore files, or reset app state
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<MdBackup />}
                  onClick={handleBackup}
                  sx={{ borderRadius: '12px', borderColor: 'rgba(245,158,11,0.4)', color: '#f59e0b', fontWeight: 800, textTransform: 'none' }}
                >
                  Export JSON Backup
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<MdSettingsBackupRestore />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ borderRadius: '12px', borderColor: 'rgba(96,165,250,0.4)', color: '#60a5fa', fontWeight: 800, textTransform: 'none' }}
                >
                  Import JSON Backup
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleRestoreBackup}
                />
              </Box>

              <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.08)' }} />

              <Box sx={{ p: 2, borderRadius: '18px', bgcolor: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f43f5e' }}>
                    Danger Zone: Reset App State
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '.75rem' }}>
                    Resets local state back to default semester configuration
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  disabled={!isUnlocked}
                  onClick={() => setResetDialogOpen(true)}
                  sx={{ borderRadius: '10px', fontWeight: 800, textTransform: 'none' }}
                >
                  Reset App
                </Button>
              </Box>
            </Box>
          </GlassCard>
        </Box>
      )}

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        open={resetDialogOpen}
        title="Reset All Attendance Data?"
        message="This will reset all subject counts, history logs, and bunks back to defaults. Are you sure?"
        onConfirm={() => {
          resetData()
          setResetDialogOpen(false)
        }}
        onCancel={() => setResetDialogOpen(false)}
      />
    </Box>
  )
}
