import { useState, useEffect } from 'react'
import { verifyTwoFactorToken } from '../../services/twoFactorAuth'
import { useAuth } from '../../hooks/useAuth'
import { validate2FAToken } from '../../utils/validation'
import { checkRateLimit, getRateLimitStatus } from '../../services/rateLimiting'

interface TwoFactorVerificationProps {
  onSuccess: () => void
  onCancel: () => void
}

const TwoFactorVerification = ({ onSuccess, onCancel }: TwoFactorVerificationProps) => {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const [blockExpiry, setBlockExpiry] = useState<Date | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const checkBlockStatus = async () => {
      if (!user?.id) return

      const status = await getRateLimitStatus('twoFactor', user.id)
      setRemainingAttempts(status.remainingAttempts)
      setBlockExpiry(status.blockedUntil || null)
    }

    checkBlockStatus()
  }, [user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validate and sanitize the token
    const validation = validate2FAToken(token)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid verification code')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Check rate limit before verifying
      const ip = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'unknown')

      const rateLimit = await checkRateLimit('twoFactor', user.id, ip, {
        id: user.id,
        name: user.displayName || 'Unknown User',
        role: user.role
      })

      if (!rateLimit.allowed) {
        setError(`Too many attempts. Please try again ${rateLimit.blockedUntil ? 
          `after ${rateLimit.blockedUntil.toLocaleString()}` : 
          'later'}.`)
        setRemainingAttempts(0)
        setBlockExpiry(rateLimit.blockedUntil || null)
        return
      }

      setRemainingAttempts(rateLimit.remainingAttempts)

      const isValid = await verifyTwoFactorToken(
        user.id,
        validation.sanitizedValue,
        {
          id: user.id,
          name: user.displayName || 'Unknown User',
          role: user.role
        }
      )

      if (isValid) {
        onSuccess()
      } else {
        setError(`Invalid verification code. ${rateLimit.remainingAttempts} attempts remaining.`)
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validation = validate2FAToken(e.target.value)
    setToken(validation.sanitizedValue)
  }

  if (blockExpiry && blockExpiry > new Date()) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-red-600 mb-6">
            Account Temporarily Blocked
          </h2>
          <p className="text-gray-600 mb-6">
            Too many failed verification attempts. Please try again after{' '}
            {blockExpiry.toLocaleString()}.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Two-Factor Authentication Required
        </h2>
        <p className="text-gray-600 mb-6">
          Please enter the verification code from your authenticator app to continue.
          {remainingAttempts !== null && remainingAttempts < 3 && (
            <span className="block mt-2 text-yellow-600">
              {remainingAttempts} attempts remaining before temporary block.
            </span>
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={handleTokenChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter 6-digit code"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              disabled={loading || (blockExpiry !== null && blockExpiry > new Date())}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              disabled={loading || token.length !== 6 || (blockExpiry !== null && blockExpiry > new Date())}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>Lost access to your authenticator app?</p>
            <button
              type="button"
              onClick={() => setToken('')}
              className="text-primary-600 hover:text-primary-500"
              disabled={loading || (blockExpiry !== null && blockExpiry > new Date())}
            >
              Use a backup code instead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TwoFactorVerification 