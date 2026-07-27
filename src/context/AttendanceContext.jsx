import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { STORAGE_KEYS, collectAllData, downloadJSON, applyImportedData } from '../utils/storageUtils'
import { defaultSubjects, buildSubject, DEFAULT_TIMETABLE_HEADER, generateSeedHistory } from '../data/defaultSubjects'
import { getTodayName, WEEKDAYS } from '../utils/attendanceUtils'

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

function seedHistory() {
  return generateSeedHistory(seedSubjects())
}

/** Parses end time from range like "09:00 AM - 09:50 AM" or "11:30 AM - 01:10 PM" */
function parseEndTime(timeRangeStr) {
  try {
    const parts = timeRangeStr.split('-')
    if (parts.length < 2) return null
    const endStr = parts[1].trim() // "09:50 AM" or "01:10 PM"
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
  const [subjects, setSubjects] = useLocalStorage(STORAGE_KEYS.subjects, seedSubjects())
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.history, seedHistory())
  const [bunks, setBunks] = useLocalStorage('attendx_bunks', [])
  const [autoLoggedSlots, setAutoLoggedSlots] = useLocalStorage('attendx_auto_logged_slots', [])
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
      date: '26/07/2026',
      completed: false
    }
  ])

  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

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

  /** Mark a subject Present or Absent - Date Only */
  const markAttendance = useCallback((subjectId, status) => {
    let subjectName = ''
    setSubjects((prev) =>
      prev.map((s) => {
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
    )
    const now = new Date()
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    const entry = {
      id: `log_${Math.random().toString(36).slice(2, 10)}`,
      subjectId,
      subjectName,
      status,
      date: dateFormatted, // Date only e.g. 27/07/2026
      timestamp: now.getTime(),
    }
    setHistory((prev) => [entry, ...prev])
    notify(status === 'present' ? 'Marked Present ✅' : 'Marked Absent ❌', status === 'present' ? 'success' : 'warning')
  }, [setSubjects, setHistory, notify])

  // Log a Bunked Class (Personal opinion tracker)
  const logBunkClass = useCallback((subjectId, reason = 'Personal') => {
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
    setBunks((prev) => [bunkEntry, ...prev])
    notify(`Personal Bunk logged for ${subjectName || 'Class'} 🚪`, 'info')
  }, [subjects, setBunks, notify])

  const deleteBunkClass = useCallback((id) => {
    setBunks((prev) => prev.filter((b) => b.id !== id))
    notify('Bunk record removed', 'info')
  }, [setBunks, notify])

  // ── AUTO ATTENDANCE ENGINE ──
  useEffect(() => {
    if (!settings.autoAttendance) return

    const checkAutoAttendance = () => {
      const now = new Date()
      const todayName = getTodayName()
      const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
      const curHours = now.getHours()
      const curMins = now.getMinutes()

      subjects.forEach((subj) => {
        ;(subj.timetable || []).forEach((slot) => {
          if (slot.day !== todayName) return

          const endTime = parseEndTime(slot.time)
          if (!endTime) return

          const classEnded = curHours > endTime.hours || (curHours === endTime.hours && curMins >= endTime.minutes)

          if (classEnded) {
            const slotKey = `${dateFormatted}_${subj.id}_${slot.time}`

            if (!autoLoggedSlots.includes(slotKey)) {
              setSubjects((prev) =>
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
            }
          }
        })
      })
    }

    checkAutoAttendance()
    const timer = setInterval(checkAutoAttendance, 30000)
    return () => clearInterval(timer)
  }, [subjects, autoLoggedSlots, settings.autoAttendance, setSubjects, setHistory, setAutoLoggedSlots, notify])

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
    setAutoLoggedSlots([])
    notify('Attendance reset', 'info')
  }, [setSubjects, setHistory, setBunks, setAutoLoggedSlots, notify])

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
    subjects, history, bunks, notes, settings, isUnlocked, timetableHeader,
    setTimetableHeader, snackbar, notify, closeSnackbar, unlockApp, lockApp,
    markAttendance, logBunkClass, deleteBunkClass, addSubject, updateSubject, deleteSubject,
    addNote, toggleNoteComplete, deleteNote, resetAttendance, updateTimetable, exportData, importData,
    backup, restoreBackup, setSettings
  ])

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>
}
