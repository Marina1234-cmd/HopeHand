import { useState, useEffect } from 'react'
import { setupTwoFactor, enableTwoFactor } from '../../services/twoFactorAuth'
import { useAuth } from '../../hooks/useAuth'
import { validate2FAToken } from '../../utils/validation'
import { checkRateLimit, getRateLimitStatus } from '../../services/rateLimiting'

interface TwoFactorSetupProps {
  onComplete: () => void
  onCancel: () => void
}

const TwoFactorSetup = ({ onComplete, onCancel }: TwoFactorSetupProps) => {
  const [step, setStep] = useState<'initial' | 'verify'>('initial')
  const [setupData, setSetupData] = useState<{
    secret: string
    qrCodeUrl: string
    backupCodes: string[]
  } | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
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

    if (step === 'verify') {
      checkBlockStatus()
    }
  }, [user?.id, step])

  const handleSetup = async () => {
    if (!user?.email) return

    setLoading(true)
    setError('')

    try {
      const data = await setupTwoFactor(user.id, user.email)
      setSetupData(data)
      setStep('verify')
    } catch (error) {
      setError('Failed to setup two-factor authentication. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validate and sanitize the verification code
    const validation = validate2FAToken(verificationCode)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid verification code')
      return
    }

    setLoading(true)
    setError('')

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

      const isValid = await enableTwoFactor(
        user.id,
        validation.sanitizedValue,
        {
          id: user.id,
          name: user.displayName || 'Unknown User',
          role: user.role
        }
      )

      if (isValid) {
        onComplete()
      } else {
        setError(`Invalid verification code. ${rateLimit.remainingAttempts} attempts remaining.`)
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validation = validate2FAToken(e.target.value)
    setVerificationCode(validation.sanitizedValue)
  }

  if (blockExpiry && blockExpiry > new Date()) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-red-600 mb-6">
            Setup Temporarily Blocked
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
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Setup Two-Factor Authentication
        </h2>

        {step === 'initial' && (
          <div className="space-y-6">
            <p className="text-gray-600">
              Two-factor authentication adds an extra layer of security to your account.
              When enabled, you'll need to enter a verification code from your authenticator
              app in addition to your password when accessing the admin area.
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Steps to enable:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Install an authenticator app (like Google Authenticator or Authy)</li>
                <li>Scan the QR code with your authenticator app</li>
                <li>Enter the verification code to confirm setup</li>
                <li>Save your backup codes in a secure location</li>
              </ol>
            </div>

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
                type="button"
                onClick={handleSetup}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Setting up...' : 'Begin Setup'}
              </button>
            </div>
          </div>
        )}

        {step === 'verify' && setupData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  1. Scan QR Code
                </h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                  <img src={setupData.qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Can't scan? Enter this code manually: <br />
                  <code className="bg-gray-100 px-2 py-1 rounded select-all">
                    {setupData.secret}
                  </code>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  2. Save Backup Codes
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    Save these backup codes in a secure place. You can use them to access
                    your account if you lose your authenticator device.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {setupData.backupCodes.map((code, index) => (
                      <code
                        key={index}
                        className="bg-white px-2 py-1 rounded border border-gray-200 text-center select-all"
                      >
                        {code}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                  3. Enter Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={handleCodeChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  disabled={loading || (blockExpiry !== null && blockExpiry > new Date())}
                />
                {remainingAttempts !== null && remainingAttempts < 3 && (
                  <p className="mt-2 text-sm text-yellow-600">
                    {remainingAttempts} attempts remaining before temporary block.
                  </p>
                )}
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
                  disabled={loading || verificationCode.length !== 6 || (blockExpiry !== null && blockExpiry > new Date())}
                >
                  {loading ? 'Verifying...' : 'Enable 2FA'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default TwoFactorSetup 