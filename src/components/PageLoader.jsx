import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function PageLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <CircularProgress size={36} thickness={4.5} sx={{ color: '#38bdf8' }} />
      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
        Loading AttendX...
      </Typography>
    </Box>
  )
}
