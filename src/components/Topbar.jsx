import React, { useState } from 'react'
import { Box, Typography, IconButton, Tooltip, Avatar, Popover, Divider, Chip } from '@mui/material'
import { MdLightMode, MdDarkMode } from 'react-icons/md'
import { useLocation } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { useThemeMode } from '../context/ThemeContext'
import { NAV_ITEMS } from '../data/navConfig'
import { useAttendance } from '../context/AttendanceContext'
import { getOverallStats } from '../utils/attendanceUtils'

export default function Topbar() {
  const { mode, toggleMode } = useThemeMode()
  const theme = useTheme()
  const location = useLocation()
  const current = NAV_ITEMS.find((n) => n.path === location.pathname)
  const { subjects } = useAttendance()
  const stats = getOverallStats(subjects)
  const [anchorEl, setAnchorEl] = useState(null)

  const openProfile = (e) => setAnchorEl(e.currentTarget)
  const closeProfile = () => setAnchorEl(null)
  const open = Boolean(anchorEl)

  const statusColor = stats.percentage >= 85 ? '#10b981' : stats.percentage >= 75 ? '#f59e0b' : '#f43f5e'
  const statusLabel = stats.percentage >= 85 ? 'Safe' : stats.percentage >= 75 ? 'Warning' : 'Critical'

  return (
    <Box
      sx={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: { xs: 2, md: 4 }, py: 1.5,
        backdropFilter: 'blur(16px)',
        background: theme.palette.mode === 'dark' ? 'rgba(11,17,32,0.55)' : 'rgba(242,245,251,0.65)',
        borderBottom: `1px solid ${theme.custom.glassBorder}`,
      }}
    >
      {/* Left: Page title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-.02em' }}>
          {current?.label || 'AttendX'}
        </Typography>
      </Box>

      {/* Right: Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Dark/Light toggle */}
        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton onClick={toggleMode} sx={{ borderRadius: '12px' }}>
            {mode === 'dark' ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </IconButton>
        </Tooltip>

        {/* Profile Avatar */}
        <Tooltip title="Anshu Jaiswal">
          <Avatar
            src="/profile.jpg"
            alt="Anshu Jaiswal"
            onClick={openProfile}
            sx={{
              width: 38, height: 38, cursor: 'pointer', ml: .5,
              border: `2.5px solid transparent`,
              background: `linear-gradient(white, white) padding-box, var(--aurora) border-box`,
              boxShadow: '0 4px 14px rgba(99,102,241,.3)',
              transition: 'transform 220ms ease, box-shadow 220ms ease',
              '&:hover': { transform: 'scale(1.07)', boxShadow: '0 6px 20px rgba(99,102,241,.45)' }
            }}
          />
        </Tooltip>

        {/* Profile Popover */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={closeProfile}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              mt: 1, borderRadius: '18px', minWidth: 220, p: 0, overflow: 'hidden',
              background: theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.custom.glassBorder}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }
          }}
        >
          {/* Profile header */}
          <Box sx={{ p: 2.25, display: 'flex', alignItems: 'center', gap: 1.75, background: 'var(--aurora)' }}>
            <Avatar
              src="/profile.jpg"
              alt="Anshu Jaiswal"
              sx={{ width: 46, height: 46, border: '2px solid rgba(255,255,255,0.4)' }}
            />
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '.95rem', lineHeight: 1.2 }}>
                Anshu Jaiswal
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.75)' }}>
                B.Tech Student
              </Typography>
            </Box>
          </Box>

          {/* Stats */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Overall Attendance
              </Typography>
              <Chip
                label={statusLabel}
                size="small"
                sx={{ fontSize: '.65rem', fontWeight: 700, height: 20, bgcolor: `${statusColor}18`, color: statusColor }}
              />
            </Box>
            <Typography className="mono-num" variant="h5" sx={{ fontWeight: 800, color: statusColor }}>
              {stats.percentage.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stats.present} present of {stats.total} total classes
            </Typography>
          </Box>
        </Popover>
      </Box>
    </Box>
  )
}
