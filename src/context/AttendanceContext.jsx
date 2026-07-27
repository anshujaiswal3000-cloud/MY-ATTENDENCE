import React, { createContext, useContext, useCallback, useMemo, useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { STORAGE_KEYS, collectAllData, downloadJSON, applyImportedData } from '../utils/storageUtils'
import { defaultSubjects, buildSubject } from '../data/defaultSubjects'

const AttendanceContext = createContext(null)

export function useAttendance() {
  const ctx = useContext(AttendanceContext)
  if (!ctx) throw new Error('useAttendance must be used within AttendanceProvider')
  return ctx
}

const DEFAULT_SETTINGS = {
  semester: 'Semester 1',
  semesters: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'],
}

function seedSubjects() {
  return defaultSubjects.map((s) => buildSubject(s))
}

export function AttendanceProvider({ children }) {
  const [subjects, setSubjects] = useLocalStorage(STORAGE_KEYS.subjects, seedSubjects())
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.history, [])
  const [notes, setNotes] = useLocalStorage(STORAGE_KEYS.notes, [
    {
      id: 'note_1',
      title: 'Digital Electronics Assignment 2',
      subjectId: 'de',
      subjectName: 'Digital Electronics',
      category: 'Assignment',
      content: 'Submit solved K-Map minimization questions before Friday 5 PM.',
      date: 'Jul 26, 2026'
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
      ...noteData,
    }
    setNotes((prev) => [newNote, ...prev])
    notify('Note added')
  }, [setNotes, notify])

  const deleteNote = useCallback((id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    notify('Note deleted', 'info')
  }, [setNotes, notify])

  const deleteHistoryEntry = useCallback((entryId) => {
    let target = null
    setHistory((prev) => {
      target = prev.find((h) => h.id === entryId)
      return prev.filter((h) => h.id !== entryId)
    })
    if (target) {
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== target.subjectId) return s
          const total = Math.max(0, s.total - 1)
          const present = target.status === 'present' ? Math.max(0, s.present - 1) : s.present
          return { ...s, total, present }
        })
      )
    }
    notify('Entry removed', 'info')
  }, [setHistory, setSubjects, notify])

  const resetAttendance = useCallback(() => {
    setSubjects((prev) => prev.map((s) => ({ ...s, present: 0, total: 0 })))
    setHistory([])
    notify('Attendance reset', 'info')
  }, [setSubjects, setHistory, notify])

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
    notes,
    settings,
    setSettings,
    snackbar,
    notify,
    closeSnackbar,
    markAttendance,
    addSubject,
    updateSubject,
    deleteSubject,
    addNote,
    deleteNote,
    deleteHistoryEntry,
    resetAttendance,
    updateTimetable,
    exportData,
    importData,
    backup,
    restoreBackup,
  }), [subjects, history, notes, settings, snackbar, notify, closeSnackbar, markAttendance, addSubject, updateSubject, deleteSubject, addNote, deleteNote, deleteHistoryEntry, resetAttendance, updateTimetable, exportData, importData, backup, restoreBackup, setSettings])

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>
}
