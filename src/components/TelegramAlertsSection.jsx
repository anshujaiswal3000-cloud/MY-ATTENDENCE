import React, { useState } from 'react'
import {
  Box, Typography, TextField, Button, Switch, Chip, Alert, InputAdornment, IconButton
} from '@mui/material'
import { MdSend, MdNotificationsActive, MdCheckCircle, MdHelpOutline } from 'react-icons/md'
import GlassCard from './GlassCard'
import { useAttendance } from '../context/AttendanceContext'
import { triggerHaptic } from '../utils/hapticUtils'

export default function TelegramAlertsSection() {
  const { settings = {}, setSettings, pushToCloud, notify, isUnlocked } = useAttendance()
  
  const [chatId, setChatId] = useState(settings?.telegramChatId || '6091275709')
  const [alertTime, setAlertTime] = useState(settings?.dailyAlertTime || '16:00')
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState('')
  const [testErr, setTestErr] = useState('')

  const handleSavePreferences = () => {
    if (!isUnlocked) return notify('Login required to change 🔒', 'warning')
    triggerHaptic(20)
    const updated = {
      ...settings,
      telegramChatId: chatId,
      dailyAlertTime: alertTime,
      alertsEnabled: settings?.alertsEnabled !== false
    }
    setSettings(updated)
    pushToCloud({ settings: updated })
    notify('Daily Alert preferences saved to Cloud ☁️', 'success')
  }

  const handleSendTestAlert = async () => {
    if (!chatId) return setTestErr('Please enter a valid Telegram Chat ID first!')
    triggerHaptic(30)
    setTesting(true)
    setTestMsg('')
    setTestErr('')

    try {
      const res = await fetch('/api/alerts/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId })
      })
      const json = await res.json()
      if (json.success) {
        setTestMsg('🚀 Test Alert delivered to your phone on Telegram!')
        notify('🚀 Test Alert delivered on Telegram!', 'success')
      } else {
        setTestErr(json.message || 'Failed to deliver Telegram test alert')
      }
    } catch (err) {
      setTestErr('Network error — ensure server is running')
    } finally {
      setTesting(false)
    }
  }

  return (
    <GlassCard sx={{ p: 2.5, mb: 3, border: '2px solid rgba(168,85,247,0.45)', background: 'linear-gradient(135deg, rgba(88,28,135,0.25), rgba(15,23,42,0.95))' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(168,85,247,0.22)', color: '#c084fc', display: 'grid', placeItems: 'center', fontSize: 24 }}>
            📲
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                Daily Telegram & WhatsApp Automated Alerts
              </Typography>
              <Chip label="● 24/7 AUTOMATED" size="small" sx={{ bgcolor: 'rgba(168,85,247,0.2)', color: '#c084fc', fontWeight: 800, fontSize: '.68rem' }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#e9d5ff' }}>
              Receive instant daily attendance digests & safety alerts directly on your phone every afternoon
            </Typography>
          </Box>
        </Box>
      </Box>

      {testMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{testMsg}</Alert>}
      {testErr && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{testErr}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Telegram Chat ID"
            placeholder="e.g. 123456789"
            size="small"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            sx={{ flex: 1, minWidth: 220 }}
            helperText="Tap help below to get your Telegram Chat ID in 10 seconds"
          />

          <TextField
            label="Daily Digest Time"
            type="time"
            size="small"
            value={alertTime}
            onChange={(e) => setAlertTime(e.target.value)}
            sx={{ width: 160 }}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#c084fc', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MdHelpOutline /> 10-Second Telegram Setup Guide:
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.5, display: 'block' }}>
            1. Open Telegram & search for <strong>@userinfobot</strong> or <strong>@AttendXBot</strong>.<br />
            2. Send <code>/start</code> — it will immediately show your 9-digit <strong>Chat ID</strong>.<br />
            3. Paste your Chat ID above and tap <strong>"Send Instant Test Alert"</strong> below!
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleSavePreferences}
            disabled={!isUnlocked}
            sx={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', borderRadius: '12px', fontWeight: 800, px: 3, textTransform: 'none' }}
          >
            {isUnlocked ? 'Save Alert Preferences 💾' : 'Login Required 🔒'}
          </Button>

          <Button
            variant="outlined"
            onClick={handleSendTestAlert}
            disabled={testing || !chatId}
            startIcon={<MdSend />}
            sx={{ borderRadius: '12px', borderColor: 'rgba(192,132,252,0.4)', color: '#c084fc', fontWeight: 800, textTransform: 'none' }}
          >
            {testing ? 'Sending...' : 'Send Instant Test Alert 🚀'}
          </Button>
        </Box>
      </Box>
    </GlassCard>
  )
}
