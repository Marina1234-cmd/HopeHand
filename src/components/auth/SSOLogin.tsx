import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Typography,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  Twitter as TwitterIcon
} from '@mui/icons-material'
import MicrosoftIcon from '@mui/icons-material/Window'
import authService, { SSOProvider } from '../../services/authService'
import { styled } from '@mui/material/styles'

const ProviderButton = styled(Button)(({ theme }) => ({
  width: '100%',
  justifyContent: 'flex-start',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(2)
  }
}))

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  margin: '40px auto',
  padding: theme.spacing(3)
}))

interface ProviderConfig {
  id: SSOProvider
  name: string
  icon: React.ReactNode
  color: string
}

const providers: ProviderConfig[] = [
  {
    id: 'google',
    name: 'Continue with Google',
    icon: <GoogleIcon />,
    color: '#DB4437'
  },
  {
    id: 'facebook',
    name: 'Continue with Facebook',
    icon: <FacebookIcon />,
    color: '#4267B2'
  },
  {
    id: 'microsoft',
    name: 'Continue with Microsoft',
    icon: <MicrosoftIcon />,
    color: '#00A4EF'
  },
  {
    id: 'github',
    name: 'Continue with GitHub',
    icon: <GitHubIcon />,
    color: '#333'
  },
  {
    id: 'twitter',
    name: 'Continue with Twitter',
    icon: <TwitterIcon />,
    color: '#1DA1F2'
  }
]

const SSOLogin: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState<SSOProvider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (provider: SSOProvider) => {
    setLoading(provider)
    setError(null)

    try {
      // Use redirect for mobile devices, popup for desktop
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      await authService.signInWithSSO(provider, isMobile)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h5" gutterBottom align="center">
          Sign In to HopeHand
        </Typography>

        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          Choose your preferred sign-in method
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          {providers.map((provider) => (
            <ProviderButton
              key={provider.id}
              variant="outlined"
              startIcon={provider.icon}
              onClick={() => handleLogin(provider.id)}
              disabled={loading !== null}
              sx={{
                borderColor: provider.color,
                color: provider.color,
                '&:hover': {
                  borderColor: provider.color,
                  backgroundColor: `${provider.color}10`
                }
              }}
            >
              {loading === provider.id ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                provider.name
              )}
            </ProviderButton>
          ))}
        </Stack>

        <Box sx={{ mt: 3 }}>
          <Divider>
            <Typography variant="body2" color="textSecondary">
              By continuing, you agree to our
            </Typography>
          </Divider>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mt: 1 }}
          >
            <Button
              size="small"
              color="primary"
              onClick={() => navigate('/terms')}
            >
              Terms of Service
            </Button>
            <Button
              size="small"
              color="primary"
              onClick={() => navigate('/privacy')}
            >
              Privacy Policy
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </StyledCard>
  )
}

export default SSOLogin 