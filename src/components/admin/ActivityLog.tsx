import { useState, useEffect } from 'react'
import { collection, query, getDocs, orderBy, where, limit } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../hooks/useAuth'

interface ActivityLogEntry {
  id: string
  action: string
  performedBy: {
    id: string
    name: string
    role: string
  }
  targetType: 'campaign' | 'user' | 'donation' | 'comment' | 'system'
  targetId: string
  targetName: string
  details: string
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
  ipAddress?: string
  success: boolean
}

const ActivityLog = () => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | ActivityLogEntry['targetType']>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | ActivityLogEntry['severity']>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h')
  const { hasPermission } = useAuth()

  const fetchActivities = async () => {
    try {
      const activitiesRef = collection(db, 'activityLogs')
      let activitiesQuery = query(activitiesRef, orderBy('timestamp', 'desc'))

      // Apply time range filter
      if (timeRange !== 'all') {
        const now = new Date()
        let startDate = new Date()
        
        switch (timeRange) {
          case '24h':
            startDate.setHours(startDate.getHours() - 24)
            break
          case '7d':
            startDate.setDate(startDate.getDate() - 7)
            break
          case '30d':
            startDate.setDate(startDate.getDate() - 30)
            break
        }
        
        activitiesQuery = query(activitiesQuery, 
          where('timestamp', '>=', startDate.toISOString())
        )
      }

      // Apply type filter
      if (filter !== 'all') {
        activitiesQuery = query(activitiesQuery, where('targetType', '==', filter))
      }

      // Apply severity filter
      if (severityFilter !== 'all') {
        activitiesQuery = query(activitiesQuery, where('severity', '==', severityFilter))
      }

      const snapshot = await getDocs(activitiesQuery)
      const activitiesList = snapshot.docs.map(doc => ({
        ...doc.data() as ActivityLogEntry,
        id: doc.id
      }))

      setActivities(activitiesList)
    } catch (error) {
      console.error('Error fetching activity logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasPermission('canAccessAdminPanel')) {
      fetchActivities()
    }
  }, [filter, severityFilter, timeRange])

  const getSeverityColor = (severity: ActivityLogEntry['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getTargetTypeColor = (type: ActivityLogEntry['targetType']) => {
    switch (type) {
      case 'campaign':
        return 'bg-purple-100 text-purple-800'
      case 'user':
        return 'bg-green-100 text-green-800'
      case 'donation':
        return 'bg-blue-100 text-blue-800'
      case 'comment':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredActivities = activities.filter(activity => {
    const searchLower = searchTerm.toLowerCase()
    return (
      activity.action.toLowerCase().includes(searchLower) ||
      activity.targetName.toLowerCase().includes(searchLower) ||
      activity.performedBy.name.toLowerCase().includes(searchLower) ||
      activity.details.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">All Types</option>
            <option value="campaign">Campaigns</option>
            <option value="user">Users</option>
            <option value="donation">Donations</option>
            <option value="comment">Comments</option>
            <option value="system">System</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">All Severity</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="flow-root">
          <ul className="-mb-8">
            {filteredActivities.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== filteredActivities.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                        ${activity.success ? 'bg-green-500' : 'bg-red-500'}`}
                      >
                        {activity.success ? (
                          <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900">
                            {activity.performedBy.name}
                          </span>
                          {' '}
                          {activity.action}
                          {' '}
                          <span className="font-medium text-gray-900">
                            {activity.targetName}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {activity.details}
                        </p>
                        <div className="mt-2 flex space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${getSeverityColor(activity.severity)}`}
                          >
                            {activity.severity}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${getTargetTypeColor(activity.targetType)}`}
                          >
                            {activity.targetType}
                          </span>
                          {activity.ipAddress && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              IP: {activity.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={activity.timestamp}>
                          {new Date(activity.timestamp).toLocaleString()}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ActivityLog 