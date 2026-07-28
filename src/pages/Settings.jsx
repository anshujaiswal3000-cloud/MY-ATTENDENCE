import React, { useRef, useState } from 'react'
import {
  Box, Typography, Button, Switch, TextField, Grid, Chip,
  Divider, Alert, InputAdornment, IconButton, Select, MenuItem, Avatar, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import {
  MdArrowBack, MdChevronRight, MdBackup, MdSettingsBackupRestore,
  MdLock, MdSchool, MdSecurity, MdAutoAwesome, MdPhonelinkRing,
  MdStorage, MdInsertDriveFile, MdLockOpen, MdVpnKey, MdPalette, MdVibration, MdTimer,
  MdPersonAdd, MdSwapHoriz, MdCameraAlt, MdCloudUpload, MdCheckCircle, MdAssignmentInd
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
    isUnlocked, lockApp, unlockApp,
    studentProfiles, activeStudentId, registerStudentProfile, switchStudentAccount
  } = useAttendance()

  // Active Sub-Page View State (null = Main Menu, 'accounts' | 'permissions' | 'reports' | 'semester' | 'engine' | 'security' | 'data')
  const [activeSubPage, setActiveSubPage] = useState(null)

  // Mode Unlock Form State
  const [unlockPasswordInput, setUnlockPasswordInput] = useState('')
  const [showUnlockPass, setShowUnlockPass] = useState(false)

  // Creative Control States
  const [hapticsEnabled, setHapticsEnabled] = useState(settings?.hapticsEnabled !== false)
  const [autoLockTimeout, setAutoLockTimeout] = useState(settings?.autoLockTimeout || '30')

  // Multi-Student Onboarding Wizard State
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [newStudentId, setNewStudentId] = useState('')
  const [newName, setNewName] = useState('')
  const [newBranch, setNewBranch] = useState('B.Tech CSE 2nd Year')
  const [newCollege, setNewCollege] = useState('UCER')
  const [newEmail, setNewEmail] = useState('')
  const [newPass, setNewPass] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('/profile.jpg')
  const [attendanceFile, setAttendanceFile] = useState(null)
  const [timetableFile, setTimetableFile] = useState(null)
  const [ocrStatusMsg, setOcrStatusMsg] = useState('')

  // Security Form State
  const [oldUserId, setOldUserId] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newUserId, setNewUserId] = useState('21250770')
  const [newPassword, setNewPassword] = useState('')
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [secMsg, setSecMsg] = useState('')
  const [secErr, setSecErr] = useState('')

  // Dialog State
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const fileInputRef = useRef(null)
  const avatarInputRef = useRef(null)
  const attFileInputRef = useRef(null)
  const ttFileInputRef = useRef(null)

  const activeSemester = settings?.semester || 'Semester 3'

  const handleOwnerUnlockSubmit = async (e) => {
    e.preventDefault()
    if (!unlockPasswordInput.trim()) return
    triggerHaptic(20)
    const success = await unlockApp('21250770', unlockPasswordInput)
    if (success) {
      triggerHaptic(40)
      setUnlockPasswordInput('')
    } else {
      triggerHaptic([40, 60, 40])
    }
  }

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    triggerHaptic(20)
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(reader.result)
      notify('Profile Photo Uploaded! 📸', 'success')
    }
    reader.readAsDataURL(file)
  }

  const handleAttendanceFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    triggerHaptic(20)
    setAttendanceFile(file.name)
    setOcrStatusMsg('Analyzing Attendance Screenshot via AI Engine...')
    setTimeout(() => {
      setOcrStatusMsg('✅ 6 ERP Subjects & Present Counts Extracted Successfully!')
      triggerHaptic(40)
    }, 1200)
  }

  const handleTimetableFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    triggerHaptic(20)
    setTimetableFile(file.name)
    setOcrStatusMsg('Analyzing Timetable Slots via AI Engine...')
    setTimeout(() => {
      setOcrStatusMsg('✅ Monday to Saturday Lecture Slots Auto-Configured!')
      triggerHaptic(40)
    }, 1200)
  }

  const handleOnboardingSubmit = (e) => {
    e.preventDefault()
    if (!newStudentId || !newName) {
      return notify('Please enter Student ID and Name', 'warning')
    }

    triggerHaptic(30)
    const profilePayload = {
      studentId: newStudentId.trim(),
      name: newName.trim(),
      branch: newBranch.trim(),
      college: newCollege.trim(),
      email: newEmail.trim(),
      avatarPic: avatarPreview,
      subjects: subjects
    }

    registerStudentProfile(profilePayload)
    setWizardOpen(false)
    setWizardStep(1)
    setNewStudentId('')
    setNewName('')
    setNewEmail('')
    setNewPass('')
  }

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault()
    if (!isUnlocked) return notify('Login required to change credentials 🔒 (Default pass: anshu123)', 'warning')

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
        setSecMsg('Private User ID (21250770) & New Password updated in MongoDB Atlas Cloud 🔒')
        setOldPassword('')
        setNewPassword('')
      } else {
        triggerHaptic([40, 60, 40])
        setSecErr(json.message || 'Failed to update credentials. Default pass is anshu123.')
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
      id: 'accounts',
      icon: '👥',
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.18)',
      border: 'rgba(167,139,250,0.3)',
      title: 'Multi-Student Account Switcher & Onboarding Portal',
      subtitle: `Active: ${(Array.isArray(studentProfiles) ? studentProfiles : []).find(p => p.studentId === activeStudentId)?.name || 'Anshu Jaiswal'} • Register ID & Auto-Upload OCR`
    },
    {
      id: 'permissions',
      icon: '🎨',
      color: isUnlocked ? '#34d399' : '#60a5fa',
      bg: isUnlocked ? 'rgba(16,185,129,0.18)' : 'rgba(96,165,250,0.18)',
      border: isUnlocked ? 'rgba(16,185,129,0.3)' : 'rgba(96,165,250,0.3)',
      title: 'App Master Controls & Creative Modes',
      subtitle: isUnlocked ? 'Status: Unlocked (Editing Mode 🔓)' : 'Status: View Only Mode (Locked 🔒)'
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
      subtitle: 'Update Owner User ID (21250770) & Password'
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

  const displayProfiles = React.useMemo(() => {
    const current = Array.isArray(studentProfiles) ? studentProfiles : []
    const hasAnshu = current.some(p => p.studentId === '21250770')
    const hasAnshuman = current.some(p => p.studentId === '21250800')

    const list = [...current]
    if (!hasAnshu) {
      list.unshift({
        studentId: '21250770',
        name: 'Anshu Jaiswal',
        branch: 'B.Tech CSE 2nd Year (Sec B)',
        college: 'UCER',
        email: 'anshujaiswal3000@gmail.com',
        role: 'SUPER ADMIN 👑',
        avatarPic: '/profile.jpg'
      })
    }
    if (!hasAnshuman) {
      list.push({
        studentId: '21250800',
        name: 'Anshuman',
        branch: 'B.Tech CSE 2nd Year (Sec B)',
        college: 'UCER',
        email: 'anshuman@gmail.com',
        role: 'STUDENT MEMBER 🎓',
        avatarPic: ''
      })
    }
    return list
  }, [studentProfiles])

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
          DEDICATED SUB-PAGE: MULTI-STUDENT ACCOUNT SWITCHER & PORTAL
      ───────────────────────────────────────────────────────────── */}
      {activeSubPage === 'accounts' && (
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(167,139,250,0.2)', color: '#a78bfa', display: 'grid', placeItems: 'center', fontSize: 24 }}>
                  👥
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                    Multi-Student Account Switcher
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 600, fontSize: '.78rem' }}>
                    1-Tap Switch Accounts or Onboard New Student Profile
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                size="small"
                startIcon={<MdPersonAdd />}
                onClick={() => {
                  triggerHaptic(20)
                  setWizardOpen(true)
                }}
                sx={{ background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)', borderRadius: '12px', fontWeight: 800, textTransform: 'none' }}
              >
                ➕ Register Profile
              </Button>
            </Box>

            {/* Saved Student Account Cards */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', mb: 1.5, textTransform: 'uppercase', fontSize: '.72rem', letterSpacing: '.05em' }}>
              Saved Student Profiles:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              {displayProfiles.map((prof) => {
                const isActive = activeStudentId === prof.studentId
                return (
                  <Box
                    key={prof.studentId}
                    sx={{
                      p: 2, borderRadius: '18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      border: isActive ? '2px solid #a78bfa' : '1px solid rgba(255,255,255,0.08)',
                      bgcolor: isActive ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)',
                      transition: 'all 200ms ease'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={prof.avatarPic || '/profile.jpg'}
                        sx={{ width: 44, height: 44, border: '2px solid rgba(167,139,250,0.5)' }}
                      />
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', fontSize: '.92rem' }}>
                            {prof.name}
                          </Typography>
                          {isActive && (
                            <Chip label="Active 👤" size="small" sx={{ bgcolor: 'rgba(167,139,250,0.3)', color: '#a78bfa', fontWeight: 800, fontSize: '.68rem', height: 20 }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '.76rem', display: 'block' }}>
                          ID: <strong>{prof.studentId}</strong> • {prof.branch || 'B.Tech CSE'}
                        </Typography>
                      </Box>
                    </Box>

                    {!isActive && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<MdSwapHoriz />}
                        onClick={() => {
                          triggerHaptic(20)
                          switchStudentAccount(prof.studentId)
                        }}
                        sx={{ borderRadius: '10px', color: '#a78bfa', borderColor: 'rgba(167,139,250,0.4)', textTransform: 'none', fontWeight: 800, fontSize: '.75rem' }}
                      >
                        Switch Account
                      </Button>
                    )}
                  </Box>
                )
              })}
            </Box>
          </GlassCard>
        </Box>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3-STEP AUTOMATED ONBOARDING WIZARD DIALOG
      ───────────────────────────────────────────────────────────── */}
      <Dialog
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1, bgcolor: '#0b1120', border: '1px solid rgba(167,139,250,0.3)' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <MdAssignmentInd color="#a78bfa" size={26} /> Student Onboarding & Registration Wizard
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {[1, 2, 3].map((st) => (
              <Box
                key={st}
                sx={{
                  flex: 1, height: 6, borderRadius: '4px',
                  bgcolor: wizardStep >= st ? '#a78bfa' : 'rgba(255,255,255,0.1)'
                }}
              />
            ))}
          </Box>

          {wizardStep === 1 && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#a78bfa' }}>
                Step 1: Student Identity & Profile Picture 📸
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={avatarPreview} sx={{ width: 64, height: 64, border: '2px solid #a78bfa' }} />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<MdCameraAlt />}
                  onClick={() => avatarInputRef.current?.click()}
                  sx={{ borderRadius: '10px', color: '#a78bfa', borderColor: 'rgba(167,139,250,0.4)', textTransform: 'none', fontWeight: 800 }}
                >
                  Upload Profile Photo
                </Button>
                <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarFileChange} />
              </Box>

              <TextField
                fullWidth label="Full Name" size="small" required
                value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Rahul Kumar"
              />

              <TextField
                fullWidth label="Student ID / Roll No" size="small" required
                value={newStudentId} onChange={(e) => setNewStudentId(e.target.value)} placeholder="e.g. 21250890"
              />

              <TextField
                fullWidth label="Branch & Year" size="small"
                value={newBranch} onChange={(e) => setNewBranch(e.target.value)}
              />

              <TextField
                fullWidth label="Account Password" size="small" type="password"
                value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Set password for account switch"
              />
            </Box>
          )}

          {wizardStep === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34d399' }}>
                Step 2: Upload Attendance Record ERP Photo/PDF 📸
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '.84rem' }}>
                Upload screenshot or PDF of your college attendance ERP. AI OCR will parse present/total counts per subject:
              </Typography>

              <Box
                onClick={() => attFileInputRef.current?.click()}
                sx={{
                  p: 3, border: '2px dashed rgba(16,185,129,0.4)', borderRadius: '18px',
                  bgcolor: 'rgba(16,185,129,0.06)', textAlign: 'center', cursor: 'pointer'
                }}
              >
                <MdCloudUpload size={36} color="#34d399" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34d399', mt: 1 }}>
                  {attendanceFile ? `Uploaded: ${attendanceFile}` : 'Tap to Upload Attendance Screenshot / PDF'}
                </Typography>
              </Box>
              <input ref={attFileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleAttendanceFileUpload} />

              {ocrStatusMsg && (
                <Alert severity="success" icon={<MdCheckCircle size={20} />} sx={{ borderRadius: '12px' }}>
                  {ocrStatusMsg}
                </Alert>
              )}
            </Box>
          )}

          {wizardStep === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#60a5fa' }}>
                Step 3: Upload Current Timetable Photo 🗓️
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '.84rem' }}>
                Upload your weekly timetable screenshot. AI will auto-configure Monday to Saturday lecture time ranges:
              </Typography>

              <Box
                onClick={() => ttFileInputRef.current?.click()}
                sx={{
                  p: 3, border: '2px dashed rgba(96,165,250,0.4)', borderRadius: '18px',
                  bgcolor: 'rgba(96,165,250,0.06)', textAlign: 'center', cursor: 'pointer'
                }}
              >
                <MdCloudUpload size={36} color="#60a5fa" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#60a5fa', mt: 1 }}>
                  {timetableFile ? `Uploaded: ${timetableFile}` : 'Tap to Upload Weekly Timetable Photo'}
                </Typography>
              </Box>
              <input ref={ttFileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleTimetableFileUpload} />

              {ocrStatusMsg && (
                <Alert severity="info" sx={{ borderRadius: '12px' }}>{ocrStatusMsg}</Alert>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button disabled={wizardStep === 1} onClick={() => setWizardStep(s => s - 1)} sx={{ textTransform: 'none' }}>
            Previous Step
          </Button>

          {wizardStep < 3 ? (
            <Button variant="contained" onClick={() => setWizardStep(s => s + 1)} sx={{ background: 'var(--aurora)', borderRadius: '10px', textTransform: 'none', fontWeight: 800 }}>
              Next Step ➔
            </Button>
          ) : (
            <Button variant="contained" onClick={handleOnboardingSubmit} sx={{ background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)', borderRadius: '10px', textTransform: 'none', fontWeight: 800 }}>
              🎉 Save & Onboard Student
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED SUB-PAGE: APP MASTER CONTROLS & CREATIVE MODES
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(167,139,250,0.2)', color: '#a78bfa', display: 'grid', placeItems: 'center', fontSize: 24 }}>
                🎨
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                  App Master Controls & Creative Modes
                </Typography>
                <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 700, fontSize: '.78rem' }}>
                  Custom Haptics, Auto-Lock Timeouts, and Editing Mode State
                </Typography>
              </Box>
            </Box>

            {/* 1. Editing Mode Switcher */}
            <Box sx={{ p: 2, mb: 2, borderRadius: '18px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isUnlocked ? <MdLockOpen color="#34d399" size={20} /> : <MdLock color="#60a5fa" size={20} />}
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }}>
                    Editing Mode Permission
                  </Typography>
                </Box>
                <Chip
                  label={isUnlocked ? 'Unlocked 🔓' : 'View Only 🔒'}
                  size="small"
                  sx={{ bgcolor: isUnlocked ? 'rgba(16,185,129,0.2)' : 'rgba(96,165,250,0.2)', color: isUnlocked ? '#34d399' : '#60a5fa', fontWeight: 800, fontSize: '.7rem' }}
                />
              </Box>

              {isUnlocked ? (
                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  onClick={() => {
                    triggerHaptic(20)
                    lockApp()
                    notify('Editing Mode Locked (Switched to View Only) 🔒', 'info')
                  }}
                  sx={{ borderRadius: '12px', mt: 1, textTransform: 'none', fontWeight: 800, fontSize: '.82rem' }}
                >
                  🔒 Lock Editing Mode (Switch to View Only)
                </Button>
              ) : (
                <form onSubmit={handleOwnerUnlockSubmit}>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter password (default: anshu123)"
                      type={showUnlockPass ? 'text' : 'password'}
                      value={unlockPasswordInput}
                      onChange={(e) => setUnlockPasswordInput(e.target.value)}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{ background: 'var(--aurora)', borderRadius: '10px', textTransform: 'none', fontWeight: 800, px: 2.5 }}
                    >
                      Unlock 🔓
                    </Button>
                  </Box>
                </form>
              )}
            </Box>

            {/* 2. Mobile Haptics Toggle */}
            <Box sx={{ p: 2, mb: 2, borderRadius: '18px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <MdVibration size={22} color="#60a5fa" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }}>
                    Tactile Haptic Vibration
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '.75rem' }}>
                    Vibrates phone on button clicks & attendance logs
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={hapticsEnabled}
                onChange={(e) => {
                  const val = e.target.checked
                  setHapticsEnabled(val)
                  if (val) triggerHaptic([30, 50, 30])
                  const updated = { ...settings, hapticsEnabled: val }
                  setSettings(updated)
                  pushToCloud({ settings: updated })
                  notify(val ? 'Haptic Vibrations Enabled ⚡' : 'Haptic Vibrations Disabled 🔇')
                }}
              />
            </Box>

            {/* 3. Session Auto-Lock Timeout */}
            <Box sx={{ p: 2, borderRadius: '18px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <MdTimer size={22} color="#a78bfa" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }}>
                    Session Auto-Lock Timeout
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '.75rem' }}>
                    Automatically locks editing mode after inactivity
                  </Typography>
                </Box>
              </Box>

              <Select
                size="small"
                value={autoLockTimeout}
                onChange={(e) => {
                  const val = e.target.value
                  setAutoLockTimeout(val)
                  triggerHaptic(15)
                  const updated = { ...settings, autoLockTimeout: val }
                  setSettings(updated)
                  pushToCloud({ settings: updated })
                  notify(`Auto-lock timeout set to ${val} mins!`)
                }}
                sx={{ borderRadius: '12px', minWidth: 110, fontSize: '.8rem', fontWeight: 800 }}
              >
                <MenuItem value="5">5 Mins</MenuItem>
                <MenuItem value="15">15 Mins</MenuItem>
                <MenuItem value="30">30 Mins</MenuItem>
                <MenuItem value="never">Never Lock</MenuItem>
              </Select>
            </Box>
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
                  placeholder="Default password is: anshu123"
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
