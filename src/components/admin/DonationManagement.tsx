import { useState, useEffect } from 'react'
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../hooks/useAuth'

interface DonationData {
  id: string
  amount: number
  campaignId: string
  campaignTitle: string
  userId: string
  userName: string
  status: 'completed' | 'pending' | 'failed'
  paymentMethod: string
  createdAt: string
  currency: string
}

interface FinancialSummary {
  totalDonations: number
  totalAmount: number
  averageDonation: number
  successRate: number
  campaignStats: {
    [key: string]: {
      total: number
      count: number
    }
  }
}

const DonationManagement = () => {
  const [donations, setDonations] = useState<DonationData[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const { hasPermission } = useAuth()

  const fetchDonations = async () => {
    try {
      const donationsRef = collection(db, 'donations')
      let donationsQuery = query(donationsRef, orderBy('createdAt', 'desc'))

      // Apply date filters
      const now = new Date()
      let startDate = new Date()
      
      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          donationsQuery = query(donationsQuery, where('createdAt', '>=', startDate.toISOString()))
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          donationsQuery = query(donationsQuery, where('createdAt', '>=', startDate.toISOString()))
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          donationsQuery = query(donationsQuery, where('createdAt', '>=', startDate.toISOString()))
          break
        case 'custom':
          if (customStartDate && customEndDate) {
            donationsQuery = query(
              donationsQuery,
              where('createdAt', '>=', new Date(customStartDate).toISOString()),
              where('createdAt', '<=', new Date(customEndDate).toISOString())
            )
          }
          break
      }

      const snapshot = await getDocs(donationsQuery)
      const donationsList = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data() as DonationData
        // Get campaign details
        const campaignDoc = await getDocs(query(
          collection(db, 'campaigns'),
          where('id', '==', data.campaignId)
        ))
        if (!campaignDoc.empty) {
          data.campaignTitle = campaignDoc.docs[0].data().title
        }
        return { ...data, id: doc.id }
      }))

      setDonations(donationsList)
      calculateSummary(donationsList)
    } catch (error) {
      console.error('Error fetching donations:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSummary = (donationsList: DonationData[]) => {
    const completed = donationsList.filter(d => d.status === 'completed')
    const summary: FinancialSummary = {
      totalDonations: donationsList.length,
      totalAmount: completed.reduce((sum, d) => sum + d.amount, 0),
      averageDonation: completed.length ? completed.reduce((sum, d) => sum + d.amount, 0) / completed.length : 0,
      successRate: donationsList.length ? (completed.length / donationsList.length) * 100 : 0,
      campaignStats: {}
    }

    // Calculate per-campaign statistics
    donationsList.forEach(donation => {
      if (!summary.campaignStats[donation.campaignId]) {
        summary.campaignStats[donation.campaignId] = { total: 0, count: 0 }
      }
      if (donation.status === 'completed') {
        summary.campaignStats[donation.campaignId].total += donation.amount
      }
      summary.campaignStats[donation.campaignId].count++
    })

    setSummary(summary)
  }

  useEffect(() => {
    if (hasPermission('canManageDonations')) {
      fetchDonations()
    }
  }, [dateRange, customStartDate, customEndDate])

  const exportToCSV = () => {
    if (!donations.length) return

    const headers = ['Date', 'Campaign', 'Donor', 'Amount', 'Currency', 'Status', 'Payment Method']
    const csvData = donations.map(d => [
      new Date(d.createdAt).toLocaleDateString(),
      d.campaignTitle,
      d.userName,
      d.amount,
      d.currency,
      d.status,
      d.paymentMethod
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `donations_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
        <h2 className="text-2xl font-bold text-gray-900">Donation Management</h2>
        <div className="flex gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          )}
          <button
            onClick={exportToCSV}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Export to CSV
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Donations</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">{summary.totalDonations}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Amount</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              ${summary.totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Average Donation</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              ${summary.averageDonation.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Success Rate</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {summary.successRate.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Donations Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Donor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donations.map((donation) => (
              <tr key={donation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(donation.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {donation.campaignTitle}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{donation.userName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {donation.currency} {donation.amount.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${donation.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    ${donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${donation.status === 'failed' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {donation.paymentMethod}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DonationManagement 