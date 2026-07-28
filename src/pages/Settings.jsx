import React, { useRef, useState } from 'react'
import {
  Box, Typography, Button, Switch, TextField, Grid, Chip,
  Divider, Alert, InputAdornment, IconButton
} from '@mui/material'
import {
  MdArrowBack, MdChevronRight, MdBackup, MdSettingsBackupRestore,
  MdLock, MdSchool, MdSecurity, MdAutoAwesome, MdPhonelinkRing,
  MdStorage, MdInsertDriveFile, MdLockOpen
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
    isUnlocked
  } = useAttendance()

  // Active Sub-Page View State (null = Main Menu, 'reports' | 'semester' | 'engine' | 'security' | 'data')
  const [activeSubPage, setActiveSubPage] = useState(null)

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
        body: JSON.stringify({ oldUserId, oldPassword, newUserId, newPassword })
      })
      const json = await res.json()
      if (json.success) {
        triggerHaptic(40)
        setSecMsg('Private User ID & Password updated in MongoDB Atlas Cloud 🔒')
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
      subtitle: 'Update MongoDB Atlas Owner User ID & Private Password'
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
                  Update Owner User ID & Private Password in MongoDB Atlas Cloud
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
                  placeholder="anshujaiswal3000@gmail.com"
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
                  label="Enter New User ID (Optional)"
                  size="small"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
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
                  Save Credentials to Cloud 🔒
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
