import React from 'react'
import { Box, Typography, IconButton, Tooltip } from '@mui/material'
import { MdLightMode, MdDarkMode } from 'react-icons/md'
import { useLocation } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { useThemeMode } from '../context/ThemeContext'
import { NAV_ITEMS } from '../data/navConfig'

export default function Topbar() {
  const { mode, toggleMode } = useThemeMode()
  const theme = useTheme()
  const location = useLocation()
  const current = NAV_ITEMS.find((n) => n.path === location.pathname)

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        py: 2,
        backdropFilter: 'blur(16px)',
        background: theme.palette.mode === 'dark' ? 'rgba(11,17,32,0.55)' : 'rgba(242,245,251,0.65)',
        borderBottom: `1px solid ${theme.custom.glassBorder}`,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700 }}>{current?.label || 'AttendX'}</Typography>
      <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
        <IconButton onClick={toggleMode} sx={{ borderRadius: '12px' }}>
          {mode === 'dark' ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </IconButton>
      </Tooltip>
    </Box>
  )
}
