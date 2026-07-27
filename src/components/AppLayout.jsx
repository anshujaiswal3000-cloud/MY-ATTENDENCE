import React from 'react'
import { Box, Snackbar, Alert } from '@mui/material'
import { Slide } from '@mui/material'
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
        <Box sx={{ flex: 1, maxWidth: 1500, width: '100%', mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2.5, md: 3.5 }, pb: { xs: 11, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
      <BottomNav />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled" sx={{ borderRadius: '16px', boxShadow: '0 14px 36px rgba(0,0,0,.28)', px: 1 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
