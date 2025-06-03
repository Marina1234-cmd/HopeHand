import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import alertsService, { AlertRule } from '../../services/alertsService'
import { useAuth } from '../../hooks/useAuth'

const METRIC_OPTIONS = {
  financial: [
    { value: 'campaign_total', label: 'Campaign Total' },
    { value: 'daily_donations', label: 'Daily Donations' },
    { value: 'monthly_donations', label: 'Monthly Donations' }
  ],
  activity: [
    { value: 'page_views', label: 'Page Views' },
    { value: 'new_users', label: 'New User Registrations' },
    { value: 'active_sessions', label: 'Active Sessions' },
    { value: 'donation_attempts', label: 'Donation Attempts' }
  ]
}

interface RuleFormData {
  type: 'financial' | 'activity'
  metric: string
  threshold: number
  timeWindow?: number
  comparison: 'greater' | 'less' | 'equal' | 'spike'
  notifyRoles: string[]
  message: string
  cooldown: number
}

const DEFAULT_FORM_DATA: RuleFormData = {
  type: 'financial',
  metric: '',
  threshold: 0,
  timeWindow: 5,
  comparison: 'greater',
  notifyRoles: ['admin'],
  message: '',
  cooldown: 60
}

const AlertRules: React.FC = () => {
  const { user } = useAuth()
  const [rules, setRules] = useState<AlertRule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null)
  const [formData, setFormData] = useState<RuleFormData>(DEFAULT_FORM_DATA)

  useEffect(() => {
    const unsubscribe = alertsService.subscribeToRules((updatedRules) => {
      setRules(updatedRules)
    })
    return () => unsubscribe()
  }, [])

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      if (editingRule) {
        await alertsService.updateRule(editingRule.id, formData)
      } else {
        await alertsService.createRule(formData)
      }

      setShowDialog(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save alert rule')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (ruleId: string) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await alertsService.deleteRule(ruleId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete alert rule')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA)
    setEditingRule(null)
  }

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule)
    setFormData({
      type: rule.type,
      metric: rule.metric,
      threshold: rule.threshold,
      timeWindow: rule.timeWindow,
      comparison: rule.comparison,
      notifyRoles: rule.notifyRoles,
      message: rule.message,
      cooldown: rule.cooldown
    })
    setShowDialog(true)
  }

  const RuleDialog = () => (
    <Dialog 
      open={showDialog} 
      onClose={() => {
        setShowDialog(false)
        resetForm()
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {editingRule ? 'Edit Alert Rule' : 'Create Alert Rule'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({
                ...formData,
                type: e.target.value as 'financial' | 'activity',
                metric: ''
              })}
            >
              <MenuItem value="financial">Financial</MenuItem>
              <MenuItem value="activity">Activity</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Metric</InputLabel>
            <Select
              value={formData.metric}
              onChange={(e) => setFormData({
                ...formData,
                metric: e.target.value as string
              })}
            >
              {METRIC_OPTIONS[formData.type].map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Comparison</InputLabel>
            <Select
              value={formData.comparison}
              onChange={(e) => setFormData({
                ...formData,
                comparison: e.target.value as AlertRule['comparison']
              })}
            >
              <MenuItem value="greater">Greater Than</MenuItem>
              <MenuItem value="less">Less Than</MenuItem>
              <MenuItem value="equal">Equal To</MenuItem>
              {formData.type === 'activity' && (
                <MenuItem value="spike">Spike Detection</MenuItem>
              )}
            </Select>
          </FormControl>

          <TextField
            label="Threshold"
            type="number"
            value={formData.threshold}
            onChange={(e) => setFormData({
              ...formData,
              threshold: parseFloat(e.target.value)
            })}
            required
            fullWidth
          />

          {formData.type === 'activity' && (
            <TextField
              label="Time Window (minutes)"
              type="number"
              value={formData.timeWindow}
              onChange={(e) => setFormData({
                ...formData,
                timeWindow: parseInt(e.target.value)
              })}
              fullWidth
              helperText="Period to monitor for activity metrics"
            />
          )}

          <TextField
            label="Cooldown Period (minutes)"
            type="number"
            value={formData.cooldown}
            onChange={(e) => setFormData({
              ...formData,
              cooldown: parseInt(e.target.value)
            })}
            fullWidth
            helperText="Minimum time between consecutive alerts"
          />

          <TextField
            label="Alert Message"
            value={formData.message}
            onChange={(e) => setFormData({
              ...formData,
              message: e.target.value
            })}
            multiline
            rows={2}
            fullWidth
            helperText="Use {value} to include the threshold value"
          />

          <FormControl fullWidth>
            <InputLabel>Notify Roles</InputLabel>
            <Select
              multiple
              value={formData.notifyRoles}
              onChange={(e) => setFormData({
                ...formData,
                notifyRoles: e.target.value as string[]
              })}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="moderator">Moderator</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => {
            setShowDialog(false)
            resetForm()
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading || !formData.metric || !formData.message}
        >
          {editingRule ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <Card>
      <CardHeader
        title="Alert Rules"
        action={
          <Button
            startIcon={<AddIcon />}
            color="primary"
            variant="contained"
            onClick={() => setShowDialog(true)}
          >
            Create Rule
          </Button>
        }
      />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          {rules.map((rule) => (
            <Card key={rule.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {METRIC_OPTIONS[rule.type].find(m => m.value === rule.metric)?.label}
                  </Typography>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rule.enabled}
                          onChange={() => alertsService.updateRule(rule.id, {
                            enabled: !rule.enabled
                          })}
                        />
                      }
                      label={rule.enabled ? 'Enabled' : 'Disabled'}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(rule)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {rule.message}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    label={rule.type}
                    color={rule.type === 'financial' ? 'success' : 'info'}
                    size="small"
                  />
                  <Chip
                    label={`${rule.comparison} ${rule.threshold}`}
                    color="primary"
                    size="small"
                  />
                  {rule.timeWindow && (
                    <Chip
                      label={`${rule.timeWindow}m window`}
                      color="secondary"
                      size="small"
                    />
                  )}
                  <Chip
                    label={`${rule.cooldown}m cooldown`}
                    color="warning"
                    size="small"
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <RuleDialog />
      </CardContent>
    </Card>
  )
}

export default AlertRules 