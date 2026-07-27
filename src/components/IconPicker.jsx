import React from 'react'
import { Box, Typography } from '@mui/material'
import { ICON_REGISTRY } from '../utils/iconRegistry'

export default function IconPicker({ value, onChange }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ opacity: 0.65, mb: 1, display: 'block' }}>Icon</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {Object.entries(ICON_REGISTRY).map(([key, { Icon, label }]) => (
          <Box
            key={key}
            onClick={() => onChange(key)}
            title={label}
            sx={{
              width: 40, height: 40, borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 16,
              border: value === key ? '2px solid #3b82f6' : '1px solid rgba(148,163,184,0.3)',
              bgcolor: value === key ? 'rgba(59,130,246,0.12)' : 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <Icon />
          </Box>
        ))}
      </Box>
    </Box>
  )
}
