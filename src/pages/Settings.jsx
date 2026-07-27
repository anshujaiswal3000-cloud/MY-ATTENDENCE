import React, { useRef, useState } from 'react'
import {
  Box, Typography, Button, Switch, TextField, MenuItem, Grid,
  Divider, Alert, Slider, InputAdornment, IconButton, Collapse
} from '@mui/material'
import {
  MdLightMode, MdDarkMode, MdFileDownload, MdFileUpload,
  MdRestartAlt, MdBackup, MdSettingsBackupRestore, MdLock,
  MdVpnKey, MdVibration, MdAutoAwesome, MdSecurity, MdExpandMore, MdExpandLess
} from 'react-icons/md'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import GlassCard from '../components/GlassCard'
import ConfirmDialog from '../components/ConfirmDialog'
import { useThemeMode } from '../context/ThemeContext'
import { useAttendance } from '../context/AttendanceContext'
import { readJSONFile } from '../utils/storageUtils'

function SettingRow({ icon, title, subtitle, action }) {
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
}

export default function Settings() {
  const { mode, toggleMode } = useThemeMode()
  const { exportData, importData, resetAttendance, backup, restoreBackup, settings = {}, setSettings, notify, isUnlocked } = useAttendance()
  const fileInputRef = useRef(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(false)

  // Security section collapse state
  const [securityExpanded, setSecurityExpanded] = useState(false)

  // Security Credentials form state
  const [oldUserId, setOldUserId] = useState('anshu')
  const [oldPassword, setOldPassword] = useState('')
  const [newUserId, setNewUserId] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Show/Hide password toggles
  const [showOldUser, setShowOldUser] = useState(false)
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  const [secMsg, setSecMsg] = useState('')
  const [secErr, setSecErr] = useState('')

  const handleImportClick = () => fileInputRef.current?.click()

  const semestersList = Array.isArray(settings?.semesters) ? settings.semesters : ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4']
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

  const addSemester = () => {
    const name = `Semester ${semestersList.length + 1}`
    setSettings((s) => ({ ...s, semesters: [...(s?.semesters || semestersList), name] }))
  }

  const handleChangeCredentials = async (e) => {
    e.preventDefault()
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
        setSecMsg('Private User ID & Password updated in MongoDB Atlas Cloud 🔒')
        setOldPassword('')
        setNewPassword('')
      } else {
        setSecErr(json.message || 'Failed to update credentials')
      }
    } catch (err) {
      setSecErr('Network error — ensure MongoDB server is connected')
    }
  }

  return (
    <Box sx={{ maxWidth: 640, pb: 4 }}>

      {/* 🛡️ Collapsible Dedicated Security Card 🛡️ */}
      <GlassCard sx={{ p: 2.5, mb: 3, border: '1px solid rgba(99,102,241,.35)' }}>
        <Box
          onClick={() => setSecurityExpanded(!securityExpanded)}
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
              
              {/* Row 1: Current User ID & Current Password */}
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

              {/* Row 2: New Secret User ID & New Secret Password */}
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
          action={<Switch checked={mode === 'dark'} onChange={toggleMode} />}
        />
        <Divider sx={{ opacity: 0.3 }} />
        <SettingRow
          icon={<MdAutoAwesome color="#34d399" />}
          title="Auto-Attendance Engine"
          subtitle="Automatically marks classes Present when lecture end-time passes"
          action={
            <Switch
              checked={settings?.autoAttendance !== false}
              onChange={(e) => setSettings((s) => ({ ...s, autoAttendance: e.target.checked }))}
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
              onChange={(e) => setSettings((s) => ({ ...s, hapticFeedback: e.target.checked }))}
            />
          }
        />
      </GlassCard>

      {/* ── Target Goal & Semester ── */}
      <GlassCard delay={0.05} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Target Attendance Goal</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Current Target Goal: <strong>{settings?.targetPercentage || 75}%</strong>
        </Typography>
        <Slider
          value={settings?.targetPercentage || 75}
          onChange={(_, v) => setSettings((s) => ({ ...s, targetPercentage: v }))}
          step={5}
          marks
          min={60}
          max={95}
          valueLabelDisplay="auto"
          sx={{ mb: 2 }}
        />

        <Divider sx={{ opacity: 0.3, my: 2 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Active Semester</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={8}>
            <TextField
              select fullWidth size="small" label="Active semester"
              value={activeSemester}
              onChange={(e) => setSettings((s) => ({ ...s, semester: e.target.value }))}
            >
              {semestersList.map((sem) => (
                <MenuItem key={sem} value={sem}>{sem}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={4}>
            <Button fullWidth variant="outlined" onClick={addSemester} sx={{ borderRadius: '12px' }}>+ Add</Button>
          </Grid>
        </Grid>
      </GlassCard>

      {/* ── Data Export & Backup ── */}
      <GlassCard delay={0.1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Data Management</Typography>
        <Divider sx={{ opacity: 0.3 }} />
        <SettingRow
          icon={<MdFileDownload />}
          title="Export Data (JSON)"
          subtitle="Download a full backup of subjects, history, and settings"
          action={<Button variant="outlined" onClick={exportData} sx={{ borderRadius: '12px' }}>Export</Button>}
        />
        <Divider sx={{ opacity: 0.3 }} />
        <SettingRow
          icon={<MdFileUpload />}
          title="Import Data (JSON)"
          subtitle="Restore from a previously exported file"
          action={<Button variant="outlined" onClick={handleImportClick} sx={{ borderRadius: '12px' }}>Import</Button>}
        />
        <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleFileChange} />
        <Divider sx={{ opacity: 0.3 }} />
        <SettingRow
          icon={<MdBackup />}
          title="Backup Local Storage"
          subtitle="Save a snapshot inside this browser"
          action={<Button variant="outlined" onClick={backup} sx={{ borderRadius: '12px' }}>Backup</Button>}
        />
        <Divider sx={{ opacity: 0.3 }} />
        <SettingRow
          icon={<MdSettingsBackupRestore />}
          title="Restore Backup"
          subtitle="Load the most recent local snapshot"
          action={<Button variant="outlined" onClick={() => setConfirmRestore(true)} sx={{ borderRadius: '12px' }}>Restore</Button>}
        />
      </GlassCard>

      {/* ── Danger Zone ── */}
      <GlassCard delay={0.15} sx={{ p: 3, borderColor: 'rgba(244,63,94,0.3)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#f43f5e' }}>Danger Zone</Typography>
        <SettingRow
          icon={<MdRestartAlt />}
          title="Reset Attendance"
          subtitle="Clears all present/absent counters and history — subjects remain"
          action={<Button variant="contained" color="error" onClick={() => setConfirmReset(true)} sx={{ borderRadius: '12px' }}>Reset</Button>}
        />
      </GlassCard>

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
