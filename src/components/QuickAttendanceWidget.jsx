import React, { useState } from 'react'
import { Box, Fab, Popper, Paper, Typography, List, ListItem, IconButton, ClickAwayListener, Grow } from '@mui/material'
import { MdBolt } from 'react-icons/md'
import { FaCheck, FaTimes } from 'react-icons/fa'
import { useTheme } from '@mui/material/styles'
import { getSubjectIcon } from '../utils/iconRegistry'

/** A floating quick-mark widget: pick any subject and log present/absent in one tap. */
export default function QuickAttendanceWidget({ subjects, onPresent, onAbsent }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const theme = useTheme()
  const open = Boolean(anchorEl)

  return (
    <>
      <Fab
        onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}
        sx={{
          position: 'fixed',
          bottom: { xs: 84, md: 28 },
          right: 24,
          zIndex: 30,
          background: theme.custom.aurora,
          color: '#fff',
        }}
      >
        <MdBolt size={24} />
      </Fab>

      <Popper open={open} anchorEl={anchorEl} placement="top-end" transition sx={{ zIndex: 40 }}>
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'bottom right' }}>
            <Paper
              className="glass-surface"
              sx={{
                width: 300, maxHeight: 380, overflowY: 'auto', mb: 1.5, mr: 1,
                background: theme.custom.glassBg, borderRadius: '20px', p: 1.5,
              }}
            >
              <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, px: 1, pb: 1 }}>Quick Attendance</Typography>
                  <List dense disablePadding>
                    {subjects.map((s) => {
                      const Icon = getSubjectIcon(s.icon)
                      return (
                        <ListItem
                          key={s.id}
                          sx={{ borderRadius: '14px', px: 1, '&:hover': { bgcolor: 'rgba(148,163,184,0.1)' } }}
                          secondaryAction={
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton size="small" onClick={() => onPresent(s.id)} sx={{ color: '#10b981' }}>
                                <FaCheck size={13} />
                              </IconButton>
                              <IconButton size="small" onClick={() => onAbsent(s.id)} sx={{ color: '#f43f5e' }}>
                                <FaTimes size={13} />
                              </IconButton>
                            </Box>
                          }
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                            <Icon size={13} />
                            <Typography variant="body2" noWrap sx={{ maxWidth: 140 }}>{s.name}</Typography>
                          </Box>
                        </ListItem>
                      )
                    })}
                  </List>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}
