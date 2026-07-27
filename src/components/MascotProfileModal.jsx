import React, { useEffect } from 'react'
import { Box, Typography, Button, Chip, Avatar, Dialog } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { MdVerified, MdSchool, MdCheckCircle, MdDoorBack, MdCloudDone, MdClose, MdEmojiEvents } from 'react-icons/md'
import confetti from 'canvas-confetti'
import { useAttendance } from '../context/AttendanceContext'
import { getOverallStats } from '../utils/attendanceUtils'
import { triggerHaptic } from '../utils/hapticUtils'

export default function MascotProfileModal({ open, onClose }) {
  const { subjects, bunks, dbSynced, settings } = useAttendance()
  const stats = getOverallStats(subjects)
  const activeSemester = settings?.semester || 'Semester 3'

  const attendanceSafe = stats.percentage >= 75
  const attendanceExcellent = stats.percentage >= 85

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
            overflow: 'visible',
            m: 2
          }
        }}
      >
        {/* 🔮 Glowing Opening Ball Container (Expands from Orb) 🔮 */}
        <motion.div
          initial={{ scale: 0.2, opacity: 0, borderRadius: '50%' }}
          animate={{ scale: 1, opacity: 1, borderRadius: '28px' }}
          exit={{ scale: 0.2, opacity: 0, borderRadius: '50%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          style={{ position: 'relative' }}
        >
          <Box
            sx={{
              p: 3, pt: 5,
              borderRadius: '28px',
              background: 'linear-gradient(145deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))',
              backdropFilter: 'blur(24px)',
              border: '2px solid rgba(99,102,241,0.4)',
              boxShadow: '0 25px 70px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Ambient Aurora Glow */}
            <Box sx={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', filter: 'blur(50px)', top: -60, left: -40, pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: 'rgba(16,185,129,0.18)', filter: 'blur(45px)', bottom: -40, right: -30, pointerEvents: 'none' }} />

            {/* Close Cross Button */}
            <Box sx={{ position: 'absolute', top: 14, right: 14, zIndex: 10 }}>
              <IconButton
                size="small"
                onClick={() => {
                  triggerHaptic(15)
                  onClose()
                }}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
              >
                <MdClose size={18} />
              </IconButton>
            </Box>

            {/* 🤖 Mascot Dropping Down with Hover Motion 🤖 */}
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <motion.div
                initial={{ y: -70, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                >
                  <Box
                    sx={{
                      width: 76, height: 76, borderRadius: '24px',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'grid', placeItems: 'center', fontSize: 42,
                      boxShadow: '0 12px 30px rgba(99,102,241,0.45)',
                      border: '3px solid #fff'
                    }}
                  >
                    🎓
                  </Box>
                </motion.div>
              </motion.div>

              {/* Speech Bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Box
                  sx={{
                    mt: 1.5, px: 2, py: 1, borderRadius: '16px',
                    bgcolor: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
                    textAlign: 'center', position: 'relative'
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#a5b4fc', lineHeight: 1.35 }}>
                    {attendanceExcellent
                      ? `🎉 Incredible Anshu! You're holding ${stats.percentage.toFixed(1)}% attendance in ${activeSemester}! Pure excellence!`
                      : attendanceSafe
                        ? `👏 Great job Anshu! You are in the Safe Zone (${stats.percentage.toFixed(1)}%) for ${activeSemester}!`
                        : `⚠️ Heads up Anshu! Your ${activeSemester} attendance is ${stats.percentage.toFixed(1)}%. Attend upcoming classes!`}
                  </Typography>
                </Box>
              </motion.div>
            </Box>

            {/* 🪪 Student Profile Details Card 🪪 */}
            <Box sx={{ p: 2, borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Avatar src="/profile.jpg" alt="Anshu Jaiswal" sx={{ width: 54, height: 54, border: '2px solid #60a5fa', boxShadow: '0 4px 14px rgba(96,165,250,0.3)' }} />
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                      Anshu Jaiswal
                    </Typography>
                    <MdVerified color="#60a5fa" size={16} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>
                    ID: 21250770 • B.Tech CSE (Sec B)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700 }}>
                    United College of Engineering & Research
                  </Typography>
                </Box>
              </Box>

              {/* Stats Summary Strip */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '.64rem' }}>
                    ATTENDANCE
                  </Typography>
                  <Typography className="mono-num" variant="subtitle2" sx={{ fontWeight: 800, color: attendanceSafe ? '#34d399' : '#f43f5e' }}>
                    {stats.percentage.toFixed(1)}%
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '.64rem' }}>
                    CLASSES
                  </Typography>
                  <Typography className="mono-num" variant="subtitle2" sx={{ fontWeight: 800, color: '#60a5fa' }}>
                    {stats.present}/{stats.total}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '.64rem' }}>
                    BUNKS
                  </Typography>
                  <Typography className="mono-num" variant="subtitle2" sx={{ fontWeight: 800, color: '#a78bfa' }}>
                    {bunks.length} Logged
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                triggerHaptic(20)
                onClose()
              }}
              sx={{
                background: 'var(--aurora)',
                borderRadius: '14px',
                py: 1.25,
                fontWeight: 800,
                fontSize: '.9rem',
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
