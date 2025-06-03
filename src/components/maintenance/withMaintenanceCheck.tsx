import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import maintenanceService, { MaintenanceState } from '../../services/maintenanceService'
import { useAuth } from '../../hooks/useAuth'

interface MaintenanceDialogProps {
  state: MaintenanceState
  isAdmin: boolean
  onClose: () => void
}

const MaintenanceDialog: React.FC<MaintenanceDialogProps> = ({
  state,
  isAdmin,
  onClose
}) => (
  <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>
      System Maintenance
    </DialogTitle>
    <DialogContent>
      <Typography variant="body1" gutterBottom>
        {state.message}
      </Typography>
      
      {isAdmin && state.adminMessage && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="error" gutterBottom>
            Admin Note:
          </Typography>
          <Typography variant="body2">
            {state.adminMessage}
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Maintenance Details:
        </Typography>
        <Typography variant="body2">
          • Reason: {state.reason}
        </Typography>
        <Typography variant="body2">
          • Started: {state.startTime.toLocaleString()}
        </Typography>
        {state.endTime && (
          <Typography variant="body2">
            • Expected End: {state.endTime.toLocaleString()}
          </Typography>
        )}
        <Typography variant="body2">
          • Affected Services: {state.affectedServices.join(', ')}
        </Typography>
        <Typography variant="body2">
          • Allowed Operations: {state.allowedOperations.join(', ')}
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        {isAdmin ? 'Continue Anyway' : 'Understood'}
      </Button>
    </DialogActions>
  </Dialog>
)

export interface MaintenanceProps {
  requiredOperation?: string
  service?: string
}

export const withMaintenanceCheck = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: MaintenanceProps = {}
) => {
  return (props: P) => {
    const [maintenanceState, setMaintenanceState] = useState<MaintenanceState | null>(null)
    const [showDialog, setShowDialog] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { user } = useAuth()

    const isAdmin = user?.roles?.includes('admin') || false

    useEffect(() => {
      const unsubscribe = maintenanceService.subscribe((state) => {
        setMaintenanceState(state)
        setLoading(false)

        if (state?.enabled) {
          const operationAllowed = !options.requiredOperation || 
            maintenanceService.isOperationAllowed(options.requiredOperation)
          const serviceAffected = options.service && 
            maintenanceService.isServiceAffected(options.service)

          if (!operationAllowed || serviceAffected) {
            setShowDialog(true)
            if (!isAdmin) {
              navigate('/')
            }
          }
        }
      })

      return () => unsubscribe()
    }, [navigate, isAdmin])

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )
    }

    return (
      <>
        <WrappedComponent {...props} />
        {showDialog && maintenanceState && (
          <MaintenanceDialog
            state={maintenanceState}
            isAdmin={isAdmin}
            onClose={() => setShowDialog(false)}
          />
        )}
      </>
    )
  }
} 