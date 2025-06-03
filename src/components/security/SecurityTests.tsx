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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  PlayArrow as RunIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import securityTestingService, {
  SecurityTest,
  TestResult,
  TestConfig
} from '../../services/securityTestingService'
import { useAuth } from '../../hooks/useAuth'

const TEST_TYPES = [
  { value: 'vulnerability', label: 'Vulnerability Scan' },
  { value: 'penetration', label: 'Penetration Test' },
  { value: 'dependency', label: 'Dependency Check' },
  { value: 'configuration', label: 'Configuration Audit' }
]

const SecurityTests: React.FC = () => {
  const { user } = useAuth()
  const [tests, setTests] = useState<SecurityTest[]>([])
  const [selectedTest, setSelectedTest] = useState<SecurityTest | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  // Form state
  const [testType, setTestType] = useState<SecurityTest['type']>('vulnerability')
  const [schedule, setSchedule] = useState('')
  const [targets, setTargets] = useState<string[]>([])
  const [excludePatterns, setExcludePatterns] = useState<string[]>([])

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    setLoading(true)
    try {
      const recentTests = await securityTestingService.getRecentTests()
      setTests(recentTests)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security tests')
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleTest = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const config: Partial<TestConfig> = {
        targets,
        excludePatterns: excludePatterns.length > 0 ? excludePatterns : undefined
      }

      await securityTestingService.scheduleTest(
        testType,
        config,
        schedule || undefined,
        user.uid
      )

      setShowDialog(false)
      resetForm()
      await fetchTests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule security test')
    } finally {
      setLoading(false)
    }
  }

  const handleViewResults = async (test: SecurityTest) => {
    setSelectedTest(test)
    setLoading(true)
    setError(null)

    try {
      const results = await securityTestingService.getTestResults(test.id)
      setTestResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch test results')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkFalsePositive = async (
    testId: string,
    resultId: string,
    isFalsePositive: boolean
  ) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await securityTestingService.markFalsePositive(
        testId,
        resultId,
        isFalsePositive,
        user.uid
      )
      
      // Refresh results
      const results = await securityTestingService.getTestResults(testId)
      setTestResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update result status')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRemediated = async (
    testId: string,
    resultId: string,
    isRemediated: boolean
  ) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await securityTestingService.markRemediated(
        testId,
        resultId,
        isRemediated,
        user.uid
      )
      
      // Refresh results
      const results = await securityTestingService.getTestResults(testId)
      setTestResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update remediation status')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTestType('vulnerability')
    setSchedule('')
    setTargets([])
    setExcludePatterns([])
  }

  const getStatusColor = (status: SecurityTest['status']) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'running':
        return 'info'
      case 'failed':
        return 'error'
      default:
        return 'warning'
    }
  }

  const getSeverityIcon = (severity: TestResult['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <ErrorIcon color="error" />
      case 'medium':
        return <WarningIcon color="warning" />
      case 'low':
        return <InfoIcon color="info" />
      default:
        return <InfoIcon color="disabled" />
    }
  }

  const ScheduleDialog = () => (
    <Dialog
      open={showDialog}
      onClose={() => {
        setShowDialog(false)
        resetForm()
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Schedule Security Test</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Test Type</InputLabel>
            <Select
              value={testType}
              onChange={(e) => setTestType(e.target.value as SecurityTest['type'])}
            >
              {TEST_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Schedule (Cron Expression)"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            helperText="Leave empty for immediate execution"
            fullWidth
          />

          <TextField
            label="Target URLs/Paths"
            value={targets.join('\n')}
            onChange={(e) => setTargets(e.target.value.split('\n').filter(Boolean))}
            multiline
            rows={4}
            fullWidth
            helperText="One target per line"
          />

          <TextField
            label="Exclude Patterns"
            value={excludePatterns.join('\n')}
            onChange={(e) => setExcludePatterns(e.target.value.split('\n').filter(Boolean))}
            multiline
            rows={2}
            fullWidth
            helperText="One pattern per line"
          />
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
          onClick={handleScheduleTest}
          color="primary"
          variant="contained"
          disabled={loading || targets.length === 0}
        >
          Schedule Test
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <Box>
      <Card>
        <CardHeader
          title="Security Tests"
          action={
            <Button
              startIcon={<AddIcon />}
              color="primary"
              variant="contained"
              onClick={() => setShowDialog(true)}
            >
              Schedule Test
            </Button>
          }
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <Stack spacing={2}>
            {tests.map((test) => (
              <Accordion
                key={test.id}
                onChange={() => handleViewResults(test)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="subtitle1">
                      {TEST_TYPES.find(t => t.value === test.type)?.label}
                    </Typography>
                    <Chip
                      label={test.status}
                      color={getStatusColor(test.status)}
                      size="small"
                    />
                    {test.schedule && (
                      <Chip
                        icon={<ScheduleIcon />}
                        label={test.schedule}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="caption" color="textSecondary">
                      {test.startTime.toLocaleString()}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {test.id === selectedTest?.id && (
                    <>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Summary
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Chip
                            icon={<ErrorIcon />}
                            label={`Critical: ${test.summary.critical}`}
                            color="error"
                            variant="outlined"
                          />
                          <Chip
                            icon={<ErrorIcon />}
                            label={`High: ${test.summary.high}`}
                            color="error"
                            variant="outlined"
                          />
                          <Chip
                            icon={<WarningIcon />}
                            label={`Medium: ${test.summary.medium}`}
                            color="warning"
                            variant="outlined"
                          />
                          <Chip
                            icon={<InfoIcon />}
                            label={`Low: ${test.summary.low}`}
                            color="info"
                            variant="outlined"
                          />
                          <Chip
                            icon={<CheckIcon />}
                            label={`Remediated: ${test.summary.remediatedCount}`}
                            color="success"
                            variant="outlined"
                          />
                        </Stack>
                      </Box>

                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Severity</TableCell>
                              <TableCell>Title</TableCell>
                              <TableCell>Category</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {testResults.map((result) => (
                              <TableRow key={result.id}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getSeverityIcon(result.severity)}
                                    {result.severity}
                                  </Box>
                                </TableCell>
                                <TableCell>{result.title}</TableCell>
                                <TableCell>{result.category}</TableCell>
                                <TableCell>
                                  {result.remediated ? (
                                    <Chip
                                      label="Remediated"
                                      color="success"
                                      size="small"
                                    />
                                  ) : result.falsePositive ? (
                                    <Chip
                                      label="False Positive"
                                      color="default"
                                      size="small"
                                    />
                                  ) : (
                                    <Chip
                                      label="Open"
                                      color="error"
                                      size="small"
                                    />
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMarkFalsePositive(
                                      test.id,
                                      result.id,
                                      !result.falsePositive
                                    )}
                                    color={result.falsePositive ? 'primary' : 'default'}
                                  >
                                    <InfoIcon />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMarkRemediated(
                                      test.id,
                                      result.id,
                                      !result.remediated
                                    )}
                                    color={result.remediated ? 'success' : 'default'}
                                  >
                                    <CheckIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <ScheduleDialog />
    </Box>
  )
}

export default SecurityTests 