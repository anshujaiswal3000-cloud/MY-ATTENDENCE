import React, { useEffect } from 'react'
import { Box, Typography, Button, Avatar, Dialog, IconButton, Chip } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { MdVerified, MdSchool, MdClose, MdCheckCircle } from 'react-icons/md'
import confetti from 'canvas-confetti'
import { useAttendance } from '../context/AttendanceContext'
import { getOverallStats } from '../utils/attendanceUtils'
import { triggerHaptic } from '../utils/hapticUtils'

export default function MascotProfileModal({ open, onClose }) {
  const { subjects = [], bunks = [], settings = {} } = useAttendance()
  const stats = getOverallStats(subjects)
  const activeSemester = settings?.semester || 'Semester 3'

  const attendanceSafe = stats.percentage >= 75

  useEffect(() => {
    if (open) {
      triggerHaptic([30, 50, 30])
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.35 },
          colors: ['#60a5fa', '#34d399', '#f59e0b', '#ec4899', '#a78bfa']
        })
      } catch (e) {}
    }
  }, [open])

  if (!open) return null

  return (
    <AnimatePresence>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden',
            m: 1.5,
            maxWidth: '380px'
          }
        }}
      >
        {/* 🔮 Ultra-Clean Compact 3D Glassmorphic Profile Card 🔮 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          style={{ position: 'relative', width: '100%' }}
        >
          <Box
            sx={{
              p: 2.5, pt: 3.5,
              borderRadius: '28px',
              background: 'linear-gradient(145deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.94) 100%)',
              backdropFilter: 'blur(28px)',
              border: '1.5px solid rgba(99,102,241,0.4)',
              boxShadow: '0 25px 70px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.15)',
              position: 'relative',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
          >
            {/* Close Button */}
            <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
              <IconButton
                size="small"
                onClick={() => {
                  triggerHaptic(15)
                  onClose()
                }}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.12)', color: '#fff',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                }}
              >
                <MdClose size={16} />
              </IconButton>
            </Box>

            {/* 🎓 3D Floating Graduation Mascot 🎓 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1.5 }}>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
              >
                <Box
                  sx={{
                    width: 68, height: 68, borderRadius: '22px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'grid', placeItems: 'center', fontSize: 36,
                    boxShadow: '0 12px 28px rgba(99,102,241,0.45)',
                    border: '2.5px solid #fff'
                  }}
                >
                  🎓
                </Box>
              </motion.div>

              {/* Short & Crisp Speech Bubble */}
              <Box
                sx={{
                  mt: 1.5, px: 2, py: 0.85, borderRadius: '16px',
                  bgcolor: 'rgba(99,102,241,0.18)', border: '1px solid rgba(165,180,252,0.3)',
                  textAlign: 'center', width: '100%'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#c7d2fe', fontSize: '.82rem', lineHeight: 1.3 }}>
                  🎯 Anshu Jaiswal • <strong>{stats.percentage.toFixed(1)}%</strong> in {activeSemester} ({attendanceSafe ? 'Safe Zone 🎯' : 'Warning ⚠️'})
                </Typography>
              </Box>
            </Box>

            {/* 🪪 Student Profile Details Card 🪪 */}
            <Box
              sx={{
                p: 2, borderRadius: '20px',
                bgcolor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                mb: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Avatar
                  src="/profile.jpg"
                  alt="Anshu Jaiswal"
                  sx={{
                    width: 48, height: 48,
                    border: '2px solid #60a5fa',
                    boxShadow: '0 4px 14px rgba(96,165,250,0.35)'
                  }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', fontSize: '.95rem', lineHeight: 1.2 }} noWrap>
                      Anshu Jaiswal
                    </Typography>
                    <MdVerified color="#60a5fa" size={16} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '.72rem', display: 'block' }}>
                    ID: 21250770 • B.Tech CSE (Sec B)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700, fontSize: '.72rem' }}>
                    United College of Eng. & Research
                  </Typography>
                </Box>
              </Box>

              {/* 3D Metric Stat Pills */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, pt: 1.25, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <Box sx={{ p: 0.85, borderRadius: '12px', bgcolor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '.58rem', fontWeight: 800, color: '#34d399' }}>
                    ATTENDANCE
                  </Typography>
                  <Typography className="mono-num" variant="subtitle2" sx={{ fontWeight: 800, color: attendanceSafe ? '#34d399' : '#f43f5e', fontSize: '.85rem' }}>
                    {stats.percentage.toFixed(1)}%
                  </Typography>
                </Box>

                <Box sx={{ p: 0.85, borderRadius: '12px', bgcolor: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '.58rem', fontWeight: 800, color: '#60a5fa' }}>
                    CLASSES
                  </Typography>
                  <Typography className="mono-num" variant="subtitle2" sx={{ fontWeight: 800, color: '#60a5fa', fontSize: '.85rem' }}>
                    {stats.present}/{stats.total}
                  </Typography>
                </Box>

                <Box sx={{ p: 0.85, borderRadius: '12px', bgcolor: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '.58rem', fontWeight: 800, color: '#a78bfa' }}>
                    BUNKS
                  </Typography>
                  <Typography className="mono-num" variant="subtitle2" sx={{ fontWeight: 800, color: '#a78bfa', fontSize: '.85rem' }}>
                    {bunks.length} Logged
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Action Button */}
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                triggerHaptic(20)
                onClose()
              }}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
                borderRadius: '16px',
                py: 1.2,
                fontWeight: 800,
                fontSize: '.88rem',
                boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                textTransform: 'none'
              }}
            >
              Awesome! Let's Go 🎉
            </Button>
          </Box>
        </motion.div>
      </Dialog>
    </AnimatePresence>
  )
}
