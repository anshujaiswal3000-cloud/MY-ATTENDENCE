import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { motion } from 'framer-motion'

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ textAlign: 'center', py: 8, px: 2 }}
    >
      <Box sx={{ fontSize: 46, mb: 2, opacity: 0.7 }}>{icon}</Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{title}</Typography>
      <Typography variant="body2" sx={{ opacity: 0.6, mb: actionLabel ? 3 : 0 }}>{subtitle}</Typography>
      {actionLabel && (
        <Button variant="contained" onClick={onAction} sx={{ borderRadius: '14px', px: 3 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
