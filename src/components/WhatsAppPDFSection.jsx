import React, { useState } from 'react'
import {
  Box, Typography, Button, Chip, Alert, CircularProgress
} from '@mui/material'
import { MdPictureAsPdf, MdSend, MdCheckCircle, MdAutoAwesome, MdSmartphone } from 'react-icons/md'
import jsPDF from 'jspdf'
import GlassCard from './GlassCard'
import { useAttendance } from '../context/AttendanceContext'
import { getOverallStats } from '../utils/attendanceUtils'
import { triggerHaptic } from '../utils/hapticUtils'

export default function WhatsAppPDFSection() {
  const { subjects = [], settings = {}, notify } = useAttendance()
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [testingAlert, setTestingAlert] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [statusErr, setStatusErr] = useState('')

  const activeSemester = settings?.semester || 'Semester 3'
  const stats = getOverallStats(subjects)

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
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')} | Semester: ${activeSemester}`, 14, 32)

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

      // 2. Open WhatsApp Direct Message pre-filled to target number 919125469499
      const reportText = `*AttendX Official Attendance Report* 📄%0A%0A*Student*: Anshu Jaiswal (ID: 21250770)%0A*Branch*: B.Tech CSE (Sec B), UCER%0A*Active Semester*: ${activeSemester}%0A%0A*Overall Attendance*: *${stats.percentage.toFixed(2)}%*%0A*Total Lectures*: ${stats.present} / ${stats.total} Present%0A*Status*: ${stats.percentage >= 75 ? 'Safe Zone 🎯' : 'Warning Zone ⚠️'}%0A%0A📄 _Official PDF Report generated & ready._%0A_Powered by ATTIX Autonomous Engine_ ⚡`

      const waUrl = `https://api.whatsapp.com/send?phone=919125469499&text=${reportText}`
      window.open(waUrl, '_blank')

      setStatusMsg('✨ PDF Report generated & WhatsApp dispatched!')
      notify('📄 PDF Report generated & WhatsApp dispatched!', 'success')
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
        body: JSON.stringify({ phone: '9125469499' })
      })
      const json = await res.json()
      if (json.success) {
        setStatusMsg('⚡ Real-Time ATTIX WhatsApp Alert delivered to your phone!')
        notify('⚡ ATTIX WhatsApp Alert sent!', 'success')
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
    <GlassCard
      sx={{
        p: { xs: 2.5, sm: 3 },
        mb: 3,
        borderRadius: '24px',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        background: 'linear-gradient(145deg, rgba(6, 78, 59, 0.22) 0%, rgba(15, 23, 42, 0.95) 100%)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
      }}
    >
      {/* Top Header Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '16px',
              bgcolor: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              display: 'grid',
              placeItems: 'center',
              fontSize: 24,
              border: '1px solid rgba(52, 211, 153, 0.3)',
              boxShadow: '0 4px 16px rgba(16,185,129,0.2)',
              flexShrink: 0,
            }}
          >
            📲
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.25 }}>
              WhatsApp PDF Report & ATTIX Alerts
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '.78rem', fontWeight: 600 }}>
              1-Tap PDF Report Generation & Real-Time WhatsApp Alerts
            </Typography>
          </Box>
        </Box>

        <Chip
          label="● LIVE ATTIX"
          size="small"
          sx={{
            bgcolor: 'rgba(16, 185, 129, 0.18)',
            color: '#34d399',
            fontWeight: 800,
            fontSize: '.68rem',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            height: 24,
            px: 0.5,
          }}
        />
      </Box>

      {/* Status Alerts */}
      {statusMsg && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: '14px', fontSize: '.82rem', fontWeight: 700 }}>
          {statusMsg}
        </Alert>
      )}
      {statusErr && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px', fontSize: '.82rem', fontWeight: 700 }}>
          {statusErr}
        </Alert>
      )}

      {/* Action Buttons Section (Clean Grid) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75, mt: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleGenerateAndSendPdf}
          disabled={generatingPdf}
          startIcon={generatingPdf ? <CircularProgress size={18} color="inherit" /> : <MdPictureAsPdf size={20} />}
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px',
            py: 1.35,
            px: 2,
            fontWeight: 800,
            fontSize: '.88rem',
            textTransform: 'none',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            letterSpacing: '0.01em',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              boxShadow: '0 10px 28px rgba(16, 185, 129, 0.45)',
            },
          }}
        >
          {generatingPdf ? 'Generating PDF...' : '📄 Send PDF Report to WhatsApp'}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleSendTestAttixAlert}
          disabled={testingAlert}
          startIcon={<MdSend size={18} />}
          sx={{
            borderRadius: '16px',
            py: 1.35,
            px: 2,
            borderColor: 'rgba(52, 211, 153, 0.4)',
            color: '#34d399',
            bgcolor: 'rgba(16, 185, 129, 0.06)',
            fontWeight: 800,
            fontSize: '.88rem',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#34d399',
              bgcolor: 'rgba(16, 185, 129, 0.15)',
            },
          }}
        >
          {testingAlert ? 'Sending Alert...' : '⚡ Test ATTIX Alert'}
        </Button>
      </Box>
    </GlassCard>
  )
}
