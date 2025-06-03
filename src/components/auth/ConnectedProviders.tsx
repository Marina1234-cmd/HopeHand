import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  Link as LinkIcon,
  LinkOff as UnlinkIcon
} from '@mui/icons-material'
import MicrosoftIcon from '@mui/icons-material/Window'
import { useAuth } from '../../hooks/useAuth'
import authService, { SSOProvider } from '../../services/authService'

interface ProviderInfo {
  id: SSOProvider
  name: string
  icon: React.ReactNode
  color: string
}

const providers: ProviderInfo[] = [
  {
    id: 'google',
    name: 'Google',
    icon: <GoogleIcon />,
    color: '#DB4437'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <FacebookIcon />,
    color: '#4267B2'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: <MicrosoftIcon />,
    color: '#00A4EF'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: <GitHubIcon />,
    color: '#333'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: <TwitterIcon />,
    color: '#1DA1F2'
  }
]

const ConnectedProviders: React.FC = () => {
  const { user } = useAuth()
  const [connectedProviders, setConnectedProviders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unlinkDialog, setUnlinkDialog] = useState<SSOProvider | null>(null)
  const [linkingProvider, setLinkingProvider] = useState<SSOProvider | null>(null)

  useEffect(() => {
    if (user?.providerData) {
      const providers = user.providerData.map(data => 
        data.providerId.replace('.com', '').replace('microsoft', 'microsoft')
      )
      setConnectedProviders(providers)
    }
  }, [user])

  const handleLink = async (provider: SSOProvider) => {
    setLinkingProvider(provider)
    setError(null)

    try {
      await authService.linkProvider(provider)
      // Update connected providers list
      setConnectedProviders(prev => [...prev, provider])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link provider')
    } finally {
      setLinkingProvider(null)
    }
  }

  const handleUnlink = async (provider: SSOProvider) => {
    if (connectedProviders.length <= 1) {
      setError('Cannot unlink the last provider. Add another provider first.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await authService.unlinkProvider(provider)
      // Update connected providers list
      setConnectedProviders(prev => prev.filter(p => p !== provider))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlink provider')
    } finally {
      setLoading(false)
      setUnlinkDialog(null)
    }
  }

  const UnlinkConfirmationDialog: React.FC<{
    provider: SSOProvider | null
    onConfirm: () => void
    onCancel: () => void
  }> = ({ provider, onConfirm, onCancel }) => (
    <Dialog open={provider !== null} onClose={onCancel}>
      <DialogTitle>Unlink Provider</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to unlink your {provider} account? 
          You won't be able to sign in with it anymore.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} color="error">
          Unlink
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Connected Accounts
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <List>
          {providers.map((provider) => {
            const isConnected = connectedProviders.includes(provider.id)
            const isLinking = linkingProvider === provider.id
            const isLoading = loading && unlinkDialog === provider.id

            return (
              <ListItem
                key={provider.id}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  border: 1,
                  borderColor: 'divider'
                }}
              >
                <ListItemIcon sx={{ color: provider.color }}>
                  {provider.icon}
                </ListItemIcon>
                <ListItemText
                  primary={provider.name}
                  secondary={isConnected ? 'Connected' : 'Not connected'}
                />
                <ListItemSecondaryAction>
                  {isConnected ? (
                    <Tooltip title="Unlink provider">
                      <IconButton
                        edge="end"
                        onClick={() => setUnlinkDialog(provider.id)}
                        disabled={isLoading || connectedProviders.length <= 1}
                      >
                        {isLoading ? (
                          <CircularProgress size={24} />
                        ) : (
                          <UnlinkIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Link provider">
                      <IconButton
                        edge="end"
                        onClick={() => handleLink(provider.id)}
                        disabled={isLinking}
                      >
                        {isLinking ? (
                          <CircularProgress size={24} />
                        ) : (
                          <LinkIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            )
          })}
        </List>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Connect multiple accounts to enable signing in with different providers.
            You must have at least one connected provider.
          </Typography>
        </Box>

        <UnlinkConfirmationDialog
          provider={unlinkDialog}
          onConfirm={() => unlinkDialog && handleUnlink(unlinkDialog)}
          onCancel={() => setUnlinkDialog(null)}
        />
      </CardContent>
    </Card>
  )
}

export default ConnectedProviders 