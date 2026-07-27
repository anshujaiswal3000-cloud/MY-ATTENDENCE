import React from 'react'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'

/**
 * GlassCard — the base glassmorphism surface used throughout AttendX.
 * Wraps children in a blurred, translucent, rounded panel that adapts
 * to light/dark mode via theme.custom tokens.
 */
export default function GlassCard({ children, sx = {}, delay = 0, ...props }) {
  const theme = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%' }}
    >
      <div
        className="glass-surface"
        style={{
          background: theme.custom.glassBg,
          borderColor: theme.custom.glassBorder,
          borderRadius: 22,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.35)'
            : '0 8px 32px rgba(15,23,42,0.08)',
          height: '100%',
          ...sx,
        }}
        {...props}
      >
        {children}
      </div>
    </motion.div>
  )
}
