import React from 'react'
import { Box, Typography, Button, IconButton, LinearProgress, Chip, Tooltip } from '@mui/material'
import { FaCheck, FaTimes, FaEdit, FaTrash } from 'react-icons/fa'
import GlassCard from './GlassCard'
import { getSubjectIcon } from '../utils/iconRegistry'
import { getPercentage, getStatus, STATUS_COLORS, STATUS_LABELS } from '../utils/attendanceUtils'

/**
 * SubjectCard
 * variant="compact" -> used on Dashboard's Today's Classes rail (Present/Absent only)
 * variant="full" -> used on Subjects page (adds progress bar, status chip, edit/delete)
 */
export default function SubjectCard({
  subject,
  variant = 'full',
  onPresent,
  onAbsent,
  onEdit,
  onDelete,
  delay = 0,
}) {
  const Icon = getSubjectIcon(subject.icon)
  const pct = getPercentage(subject.present, subject.total)
  const status = getStatus(pct)
  const [start, end] = subject.color || ['#3b82f6', '#8b5cf6']

  return (
    <GlassCard delay={delay} sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${start}, ${end})`, color: '#fff', fontSize: 17,
            }}
          >
            <Icon />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap title={subject.name}>
              {subject.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>{subject.code}</Typography>
          </Box>
        </Box>

        {variant === 'full' && (
          <Chip
            size="small"
            label={STATUS_LABELS[status]}
            sx={{
              bgcolor: `${STATUS_COLORS[status]}22`,
              color: STATUS_COLORS[status],
              fontWeight: 600,
              flexShrink: 0,
            }}
          />
        )}
      </Box>

      {variant === 'full' && (
        <>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography className="mono-num" variant="body2" sx={{ fontWeight: 700 }}>
                {pct.toFixed(2)}%
              </Typography>
              <Typography className="mono-num" variant="caption" sx={{ opacity: 0.6 }}>
                {subject.present}/{subject.total}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, pct)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(148,163,184,0.18)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${start}, ${end})`,
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="caption" sx={{ opacity: 0.65 }}>Present: <b className="mono-num">{subject.present}</b></Typography>
            <Typography variant="caption" sx={{ opacity: 0.65 }}>Absent: <b className="mono-num">{subject.total - subject.present}</b></Typography>
            <Typography variant="caption" sx={{ opacity: 0.65 }}>Total: <b className="mono-num">{subject.total}</b></Typography>
          </Box>
        </>
      )}

      <Box sx={{ display: 'flex', gap: 1, mt: 'auto', alignItems: 'center' }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<FaCheck size={12} />}
          onClick={() => onPresent?.(subject.id)}
          sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#0ea975' }, flex: variant === 'compact' ? 1 : 'none' }}
        >
          Present
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<FaTimes size={12} />}
          onClick={() => onAbsent?.(subject.id)}
          sx={{ bgcolor: '#f43f5e', '&:hover': { bgcolor: '#e11d48' }, flex: variant === 'compact' ? 1 : 'none' }}
        >
          Absent
        </Button>

        {variant === 'full' && (
          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
            <Tooltip title="Edit subject">
              <IconButton size="small" onClick={() => onEdit?.(subject)}>
                <FaEdit size={14} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete subject">
              <IconButton size="small" onClick={() => onDelete?.(subject)} color="error">
                <FaTrash size={14} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </GlassCard>
  )
}
