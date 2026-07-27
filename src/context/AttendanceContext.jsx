import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react'
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

/** Parses end time from range like "09:00 AM - 09:50 AM" */
function parseEndTime(timeRangeStr) {
  try {
    const parts = timeRangeStr.split('-')
    if (parts.length < 2) return null
    const endStr = parts[1].trim()
    const [timeVal, modifier] = endStr.split(' ')
    let [hours, minutes] = timeVal.split(':').map(Number)

    if (modifier === 'PM' && hours < 12) hours += 12
    if (modifier === 'AM' && hours === 12) hours = 0

    return { hours, minutes }
  } catch (err) {
    return null
  }
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
        subjects: overrides.subjects || sem3Subjects,
        sem1Subjects: overrides.sem1Subjects || sem1Subjects,
        sem2Subjects: overrides.sem2Subjects || sem2Subjects,
        history: overrides.history || history,
        bunks: overrides.bunks || bunks,
        notes: overrides.notes || notes,
        settings: overrides.settings || settings,
        timetableHeader: overrides.timetableHeader || timetableHeader
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
  }, [sem3Subjects, sem1Subjects, sem2Subjects, history, bunks, notes, settings, timetableHeader])

  const pullFromCloud = useCallback(async () => {
    try {
      const res = await fetch('/api/sync/anshu')
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          const cloud = json.data
          if (cloud.subjects && cloud.subjects.length > 0) setSem3Subjects(cloud.subjects)
          if (cloud.sem1Subjects) setSem1Subjects(cloud.sem1Subjects)
          if (cloud.sem2Subjects) setSem2Subjects(cloud.sem2Subjects)
          if (cloud.history) setHistory(cloud.history)
          if (cloud.bunks) setBunks(cloud.bunks)
          if (cloud.notes) setNotes(cloud.notes)
          if (cloud.settings) setSettings(cloud.settings)
          if (cloud.timetableHeader) setTimetableHeader(cloud.timetableHeader)
          setDbSynced(true)
        }
      }
    } catch (err) {
      setDbSynced(false)
    }
  }, [setSem3Subjects, setSem1Subjects, setSem2Subjects, setHistory, setBunks, setNotes, setSettings, setTimetableHeader])

  useEffect(() => {
    pullFromCloud()
    const timer = setInterval(pullFromCloud, 10000)
    return () => clearInterval(timer)
  }, [])

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

  /** Mark a subject Present or Absent - STRICT OWNER PERMISSION REQUIRED */
  const markAttendance = useCallback((subjectId, status) => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
      return
    }

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

    if (activeSemester === 'Semester 1') setSem1Subjects(updateSubjectList)
    else if (activeSemester === 'Semester 2') setSem2Subjects(updateSubjectList)
    else setSem3Subjects(updateSubjectList)

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
    pushToCloud()
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

  // ── AUTO ATTENDANCE ENGINE (Sem 3) ──
  useEffect(() => {
    if (!settings.autoAttendance || activeSemester !== 'Semester 3') return

    const checkAutoAttendance = () => {
      const now = new Date()
      const todayName = getTodayName()
      const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
      const curHours = now.getHours()
      const curMins = now.getMinutes()

      sem3Subjects.forEach((subj) => {
        ;(subj.timetable || []).forEach((slot) => {
          if (slot.day !== todayName) return

          const endTime = parseEndTime(slot.time)
          if (!endTime) return

          const classEnded = curHours > endTime.hours || (curHours === endTime.hours && curMins >= endTime.minutes)

          if (classEnded) {
            const slotKey = `${dateFormatted}_${subj.id}_${slot.time}`

            if (!autoLoggedSlots.includes(slotKey)) {
              setSem3Subjects((prev) =>
                prev.map((s) => (s.id === subj.id ? { ...s, present: s.present + 1, total: s.total + 1 } : s))
              )

              const logEntry = {
                id: `auto_${Math.random().toString(36).slice(2, 10)}`,
                subjectId: subj.id,
                subjectName: subj.name,
                status: 'present',
                auto: true,
                date: dateFormatted,
                timestamp: now.getTime()
              }

              setHistory((prev) => [logEntry, ...prev])
              setAutoLoggedSlots((prev) => [...prev, slotKey])
              notify(`⏰ Auto-logged Present for ${subj.name}`, 'success')
              pushToCloud()
            }
          }
        })
      })
    }

    checkAutoAttendance()
    const timer = setInterval(checkAutoAttendance, 30000)
    return () => clearInterval(timer)
  }, [sem3Subjects, autoLoggedSlots, settings.autoAttendance, activeSemester, setSem3Subjects, setHistory, setAutoLoggedSlots, notify, pushToCloud])

  const addSubject = useCallback((data) => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
      return null
    }
    const subject = buildSubject(data)
    if (activeSemester === 'Semester 1') setSem1Subjects((prev) => [...prev, subject])
    else if (activeSemester === 'Semester 2') setSem2Subjects((prev) => [...prev, subject])
    else setSem3Subjects((prev) => [...prev, subject])

    notify('Subject added')
    pushToCloud()
    return subject.id
  }, [isUnlocked, activeSemester, setSem1Subjects, setSem2Subjects, setSem3Subjects, notify, pushToCloud])

  const updateSubject = useCallback((id, updates) => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
      return
    }
    const updateList = (prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    if (activeSemester === 'Semester 1') setSem1Subjects(updateList)
    else if (activeSemester === 'Semester 2') setSem2Subjects(updateList)
    else setSem3Subjects(updateList)

    notify('Subject updated')
    pushToCloud()
  }, [isUnlocked, activeSemester, setSem1Subjects, setSem2Subjects, setSem3Subjects, notify, pushToCloud])

  const deleteSubject = useCallback((id) => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
      return
    }
    const filterList = (prev) => prev.filter((s) => s.id !== id)
    if (activeSemester === 'Semester 1') setSem1Subjects(filterList)
    else if (activeSemester === 'Semester 2') setSem2Subjects(filterList)
    else setSem3Subjects(filterList)

    setHistory((prev) => prev.filter((h) => h.subjectId !== id))
    notify('Subject deleted', 'info')
    pushToCloud()
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
    pushToCloud()
  }, [isUnlocked, setSem3Subjects, setSem1Subjects, setSem2Subjects, setHistory, setBunks, setAutoLoggedSlots, notify, pushToCloud])

  const updateTimetable = useCallback((subjectId, timetable) => {
    if (!isUnlocked) {
      notify('Login to make any change 🔒', 'warning')
      return
    }
    setSem3Subjects((prev) => {
      const next = prev.map((s) => (s.id === subjectId ? { ...s, timetable } : s))
      pushToCloud({ subjects: next })
      return next
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
