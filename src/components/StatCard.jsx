import React from 'react'
import { Box, Typography } from '@mui/material'
import GlassCard from './GlassCard'

export default function StatCard({ icon, label, value, accent = '#3b82f6', delay = 0, suffix = '', description }) {
  return (
    <GlassCard delay={delay} sx={{ p: 2.25, minHeight: 122 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: '#fff',
            background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ opacity: 0.65 }} noWrap>{label}</Typography>
          <Typography className="mono-num" variant="h5" sx={{ fontWeight: 700 }}>
            {value}{suffix}
          </Typography>
          {description && <Typography variant="caption" sx={{ opacity: 0.52, display: 'block', mt: 0.2 }} noWrap>{description}</Typography>}
        </Box>
      </Box>
    </GlassCard>
  )
}
