import React from 'react'
import { Box, Skeleton } from '@mui/material'

export function CardSkeleton() {
  return (
    <Box sx={{ p: 2.5, borderRadius: '22px', bgcolor: 'rgba(148,163,184,0.08)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '12px' }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="70%" height={20} />
          <Skeleton width="40%" height={16} />
        </Box>
      </Box>
      <Skeleton height={8} sx={{ borderRadius: 4, mb: 1.5 }} />
      <Skeleton width="60%" height={32} />
    </Box>
  )
}

export function GridSkeleton({ count = 6 }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </Box>
  )
}
