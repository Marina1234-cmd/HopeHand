import React from 'react'
import {
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  MonetizationOn as DonationsIcon,
  Group as VolunteersIcon,
  FileDownload as ExportIcon
} from '@mui/icons-material'
import { usePermissions, RequirePermission } from '../../hooks/usePermissions'

interface CampaignActionsProps {
  campaignId: string
  onEdit: () => void
  onDelete: () => void
  onApprove: () => void
  onReject: () => void
  onManageDonations: () => void
  onManageVolunteers: () => void
  onExport: () => void
}

const CampaignActions: React.FC<CampaignActionsProps> = ({
  campaignId,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onManageDonations,
  onManageVolunteers,
  onExport
}) => {
  const { checkResourcePermission } = usePermissions()

  // Check individual permissions
  const canEdit = checkResourcePermission('campaign', 'update')
  const canDelete = checkResourcePermission('campaign', 'delete')
  const canApprove = checkResourcePermission('campaign', 'approve')
  const canReject = checkResourcePermission('campaign', 'reject')
  const canManageDonations = checkResourcePermission('campaign', 'manageDonations')
  const canManageVolunteers = checkResourcePermission('campaign', 'manageVolunteers')
  const canExport = checkResourcePermission('campaign', 'exportData')

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {/* Basic Actions */}
      <ButtonGroup size="small" variant="outlined">
        <RequirePermission resource="campaign" resourceAction="update">
          <Tooltip title="Edit Campaign">
            <IconButton onClick={onEdit} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
        </RequirePermission>

        <RequirePermission resource="campaign" resourceAction="delete">
          <Tooltip title="Delete Campaign">
            <IconButton onClick={onDelete} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </RequirePermission>
      </ButtonGroup>

      {/* Approval Actions */}
      <ButtonGroup size="small" variant="outlined">
        <RequirePermission resource="campaign" resourceAction="approve">
          <Tooltip title="Approve Campaign">
            <IconButton onClick={onApprove} size="small" color="success">
              <ApproveIcon />
            </IconButton>
          </Tooltip>
        </RequirePermission>

        <RequirePermission resource="campaign" resourceAction="reject">
          <Tooltip title="Reject Campaign">
            <IconButton onClick={onReject} size="small" color="warning">
              <RejectIcon />
            </IconButton>
          </Tooltip>
        </RequirePermission>
      </ButtonGroup>

      {/* Management Actions */}
      <ButtonGroup size="small" variant="outlined">
        <RequirePermission resource="campaign" resourceAction="manageDonations">
          <Tooltip title="Manage Donations">
            <IconButton onClick={onManageDonations} size="small" color="primary">
              <DonationsIcon />
            </IconButton>
          </Tooltip>
        </RequirePermission>

        <RequirePermission resource="campaign" resourceAction="manageVolunteers">
          <Tooltip title="Manage Volunteers">
            <IconButton onClick={onManageVolunteers} size="small" color="primary">
              <VolunteersIcon />
            </IconButton>
          </Tooltip>
        </RequirePermission>
      </ButtonGroup>

      {/* Export Action */}
      <RequirePermission 
        resource="campaign" 
        resourceAction="exportData"
        fallback={null}
      >
        <Tooltip title="Export Campaign Data">
          <IconButton onClick={onExport} size="small">
            <ExportIcon />
          </IconButton>
        </Tooltip>
      </RequirePermission>

      {/* Example of checking multiple permissions */}
      <RequirePermission
        resource="campaign"
        resourceAction="update"
        fallback={
          <Tooltip title="You don't have permission to manage this campaign">
            <span>
              <Button variant="contained" disabled>
                Manage Campaign
              </Button>
            </span>
          </Tooltip>
        }
      >
        <Button
          variant="contained"
          onClick={onEdit}
          disabled={!canEdit && !canManageDonations && !canManageVolunteers}
        >
          Manage Campaign
        </Button>
      </RequirePermission>
    </Stack>
  )
}

export default CampaignActions 