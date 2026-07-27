import React from 'react'
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../data/navConfig'
import { useTheme } from '@mui/material/styles'
import { triggerHaptic } from '../utils/hapticUtils'

export default function Sidebar() {
  const theme = useTheme()

  return (
    <Box
      component="nav"
      sx={{
        width: 240,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        p: 2.5,
        gap: 1,
        borderRight: `1px solid ${theme.custom.glassBorder}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 1, mb: 3 }}>
        <Box
          sx={{
            width: 36, height: 36, borderRadius: '11px',
            background: theme.custom.aurora,
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>AttendX</Typography>
      </Box>

      <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {NAV_ITEMS.map(({ label, path, Icon }) => (
          <ListItemButton
            key={path}
            component={NavLink}
            to={path}
            end={path === '/'}
            onClick={() => triggerHaptic(18)}
            sx={{
              borderRadius: '14px',
              '&.active': {
                background: theme.custom.aurora,
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38 }}><Icon size={19} /></ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 600, fontSize: 14.5 }} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: 'auto', px: 1 }}>
        <Typography variant="caption" sx={{ opacity: 0.45 }}>AttendX v1.0 · CSE Sec B</Typography>
      </Box>
    </Box>
  )
}
