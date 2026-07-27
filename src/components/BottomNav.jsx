import React from 'react'
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { NAV_ITEMS } from '../data/navConfig'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  const currentIndex = Math.max(0, NAV_ITEMS.findIndex((n) => n.path === location.pathname))

  return (
    <Paper
      elevation={0}
      className="glass-surface"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        display: { xs: 'block', md: 'none' },
        borderRadius: 0,
        borderTop: `1px solid ${theme.custom.glassBorder}`,
        background: theme.custom.glassBg,
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation
        showLabels
        value={currentIndex}
        onChange={(_, newIndex) => navigate(NAV_ITEMS[newIndex].path)}
        sx={{ bgcolor: 'transparent' }}
      >
        {NAV_ITEMS.map(({ label, Icon }) => (
          <BottomNavigationAction
            key={label}
            label={label}
            icon={<span className="bottom-nav-icon"><Icon size={20} /></span>}
            sx={{
              minWidth: 0,
              minHeight: 62,
              fontSize: '0.66rem',
              '&.Mui-selected': { color: '#60a5fa' },
              '&.Mui-selected .bottom-nav-icon': { transform: 'translateY(-2px) scale(1.12)' },
              '& .bottom-nav-icon': { display: 'inline-flex', transition: 'transform 220ms cubic-bezier(.22,1,.36,1)' },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  )
}
