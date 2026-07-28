import React, { useRef, useState } from 'react'
import {
  Box, Typography, Button, Switch, TextField, Grid, Chip,
  Divider, Alert, InputAdornment, IconButton, Collapse
} from '@mui/material'
import {
  MdBackup, MdSettingsBackupRestore, MdLock, MdExpandMore, MdExpandLess,
  MdSchool, MdSecurity, MdAutoAwesome, MdPhonelinkRing, MdStorage
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

  // Accordion Single Expansion State ('reports' | 'semester' | 'engine' | 'security' | 'data' | null)
  const [openSection, setOpenSection] = useState('reports')
  const [changePassExpanded, setChangePassExpanded] = useState(false)

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

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: WHATSAPP PDF REPORTS & ATTIX ALERTS
      ───────────────────────────────────────────────────────────── */}
      <GlassCard sx={{ p: 2.5, mb: 3, borderRadius: '24px', border: '1px solid rgba(16,185,129,0.35)' }}>
        <Box
          onClick={() => {
            triggerHaptic(15)
            setOpenSection(openSection === 'reports' ? null : 'reports')
          }}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: '14px', bgcolor: 'rgba(16,185,129,0.2)', color: '#34d399', display: 'grid', placeItems: 'center', fontSize: 22 }}>
              📲
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                1-Click PDF Report & ATTIX Alerts
              </Typography>
              <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 600 }}>
                Target Number: +91 9125469499 (Active & Verified)
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" sx={{ color: '#34d399' }}>
            {openSection === 'reports' ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
          </IconButton>
        </Box>

        <Collapse in={openSection === 'reports'} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <WhatsAppPDFSection />
          </Box>
        </Collapse>
      </GlassCard>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: ACADEMIC SEMESTER SELECTOR
      ───────────────────────────────────────────────────────────── */}
      <GlassCard sx={{ p: 2.5, mb: 3, borderRadius: '24px', border: '1px solid rgba(96,165,250,0.35)' }}>
        <Box
          onClick={() => {
            triggerHaptic(15)
            setOpenSection(openSection === 'semester' ? null : 'semester')
          }}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: '14px', bgcolor: 'rgba(96,165,250,0.2)', color: '#60a5fa', display: 'grid', placeItems: 'center', fontSize: 22 }}>
              🎓
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                Select Semester ({activeSemester})
              </Typography>
              <Typography variant="caption" sx={{ color: '#93c5fd', fontWeight: 600 }}>
                Tap to expand and load Semester 1, 2, or 3 ERP records
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" sx={{ color: '#60a5fa' }}>
            {openSection === 'semester' ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
          </IconButton>
        </Box>

        <Collapse in={openSection === 'semester'} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
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
                      p: 2, borderRadius: '16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      border: isSelected ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
                      bgcolor: isSelected ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.03)',
                      transition: 'all 200ms ease',
                      '&:hover': { bgcolor: 'rgba(96,165,250,0.2)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 36, height: 36, borderRadius: '12px', display: 'grid', placeItems: 'center',
                        bgcolor: isSelected ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.08)',
                        color: isSelected ? '#60a5fa' : '#94a3b8', fontWeight: 800, fontSize: 16
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
          </Box>
        </Collapse>
      </GlassCard>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: AUTONOMOUS ENGINE & HOLIDAY PROTECTION
      ───────────────────────────────────────────────────────────── */}
      <GlassCard sx={{ p: 2.5, mb: 3, borderRadius: '24px', border: '1px solid rgba(16,185,129,0.35)' }}>
        <Box
          onClick={() => {
            triggerHaptic(15)
            setOpenSection(openSection === 'engine' ? null : 'engine')
          }}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: '14px', bgcolor: 'rgba(16,185,129,0.2)', color: '#34d399', display: 'grid', placeItems: 'center', fontSize: 22 }}>
              ⚡
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                24/7 Server Autonomous Engine
              </Typography>
              <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 600 }}>
                Runs 24/7 in IST timezone • Render Keep-Alive Active
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" sx={{ color: '#34d399' }}>
            {openSection === 'engine' ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
          </IconButton>
        </Box>

        <Collapse in={openSection === 'engine'} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <Box sx={{ p: 1.75, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

              <Box sx={{ p: 1.75, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

              <Box sx={{ p: 1.75, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          </Box>
        </Collapse>
      </GlassCard>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: OWNER SECURITY & STEP-BY-STEP PASSWORD CHANGE
      ───────────────────────────────────────────────────────────── */}
      <GlassCard sx={{ p: 2.5, mb: 3, borderRadius: '24px', border: '1px solid rgba(99,102,241,0.35)' }}>
        <Box
          onClick={() => {
            triggerHaptic(15)
            setOpenSection(openSection === 'security' ? null : 'security')
          }}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: '14px', bgcolor: 'rgba(99,102,241,0.2)', color: '#818cf8', display: 'grid', placeItems: 'center', fontSize: 22 }}>
              🔒
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                Security Credentials & Authentication
              </Typography>
              <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 600 }}>
                Step 1: Expand Credentials ➔ Step 2: Change Password
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" sx={{ color: '#818cf8' }}>
            {openSection === 'security' ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
          </IconButton>
        </Box>

        <Collapse in={openSection === 'security'} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            
            {/* Step 1 Nested Accordion Option */}
            <Box
              onClick={() => {
                triggerHaptic(15)
                setChangePassExpanded(!changePassExpanded)
              }}
              sx={{
                p: 1.75, borderRadius: '16px', cursor: 'pointer',
                bgcolor: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }}>
                🔑 Step 1: Change Owner Password & User ID
              </Typography>
              <IconButton size="small" sx={{ color: '#818cf8' }}>
                {changePassExpanded ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
              </IconButton>
            </Box>

            {/* Step 2 Form Inputs Expansion */}
            <Collapse in={changePassExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ pt: 2, px: 1 }}>
                {secMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{secMsg}</Alert>}
                {secErr && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{secErr}</Alert>}

                <form onSubmit={handleCredentialsSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
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
                      sx={{ background: 'var(--aurora)', borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none', mt: 0.5 }}
                    >
                      Save to Cloud 🔒
                    </Button>
                  </Box>
                </form>
              </Box>
            </Collapse>
          </Box>
        </Collapse>
      </GlassCard>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: DATA MAINTENANCE & BACKUPS
      ───────────────────────────────────────────────────────────── */}
      <GlassCard sx={{ p: 2.5, mb: 3, borderRadius: '24px', border: '1px solid rgba(245,158,11,0.35)' }}>
        <Box
          onClick={() => {
            triggerHaptic(15)
            setOpenSection(openSection === 'data' ? null : 'data')
          }}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: '14px', bgcolor: 'rgba(245,158,11,0.2)', color: '#f59e0b', display: 'grid', placeItems: 'center', fontSize: 22 }}>
              💾
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                Data Maintenance & JSON Backups
              </Typography>
              <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                Export JSON backups, restore files, or reset state
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" sx={{ color: '#f59e0b' }}>
            {openSection === 'data' ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
          </IconButton>
        </Box>

        <Collapse in={openSection === 'data'} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

              <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.08)' }} />

              <Box sx={{ p: 1.75, borderRadius: '16px', bgcolor: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          </Box>
        </Collapse>
      </GlassCard>

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
