import React, { useRef, useState } from 'react'
import {
  Box, Typography, Button, Switch, TextField, MenuItem, Grid, Chip,
  Divider, Alert, Slider, InputAdornment, IconButton, Tabs, Tab
} from '@mui/material'
import {
  MdLightMode, MdDarkMode, MdFileDownload, MdFileUpload,
  MdRestartAlt, MdBackup, MdSettingsBackupRestore, MdLock,
  MdVpnKey, MdVibration, MdAutoAwesome, MdSecurity, MdSchool, MdSmartToy,
  MdPhoneAndroid, MdOutlineFolderZip, MdCheckCircle
} from 'react-icons/md'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import GlassCard from '../components/GlassCard'
import ConfirmDialog from '../components/ConfirmDialog'
import WhatsAppPDFSection from '../components/WhatsAppPDFSection'
import { useThemeMode } from '../context/ThemeContext'
import { useAttendance } from '../context/AttendanceContext'
import { readJSONFile } from '../utils/storageUtils'
import { triggerHaptic } from '../utils/hapticUtils'

export default function Settings() {
  const { mode, toggleMode } = useThemeMode()
  const {
    subjects, history, bunks, notes, settings, setSettings,
    resetData, exportBackup, importBackup, pushToCloud, notify,
    isUnlocked, lockApp
  } = useAttendance()

  // Pro Tabbed Sub-Navigation State (0: Reports, 1: Semester, 2: Engine, 3: Security, 4: Data)
  const [activeTab, setActiveTab] = useState(0)

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

  return (
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto', pb: 6, overflowX: 'hidden' }}>

      {/* 🎛️ PRO SUB-NAVIGATION TABS BAR (Tab > Option > Data) 🎛️ */}
      <GlassCard sx={{ p: 1, mb: 3, borderRadius: '20px' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => {
            triggerHaptic(15)
            setActiveTab(val)
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 2,
              bgcolor: '#60a5fa'
            },
            '& .MuiTab-root': {
              minHeight: 44,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '.82rem',
              color: '#94a3b8',
              px: 2,
              '&.Mui-selected': { color: '#fff' }
            }
          }}
        >
          <Tab icon={<Typography variant="body2" sx={{ mr: 0.5, inline: true }}>📲</Typography>} label="Reports" />
          <Tab icon={<Typography variant="body2" sx={{ mr: 0.5, inline: true }}>🎓</Typography>} label="Semester" />
          <Tab icon={<Typography variant="body2" sx={{ mr: 0.5, inline: true }}>⚡</Typography>} label="Auto-Engine" />
          <Tab icon={<Typography variant="body2" sx={{ mr: 0.5, inline: true }}>🔒</Typography>} label="Security" />
          <Tab icon={<Typography variant="body2" sx={{ mr: 0.5, inline: true }}>💾</Typography>} label="Data & Backup" />
        </Tabs>
      </GlassCard>

      {/* ─────────────────────────────────────────────────────────────
          TAB 0: REPORTS & WHATSAPP
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 0 && (
        <WhatsAppPDFSection />
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: SEMESTER SELECTOR
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 1 && (
        <GlassCard sx={{ p: 2.75, mb: 3, borderRadius: '24px', border: '1px solid rgba(96,165,250,0.35)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(96,165,250,0.2)', color: '#60a5fa', display: 'grid', placeItems: 'center', fontSize: 24 }}>
              🎓
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                Academic Semester Management
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '.78rem' }}>
                Currently Active: <strong>{activeSemester}</strong>
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '.84rem' }}>
            Choose a semester to load its official ERP attendance history across Dashboard, Subjects, and Reports:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
                    p: 2,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    border: isSelected ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
                    bgcolor: isSelected ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.03)',
                    transition: 'all 200ms ease',
                    '&:hover': { bgcolor: 'rgba(96,165,250,0.2)' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 38, height: 38, borderRadius: '12px', display: 'grid', placeItems: 'center',
                      bgcolor: isSelected ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.08)',
                      color: isSelected ? '#60a5fa' : '#94a3b8', fontWeight: 800, fontSize: 18
                    }}>
                      🎓
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? '#fff' : 'text.primary' }}>
                        {sem.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: isSelected ? '#93c5fd' : '#94a3b8', fontSize: '.75rem' }}>
                        {sem.subtitle}
                      </Typography>
                    </Box>
                  </Box>

                  {isSelected && (
                    <Chip label="Active ✨" size="small" sx={{ bgcolor: 'var(--aurora)', color: '#fff', fontWeight: 800, fontSize: '.7rem' }} />
                  )}
                </Box>
              )
            })}
          </Box>
        </GlassCard>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: AUTONOMOUS ENGINE & HOLIDAY GUARDS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 2 && (
        <GlassCard sx={{ p: 2.75, mb: 3, borderRadius: '24px', border: '1px solid rgba(16,185,129,0.35)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(16,185,129,0.2)', color: '#34d399', display: 'grid', placeItems: 'center', fontSize: 24 }}>
              ⚡
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                24/7 Autonomous Server Engine
              </Typography>
              <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 600, fontSize: '.78rem' }}>
                Runs every 30s in IST timezone on Render server
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }}>
                  24/7 Autonomous Server Auto-Attendance
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

            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }}>
                  Mass Bunk Protection Guard
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '.75rem' }}>
                  Prevents auto-logging when class has a mass bunk
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

            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: SECURITY & CREDENTIALS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 3 && (
        <GlassCard sx={{ p: 2.75, mb: 3, borderRadius: '24px', border: '1px solid rgba(99,102,241,0.35)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(99,102,241,0.2)', color: '#818cf8', display: 'grid', placeItems: 'center', fontSize: 24 }}>
              🔒
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                Owner Credentials & Cloud Security
              </Typography>
              <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 600, fontSize: '.78rem' }}>
                Change Private User ID & Access Password in MongoDB Atlas
              </Typography>
            </Box>
          </Box>

          {secMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{secMsg}</Alert>}
          {secErr && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{secErr}</Alert>}

          <form onSubmit={handleCredentialsSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current User ID"
                    size="small"
                    value={oldUserId}
                    onChange={(e) => setOldUserId(e.target.value)}
                    placeholder="anshujaiswal3000@gmail.com"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current Password"
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
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New User ID (Optional)"
                    size="small"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Password"
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
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                disabled={!isUnlocked}
                sx={{ background: 'var(--aurora)', borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none', mt: 1 }}
              >
                Update Cloud Credentials 🔒
              </Button>
            </Box>
          </form>
        </GlassCard>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: DATA BACKUP & RESET
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 4 && (
        <GlassCard sx={{ p: 2.75, mb: 3, borderRadius: '24px', border: '1px solid rgba(245,158,11,0.35)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(245,158,11,0.2)', color: '#f59e0b', display: 'grid', placeItems: 'center', fontSize: 24 }}>
              💾
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                Data Maintenance & Backups
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

            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
