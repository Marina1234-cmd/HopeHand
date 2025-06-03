import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Stack,
  Alert,
  Box,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Badge
} from '@mui/material'
import {
  CheckCircle as AcknowledgeIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import alertsService, { AlertInstance } from '../../services/alertsService'
import { useAuth } from '../../hooks/useAuth'

const ActiveAlerts: React.FC = () => {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<AlertInstance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true)
      try {
        const activeAlerts = await alertsService.getActiveAlerts()
        setAlerts(activeAlerts)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch alerts')
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleAcknowledge = async (alertId: string) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await alertsService.acknowledgeAlert(alertId, user.uid)
      setAlerts(alerts.filter(alert => alert.id !== alertId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (alertId: string) => {
    const newExpanded = new Set(expandedAlerts)
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId)
    } else {
      newExpanded.add(alertId)
    }
    setExpandedAlerts(newExpanded)
  }

  const getAlertSeverity = (alert: AlertInstance): 'error' | 'warning' | 'info' => {
    // You can customize this based on your alert types/thresholds
    if (alert.value > 10000) return 'error'
    if (alert.value > 5000) return 'warning'
    return 'info'
  }

  const getAlertIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return <ErrorIcon color="error" />
      case 'warning':
        return <WarningIcon color="warning" />
      default:
        return <WarningIcon color="info" />
    }
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Active Alerts</Typography>
            <Badge
              badgeContent={alerts.length}
              color="error"
              sx={{ ml: 2 }}
            />
          </Box>
        }
      />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          {alerts.map((alert) => {
            const severity = getAlertSeverity(alert)
            const isExpanded = expandedAlerts.has(alert.id)

            return (
              <Alert
                key={alert.id}
                severity={severity}
                icon={getAlertIcon(severity)}
                action={
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => toggleExpand(alert.id)}
                    >
                      <ExpandMoreIcon
                        sx={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                          transition: '0.2s'
                        }}
                      />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={loading}
                    >
                      <AcknowledgeIcon />
                    </IconButton>
                  </Box>
                }
              >
                <Box>
                  <Typography variant="subtitle2">
                    {alert.message}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Triggered {alert.timestamp.toLocaleString()}
                  </Typography>

                  <Collapse in={isExpanded}>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" gutterBottom>
                        Value: {alert.value}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={`Alert ID: ${alert.id}`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Rule ID: ${alert.ruleId}`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                  </Collapse>
                </Box>
              </Alert>
            )
          })}

          {alerts.length === 0 && (
            <Typography
              variant="body1"
              color="textSecondary"
              align="center"
              sx={{ py: 4 }}
            >
              No active alerts
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ActiveAlerts 