import React from 'react'
import { motion } from 'framer-motion'
import { Box, Typography } from '@mui/material'

/**
 * AuroraGauge — the app's signature element. A large circular ring
 * stroked with the emerald→azure→violet aurora gradient, animating its
 * fill on mount/update to reflect overall attendance percentage.
 */
export default function AuroraGauge({ percentage = 0, size = 196, strokeWidth = 13, label = 'Overall' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, percentage))
  const offset = circumference - (clamped / 100) * circumference

  const gradientId = 'aurora-gauge-gradient'

  return (
    <Box sx={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="52%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.18)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <Box sx={{ position: 'absolute', textAlign: 'center' }}>
        <Typography className="mono-num" sx={{ fontSize: size * 0.17, fontWeight: 800, lineHeight: 1, letterSpacing: '-.02em' }}>
          {clamped.toFixed(2)}%
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, fontWeight: 700, display: 'block', fontSize: '.75rem' }}>{label}</Typography>
      </Box>
    </Box>
  )
}
