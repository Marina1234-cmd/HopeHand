import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  Stack,
  Alert,
  Box,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers'
import maintenanceService, { MaintenanceState } from '../../services/maintenanceService'
import { useAuth } from '../../hooks/useAuth'

const AVAILABLE_OPERATIONS = ['read', 'write', 'delete', 'update']
const AVAILABLE_SERVICES = ['campaigns', 'donations', 'users', 'auth', 'files', 'notifications']

const MaintenanceControl: React.FC = () => {
  const { user } = useAuth()
  const [maintenanceState, setMaintenanceState] = useState<MaintenanceState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEnableDialog, setShowEnableDialog] = useState(false)

  // Form state
  const [reason, setReason] = useState('')
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [message, setMessage] = useState('')
  const [adminMessage, setAdminMessage] = useState('')
  const [selectedOperations, setSelectedOperations] = useState<string[]>(['read'])
  const [selectedServices, setSelectedServices] = useState<string[]>(['all'])

  useEffect(() => {
    const unsubscribe = maintenanceService.subscribe(setMaintenanceState)
    return () => unsubscribe()
  }, [])

  const handleEnableMaintenance = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await maintenanceService.enableMaintenance({
        reason,
        endTime: endTime || undefined,
        allowedOperations: selectedOperations,
        affectedServices: selectedServices,
        message,
        adminMessage
      }, user.uid)

      setShowEnableDialog(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable maintenance mode')
    } finally {
      setLoading(false)
    }
  }

  const handleDisableMaintenance = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await maintenanceService.disableMaintenance(user.uid)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable maintenance mode')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setReason('')
    setEndTime(null)
    setMessage('')
    setAdminMessage('')
    setSelectedOperations(['read'])
    setSelectedServices(['all'])
  }

  const MaintenanceDialog = () => (
    <Dialog 
      open={showEnableDialog} 
      onClose={() => setShowEnableDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Enable Maintenance Mode</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            fullWidth
          />

          <DateTimePicker
            label="Expected End Time"
            value={endTime}
            onChange={(newValue) => setEndTime(newValue)}
          />

          <TextField
            label="User Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={2}
            fullWidth
            helperText="Message shown to all users during maintenance"
          />

          <TextField
            label="Admin Message"
            value={adminMessage}
            onChange={(e) => setAdminMessage(e.target.value)}
            multiline
            rows={2}
            fullWidth
            helperText="Additional message shown only to admins"
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Allowed Operations
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {AVAILABLE_OPERATIONS.map((op) => (
                <FormControlLabel
                  key={op}
                  control={
                    <Checkbox
                      checked={selectedOperations.includes(op)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOperations([...selectedOperations, op])
                        } else {
                          setSelectedOperations(selectedOperations.filter(o => o !== op))
                        }
                      }}
                    />
                  }
                  label={op}
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Affected Services
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedServices.includes('all')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServices(['all'])
                      } else {
                        setSelectedServices([])
                      }
                    }}
                  />
                }
                label="All Services"
              />
              {!selectedServices.includes('all') && AVAILABLE_SERVICES.map((service) => (
                <FormControlLabel
                  key={service}
                  control={
                    <Checkbox
                      checked={selectedServices.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServices([...selectedServices, service])
                        } else {
                          setSelectedServices(selectedServices.filter(s => s !== service))
                        }
                      }}
                    />
                  }
                  label={service}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowEnableDialog(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleEnableMaintenance}
          color="primary"
          variant="contained"
          disabled={loading || !reason}
        >
          Enable Maintenance Mode
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <Card>
      <CardHeader 
        title="System Maintenance Control"
        subheader={maintenanceState?.enabled 
          ? "Maintenance mode is currently active"
          : "System is operating normally"
        }
        action={
          <Button
            color={maintenanceState?.enabled ? "error" : "primary"}
            variant="contained"
            onClick={maintenanceState?.enabled 
              ? handleDisableMaintenance 
              : () => setShowEnableDialog(true)
            }
            disabled={loading}
          >
            {maintenanceState?.enabled ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
          </Button>
        }
      />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {maintenanceState?.enabled && (
          <Stack spacing={2}>
            <Typography variant="subtitle2">
              Current Maintenance Status:
            </Typography>
            
            <Box>
              <Typography variant="body2" gutterBottom>
                • Reason: {maintenanceState.reason}
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Started: {maintenanceState.startTime.toLocaleString()}
              </Typography>
              {maintenanceState.endTime && (
                <Typography variant="body2" gutterBottom>
                  • Expected End: {maintenanceState.endTime.toLocaleString()}
                </Typography>
              )}
              <Typography variant="body2" gutterBottom>
                • Last Updated: {maintenanceState.updatedAt.toLocaleString()}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Allowed Operations:
              </Typography>
              <Stack direction="row" spacing={1}>
                {maintenanceState.allowedOperations.map((op) => (
                  <Chip key={op} label={op} color="primary" variant="outlined" />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Affected Services:
              </Typography>
              <Stack direction="row" spacing={1}>
                {maintenanceState.affectedServices.map((service) => (
                  <Chip key={service} label={service} color="warning" variant="outlined" />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                User Message:
              </Typography>
              <Typography variant="body2">
                {maintenanceState.message}
              </Typography>
            </Box>

            {maintenanceState.adminMessage && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Admin Message:
                </Typography>
                <Typography variant="body2">
                  {maintenanceState.adminMessage}
                </Typography>
              </Box>
            )}
          </Stack>
        )}

        <MaintenanceDialog />
      </CardContent>
    </Card>
  )
}

export default MaintenanceControl 