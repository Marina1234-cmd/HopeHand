import { useState, useEffect } from 'react'
import { collection, query, getDocs, doc, updateDoc, where, orderBy } from 'firebase/firestore'
import { sendPasswordResetEmail } from 'firebase/auth'
import { db, auth } from '../../config/firebase'
import { useAuth } from '../../hooks/useAuth'
import { UserRole } from '../../types/auth'

interface UserData {
  id: string
  email: string
  displayName: string | null
  role: UserRole
  createdAt: string
  lastLogin?: string
  volunteerVerified?: boolean
  campaignsCreated?: number
  donationsCount?: number
  status: 'active' | 'suspended' | 'pending'
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | UserData['status']>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { hasPermission, user: currentUser } = useAuth()

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users')
      let usersQuery = query(usersRef, orderBy('createdAt', 'desc'))

      if (roleFilter !== 'all') {
        usersQuery = query(usersQuery, where('role', '==', roleFilter))
      }
      if (statusFilter !== 'all') {
        usersQuery = query(usersQuery, where('status', '==', statusFilter))
      }

      const snapshot = await getDocs(usersQuery)
      const usersList = await Promise.all(snapshot.docs.map(async doc => {
        const userData = doc.data() as UserData
        // Get campaign count
        const campaignsQuery = query(
          collection(db, 'campaigns'),
          where('createdBy', '==', doc.id)
        )
        const campaignsSnapshot = await getDocs(campaignsQuery)
        
        // Get donations count
        const donationsQuery = query(
          collection(db, 'donations'),
          where('userId', '==', doc.id)
        )
        const donationsSnapshot = await getDocs(donationsQuery)

        return {
          ...userData,
          id: doc.id,
          campaignsCreated: campaignsSnapshot.size,
          donationsCount: donationsSnapshot.size
        }
      }))

      setUsers(usersList)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [roleFilter, statusFilter])

  const handleUpdateUser = async (userId: string, updates: Partial<UserData>) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ))
      setIsEditing(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handlePasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      alert('Password reset email sent successfully')
    } catch (error) {
      console.error('Error sending password reset:', error)
      alert('Error sending password reset email')
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.displayName?.toLowerCase().includes(searchLower))
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
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="volunteer">Volunteer</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.displayName || 'No Name'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : ''}
                    ${user.role === 'user' ? 'bg-blue-100 text-blue-800' : ''}
                    ${user.role === 'volunteer' ? 'bg-green-100 text-green-800' : ''}
                  `}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${user.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    ${user.status === 'suspended' ? 'bg-red-100 text-red-800' : ''}
                    ${user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  `}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Campaigns: {user.campaignsCreated}</div>
                  <div>Donations: {user.donationsCount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-4">
                    {hasPermission('canManageUsers') && currentUser?.id !== user.id && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setIsEditing(true)
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePasswordReset(user.email)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => handleUpdateUser(user.id, {
                            status: user.status === 'active' ? 'suspended' : 'active'
                          })}
                          className={`${
                            user.status === 'active' 
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {isEditing && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const updates = {
                displayName: formData.get('displayName') as string,
                role: formData.get('role') as UserRole,
                volunteerVerified: formData.get('role') === 'volunteer' 
                  ? Boolean(formData.get('volunteerVerified'))
                  : false
              }
              handleUpdateUser(selectedUser.id, updates)
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    id="displayName"
                    defaultValue={selectedUser.displayName || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    name="role"
                    id="role"
                    defaultValue={selectedUser.role}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="user">User</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {selectedUser.role === 'volunteer' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="volunteerVerified"
                      id="volunteerVerified"
                      defaultChecked={selectedUser.volunteerVerified}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="volunteerVerified" className="ml-2 block text-sm text-gray-900">
                      Verified Volunteer
                    </label>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setSelectedUser(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement 