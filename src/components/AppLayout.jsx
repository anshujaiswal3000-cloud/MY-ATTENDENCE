import React from 'react'
import { Box, Snackbar, Alert, Slide } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import BottomNav from './BottomNav'
import { useAttendance } from '../context/AttendanceContext'

export default function AppLayout() {
  const { snackbar, closeSnackbar } = useAttendance()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <Box sx={{ flex: 1, maxWidth: 1500, width: '100%', mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2.5, md: 3.5 }, pb: { xs: 11, md: 4 }, display: 'flex', flexDirection: 'column' }}>
          <Outlet />

          {/* Signature Glassmorphic Ownership Footer */}
          <Box
            sx={{
              mt: 'auto', pt: 3, pb: 1, textAlign: 'center',
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <span>Crafted with ❤️ by</span>
              <span style={{ background: 'var(--aurora)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>Anshu Jaiswal (Super Admin)</span>
              <span>• All Rights Reserved © 2026 AttendX</span>
            </Typography>
          </Box>
        </Box>
      </Box>
      <BottomNav />

      {/* 🚀 Ultra-Fast Auto-Dismissing Toast Messages (1 Second Disappear) 🚀 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={1000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
        sx={{ bottom: { xs: 72, md: 24 } }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: '16px',
            boxShadow: '0 14px 36px rgba(0,0,0,.28)',
            px: 2, py: .5, fontWeight: 700, fontSize: '.82rem',
            bgcolor: snackbar.severity === 'success' ? '#10b981' : snackbar.severity === 'warning' ? '#f59e0b' : snackbar.severity === 'error' ? '#f43f5e' : '#3b82f6'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
