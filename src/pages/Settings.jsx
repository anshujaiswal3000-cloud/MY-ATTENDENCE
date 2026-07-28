import React, { useRef, useState } from 'react'
import {
  Box, Typography, Button, Switch, TextField, MenuItem, Grid,
  Divider, Alert, Slider, InputAdornment, IconButton, Collapse, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import {
  MdLightMode, MdDarkMode, MdFileDownload, MdFileUpload,
  MdRestartAlt, MdBackup, MdSettingsBackupRestore, MdLock,
  MdVpnKey, MdVibration, MdAutoAwesome, MdSecurity, MdExpandMore, MdExpandLess, MdSchool, MdSmartToy
} from 'react-icons/md'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import GlassCard from '../components/GlassCard'
import ConfirmDialog from '../components/ConfirmDialog'
import AttendAITools from '../components/AttendAITools'
import { useThemeMode } from '../context/ThemeContext'
import { useAttendance } from '../context/AttendanceContext'
import { readJSONFile } from '../utils/storageUtils'
import { triggerHaptic } from '../utils/hapticUtils'

const SettingRow = React.memo(function SettingRow({ icon, title, subtitle, action }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
      <Box sx={{ fontSize: 22, opacity: 0.75, width: 30, display: 'flex', justifyContent: 'center' }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
        {subtitle && <Typography variant="caption" sx={{ opacity: 0.6 }}>{subtitle}</Typography>}
      </Box>
      {action}
    </Box>
  )
})

export default function Settings() {
  const { mode, toggleMode } = useThemeMode()
  const { exportData, importData, resetAttendance, backup, restoreBackup, settings = {}, setSettings, notify, isUnlocked } = useAttendance()
  const fileInputRef = useRef(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(false)

  // Collapsible states
  const [attendAiExpanded, setAttendAiExpanded] = useState(true)
  const [autoAiExpanded, setAutoAiExpanded] = useState(true)
  const [semesterExpanded, setSemesterExpanded] = useState(false)
  const [securityExpanded, setSecurityExpanded] = useState(false)


  // Security Credentials form state
  const [oldUserId, setOldUserId] = useState('anshu')
  const [oldPassword, setOldPassword] = useState('')
  const [newUserId, setNewUserId] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Password Prompt Modal for Sensitive Data Operations
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authPassword, setAuthPassword] = useState('')
  const [showAuthPass, setShowAuthPass] = useState(false)
  const [authError, setAuthError] = useState('')
  const [pendingAction, setPendingAction] = useState(null)

  // Show/Hide password toggles
  const [showOldUser, setShowOldUser] = useState(false)
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  const [secMsg, setSecMsg] = useState('')
  const [secErr, setSecErr] = useState('')

  const handleImportClick = () => fileInputRef.current?.click()

  const activeSemester = settings?.semester || 'Semester 3'

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await readJSONFile(file)
      importData(data)
    } catch (err) {
      notify('Import failed — invalid file', 'error')
    } finally {
      e.target.value = ''
    }
  }

  // Password verification wrapper for sensitive actions
  const requirePasswordThen = (actionFn) => {
    triggerHaptic(20)
    setPendingAction(() => actionFn)
    setAuthPassword('')
    setAuthError('')
    setAuthDialogOpen(true)
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'anshu', password: authPassword })
      })
      const json = await res.json()
      if (json.success) {
        setAuthDialogOpen(false)
        triggerHaptic(30)
        if (pendingAction) pendingAction()
        setPendingAction(null)
      } else {
        triggerHaptic([40, 60, 40])
        setAuthError('Incorrect password! Operation denied.')
      }
    } catch (err) {
      setAuthError('Network error during verification')
    }
  }

  const handleChangeCredentials = async (e) => {
    e.preventDefault()
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

  return (
    <Box sx={{ maxWidth: 680, pb: 4 }}>

      {/* 🤖 NEW TAB: AttendAI Doctor & Real-Time Analytics Tools 🤖 */}
      <GlassCard sx={{ p: 2.5, mb: 3, border: '2px solid rgba(99,102,241,0.45)', background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.92))' }}>
        <Box
          onClick={() => {
            triggerHaptic(15)
            setAttendAiExpanded(!attendAiExpanded)
          }}
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', userSelect: 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '14px', display: 'grid', placeItems: 'center',
              bgcolor: 'rgba(99,102,241,0.22)', color: '#818cf8', fontSize: 24
            }}>
              <MdSmartToy />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#fff' }}>
                AttendAI — Real-Time AI Doctor & Library Counter
              </Typography>
              <Typography variant="caption" sx={{ color: '#a5b4fc' }}>
                Tap to expand real-time bunk analysis, goal predictor & library class tracking
              </Typography>
            </Box>
          </Box>

          <IconButton size="small" sx={{ color: '#818cf8' }}>
            {attendAiExpanded ? <MdExpandLess size={26} /> : <MdExpandMore size={26} />}
          </IconButton>
        </Box>

        {/* Collapsible AttendAI Body */}
        <Collapse in={attendAiExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 2.5, mt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <AttendAITools />
          </Box>
        </Collapse>
      </GlassCard>

      {/* 🤖 NEW TAB / CARD: AutoAttendance AI Control Hub & Holiday Guards 🤖 */}
      <GlassCard sx={{ p: 2.5, mb: 3, border: '2px solid rgba(16,185,129,0.45)', background: 'linear-gradient(135deg, rgba(6,78,59,0.25), rgba(15,23,42,0.95))' }}>
        <Box
          onClick={() => {
            triggerHaptic(15)
            setAutoAiExpanded(!autoAiExpanded)
          }}
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', userSelect: 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '14px', display: 'grid', placeItems: 'center',
              bgcolor: 'rgba(16,185,129,0.22)', color: '#34d399', fontSize: 24
            }}>
              🤖
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#fff' }}>
                  AutoAttendance AI Control Hub & Holiday Guards
                </Typography>
                <Chip label="● 24/7 LIVE AWAKE" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: 800, fontSize: '.68rem' }} />
              </Box>
              <Typography variant="caption" sx={{ color: '#6ee7b7' }}>
                Configure 24/7 Server Auto-Attendance, Mass Bunks & Official Holiday Guards
              </Typography>
            </Box>
          </Box>

          <IconButton size="small" sx={{ color: '#34d399' }}>
            {autoAiExpanded ? <MdExpandLess size={26} /> : <MdExpandMore size={26} />}
          </IconButton>
        </Box>

        {/* Collapsible AutoAttendance AI Control Hub Body */}
        <Collapse in={autoAiExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 2.5, mt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            
            {/* Setting 1: Master Server Auto-Attendance Switch */}
            <SettingRow
              icon="⚡"
              title="24/7 Server Autonomous Auto-Attendance"
              subtitle="Runs on Render server every 30s in IST timezone even when phone is turned off"
              action={
                <Switch
                  checked={settings?.autoAttendance !== false}
                  onChange={(e) => {
                    if (!isUnlocked) return notify('Login required to change 🔒', 'warning')
                    const updated = { ...settings, autoAttendance: e.target.checked }
                    setSettings(updated)
                    pushToCloud({ settings: updated })
                    notify(e.target.checked ? 'Server Auto-Attendance Enabled ⚡' : 'Server Auto-Attendance Disabled ⏸️')
                  }}
                />
              }
            />
            <Divider sx={{ opacity: 0.1, my: 1 }} />

            {/* Setting 2: Declare Mass Bunk Today */}
            <SettingRow
              icon="⚠️"
              title="Declare Today as Mass Bunk / Cancelled Day"
              subtitle="Pauses server auto-logging today so cancelled classes/mass bunks don't increment attendance"
              action={
                <Switch
                  checked={Boolean(settings?.massBunkToday)}
                  onChange={(e) => {
                    if (!isUnlocked) return notify('Login required to change 🔒', 'warning')
                    const updated = { ...settings, massBunkToday: e.target.checked }
                    setSettings(updated)
                    pushToCloud({ settings: updated })
                    notify(e.target.checked ? 'Mass Bunk Mode Enabled: Auto-logging paused for today ⚠️' : 'Mass Bunk Mode Disabled ✅')
                  }}
                />
              }
            />
            <Divider sx={{ opacity: 0.1, my: 1 }} />

            {/* Setting 3: Declare Official College Holiday Today */}
            <SettingRow
              icon="🎉"
              title="Declare Today as Official College Holiday / Fest"
              subtitle="Guarantees 0 lectures counted or incremented on official college holidays & fest days"
              action={
                <Switch
                  checked={Boolean(settings?.officialHolidayToday)}
                  onChange={(e) => {
                    if (!isUnlocked) return notify('Login required to change 🔒', 'warning')
                    const updated = { ...settings, officialHolidayToday: e.target.checked }
                    setSettings(updated)
                    pushToCloud({ settings: updated })
                    notify(e.target.checked ? 'Official Holiday Mode Enabled: 0 lectures counted today 🎉' : 'Official Holiday Mode Disabled ✅')
                  }}
                />
              }
            />
            <Divider sx={{ opacity: 0.1, my: 1 }} />

            {/* Automatic Calendar Exceptions Info */}
            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34d399', mb: 0.5 }}>
                🌴 Automatic Calendar Exclusions
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '.78rem', color: '#94a3b8' }}>
                System automatically excludes **Every Sunday**, **1st Saturday**, and **3rd Saturday** of the month from attendance counts. No manual action needed!
              </Typography>
            </Box>

          </Box>
        </Collapse>
      </GlassCard>

      {/* 🎓 Collapsible Select Semester Card 🎓 */}
      <GlassCard sx={{ p: 2.5, mb: 3, border: '1px solid rgba(99,102,241,.35)' }}>
        <Box
          onClick={() => {
            triggerHaptic(15)
            setSemesterExpanded(!semesterExpanded)
          }}
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', userSelect: 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '12px', display: 'grid', placeItems: 'center',
              bgcolor: 'rgba(96,165,250,.18)', color: '#60a5fa', fontSize: 22
            }}>
              <MdSchool />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                Select Semester (Active: {activeSemester})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tap to expand and choose between Semester 1, 2 & 3 ERP records
              </Typography>
            </Box>
          </Box>

          <IconButton size="small" sx={{ color: '#60a5fa' }}>
            {semesterExpanded ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
          </IconButton>
        </Box>

        {/* Collapsible Semester Options Body */}
        <Collapse in={semesterExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 2.5, mt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Choose a semester to load its official ERP attendance history:
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {['Semester 1', 'Semester 2', 'Semester 3'].map((sem) => {
                const isSelected = activeSemester === sem
                return (
                  <Button
                    key={sem}
                    variant={isSelected ? "contained" : "outlined"}
                    onClick={() => {
                      triggerHaptic(20)
                      setSettings((s) => ({ ...s, semester: sem }))
                      notify(`Switched to ${sem} official attendance records!`)
                    }}
                    sx={{
                      borderRadius: '14px',
                      fontWeight: 800,
                      px: 2.5, py: 1,
                      background: isSelected ? 'var(--aurora)' : 'transparent',
                      borderColor: isSelected ? 'transparent' : 'rgba(148,163,184,.3)',
                      color: isSelected ? '#fff' : 'text.primary',
                      boxShadow: isSelected ? '0 4px 16px rgba(99,102,241,.35)' : 'none'
                    }}
                  >
                    {sem} {isSelected ? ' (Active ✨)' : ''}
                  </Button>
                )
              })}
            </Box>
          </Box>
        </Collapse>
      </GlassCard>

      {/* 🛡️ Collapsible Security Card 🛡️ */}
      <GlassCard sx={{ p: 2.5, mb: 3, border: '1px solid rgba(99,102,241,.35)' }}>
        <Box
          onClick={() => {
            triggerHaptic(15)
            setSecurityExpanded(!securityExpanded)
          }}
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', userSelect: 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '12px', display: 'grid', placeItems: 'center',
              bgcolor: 'rgba(96,165,250,.18)', color: '#60a5fa', fontSize: 22
            }}>
              <MdSecurity />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                Security (Change Owner Credentials)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tap to expand and update private Owner User ID & Password
              </Typography>
            </Box>
          </Box>

          <IconButton size="small" sx={{ color: '#60a5fa' }}>
            {securityExpanded ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
          </IconButton>
        </Box>

        {/* Collapsible Content Body */}
        <Collapse in={securityExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 2.5, mt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {secMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{secMsg}</Alert>}
            {secErr && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{secErr}</Alert>}

            <Box component="form" onSubmit={handleChangeCredentials} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Current User ID"
                    type={showOldUser ? 'text' : 'password'}
                    size="small"
                    fullWidth
                    required
                    value={oldUserId}
                    onChange={(e) => setOldUserId(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowOldUser(!showOldUser)} edge="end" size="small">
                            {showOldUser ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Current Password"
                    type={showOldPass ? 'text' : 'password'}
                    size="small"
                    fullWidth
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowOldPass(!showOldPass)} edge="end" size="small">
                            {showOldPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: .5, opacity: .3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="New Secret User ID"
                    size="small"
                    fullWidth
                    required
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    placeholder="anshu_owner"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="New Secret Password"
                    type={showNewPass ? 'text' : 'password'}
                    size="small"
                    fullWidth
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNewPass(!showNewPass)} edge="end" size="small">
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
                sx={{ background: 'var(--aurora)', borderRadius: '12px', textTransform: 'none', fontWeight: 700, mt: 1, py: 1 }}
              >
                {isUnlocked ? 'Save to Cloud ☁️' : 'Login to make any change 🔒'}
              </Button>
            </Box>
          </Box>
        </Collapse>
      </GlassCard>

      {/* ── App Preferences & Automation ── */}
      <GlassCard sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Preferences & Automation</Typography>
        
        <SettingRow
          icon={mode === 'dark' ? <MdDarkMode /> : <MdLightMode />}
          title="Dark Mode"
          subtitle={mode === 'dark' ? 'Currently on' : 'Currently off — using Light Mode'}
          action={<Switch checked={mode === 'dark'} onChange={() => { triggerHaptic(15); toggleMode(); }} />}
        />
        <Divider sx={{ opacity: 0.3 }} />
        <SettingRow
          icon={<MdAutoAwesome color="#34d399" />}
          title="Auto-Attendance Engine"
          subtitle="Automatically marks classes Present when lecture end-time passes"
          action={
            <Switch
              checked={settings?.autoAttendance !== false}
              onChange={(e) => {
                triggerHaptic(15)
                setSettings((s) => ({ ...s, autoAttendance: e.target.checked }))
              }}
            />
          }
        />
        <Divider sx={{ opacity: 0.3 }} />
        <SettingRow
          icon={<MdVibration color="#a78bfa" />}
          title="Haptic Touch Vibration"
          subtitle="Vibrate on tab switches, profile tap, and attendance clicks"
          action={
            <Switch
              checked={settings?.hapticFeedback !== false}
              onChange={(e) => {
                triggerHaptic(20)
                setSettings((s) => ({ ...s, hapticFeedback: e.target.checked }))
              }}
            />
          }
        />
      </GlassCard>

      {/* ── Target Goal Slider ── */}
      <GlassCard delay={0.05} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Target Attendance Goal</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Current Target Goal: <strong>{settings?.targetPercentage || 75}%</strong>
        </Typography>
        <Slider
          value={settings?.targetPercentage || 75}
          onChange={(_, v) => {
            setSettings((s) => ({ ...s, targetPercentage: v }))
          }}
          onChangeCommitted={() => triggerHaptic(15)}
          step={5}
          marks
          min={60}
          max={95}
          valueLabelDisplay="auto"
          sx={{ mb: 2 }}
        />
      </GlassCard>

      {/* 🔒 Data Export & Backup (PASSWORD PROTECTED) 🔒 */}
      <GlassCard delay={0.1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Data Management (Password Protected)</Typography>
        <Divider sx={{ opacity: 0.3 }} />
        <SettingRow
          icon={<MdFileDownload />}
          title="Export Data (JSON)"
          subtitle="Download a full backup of subjects, history, and settings"
          action={
            <Button
              variant="outlined"
              onClick={() => requirePasswordThen(exportData)}
              sx={{ borderRadius: '12px' }}
            >
              Export
            </Button>
          }
        />
        <Divider sx={{ opacity: 0.3 }} />
        <SettingRow
          icon={<MdFileUpload />}
          title="Import Data (JSON)"
          subtitle="Restore from a previously exported file"
          action={
            <Button
              variant="outlined"
              onClick={() => requirePasswordThen(handleImportClick)}
              sx={{ borderRadius: '12px' }}
            >
              Import
            </Button>
          }
        />
        <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleFileChange} />
        <Divider sx={{ opacity: 0.3 }} />
        <SettingRow
          icon={<MdBackup />}
          title="Backup Local Storage"
          subtitle="Save a snapshot inside this browser"
          action={
            <Button
              variant="outlined"
              onClick={() => requirePasswordThen(backup)}
              sx={{ borderRadius: '12px' }}
            >
              Backup
            </Button>
          }
        />
        <Divider sx={{ opacity: 0.3 }} />
        <SettingRow
          icon={<MdSettingsBackupRestore />}
          title="Restore Backup"
          subtitle="Load the most recent local snapshot"
          action={
            <Button
              variant="outlined"
              onClick={() => requirePasswordThen(() => setConfirmRestore(true))}
              sx={{ borderRadius: '12px' }}
            >
              Restore
            </Button>
          }
        />
      </GlassCard>

      {/* ── Danger Zone (PASSWORD PROTECTED) ── */}
      <GlassCard delay={0.15} sx={{ p: 3, borderColor: 'rgba(244,63,94,0.3)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#f43f5e' }}>Danger Zone</Typography>
        <SettingRow
          icon={<MdRestartAlt />}
          title="Reset Attendance"
          subtitle="Clears all present/absent counters and history — subjects remain"
          action={
            <Button
              variant="contained"
              color="error"
              onClick={() => requirePasswordThen(() => setConfirmReset(true))}
              sx={{ borderRadius: '12px' }}
            >
              Reset
            </Button>
          }
        />
      </GlassCard>

      {/* 🔐 Password Authorization Dialog 🔐 */}
      <Dialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '22px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <MdLock color="#60a5fa" /> Enter Owner Password
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            Please enter your Owner Password to perform this data operation.
          </Typography>
          {authError && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{authError}</Alert>}
          <Box component="form" onSubmit={handleAuthSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Owner Password"
              type={showAuthPass ? 'text' : 'password'}
              fullWidth
              required
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="Enter password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowAuthPass(!showAuthPass)} edge="end">
                      {showAuthPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setAuthDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAuthSubmit} sx={{ background: 'var(--aurora)', borderRadius: '10px', px: 3 }}>
            Verify & Proceed
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all attendance?"
        message="This clears every subject's present/absent counters and deletes the full history log. This cannot be undone."
        confirmLabel="Reset"
        destructive
        onConfirm={resetAttendance}
        onClose={() => setConfirmReset(false)}
      />
      <ConfirmDialog
        open={confirmRestore}
        title="Restore last backup?"
        message="This will overwrite your current subjects, history, and settings with the last local backup."
        confirmLabel="Restore"
        onConfirm={restoreBackup}
        onClose={() => setConfirmRestore(false)}
      />
    </Box>
  )
}
