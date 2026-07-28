import React, { useState } from 'react'
import {
  Box, Typography, Button, Chip, Alert, CircularProgress
} from '@mui/material'
import { MdPictureAsPdf, MdSend, MdCheckCircle, MdAutoAwesome } from 'react-icons/md'
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

  const handleDownloadPdfReport = () => {
    triggerHaptic([30, 50, 30])
    setGeneratingPdf(true)
    setStatusMsg('')
    setStatusErr('')

    try {
      // 1. Generate Executive Ultra-Premium PDF Document
      const doc = new jsPDF('p', 'mm', 'a4')

      // Sleek Dark Header Banner
      doc.setFillColor(11, 17, 32)
      doc.rect(0, 0, 210, 48, 'F')

      // Aurora Gradient Accent Strip
      doc.setFillColor(99, 102, 241)
      doc.rect(0, 46, 210, 2, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.text('AttendX — Official Academic Attendance Report', 14, 20)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(148, 163, 184)
      doc.text(`United College of Engineering & Research | ${activeSemester}`, 14, 30)
      doc.text(`Issued On: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 38)

      // Student Profile Card Box
      doc.setFillColor(248, 250, 252)
      doc.rect(14, 54, 182, 36, 'F')
      doc.setDrawColor(226, 232, 240)
      doc.rect(14, 54, 182, 36, 'S')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(15, 23, 42)
      doc.text('STUDENT PROFILE', 20, 64)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(51, 65, 85)
      doc.text('Name: Anshu Jaiswal', 20, 72)
      doc.text('Student ID: 21250770', 20, 79)

      doc.text('Branch: B.Tech CSE (Section B)', 110, 72)
      doc.text(`Active Semester: ${activeSemester}`, 110, 79)

      // Overall Percentage Metric Banner
      const isSafe = stats.percentage >= 75
      doc.setFillColor(isSafe ? 236 : 254, isSafe ? 253 : 242, isSafe ? 245 : 242)
      doc.rect(14, 96, 182, 26, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(isSafe ? 16 : 244, isSafe ? 185 : 63, isSafe ? 129 : 94)
      doc.text(`OVERALL ATTENDANCE: ${stats.percentage.toFixed(2)}%`, 20, 108)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(71, 85, 105)
      doc.text(`Total Lectures Attended: ${stats.present} / ${stats.total}  |  Status: ${isSafe ? 'SAFE ZONE (Eligible for Exams)' : 'WARNING ZONE'}`, 20, 116)

      // Subject Breakdown Table Header
      let y = 132
      doc.setFillColor(241, 245, 249)
      doc.rect(14, y, 182, 10, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(15, 23, 42)
      doc.text('SUBJECT NAME', 18, y + 7)
      doc.text('CODE', 105, y + 7)
      doc.text('LECTURES', 140, y + 7)
      doc.text('STATUS %', 172, y + 7)

      // Rows
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)

      subjects.forEach((sub, idx) => {
        y += 10
        if (y > 270) {
          doc.addPage()
          y = 20
        }

        // Alternating row background
        if (idx % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(14, y - 6, 182, 10, 'F')
        }

        const pct = sub.total > 0 ? ((sub.present / sub.total) * 100).toFixed(1) : '0.0'
        doc.setTextColor(30, 41, 59)
        doc.text(sub.name.substring(0, 36), 18, y)
        doc.text(sub.code || 'N/A', 105, y)
        doc.text(`${sub.present} / ${sub.total}`, 140, y)

        if (sub.isIgnored) {
          doc.setTextColor(148, 163, 184)
          doc.text('N/A (Ignored)', 172, y)
        } else {
          const subPct = parseFloat(pct)
          if (subPct >= 85) doc.setTextColor(16, 185, 129)
          else if (subPct >= 75) doc.setTextColor(245, 158, 11)
          else doc.setTextColor(244, 63, 94)

          doc.text(`${pct}%`, 172, y)
        }
      })

      // Digital Seal & Footer
      y += 18
      if (y > 265) {
        doc.addPage()
        y = 30
      }

      doc.setLineWidth(0.3)
      doc.setDrawColor(203, 213, 225)
      doc.line(14, y, 196, y)

      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text('AttendX Digital Verified Academic Document — Generated for Anshu Jaiswal (UCER)', 14, y + 8)

      // Save PDF directly to local storage (No WhatsApp redirection)
      doc.save(`AttendX_Official_Report_Anshu_Jaiswal_${new Date().toISOString().slice(0, 10)}.pdf`)

      setStatusMsg('✨ Premium Official PDF Report downloaded successfully to your device!')
      notify('📄 Official PDF Report downloaded to device!', 'success')
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
        body: JSON.stringify({
          phone: '9125469499',
          message: 'your DSTL attendance of today lecture 09:00 AM - 09:50 AM has been marked by automarker'
        })
      })
      const json = await res.json()
      if (json.success) {
        setStatusMsg('⚡ Soft ATTIX alert text dispatched: "your DSTL attendance of today lecture 09:00 AM - 09:50 AM has been marked by automarker"')
        notify('⚡ ATTIX Soft WhatsApp text alert sent to +91 9125469499!', 'success')
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
              Official PDF Report & ATTIX WhatsApp Alerts
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '.78rem', fontWeight: 600 }}>
              Real-time soft alerts to +91 9125469499 & Executive PDF Exports
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

      {/* Action Buttons Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75, mt: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleDownloadPdfReport}
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
          {generatingPdf ? 'Generating PDF...' : '📄 Download Official PDF Report'}
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
          {testingAlert ? 'Sending Alert...' : '⚡ Test ATTIX Soft Alert'}
        </Button>
      </Box>
    </GlassCard>
  )
}
