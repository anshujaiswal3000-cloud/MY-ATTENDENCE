import React from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import { MdRefresh, MdWarning } from 'react-icons/md'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('AttendX UI Error Boundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    try {
      localStorage.removeItem('attendx_settings')
      localStorage.removeItem('attendx_subjects')
      localStorage.removeItem('attendx_history')
    } catch (e) {}
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{
          minHeight: '80vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', p: 3, textAlign: 'center',
          color: '#fff'
        }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '20px', display: 'grid', placeItems: 'center',
            bgcolor: 'rgba(244,63,94,.18)', color: '#f43f5e', fontSize: 32, mb: 2
          }}>
            <MdWarning />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Something went wrong
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,.7)', maxWidth: 400, mb: 2 }}>
            AttendX encountered a temporary state glitch. Click below to reload cleanly.
          </Typography>

          {this.state.error?.message && (
            <Alert severity="error" sx={{ mb: 3, maxWidth: 450, borderRadius: '12px', fontSize: '.75rem', textTransform: 'none' }}>
              Details: {this.state.error.message}
            </Alert>
          )}

          <Button
            variant="contained"
            startIcon={<MdRefresh />}
            onClick={this.handleReset}
            sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '12px', px: 3, fontWeight: 700 }}
          >
            Reload App Cleanly
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}
