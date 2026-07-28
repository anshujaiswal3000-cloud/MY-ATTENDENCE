import React, { useState } from 'react'
import {
  Box, Typography, TextField, Button, Chip, Alert, CircularProgress
} from '@mui/material'
import { MdSend, MdPictureAsPdf, MdCheckCircle, MdHelpOutline, MdAutoAwesome } from 'react-icons/md'
import jsPDF from 'jspdf'
import GlassCard from './GlassCard'
import { useAttendance } from '../context/AttendanceContext'
import { getOverallStats, getPercentage } from '../utils/attendanceUtils'
import { triggerHaptic } from '../utils/hapticUtils'

export default function WhatsAppPDFSection() {
  const { subjects = [], history = [], settings = {}, setSettings, pushToCloud, notify, isUnlocked } = useAttendance()
  
  const [phone, setPhone] = useState(settings?.whatsappNumber || '9125469499')
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [testingAlert, setTestingAlert] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [statusErr, setStatusErr] = useState('')

  const activeSemester = settings?.semester || 'Semester 3'
  const stats = getOverallStats(subjects)

  const handleSavePhone = () => {
    if (!isUnlocked) return notify('Login required to edit 🔒', 'warning')
    triggerHaptic(20)
    const updated = { ...settings, whatsappNumber: phone }
    setSettings(updated)
    pushToCloud({ settings: updated })
    notify(`WhatsApp number updated to ${phone} 📱`, 'success')
  }

  const handleGenerateAndSendPdf = () => {
    triggerHaptic([30, 50, 30])
    setGeneratingPdf(true)
    setStatusMsg('')
    setStatusErr('')

    try {
      // 1. Generate Official PDF Document
      const doc = new jsPDF()

      // Header Banner
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, 210, 40, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.text('AttendX Official Attendance Report', 14, 22)
      
      doc.setFontSize(10)
      doc.setTextColor(148, 163, 184)
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')} | Target: ${activeSemester}`, 14, 32)

      // Student Profile
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(12)
      doc.text('Student Profile:', 14, 52)

      doc.setFontSize(10)
      doc.text('• Name: Anshu Jaiswal', 16, 60)
      doc.text('• Student ID: 21250770', 16, 67)
      doc.text('• Branch & Sec: B.Tech CSE (Sec B)', 16, 74)
      doc.text('• College: United College of Engineering & Research', 16, 81)

      // Stats Summary Box
      doc.setFillColor(241, 245, 249)
      doc.rect(14, 90, 182, 28, 'F')

      doc.setFontSize(12)
      doc.setTextColor(15, 23, 42)
      doc.text(`Overall Attendance: ${stats.percentage.toFixed(2)}%`, 20, 102)
      doc.setFontSize(10)
      doc.text(`Attended: ${stats.present} / ${stats.total} Total Lectures | Status: ${stats.percentage >= 75 ? 'Safe Zone' : 'Warning'}`, 20, 110)

      // Subject Table Header
      let y = 130
      doc.setFontSize(11)
      doc.setTextColor(15, 23, 42)
      doc.text('Subject Name', 14, y)
      doc.text('Code', 110, y)
      doc.text('Present/Total', 145, y)
      doc.text('%', 185, y)

      doc.setLineWidth(0.5)
      doc.line(14, y + 2, 196, y + 2)

      // Subject Table Rows
      doc.setFontSize(9)
      doc.setTextColor(51, 65, 85)
      
      subjects.forEach((sub) => {
        y += 8
        if (y > 270) {
          doc.addPage()
          y = 20
        }
        const pct = sub.total > 0 ? ((sub.present / sub.total) * 100).toFixed(1) : '0.0'
        doc.text(sub.name.substring(0, 38), 14, y)
        doc.text(sub.code || 'N/A', 110, y)
        doc.text(`${sub.present}/${sub.total}`, 145, y)
        doc.text(sub.isIgnored ? 'N/A' : `${pct}%`, 185, y)
      })

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text('AttendX 24/7 Autonomous Attendance Engine — Official Record Document', 14, 285)

      // Save PDF locally
      doc.save(`AttendX_Report_Anshu_Jaiswal_${new Date().toISOString().slice(0, 10)}.pdf`)

      // 2. Open WhatsApp Direct Message to 9125469499
      const targetNum = (phone || '9125469499').replace(/\D/g, '')
      const fullNum = targetNum.startsWith('91') ? targetNum : `91${targetNum}`

      const reportText = `*AttendX Official Attendance Report* 📊%0A%0A*Student*: Anshu Jaiswal (ID: 21250770)%0A*Branch*: B.Tech CSE (Sec B), UCER%0A*Active Semester*: ${activeSemester}%0A%0A*Overall Attendance*: *${stats.percentage.toFixed(2)}%*%0A*Total Lectures*: ${stats.present} / ${stats.total} Present%0A*Status*: ${stats.percentage >= 75 ? 'Safe Zone 🎯' : 'Warning Zone ⚠️'}%0A%0A📄 _PDF Report Document downloaded to device and dispatched._%0A_Powered by AttendX 24/7 Autonomous Engine_ ⚡`

      const waUrl = `https://api.whatsapp.com/send?phone=${fullNum}&text=${reportText}`
      window.open(waUrl, '_blank')

      setStatusMsg(`✨ PDF Report downloaded & WhatsApp dispatched to +${fullNum}!`)
      notify(`📄 PDF Report generated & WhatsApp dispatched to +${fullNum}!`, 'success')
    } catch (err) {
      setStatusErr('PDF Generation Error: ' + err.message)
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handleSendTestAttixAlert = async () => {
    triggerHaptic(30)
    setTestingAlert(true)
    setStatusMsg('')
    setStatusErr('')

    try {
      const res = await fetch('/api/alerts/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone || '9125469499' })
      })
      const json = await res.json()
      if (json.success) {
        setStatusMsg(`⚡ Real-Time ATTIX WhatsApp Alert delivered to +91 ${phone}!`)
        notify(`⚡ ATTIX WhatsApp Alert sent to +91 ${phone}!`, 'success')
      } else {
        setStatusErr(json.message || 'Failed to dispatch ATTIX alert')
      }
    } catch (err) {
      setStatusErr('Network error — ensure backend is running')
    } finally {
      setTestingAlert(false)
    }
  }

  return (
    <GlassCard sx={{ p: 2.5, mb: 3, border: '2px solid rgba(16,185,129,0.45)', background: 'linear-gradient(135deg, rgba(6,78,59,0.25), rgba(15,23,42,0.95))' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(16,185,129,0.22)', color: '#34d399', display: 'grid', placeItems: 'center', fontSize: 24 }}>
            📲
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                1-Click WhatsApp PDF Report & ATTIX Alerts
              </Typography>
              <Chip label="● FAST 0ms" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: 800, fontSize: '.68rem' }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#6ee7b7' }}>
              Target Number: <strong>+91 9125469499</strong> (Configured & Active)
            </Typography>
          </Box>
        </Box>
      </Box>

      {statusMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{statusMsg}</Alert>}
      {statusErr && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{statusErr}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Integrated WhatsApp Number"
            size="small"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sx={{ width: 220 }}
            helperText="Default: 9125469499"
          />

          <Button
            variant="outlined"
            size="small"
            onClick={handleSavePhone}
            disabled={!isUnlocked}
            sx={{ borderRadius: '10px', height: 40, mt: -2.5, fontWeight: 700 }}
          >
            Save Number
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleGenerateAndSendPdf}
            disabled={generatingPdf}
            startIcon={generatingPdf ? <CircularProgress size={18} color="inherit" /> : <MdPictureAsPdf />}
            sx={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px', fontWeight: 800, px: 3, py: 1.2, textTransform: 'none' }}
          >
            {generatingPdf ? 'Generating PDF...' : '📄 Send PDF Report to WhatsApp 📲'}
          </Button>

          <Button
            variant="outlined"
            onClick={handleSendTestAttixAlert}
            disabled={testingAlert}
            startIcon={<MdSend />}
            sx={{ borderRadius: '12px', borderColor: 'rgba(52,211,153,0.4)', color: '#34d399', fontWeight: 800, textTransform: 'none', px: 2.5 }}
          >
            {testingAlert ? 'Sending...' : 'Send Test ATTIX Alert ⚡'}
          </Button>
        </Box>
      </Box>
    </GlassCard>
  )
}
