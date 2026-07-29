import React, { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { STORAGE_KEYS, collectAllData, downloadJSON, applyImportedData } from '../utils/storageUtils'
import { defaultSubjects, buildSubject, DEFAULT_TIMETABLE_HEADER, generateSeedHistory } from '../data/defaultSubjects'
import { SEMESTER_1_SUBJECTS, SEMESTER_2_SUBJECTS } from '../data/semestersSeedData'
import QuickUnlockDialog from '../components/QuickUnlockDialog'

const AttendanceContext = createContext(null)

export function useAttendance() {
  const ctx = useContext(AttendanceContext)
  if (!ctx) throw new Error('useAttendance must be used within AttendanceProvider')
  return ctx
}

const DEFAULT_SETTINGS = {
  semester: 'Semester 3',
  semesters: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'],
  autoAttendance: true,
  targetPercentage: 75,
  hapticFeedback: true
}

function seedSubjects() {
  return defaultSubjects.map((s) => buildSubject(s))
}

function seedHistory() {
  return generateSeedHistory(seedSubjects())
}

export function AttendanceProvider({ children }) {
  // Active Sem 3 subjects
  const [sem3Subjects, setSem3Subjects] = useLocalStorage(STORAGE_KEYS.subjects, seedSubjects())
  const [sem1Subjects, setSem1Subjects] = useLocalStorage('attendx_sem1_subjects', SEMESTER_1_SUBJECTS)
  const [sem2Subjects, setSem2Subjects] = useLocalStorage('attendx_sem2_subjects', SEMESTER_2_SUBJECTS)

  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.history, seedHistory())
  const [bunks, setBunks] = useLocalStorage('attendx_bunks', [])
  const [autoLoggedSlots, setAutoLoggedSlots] = useLocalStorage('attendx_auto_logged_slots', [])
  
  // Default to Locked Mode for guests
  const [isUnlocked, setIsUnlocked] = useLocalStorage('attendx_is_unlocked', false)
  const [timetableHeader, setTimetableHeader] = useLocalStorage('attendx_timetable_header', DEFAULT_TIMETABLE_HEADER)

  const [notes, setNotes] = useLocalStorage(STORAGE_KEYS.notes, [
    {
      id: 'note_1',
      title: 'Digital Logic Design Assignment',
      subjectId: 'subj_dld',
      subjectName: 'DIGITAL LOGIC DESIGN (DLD)',
      category: 'Assignment',
      content: 'Complete K-Map minimization problems 1 to 5.',
      date: '26/07/2026',
      completed: false
    }
  ])

  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [dbSynced, setDbSynced] = useState(false)
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false)

  const openUnlockDialog = useCallback(() => {
    setUnlockDialogOpen(true)
  }, [])

  const notify = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }, [])

  const closeSnackbar = useCallback(() => {
    setSnackbar((s) => ({ ...s, open: false }))
  }, [])

  const DEFAULT_ANSHU_PROFILE = {
    studentId: '21250770',
    name: 'Anshu Jaiswal',
    branch: 'B.Tech CSE 2nd Year (Sec B)',
    college: 'UCER',
    email: 'anshujaiswal3000@gmail.com',
    role: 'SUPER ADMIN 👑',
    avatarPic: '/profile.jpg'
  }

  const [studentProfiles, setStudentProfiles] = useLocalStorage('attendx_student_profiles', [DEFAULT_ANSHU_PROFILE])
  const [activeStudentId, setActiveStudentId] = useLocalStorage('attendx_active_student_id', '21250770')

  const activeProfile = useMemo(() => {
    const currentList = Array.isArray(studentProfiles) ? studentProfiles : [DEFAULT_ANSHU_PROFILE]
    return currentList.find(p => p.studentId === activeStudentId) || DEFAULT_ANSHU_PROFILE
  }, [studentProfiles, activeStudentId])

  const registerStudentProfile = useCallback(async (profileData) => {
    const currentList = Array.isArray(studentProfiles) ? studentProfiles : [DEFAULT_ANSHU_PROFILE]
    const updatedProfiles = [...currentList.filter(p => p.studentId !== profileData.studentId), profileData]
    setStudentProfiles(updatedProfiles)
    setActiveStudentId(profileData.studentId)

    if (profileData.subjects && profileData.subjects.length > 0) {
      setSem3Subjects(profileData.subjects)
    }

    notify(`Student account created for ${profileData.name}! 🎉`, 'success')

    try {
      await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })
    } catch (e) {}
  }, [studentProfiles, setStudentProfiles, setActiveStudentId, setSem3Subjects, notify])

  const switchStudentAccount = useCallback((studentId) => {
    const currentList = Array.isArray(studentProfiles) ? studentProfiles : [DEFAULT_ANSHU_PROFILE]
    const target = currentList.find(p => p.studentId === studentId)
    if (!target) return
    setActiveStudentId(studentId)
    if (target.subjects && target.subjects.length > 0) {
      setSem3Subjects(target.subjects)
    }
    notify(`Switched account to ${target.name} [ID: ${studentId}]! 👤`, 'success')
  }, [studentProfiles, setActiveStudentId, setSem3Subjects, notify])

  // Tap debouncer ref to prevent accidental rapid double-taps
  const lastTapRef = useRef({})

  const activeSemester = settings?.semester || 'Semester 3'

  // Dynamic Subjects depending on active semester selection with strict safety fallback
  const subjects = useMemo(() => {
    let list = sem3Subjects
    if (activeSemester === 'Semester 1') list = sem1Subjects
    else if (activeSemester === 'Semester 2') list = sem2Subjects
    
    if (!Array.isArray(list) || list.length === 0) {
      return seedSubjects()
    }
    return list
  }, [activeSemester, sem1Subjects, sem2Subjects, sem3Subjects])

  // Timetable & Upcoming Lecture ALWAYS uses Sem 3 active schedule with safety guard
  const timetableSubjects = useMemo(() => {
    if (!Array.isArray(sem3Subjects) || sem3Subjects.length === 0) {
      return seedSubjects()
    }
    return sem3Subjects
  }, [sem3Subjects])

  const isCloudLoadedRef = useRef(false)
  const lastEditTimestampRef = useRef(0)

  // ── MONGODB REAL-TIME CLOUD SYNC ENGINE ──
  const pushToCloud = useCallback(async (overrides = {}) => {
    // Prevent pushing empty/uninitialized local state to MongoDB Atlas on startup
    if (!isCloudLoadedRef.current && Object.keys(overrides).length === 0) {
      return
    }

    try {
      const payload = {
        subjects: overrides.subjects !== undefined ? overrides.subjects : sem3Subjects,
        sem1Subjects: overrides.sem1Subjects !== undefined ? overrides.sem1Subjects : sem1Subjects,
        sem2Subjects: overrides.sem2Subjects !== undefined ? overrides.sem2Subjects : sem2Subjects,
        history: overrides.history !== undefined ? overrides.history : history,
        bunks: overrides.bunks !== undefined ? overrides.bunks : bunks,
        notes: overrides.notes !== undefined ? overrides.notes : notes,
        settings: overrides.settings !== undefined ? overrides.settings : settings,
        timetableHeader: overrides.timetableHeader !== undefined ? overrides.timetableHeader : timetableHeader,
        autoLoggedSlots: overrides.autoLoggedSlots !== undefined ? overrides.autoLoggedSlots : autoLoggedSlots
      }
      const res = await fetch(`/api/sync/${activeStudentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setDbSynced(true)
      }
    } catch (err) {
      setDbSynced(false)
    }
  }, [activeStudentId, sem3Subjects, sem1Subjects, sem2Subjects, history, bunks, notes, settings, timetableHeader, autoLoggedSlots])

  const pullFromCloud = useCallback(async () => {
    try {
      const res = await fetch(`/api/sync/${activeStudentId}`)
      if (!res.ok) return
      const json = await res.json()
      if (json.success && json.data) {
        const cloud = json.data
        setDbSynced(true)
        isCloudLoadedRef.current = true

        const isRecentlyEditedLocally = Date.now() - lastEditTimestampRef.current < 5000

        if (cloud.subjects && cloud.subjects.length > 0) {
          setSem3Subjects((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(cloud.subjects)) {
              try { localStorage.setItem(STORAGE_KEYS.subjects, JSON.stringify(cloud.subjects)) } catch (e) {}
              return cloud.subjects
            }
            return prev
          })
        }
        if (cloud.sem1Subjects && cloud.sem1Subjects.length > 0) {
          setSem1Subjects((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(cloud.sem1Subjects)) {
              try { localStorage.setItem('attendx_sem1_subjects', JSON.stringify(cloud.sem1Subjects)) } catch (e) {}
              return cloud.sem1Subjects
            }
            return prev
          })
        }
        if (cloud.sem2Subjects && cloud.sem2Subjects.length > 0) {
          setSem2Subjects((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(cloud.sem2Subjects)) {
              try { localStorage.setItem('attendx_sem2_subjects', JSON.stringify(cloud.sem2Subjects)) } catch (e) {}
              return cloud.sem2Subjects
            }
            return prev
          })
        }
        if (Array.isArray(cloud.history)) {
          setHistory((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(cloud.history)) {
              try { localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(cloud.history)) } catch (e) {}
              return cloud.history
            }
            return prev
          })
        }
        if (Array.isArray(cloud.bunks)) {
          setBunks((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(cloud.bunks)) {
              try { localStorage.setItem('attendx_bunks', JSON.stringify(cloud.bunks)) } catch (e) {}
              return cloud.bunks
            }
            return prev
          })
        }
        if (Array.isArray(cloud.notes)) {
          setNotes((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(cloud.notes)) {
              try { localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(cloud.notes)) } catch (e) {}
              return cloud.notes
            }
            return prev
          })
        }
        if (cloud.settings && typeof cloud.settings === 'object' && !isRecentlyEditedLocally) {
          setSettings((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(cloud.settings)) {
              try { localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(cloud.settings)) } catch (e) {}
              return cloud.settings
            }
            return prev
          })
        }
        if (cloud.timetableHeader && typeof cloud.timetableHeader === 'object') {
          setTimetableHeader((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(cloud.timetableHeader)) {
              try { localStorage.setItem('attendx_timetable_header', JSON.stringify(cloud.timetableHeader)) } catch (e) {}
              return cloud.timetableHeader
            }
            return prev
          })
        }
        if (Array.isArray(cloud.autoLoggedSlots)) {
          setAutoLoggedSlots((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(cloud.autoLoggedSlots)) {
              try { localStorage.setItem('attendx_auto_logged_slots', JSON.stringify(cloud.autoLoggedSlots)) } catch (e) {}
              return cloud.autoLoggedSlots
            }
            return prev
          })
        }
      }
    } catch (err) {
      setDbSynced(false)
    }
  }, [
    activeStudentId, setSem3Subjects, setSem1Subjects, setSem2Subjects, setHistory,
    setBunks, setNotes, setSettings, setTimetableHeader, setAutoLoggedSlots
  ])

  useEffect(() => {
    pullFromCloud()
    const timer = setInterval(pullFromCloud, 2000)
    return () => clearInterval(timer)
  }, [pullFromCloud])

  /** Instant 0ms Semester Switcher */
  const switchSemester = useCallback((semId) => {
    lastEditTimestampRef.current = Date.now()
    const updated = { ...settings, semester: semId }
    try { localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(updated)) } catch (e) {}
    setSettings(updated)
    pushToCloud({ settings: updated })
    notify(`Switched to ${semId} attendance records! 🎓`, 'success')
  }, [settings, setSettings, pushToCloud, notify])

  // Strict Owner Authentication with MongoDB Cloud (Supports single password arg or userId+password)
  const unlockApp = useCallback(async (arg1, arg2) => {
    const userIdInput = (arg2 ? arg1 : '21250770').trim()
    const passwordInput = (arg2 ? arg2 : arg1 || '').trim()

    // Fast local instant unlock for default credentials
    if (passwordInput === 'anshu123' || passwordInput === '21250770') {
      setIsUnlocked(true)
      notify('Welcome Anshu! Editing mode unlocked 🔓', 'success')
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdInput, password: passwordInput })
      }).catch(() => {})
      return true
    }

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdInput, password: passwordInput })
      })
      const json = await res.json()
      if (json.success) {
        setIsUnlocked(true)
        notify('Welcome Anshu! Editing mode unlocked 🔓', 'success')
        return true
      } else {
        notify('Invalid Owner Password! (Default is: anshu123)', 'error')
        return false
      }
    } catch (err) {
      notify('Authentication error — check backend server', 'error')
      return false
    }
  }, [setIsUnlocked, notify])

  const lockApp = useCallback(() => {
    setIsUnlocked(false)
    notify('Locked to View-Only mode 🔒', 'info')
  }, [setIsUnlocked, notify])

  // ── 5-MINUTE INACTIVITY AUTO-LOCK ENGINE ──
  useEffect(() => {
    if (!isUnlocked) return

    const timeoutMinutes = parseInt(settings?.autoLockTimeout || '5', 10)
    if (isNaN(timeoutMinutes) || timeoutMinutes <= 0) return

    const timeoutMs = timeoutMinutes * 60 * 1000
    let timerId = null

    const resetTimer = () => {
      if (timerId) clearTimeout(timerId)
      timerId = setTimeout(() => {
        setIsUnlocked(false)
        notify(`Auto-locked after ${timeoutMinutes} mins inactivity 🔒`, 'info')
      }, timeoutMs)
    }

    const events = ['mousemove', 'keydown', 'touchstart', 'click', 'scroll']
    events.forEach(event => window.addEventListener(event, resetTimer))
    resetTimer()

    return () => {
      if (timerId) clearTimeout(timerId)
      events.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [isUnlocked, settings?.autoLockTimeout, setIsUnlocked, notify])

  /** Mark a subject Present or Absent - STRICT OWNER PERMISSION REQUIRED + LAB (+2) SUPPORT
   *  @param {string} subjectId - Subject ID
   *  @param {'present'|'absent'} status - Attendance status
   *  @param {string} [customDate] - Optional DD/MM/YYYY date for manual past-date entry
   */
  const markAttendance = useCallback((subjectId, status, customDate = null) => {
    if (!isUnlocked) {
      setUnlockDialogOpen(true)
      notify('Login required to make changes 🔒', 'warning')
      return
    }

    // Deduplicate rapid accidental double-taps (within 500ms)
    const tapKey = `${subjectId}_${status}`
    const nowMs = Date.now()
    if (lastTapRef.current[tapKey] && nowMs - lastTapRef.current[tapKey] < 500) {
      return
    }
    lastTapRef.current[tapKey] = nowMs

    let subjectName = ''
    
    const updateSubjectList = (prevList) =>
      prevList.map((s) => {
        if (s.id !== subjectId) return s
        subjectName = s.name
        const isLab = s.isLab || s.name.toLowerCase().includes('lab')
        const count = isLab ? 2 : 1

        if (status === 'present') {
          return { ...s, present: s.present + count, total: s.total + count }
        } else {
          const newPresent = Math.max(0, s.present - (s.present >= count ? count : s.present))
          const newTotal = s.total > s.present ? s.total : s.total + count
          return { ...s, present: newPresent, total: newTotal }
        }
      })

    let currentList = []
    if (activeSemester === 'Semester 1') currentList = sem1Subjects
    else if (activeSemester === 'Semester 2') currentList = sem2Subjects
    else currentList = sem3Subjects

    const updatedSubjects = updateSubjectList(currentList)

    if (activeSemester === 'Semester 1') setSem1Subjects(updatedSubjects)
    else if (activeSemester === 'Semester 2') setSem2Subjects(updatedSubjects)
    else setSem3Subjects(updatedSubjects)

    // Support optional customDate parameter (DD/MM/YYYY format)
    const now = new Date()
    let dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    let entryTimestamp = now.getTime()
    if (customDate) {
      const parts = customDate.split('/')
      if (parts.length === 3) {
        dateFormatted = customDate
        const parsed = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 10, 0, 0)
        if (!isNaN(parsed.getTime())) entryTimestamp = parsed.getTime()
      }
    }
    const entry = {
      id: `log_${Math.random().toString(36).slice(2, 10)}`,
      subjectId,
      subjectName,
      status,
      date: dateFormatted,
      timestamp: entryTimestamp,
      isManual: !!customDate,
    }

    const newHistory = [entry, ...(history || [])]
    setHistory(newHistory)

    notify(status === 'present' ? 'Marked Present ✅' : 'Marked Absent ❌', status === 'present' ? 'success' : 'warning')
    
    // EXPLICITLY PASS UPDATED SUBJECTS & HISTORY TO PUSH TO CLOUD SO STALE STATE IS NEVER SAVED
    const syncPayload = { history: newHistory }
    if (activeSemester === 'Semester 1') syncPayload.sem1Subjects = updatedSubjects
    else if (activeSemester === 'Semester 2') syncPayload.sem2Subjects = updatedSubjects
    else syncPayload.subjects = updatedSubjects

    pushToCloud(syncPayload)
  }, [isUnlocked, activeSemester, history, sem1Subjects, sem2Subjects, sem3Subjects, setSem1Subjects, setSem2Subjects, setSem3Subjects, setHistory, notify, pushToCloud])

  const logBunkClass = useCallback((subjectId, reason = 'Personal') => {
    if (!isUnlocked) {
      setUnlockDialogOpen(true)
      notify('Login required to make changes 🔒', 'warning')
      return
    }

    let subjectName = ''
    const sub = subjects.find(s => s.id === subjectId)
    if (sub) subjectName = sub.name
    
    const now = new Date()
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    const bunkEntry = {
      id: `bunk_${Math.random().toString(36).slice(2, 10)}`,
      subjectId,
      subjectName,
      reason,
      date: dateFormatted,
      timestamp: now.getTime()
    }

    let newBunks = []
    setBunks((prev) => {
      newBunks = [bunkEntry, ...prev]
      return newBunks
    })

    notify(`Bunk logged for ${subjectName || 'Class'} 🚪`, 'info')
    pushToCloud({ bunks: newBunks })
  }, [isUnlocked, subjects, setBunks, notify, pushToCloud])

  const deleteBunkClass = useCallback((id) => {
    if (!isUnlocked) {
      setUnlockDialogOpen(true)
      notify('Login required to make changes 🔒', 'warning')
      return
    }
    let newBunks = []
    setBunks((prev) => {
      newBunks = prev.filter((b) => b.id !== id)
      return newBunks
    })
    notify('Bunk record removed', 'info')
    pushToCloud({ bunks: newBunks })
  }, [isUnlocked, setBunks, notify, pushToCloud])

  const addSubject = useCallback((data) => {
    if (!isUnlocked) {
      setUnlockDialogOpen(true)
      notify('Login required to make changes 🔒', 'warning')
      return null
    }
    const subject = buildSubject(data)
    let nextList = []

    if (activeSemester === 'Semester 1') {
      nextList = [...sem1Subjects, subject]
      setSem1Subjects(nextList)
      pushToCloud({ sem1Subjects: nextList })
    } else if (activeSemester === 'Semester 2') {
      nextList = [...sem2Subjects, subject]
      setSem2Subjects(nextList)
      pushToCloud({ sem2Subjects: nextList })
    } else {
      nextList = [...sem3Subjects, subject]
      setSem3Subjects(nextList)
      pushToCloud({ subjects: nextList })
    }

    notify('Subject added ✨')
    return subject.id
  }, [isUnlocked, activeSemester, sem1Subjects, sem2Subjects, sem3Subjects, setSem1Subjects, setSem2Subjects, setSem3Subjects, notify, pushToCloud])

  const updateSubject = useCallback((id, updates) => {
    if (!isUnlocked) {
      setUnlockDialogOpen(true)
      notify('Login required to make changes 🔒', 'warning')
      return
    }

    let updatedList = []
    if (activeSemester === 'Semester 1') {
      updatedList = sem1Subjects.map((s) => (s.id === id ? { ...s, ...updates } : s))
      setSem1Subjects(updatedList)
      pushToCloud({ sem1Subjects: updatedList })
    } else if (activeSemester === 'Semester 2') {
      updatedList = sem2Subjects.map((s) => (s.id === id ? { ...s, ...updates } : s))
      setSem2Subjects(updatedList)
      pushToCloud({ sem2Subjects: updatedList })
    } else {
      updatedList = sem3Subjects.map((s) => (s.id === id ? { ...s, ...updates } : s))
      setSem3Subjects(updatedList)
      pushToCloud({ subjects: updatedList })
    }

    notify('Subject updated live ✏️')
  }, [isUnlocked, activeSemester, sem1Subjects, sem2Subjects, sem3Subjects, setSem1Subjects, setSem2Subjects, setSem3Subjects, notify, pushToCloud])

  const deleteSubject = useCallback((id) => {
    if (!isUnlocked) {
      setUnlockDialogOpen(true)
      notify('Login required to make changes 🔒', 'warning')
      return
    }

    let filteredList = []
    if (activeSemester === 'Semester 1') {
      filteredList = sem1Subjects.filter((s) => s.id !== id)
      setSem1Subjects(filteredList)
    } else if (activeSemester === 'Semester 2') {
      filteredList = sem2Subjects.filter((s) => s.id !== id)
      setSem2Subjects(filteredList)
    } else {
      filteredList = sem3Subjects.filter((s) => s.id !== id)
      setSem3Subjects(filteredList)
    }

    const nextHist = history.filter((h) => h.subjectId !== id)
    setHistory(nextHist)

    const syncPayload = { history: nextHist }
    if (activeSemester === 'Semester 1') syncPayload.sem1Subjects = filteredList
    else if (activeSemester === 'Semester 2') syncPayload.sem2Subjects = filteredList
    else syncPayload.subjects = filteredList

    pushToCloud(syncPayload)
    notify('Subject deleted 🗑️', 'info')
  }, [isUnlocked, activeSemester, sem1Subjects, sem2Subjects, sem3Subjects, history, setSem1Subjects, setSem2Subjects, setSem3Subjects, setHistory, notify, pushToCloud])

  const deleteHistoryEntry = useCallback((logId) => {
    if (!isUnlocked) {
      setUnlockDialogOpen(true)
      notify('Login required to make changes 🔒', 'warning')
      return
    }

    const targetLog = history.find(h => h.id === logId)
    if (!targetLog) return

    const inc = targetLog.increment || (targetLog.isLab ? 2 : 1)
    const subjId = targetLog.subjectId

    // Update subject counts live
    const updateSubjectList = (list) =>
      list.map((s) => {
        if (s.id === subjId) {
          if (targetLog.status === 'present') {
            return {
              ...s,
              present: Math.max(0, s.present - inc),
              total: Math.max(0, s.total - inc)
            }
          } else {
            return {
              ...s,
              total: Math.max(0, s.total - 1)
            }
          }
        }
        return s
      })

    // Compute synchronously to avoid async setState race condition
    let updatedSubjects = []
    if (activeSemester === 'Semester 1') {
      updatedSubjects = updateSubjectList(sem1Subjects)
      setSem1Subjects(updatedSubjects)
    } else if (activeSemester === 'Semester 2') {
      updatedSubjects = updateSubjectList(sem2Subjects)
      setSem2Subjects(updatedSubjects)
    } else {
      updatedSubjects = updateSubjectList(sem3Subjects)
      setSem3Subjects(updatedSubjects)
    }

    const nextHistory = history.filter((h) => h.id !== logId)
    setHistory(nextHistory)

    // Clean up autoLoggedSlots matching this date and subject
    const nextAutoSlots = autoLoggedSlots.filter(s => !s.includes(`${targetLog.date}_${subjId}`))
    setAutoLoggedSlots(nextAutoSlots)

    notify(`Deleted log for ${targetLog.subjectName} 🗑️ — Attendance updated live!`, 'info')

    const syncPayload = {
      history: nextHistory,
      autoLoggedSlots: nextAutoSlots
    }
    if (activeSemester === 'Semester 1') syncPayload.sem1Subjects = updatedSubjects
    else if (activeSemester === 'Semester 2') syncPayload.sem2Subjects = updatedSubjects
    else syncPayload.subjects = updatedSubjects

    pushToCloud(syncPayload)
  }, [isUnlocked, activeSemester, history, autoLoggedSlots, setSem1Subjects, setSem2Subjects, setSem3Subjects, setHistory, setAutoLoggedSlots, notify, pushToCloud])

  const addNote = useCallback((noteData) => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
      return
    }
    const newNote = {
      id: `note_${Math.random().toString(36).slice(2, 10)}`,
      completed: false,
      ...noteData,
    }
    setNotes((prev) => {
      const next = [newNote, ...prev]
      pushToCloud({ notes: next })
      return next
    })
    notify('Note added')
  }, [isUnlocked, setNotes, notify, pushToCloud])

  const toggleNoteComplete = useCallback((id) => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
      return
    }
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
      pushToCloud({ notes: next })
      return next
    })
  }, [isUnlocked, setNotes, pushToCloud])

  const deleteNote = useCallback((id) => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
      return
    }
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id)
      pushToCloud({ notes: next })
      return next
    })
    notify('Note deleted', 'info')
  }, [isUnlocked, setNotes, notify, pushToCloud])

  const resetAttendance = useCallback(() => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
      return
    }
    const resetList = (prev) => prev.map((s) => ({ ...s, present: 0, total: 0 }))
    setSem3Subjects(resetList)
    setSem1Subjects(resetList)
    setSem2Subjects(resetList)
    setHistory([])
    setBunks([])
    setAutoLoggedSlots([])
    notify('Attendance reset', 'info')
    pushToCloud({
      subjects: seedSubjects(),
      sem1Subjects: SEMESTER_1_SUBJECTS,
      sem2Subjects: SEMESTER_2_SUBJECTS,
      history: [],
      bunks: [],
      autoLoggedSlots: []
    })
  }, [isUnlocked, setSem3Subjects, setSem1Subjects, setSem2Subjects, setHistory, setBunks, setAutoLoggedSlots, notify, pushToCloud])

  const updateTimetable = useCallback((subjectId, timetable) => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
      return
    }
    let updatedList = sem3Subjects.map((s) => (s.id === subjectId ? { ...s, timetable } : s))
    setSem3Subjects(updatedList)
    pushToCloud({ subjects: updatedList })
    notify('Timetable updated')
  }, [isUnlocked, sem3Subjects, setSem3Subjects, notify, pushToCloud])

  const exportData = useCallback(() => {
    const data = collectAllData()
    downloadJSON(data, `attendx-export-${Date.now()}.json`)
    notify('Data exported')
  }, [notify])

  const importData = useCallback((data) => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
      return
    }
    applyImportedData(data)
    if (data.subjects) setSem3Subjects(data.subjects)
    if (data.sem1Subjects) setSem1Subjects(data.sem1Subjects)
    if (data.sem2Subjects) setSem2Subjects(data.sem2Subjects)
    if (data.history) setHistory(data.history)
    if (data.settings) setSettings(data.settings)
    if (data.notes) setNotes(data.notes)
    notify('Data imported — reloaded from backup')
    pushToCloud(data)
  }, [isUnlocked, setSem3Subjects, setSem1Subjects, setSem2Subjects, setHistory, setSettings, setNotes, notify, pushToCloud])

  const value = useMemo(() => ({
    subjects,
    timetableSubjects,
    history,
    bunks,
    notes,
    settings,
    isUnlocked,
    dbSynced,
    timetableHeader,
    setTimetableHeader,
    setSettings,
    switchSemester,
    snackbar,
    notify,
    closeSnackbar,
    unlockApp,
    lockApp,
    openUnlockDialog,
    markAttendance,
    logBunkClass,
    deleteBunkClass,
    addSubject,
    updateSubject,
    deleteSubject,
    deleteHistoryEntry,
    addNote,
    toggleNoteComplete,
    deleteNote,
    resetAttendance,
    updateTimetable,
    exportData,
    importData,
    pushToCloud,
    pullFromCloud,
    studentProfiles,
    activeStudentId,
    activeProfile,
    registerStudentProfile,
    switchStudentAccount
  }), [
    subjects, timetableSubjects, history, bunks, notes, settings, isUnlocked, dbSynced, timetableHeader,
    setTimetableHeader, snackbar, notify, closeSnackbar, unlockApp, lockApp,
    markAttendance, logBunkClass, deleteBunkClass, addSubject, updateSubject, deleteSubject,
    addNote, toggleNoteComplete, deleteNote, resetAttendance, updateTimetable, exportData, importData,
    pushToCloud, pullFromCloud, setSettings, studentProfiles, activeStudentId, activeProfile, registerStudentProfile, switchStudentAccount
  ])

  return (
    <AttendanceContext.Provider value={value}>
      {children}
      <QuickUnlockDialog open={unlockDialogOpen} onClose={() => setUnlockDialogOpen(false)} />
    </AttendanceContext.Provider>
  )
}
