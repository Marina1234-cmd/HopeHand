import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material'
import { styled } from '@mui/material/styles'
import accountRecoveryService from '../../services/accountRecoveryService'

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 400,
  margin: '40px auto'
}))

const PasswordRequirements = styled('ul')(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  color: theme.palette.text.secondary,
  '& li': {
    marginBottom: theme.spacing(0.5)
  }
}))

const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setError('Invalid reset link')
        setVerifying(false)
        return
      }

      try {
        await accountRecoveryService.verifyRecoveryToken(email, token)
        setVerifying(false)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Invalid or expired reset link')
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token, email])

  const validatePassword = (password: string): boolean => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token || !email) {
      setError('Invalid reset link')
      return
    }

    if (!validatePassword(password)) {
      setError('Password does not meet requirements')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await accountRecoveryService.resetPassword(email, token, password)
      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <StyledCard>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
        <Typography align="center">
          Verifying reset link...
        </Typography>
      </StyledCard>
    )
  }

  if (success) {
    return (
      <StyledCard>
        <Typography variant="h5" gutterBottom>
          Password Reset Successful
        </Typography>
        <Alert severity="success" sx={{ mb: 2 }}>
          Your password has been successfully reset.
        </Alert>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => navigate('/login')}
        >
          Login with New Password
        </Button>
      </StyledCard>
    )
  }

  if (error === 'Invalid reset link' || error === 'Invalid or expired reset link') {
    return (
      <StyledCard>
        <Typography variant="h5" gutterBottom>
          Invalid Reset Link
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="textSecondary" paragraph>
          The password reset link is invalid or has expired.
          Please request a new password reset link.
        </Typography>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => navigate('/forgot-password')}
        >
          Request New Reset Link
        </Button>
      </StyledCard>
    )
  }

  return (
    <StyledCard>
      <Typography variant="h5" gutterBottom>
        Reset Password
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        Password Requirements:
      </Typography>
      <PasswordRequirements>
        <li>At least 8 characters long</li>
        <li>Contains at least one uppercase letter</li>
        <li>Contains at least one lowercase letter</li>
        <li>Contains at least one number</li>
        <li>Contains at least one special character</li>
      </PasswordRequirements>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          type="password"
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          margin="normal"
        />

        <TextField
          fullWidth
          type="password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          margin="normal"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate('/login')}
          sx={{ mt: 1 }}
        >
          Back to Login
        </Button>
      </form>
    </StyledCard>
  )
}

export default ResetPassword 