import React from 'react'
import { Box, Typography } from '@mui/material'

const PRESETS = [
  ['#10b981', '#3b82f6'],
  ['#3b82f6', '#8b5cf6'],
  ['#8b5cf6', '#10b981'],
  ['#3b82f6', '#10b981'],
  ['#8b5cf6', '#3b82f6'],
  ['#10b981', '#8b5cf6'],
  ['#f59e0b', '#f43f5e'],
  ['#06b6d4', '#3b82f6'],
]

export default function ColorPicker({ value, onChange }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ opacity: 0.65, mb: 1, display: 'block' }}>Color</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {PRESETS.map(([start, end]) => {
          const selected = value?.[0] === start && value?.[1] === end
          return (
            <Box
              key={start + end}
              onClick={() => onChange([start, end])}
              sx={{
                width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                background: `linear-gradient(135deg, ${start}, ${end})`,
                border: selected ? '2px solid #fff' : '2px solid transparent',
                outline: selected ? '2px solid #3b82f6' : 'none',
                transition: 'all 0.15s ease',
              }}
            />
          )
        })}
      </Box>
    </Box>
  )
}
