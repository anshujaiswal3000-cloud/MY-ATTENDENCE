import React, { useRef, useState } from 'react'
import { Box, Typography, Button, Switch, TextField, MenuItem, Grid, Divider, Alert } from '@mui/material'
import { MdLightMode, MdDarkMode, MdFileDownload, MdFileUpload, MdRestartAlt, MdBackup, MdSettingsBackupRestore, MdLock, MdKey } from 'react-icons/md'
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
  const { exportData, importData, resetAttendance, backup, restoreBackup, settings, setSettings, notify, isUnlocked } = useAttendance()
  const fileInputRef = useRef(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(false)

  // Security Credentials form
  const [oldPassword, setOldPassword] = useState('')
  const [newUserId, setNewUserId] = useState('anshu')
  const [newPassword, setNewPassword] = useState('')
  const [secMsg, setSecMsg] = useState('')
  const [secErr, setSecErr] = useState('')

  const handleImportClick = () => fileInputRef.current?.click()

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
    const name = `Semester ${settings.semesters.length + 1}`
    setSettings((s) => ({ ...s, semesters: [...s.semesters, name] }))
  }

  const handleChangeCredentials = async (e) => {
    e.preventDefault()
    setSecMsg('')
    setSecErr('')
    try {
      const res = await fetch('/api/auth/change-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newUserId, newPassword })
      })
      const json = await res.json()
      if (json.success) {
        setSecMsg('Private User ID & Password updated in MongoDB Atlas 🔒')
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
    <Box sx={{ maxWidth: 640 }}>
      {/* ── Owner Credentials Security Card ── */}
      <GlassCard sx={{ p: 3, mb: 3, border: '1px solid rgba(99,102,241,.3)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MdKey color="#60a5fa" /> Owner Security Credentials (MongoDB Cloud)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Set your private secret User ID & Password saved in MongoDB Atlas. Nobody else (including developers) can unlock your app without these.
        </Typography>

        {secMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{secMsg}</Alert>}
        {secErr && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{secErr}</Alert>}

        <Box component="form" onSubmit={handleChangeCredentials} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Current Password"
            type="password"
            size="small"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="123456"
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="New Secret User ID"
                size="small"
                required
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="anshu"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="New Secret Password"
                type="password"
                size="small"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            disabled={!isUnlocked}
            sx={{ background: 'var(--aurora)', borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
          >
            {isUnlocked ? 'Save Secret Credentials to MongoDB' : 'Login Required to Change Credentials 🔒'}
          </Button>
        </Box>
      </GlassCard>

      <GlassCard sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Appearance</Typography>
        <SettingRow
          icon={mode === 'dark' ? <MdDarkMode /> : <MdLightMode />}
          title="Dark Mode"
          subtitle={mode === 'dark' ? 'Currently on' : 'Currently off — using Light Mode'}
          action={<Switch checked={mode === 'dark'} onChange={toggleMode} />}
        />
      </GlassCard>

      <GlassCard delay={0.05} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Semester</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={8}>
            <TextField
              select fullWidth size="small" label="Active semester"
              value={settings.semester}
              onChange={(e) => setSettings((s) => ({ ...s, semester: e.target.value }))}
            >
              {settings.semesters.map((sem) => <MenuItem key={sem} value={sem}>{sem}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={4}>
            <Button fullWidth variant="outlined" onClick={addSemester} sx={{ borderRadius: '12px' }}>+ Add</Button>
          </Grid>
        </Grid>
      </GlassCard>

      <GlassCard delay={0.1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Data</Typography>
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
