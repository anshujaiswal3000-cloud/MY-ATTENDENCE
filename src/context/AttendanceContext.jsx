import React, { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { STORAGE_KEYS, collectAllData, downloadJSON, applyImportedData } from '../utils/storageUtils'
import { defaultSubjects, buildSubject, DEFAULT_TIMETABLE_HEADER, generateSeedHistory } from '../data/defaultSubjects'
import { SEMESTER_1_SUBJECTS, SEMESTER_2_SUBJECTS } from '../data/semestersSeedData'
import { getTodayName, WEEKDAYS } from '../utils/attendanceUtils'

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

  // Tap debouncer ref to prevent accidental rapid double-taps
  const lastTapRef = useRef({})

  const notify = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }, [])

  const closeSnackbar = useCallback(() => {
    setSnackbar((s) => ({ ...s, open: false }))
  }, [])

  const activeSemester = settings?.semester || 'Semester 3'

  // Dynamic Subjects depending on active semester selection
  const subjects = useMemo(() => {
    if (activeSemester === 'Semester 1') return sem1Subjects
    if (activeSemester === 'Semester 2') return sem2Subjects
    return sem3Subjects
  }, [activeSemester, sem1Subjects, sem2Subjects, sem3Subjects])

  // Timetable & Upcoming Lecture ALWAYS uses Sem 3 active schedule
  const timetableSubjects = sem3Subjects

  // ── MONGODB REAL-TIME CLOUD SYNC ENGINE ──
  const pushToCloud = useCallback(async (overrides = {}) => {
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
      const res = await fetch('/api/sync/anshu', {
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
  }, [sem3Subjects, sem1Subjects, sem2Subjects, history, bunks, notes, settings, timetableHeader, autoLoggedSlots])

  const pullFromCloud = useCallback(async () => {
    try {
      const res = await fetch('/api/sync/anshu')
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          const cloud = json.data
          if (cloud.subjects && cloud.subjects.length > 0) setSem3Subjects(cloud.subjects)
          if (cloud.sem1Subjects && cloud.sem1Subjects.length > 0) setSem1Subjects(cloud.sem1Subjects)
          if (cloud.sem2Subjects && cloud.sem2Subjects.length > 0) setSem2Subjects(cloud.sem2Subjects)
          if (cloud.history) setHistory(cloud.history)
          if (cloud.bunks) setBunks(cloud.bunks)
          if (cloud.notes) setNotes(cloud.notes)
          if (cloud.settings) setSettings(cloud.settings)
          if (cloud.timetableHeader) setTimetableHeader(cloud.timetableHeader)
          if (cloud.autoLoggedSlots) setAutoLoggedSlots(cloud.autoLoggedSlots)
          setDbSynced(true)
        }
      }
    } catch (err) {
      setDbSynced(false)
    }
  }, [setSem3Subjects, setSem1Subjects, setSem2Subjects, setHistory, setBunks, setNotes, setSettings, setTimetableHeader, setAutoLoggedSlots])

  useEffect(() => {
    pullFromCloud()
    const timer = setInterval(pullFromCloud, 10000)
    return () => clearInterval(timer)
  }, [pullFromCloud])

  // Strict Owner Authentication with MongoDB Cloud
  const unlockApp = useCallback(async (userIdInput, passwordInput) => {
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdInput, password: passwordInput })
      })
      const json = await res.json()
      if (json.success) {
        setIsUnlocked(true)
        notify('Welcome Anshu! Editing mode unlocked 🔓')
        return true
      } else {
        notify('Invalid User ID or Password!', 'error')
        return false
      }
    } catch (err) {
      notify('Network error during verification', 'error')
      return false
    }
  }, [setIsUnlocked, notify])

  const lockApp = useCallback(() => {
    setIsUnlocked(false)
    notify('Locked to View-Only mode 🔒', 'info')
  }, [setIsUnlocked, notify])

  /** Mark a subject Present or Absent - STRICT OWNER PERMISSION REQUIRED + IMMEDIATE CLOUD SYNC */
  const markAttendance = useCallback((subjectId, status) => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
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
        if (status === 'present') {
          return { ...s, present: s.present + 1, total: s.total + 1 }
        } else {
          const newPresent = Math.max(0, s.present - (s.present > 0 ? 1 : 0))
          const newTotal = s.total > s.present ? s.total : s.total + 1
          return { ...s, present: newPresent, total: newTotal }
        }
      })

    let updatedSubjects = []
    if (activeSemester === 'Semester 1') {
      setSem1Subjects((prev) => {
        updatedSubjects = updateSubjectList(prev)
        return updatedSubjects
      })
    } else if (activeSemester === 'Semester 2') {
      setSem2Subjects((prev) => {
        updatedSubjects = updateSubjectList(prev)
        return updatedSubjects
      })
    } else {
      setSem3Subjects((prev) => {
        updatedSubjects = updateSubjectList(prev)
        return updatedSubjects
      })
    }

    const now = new Date()
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    const entry = {
      id: `log_${Math.random().toString(36).slice(2, 10)}`,
      subjectId,
      subjectName,
      status,
      date: dateFormatted,
      timestamp: now.getTime(),
    }

    let newHistory = []
    setHistory((prev) => {
      newHistory = [entry, ...prev]
      return newHistory
    })

    notify(status === 'present' ? 'Marked Present ✅' : 'Marked Absent ❌', status === 'present' ? 'success' : 'warning')
    
    // EXPLICITLY PASS UPDATED SUBJECTS & HISTORY TO PUSH TO CLOUD SO STALE STATE IS NEVER SAVED
    const syncPayload = { history: newHistory }
    if (activeSemester === 'Semester 1') syncPayload.sem1Subjects = updatedSubjects
    else if (activeSemester === 'Semester 2') syncPayload.sem2Subjects = updatedSubjects
    else syncPayload.subjects = updatedSubjects

    pushToCloud(syncPayload)
  }, [isUnlocked, activeSemester, setSem1Subjects, setSem2Subjects, setSem3Subjects, setHistory, notify, pushToCloud])

  const logBunkClass = useCallback((subjectId, reason = 'Personal') => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
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
      notify('Login to make any change 🔒', 'warning')
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
      notify('Login to make any change 🔒', 'warning')
      return null
    }
    const subject = buildSubject(data)
    let nextList = []

    if (activeSemester === 'Semester 1') {
      setSem1Subjects((prev) => { nextList = [...prev, subject]; return nextList })
      pushToCloud({ sem1Subjects: nextList })
    } else if (activeSemester === 'Semester 2') {
      setSem2Subjects((prev) => { nextList = [...prev, subject]; return nextList })
      pushToCloud({ sem2Subjects: nextList })
    } else {
      setSem3Subjects((prev) => { nextList = [...prev, subject]; return nextList })
      pushToCloud({ subjects: nextList })
    }

    notify('Subject added')
    return subject.id
  }, [isUnlocked, activeSemester, sem1Subjects, sem2Subjects, sem3Subjects, setSem1Subjects, setSem2Subjects, setSem3Subjects, notify, pushToCloud])

  const updateSubject = useCallback((id, updates) => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
      return
    }
    const updateList = (prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    let updatedList = []

    if (activeSemester === 'Semester 1') {
      setSem1Subjects((prev) => { updatedList = updateList(prev); return updatedList })
      pushToCloud({ sem1Subjects: updatedList })
    } else if (activeSemester === 'Semester 2') {
      setSem2Subjects((prev) => { updatedList = updateList(prev); return updatedList })
      pushToCloud({ sem2Subjects: updatedList })
    } else {
      setSem3Subjects((prev) => { updatedList = updateList(prev); return updatedList })
      pushToCloud({ subjects: updatedList })
    }

    notify('Subject updated')
  }, [isUnlocked, activeSemester, setSem1Subjects, setSem2Subjects, setSem3Subjects, notify, pushToCloud])

  const deleteSubject = useCallback((id) => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
      return
    }
    const filterList = (prev) => prev.filter((s) => s.id !== id)
    let filteredList = []

    if (activeSemester === 'Semester 1') {
      setSem1Subjects((prev) => { filteredList = filterList(prev); return filteredList })
      pushToCloud({ sem1Subjects: filteredList })
    } else if (activeSemester === 'Semester 2') {
      setSem2Subjects((prev) => { filteredList = filterList(prev); return filteredList })
      pushToCloud({ sem2Subjects: filteredList })
    } else {
      setSem3Subjects((prev) => { filteredList = filterList(prev); return filteredList })
      pushToCloud({ subjects: filteredList })
    }

    setHistory((prev) => {
      const nextHist = prev.filter((h) => h.subjectId !== id)
      pushToCloud({ history: nextHist })
      return nextHist
    })
    notify('Subject deleted', 'info')
  }, [isUnlocked, activeSemester, setSem1Subjects, setSem2Subjects, setSem3Subjects, setHistory, notify, pushToCloud])

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
    let updatedList = []
    setSem3Subjects((prev) => {
      updatedList = prev.map((s) => (s.id === subjectId ? { ...s, timetable } : s))
      pushToCloud({ subjects: updatedList })
      return updatedList
    })
    notify('Timetable updated')
  }, [isUnlocked, setSem3Subjects, notify, pushToCloud])

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
    snackbar,
    notify,
    closeSnackbar,
    unlockApp,
    lockApp,
    markAttendance,
    logBunkClass,
    deleteBunkClass,
    addSubject,
    updateSubject,
    deleteSubject,
    addNote,
    toggleNoteComplete,
    deleteNote,
    resetAttendance,
    updateTimetable,
    exportData,
    importData,
    pushToCloud,
    pullFromCloud,
  }), [
    subjects, timetableSubjects, history, bunks, notes, settings, isUnlocked, dbSynced, timetableHeader,
    setTimetableHeader, snackbar, notify, closeSnackbar, unlockApp, lockApp,
    markAttendance, logBunkClass, deleteBunkClass, addSubject, updateSubject, deleteSubject,
    addNote, toggleNoteComplete, deleteNote, resetAttendance, updateTimetable, exportData, importData,
    pushToCloud, pullFromCloud, setSettings
  ])

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>
}
