import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@mui/material'
import { styled } from '@mui/material/styles'
import accountRecoveryService from '../../services/accountRecoveryService'

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 400,
  margin: '40px auto'
}))

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [method, setMethod] = useState<'email' | 'sms'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await accountRecoveryService.initiateRecovery(email, method)
      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to initiate recovery')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <StyledCard>
        <Typography variant="h5" gutterBottom>
          Recovery Instructions Sent
        </Typography>
        <Alert severity="success" sx={{ mb: 2 }}>
          {method === 'email'
            ? 'Please check your email for password reset instructions.'
            : 'Please check your phone for the recovery code.'}
        </Alert>
        <Typography variant="body2" color="textSecondary" paragraph>
          If you don't receive the {method === 'email' ? 'email' : 'SMS'} within a few minutes,
          please check your spam folder or try again.
        </Typography>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Return to Login
        </Button>
      </StyledCard>
    )
  }

  return (
    <StyledCard>
      <Typography variant="h5" gutterBottom>
        Account Recovery
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          margin="normal"
        />

        <FormControl component="fieldset" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Recovery Method
          </Typography>
          <RadioGroup
            value={method}
            onChange={(e) => setMethod(e.target.value as 'email' | 'sms')}
          >
            <FormControlLabel
              value="email"
              control={<Radio />}
              label="Email"
            />
            <FormControlLabel
              value="sms"
              control={<Radio />}
              label="SMS (if phone number is registered)"
            />
          </RadioGroup>
        </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Sending Instructions...' : 'Send Recovery Instructions'}
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

export default ForgotPassword 