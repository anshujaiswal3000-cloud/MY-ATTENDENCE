import React, { useEffect } from 'react'
import { Box, Typography, Button, Chip, Avatar, Dialog, IconButton } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { MdVerified, MdSchool, MdCheckCircle, MdClose, MdEmojiEvents, MdAutoAwesome } from 'react-icons/md'
import confetti from 'canvas-confetti'
import { useAttendance } from '../context/AttendanceContext'
import { getOverallStats } from '../utils/attendanceUtils'
import { triggerHaptic } from '../utils/hapticUtils'

export default function MascotProfileModal({ open, onClose }) {
  const { subjects = [], bunks = [], settings = {} } = useAttendance()
  const stats = getOverallStats(subjects)
  const activeSemester = settings?.semester || 'Semester 3'

  const attendanceSafe = stats.percentage >= 75
  const attendanceExcellent = stats.percentage >= 85

  useEffect(() => {
    if (open) {
      triggerHaptic([30, 50, 30])
      try {
        confetti({
          particleCount: 120,
          spread: 90,
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
        {/* 🔮 Executive 3D Glassmorphic Card Container 🔮 */}
        <motion.div
          initial={{ scale: 0.75, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.75, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          style={{ position: 'relative' }}
        >
          <Box
            sx={{
              p: 3, pt: 4.5,
              borderRadius: '32px',
              background: 'linear-gradient(145deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.92) 100%)',
              backdropFilter: 'blur(28px)',
              border: '1.5px solid rgba(99,102,241,0.45)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.7), inset 0 1.5px 0 rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Ambient Multi-Layered Animated Aurora Glows */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              style={{
                position: 'absolute', width: 240, height: 240, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(99,102,241,0) 70%)',
                filter: 'blur(40px)', top: -80, left: -50, pointerEvents: 'none'
              }}
            />
            <motion.div
              animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
              style={{
                position: 'absolute', width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(16,185,129,0) 70%)',
                filter: 'blur(40px)', bottom: -60, right: -40, pointerEvents: 'none'
              }}
            />

            {/* Close Cross Button */}
            <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
              <IconButton
                size="small"
                onClick={() => {
                  triggerHaptic(15)
                  onClose()
                }}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.12)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', transform: 'scale(1.05)' }
                }}
              >
                <MdClose size={18} />
              </IconButton>
            </Box>

            {/* 🎓 3D Animated Graduation Mascot Icon 🎓 */}
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <motion.div
                initial={{ y: -60, opacity: 0, rotate: -15 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.1 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                >
                  <Box
                    sx={{
                      width: 82, height: 82, borderRadius: '26px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                      display: 'grid', placeItems: 'center', fontSize: 44,
                      boxShadow: '0 16px 36px rgba(99,102,241,0.5), inset 0 2px 0 rgba(255,255,255,0.4)',
                      border: '3px solid #fff'
                    }}
                  >
                    🎓
                  </Box>
                </motion.div>
              </motion.div>

              {/* Glassmorphic Speech Bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                style={{ width: '100%' }}
              >
                <Box
                  sx={{
                    mt: 2, p: 2, borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(139,92,246,0.14) 100%)',
                    border: '1px solid rgba(165,180,252,0.35)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#c7d2fe', lineHeight: 1.4, fontSize: '.88rem' }}>
                    {attendanceExcellent
                      ? `🎉 Incredible Anshu! You hold ${stats.percentage.toFixed(1)}% attendance in ${activeSemester}! Pure academic excellence!`
                      : attendanceSafe
                        ? `👏 Great job Anshu! You are in the Safe Zone (${stats.percentage.toFixed(1)}%) for ${activeSemester}!`
                        : `⚠️ Heads up Anshu! Your ${activeSemester} attendance is ${stats.percentage.toFixed(1)}%. Attend upcoming lectures!`}
                  </Typography>
                </Box>
              </motion.div>
            </Box>

            {/* 🪪 Student Verified Profile Card 🪪 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Box
                sx={{
                  p: 2.25, borderRadius: '22px',
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                  mb: 2.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src="/profile.jpg"
                      alt="Anshu Jaiswal"
                      sx={{
                        width: 58, height: 58,
                        border: '2px solid #60a5fa',
                        boxShadow: '0 6px 18px rgba(96,165,250,0.4)'
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute', bottom: -2, right: -2,
                        bgcolor: '#3b82f6', borderRadius: '50%',
                        width: 20, height: 20, display: 'grid', placeItems: 'center',
                        color: '#fff', fontSize: 13, border: '2px solid #0f172a'
                      }}
                    >
                      ✓
                    </Box>
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: .6 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                        Anshu Jaiswal
                      </Typography>
                      <MdVerified color="#60a5fa" size={18} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '.76rem', display: 'block', mt: 0.25 }}>
                      ID: 21250770 • B.Tech CSE (Sec B)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 800, fontSize: '.76rem', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                      <MdSchool size={14} inline /> United College of Eng. & Research
                    </Typography>
                  </Box>
                </Box>

                {/* Styled 3D Stat Metric Cards Row */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.25, pt: 1.75, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <Box sx={{ p: 1, borderRadius: '14px', bgcolor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ display: 'block', fontSize: '.62rem', fontWeight: 800, color: '#34d399', letterSpacing: '0.05em' }}>
                      ATTENDANCE
                    </Typography>
                    <Typography className="mono-num" variant="subtitle2" sx={{ fontWeight: 800, color: attendanceSafe ? '#34d399' : '#f43f5e', fontSize: '.92rem' }}>
                      {stats.percentage.toFixed(1)}%
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1, borderRadius: '14px', bgcolor: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ display: 'block', fontSize: '.62rem', fontWeight: 800, color: '#60a5fa', letterSpacing: '0.05em' }}>
                      CLASSES
                    </Typography>
                    <Typography className="mono-num" variant="subtitle2" sx={{ fontWeight: 800, color: '#60a5fa', fontSize: '.92rem' }}>
                      {stats.present}/{stats.total}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1, borderRadius: '14px', bgcolor: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ display: 'block', fontSize: '.62rem', fontWeight: 800, color: '#a78bfa', letterSpacing: '0.05em' }}>
                      BUNKS
                    </Typography>
                    <Typography className="mono-num" variant="subtitle2" sx={{ fontWeight: 800, color: '#a78bfa', fontSize: '.92rem' }}>
                      {bunks.length} Logged
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>

            {/* Glowing Action Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  triggerHaptic(20)
                  onClose()
                }}
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
                  borderRadius: '18px',
                  py: 1.4,
                  fontWeight: 800,
                  fontSize: '.92rem',
                  boxShadow: '0 10px 30px rgba(99,102,241,0.45)',
                  textTransform: 'none',
                  letterSpacing: '0.01em'
                }}
              >
                Awesome! Let's Go 🎉
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      </Dialog>
    </AnimatePresence>
  )
}
