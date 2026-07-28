import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
  Button, LinearProgress, Alert, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, IconButton
} from '@mui/material'
import { MdCameraAlt, MdCloudUpload, MdCheckCircle, MdClose, MdAutoAwesome } from 'react-icons/md'
import { createWorker } from 'tesseract.js'
import { useAttendance } from '../context/AttendanceContext'
import { triggerHaptic } from '../utils/hapticUtils'

export default function OCRScannerDialog({ open, onClose }) {
  const { subjects, updateTimetable, notify, isUnlocked, pushToCloud } = useAttendance()
  const [imageSrc, setImageSrc] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [parsedSlots, setParsedSlots] = useState([])
  const [ocrError, setOcrError] = useState('')

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    triggerHaptic(20)
    setOcrError('')
    setParsedSlots([])

    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const runOcrScan = async () => {
    if (!imageSrc) return
    triggerHaptic(30)
    setScanning(true)
    setProgress(10)
    setStatusText('Initializing OCR Engine...')
    setOcrError('')

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
            setStatusText(`Recognizing Timetable Text... (${Math.round(m.progress * 100)}%)`)
          }
        }
      })

      const ret = await worker.recognize(imageSrc)
      await worker.terminate()

      const text = ret.data.text
      setStatusText('Processing Timetable Slots...')
      
      const slots = parseTimetableSlots(text, subjects)
      setParsedSlots(slots)

      if (slots.length === 0) {
        setOcrError('No timetable slots detected. Ensure image text is clear and readable.')
      } else {
        notify(`✨ Extracted ${slots.length} timetable slots from photo!`, 'success')
      }
    } catch (err) {
      setOcrError('OCR processing error — please try a clearer timetable image.')
    } finally {
      setScanning(false)
    }
  }

  const parseTimetableSlots = (rawText, subjectsList) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)

    const slots = []
    let currentDay = 'Monday'

    lines.forEach(line => {
      for (const d of days) {
        if (line.toLowerCase().includes(d.toLowerCase())) {
          currentDay = d
          break
        }
      }

      // Regex for time e.g., 09:00 AM - 09:50 AM or 9:00 - 9:50
      const timeMatch = line.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-–to]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i)
      if (timeMatch) {
        const timeRange = `${timeMatch[1].toUpperCase()} - ${timeMatch[2].toUpperCase()}`
        
        // Find matching subject
        let matchedSubject = subjectsList.find(s => 
          line.toLowerCase().includes(s.name.toLowerCase()) || 
          (s.code && line.toLowerCase().includes(s.code.toLowerCase()))
        )

        if (!matchedSubject && subjectsList.length > 0) {
          matchedSubject = subjectsList[0]
        }

        if (matchedSubject) {
          slots.push({
            id: Math.random().toString(36).substring(2, 9),
            day: currentDay,
            time: timeRange,
            subjectId: matchedSubject.id,
            subjectName: matchedSubject.name,
            subjectCode: matchedSubject.code
          })
        }
      }
    })

    return slots
  }

  const handleApplySlots = () => {
    if (!isUnlocked) {
      notify('Login required to update timetable 🔒', 'warning')
      return
    }

    if (parsedSlots.length === 0) return

    triggerHaptic([30, 50, 30])
    
    // Group slots by subject
    const subjectTimetables = {}
    parsedSlots.forEach(s => {
      if (!subjectTimetables[s.subjectId]) {
        subjectTimetables[s.subjectId] = []
      }
      subjectTimetables[s.subjectId].push({ day: s.day, time: s.time })
    })

    Object.entries(subjectTimetables).forEach(([subId, slots]) => {
      updateTimetable(subId, slots)
    })

    // Auto push updated timetable to MongoDB Atlas Cloud
    pushToCloud()

    notify('✨ Scanned timetable imported & saved to MongoDB Atlas Cloud! ☁️', 'success')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '12px', bgcolor: 'rgba(99,102,241,0.2)', color: '#818cf8', display: 'grid', placeItems: 'center', fontSize: 20 }}>
            📸
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Timetable Photo OCR Scanner
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <MdClose size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload any official UCER timetable notice photo, screenshot, or schedule image to auto-detect days and class time slots.
        </Typography>

        {/* Upload Box */}
        <Box
          component="label"
          sx={{
            p: 3, border: '2px dashed rgba(99,102,241,0.4)', borderRadius: '18px',
            bgcolor: 'rgba(99,102,241,0.06)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', mb: 2,
            transition: 'all 200ms ease', '&:hover': { bgcolor: 'rgba(99,102,241,0.12)' }
          }}
        >
          <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          <MdCloudUpload size={36} color="#818cf8" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1, color: '#fff' }}>
            {imageSrc ? 'Photo Selected — Click Below to Scan' : 'Tap to Upload Timetable Photo / Screenshot'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supports PNG, JPG, JPEG, WebP
          </Typography>
        </Box>

        {imageSrc && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <img src={imageSrc} alt="Timetable Preview" style={{ maxHeight: 180, borderRadius: 12, objectFit: 'contain' }} />
          </Box>
        )}

        {scanning && (
          <Box sx={{ my: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#818cf8', display: 'block', mb: 0.5 }}>
              {statusText}
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(99,102,241,0.2)' }} />
          </Box>
        )}

        {ocrError && <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px' }}>{ocrError}</Alert>}

        {parsedSlots.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#34d399', display: 'flex', alignItems: 'center', gap: 1 }}>
              <MdAutoAwesome /> Detected Timetable Slots ({parsedSlots.length})
            </Typography>

            <Box sx={{ maxHeight: 220, overflowY: 'auto', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                    <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Day</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Time Slot</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Subject</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedSlots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell sx={{ fontWeight: 700 }}>{slot.day}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#60a5fa' }}>{slot.time}</TableCell>
                      <TableCell>
                        <Chip label={slot.subjectName} size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose}>Close</Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {imageSrc && !scanning && (
            <Button
              variant="contained"
              onClick={runOcrScan}
              sx={{ background: 'var(--aurora)', borderRadius: '12px', fontWeight: 800 }}
            >
              Scan Timetable 📸
            </Button>
          )}
          {parsedSlots.length > 0 && (
            <Button
              variant="contained"
              color="success"
              onClick={handleApplySlots}
              disabled={!isUnlocked}
              sx={{ borderRadius: '12px', fontWeight: 800 }}
            >
              {isUnlocked ? 'Import to App ✨' : 'Login Required 🔒'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  )
}
