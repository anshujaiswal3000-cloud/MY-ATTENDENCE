import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { STORAGE_KEYS, collectAllData, downloadJSON, applyImportedData } from '../utils/storageUtils'
import { defaultSubjects, buildSubject, DEFAULT_TIMETABLE_HEADER } from '../data/defaultSubjects'

const AttendanceContext = createContext(null)

export function useAttendance() {
  const ctx = useContext(AttendanceContext)
  if (!ctx) throw new Error('useAttendance must be used within AttendanceProvider')
  return ctx
}

const DEFAULT_SETTINGS = {
  semester: 'Semester 1',
  semesters: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'],
  autoAttendance: true,
}

function seedSubjects() {
  return defaultSubjects.map((s) => buildSubject(s))
}

export function AttendanceProvider({ children }) {
  const [subjects, setSubjects] = useLocalStorage(STORAGE_KEYS.subjects, seedSubjects())
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.history, [])
  const [bunks, setBunks] = useLocalStorage('attendx_bunks', [])
  const [isUnlocked, setIsUnlocked] = useLocalStorage('attendx_is_unlocked', true)
  const [timetableHeader, setTimetableHeader] = useLocalStorage('attendx_timetable_header', DEFAULT_TIMETABLE_HEADER)

  const [notes, setNotes] = useLocalStorage(STORAGE_KEYS.notes, [
    {
      id: 'note_1',
      title: 'Digital Logic Design Assignment',
      subjectId: 'dld',
      subjectName: 'Digital Logic Design (BOE-310)',
      category: 'Assignment',
      content: 'Complete K-Map minimization problems 1 to 5.',
      date: 'Jul 26, 2026',
      completed: false
    },
    {
      id: 'note_2',
      title: 'Python Lab Submission',
      subjectId: 'python',
      subjectName: 'Python Programming (BCC-302)',
      category: 'Lab',
      content: 'Submit File I/O & Exception Handling code on Portal.',
      date: 'Jul 27, 2026',
      completed: true
    }
  ])

  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true)

  const notify = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }, [])

  const closeSnackbar = useCallback(() => {
    setSnackbar((s) => ({ ...s, open: false }))
  }, [])

  // Lock / Unlock Owner access
  const unlockApp = useCallback((userId, password) => {
    if ((userId.toLowerCase() === 'anshu' && password === '123456') || password === '123456') {
      setIsUnlocked(true)
      notify('Welcome back Anshu! Owner access granted 🔓')
      return true
    }
    notify('Invalid User ID or Password', 'error')
    return false
  }, [setIsUnlocked, notify])

  const lockApp = useCallback(() => {
    setIsUnlocked(false)
    notify('Locked to View-Only mode 🔒', 'info')
  }, [setIsUnlocked, notify])

  /** Mark a subject Present or Absent; logs an entry to history */
  const markAttendance = useCallback((subjectId, status) => {
    let subjectName = ''
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s
        subjectName = s.name
        if (status === 'present') {
          return { ...s, present: s.present + 1, total: s.total + 1 }
        }
        return { ...s, total: s.total + 1 }
      })
    )
    const now = new Date()
    const entry = {
      id: `log_${Math.random().toString(36).slice(2, 10)}`,
      subjectId,
      subjectName,
      status, // 'present' | 'absent'
      date: now.toISOString().slice(0, 10),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: now.getTime(),
    }
    setHistory((prev) => [entry, ...prev])
    notify(status === 'present' ? 'Marked present ✅' : 'Marked absent', status === 'present' ? 'success' : 'warning')
  }, [setSubjects, setHistory, notify])

  // Log a Bunked Class manually
  const logBunkClass = useCallback((subjectId, reason = 'Personal') => {
    let subjectName = ''
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s
        subjectName = s.name
        return { ...s, total: s.total + 1 } // Absent increments total, present remains same
      })
    )
    const now = new Date()
    const bunkEntry = {
      id: `bunk_${Math.random().toString(36).slice(2, 10)}`,
      subjectId,
      subjectName,
      reason,
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: now.getTime()
    }
    setBunks((prev) => [bunkEntry, ...prev])
    notify(`Bunk logged for ${subjectName} 🚪`, 'warning')
  }, [setSubjects, setBunks, notify])

  const deleteBunkClass = useCallback((id) => {
    setBunks((prev) => prev.filter((b) => b.id !== id))
    notify('Bunk record removed', 'info')
  }, [setBunks, notify])

  const addSubject = useCallback((data) => {
    const subject = buildSubject(data)
    setSubjects((prev) => [...prev, subject])
    notify('Subject added')
    return subject.id
  }, [setSubjects, notify])

  const updateSubject = useCallback((id, updates) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
    notify('Subject updated')
  }, [setSubjects, notify])

  const deleteSubject = useCallback((id) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id))
    setHistory((prev) => prev.filter((h) => h.subjectId !== id))
    notify('Subject deleted', 'info')
  }, [setSubjects, setHistory, notify])

  const addNote = useCallback((noteData) => {
    const newNote = {
      id: `note_${Math.random().toString(36).slice(2, 10)}`,
      completed: false,
      ...noteData,
    }
    setNotes((prev) => [newNote, ...prev])
    notify('Note added')
  }, [setNotes, notify])

  const toggleNoteComplete = useCallback((id) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
    )
  }, [setNotes])

  const deleteNote = useCallback((id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    notify('Note deleted', 'info')
  }, [setNotes, notify])

  const resetAttendance = useCallback(() => {
    setSubjects((prev) => prev.map((s) => ({ ...s, present: 0, total: 0 })))
    setHistory([])
    setBunks([])
    notify('Attendance reset', 'info')
  }, [setSubjects, setHistory, setBunks, notify])

  const updateTimetable = useCallback((subjectId, timetable) => {
    setSubjects((prev) => prev.map((s) => (s.id === subjectId ? { ...s, timetable } : s)))
    notify('Timetable updated')
  }, [setSubjects, notify])

  const exportData = useCallback(() => {
    const data = collectAllData()
    downloadJSON(data, `attendx-export-${Date.now()}.json`)
    notify('Data exported')
  }, [notify])

  const importData = useCallback((data) => {
    applyImportedData(data)
    if (data.subjects) setSubjects(data.subjects)
    if (data.history) setHistory(data.history)
    if (data.settings) setSettings(data.settings)
    if (data.notes) setNotes(data.notes)
    notify('Data imported — reloaded from backup')
  }, [setSubjects, setHistory, setSettings, setNotes, notify])

  const backup = useCallback(() => {
    const data = collectAllData()
    window.localStorage.setItem(STORAGE_KEYS.backup, JSON.stringify(data))
    notify('Backup saved locally')
  }, [notify])

  const restoreBackup = useCallback(() => {
    const raw = window.localStorage.getItem(STORAGE_KEYS.backup)
    if (!raw) {
      notify('No backup found', 'error')
      return
    }
    const data = JSON.parse(raw)
    if (data.subjects) setSubjects(data.subjects)
    if (data.history) setHistory(data.history)
    if (data.settings) setSettings(data.settings)
    if (data.notes) setNotes(data.notes)
    notify('Backup restored')
  }, [setSubjects, setHistory, setSettings, setNotes, notify])

  const value = useMemo(() => ({
    subjects,
    history,
    bunks,
    notes,
    settings,
    isUnlocked,
    timetableHeader,
    setTimetableHeader,
    showWelcomeBanner,
    setShowWelcomeBanner,
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
    backup,
    restoreBackup,
  }), [
    subjects, history, bunks, notes, settings, isUnlocked, timetableHeader, showWelcomeBanner,
    setTimetableHeader, setShowWelcomeBanner, snackbar, notify, closeSnackbar, unlockApp, lockApp,
    markAttendance, logBunkClass, deleteBunkClass, addSubject, updateSubject, deleteSubject,
    addNote, toggleNoteComplete, deleteNote, resetAttendance, updateTimetable, exportData, importData,
    backup, restoreBackup, setSettings
  ])

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>
}
