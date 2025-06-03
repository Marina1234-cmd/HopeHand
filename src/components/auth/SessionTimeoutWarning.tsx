import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import sessionManager from '../../services/sessionManager'

interface SessionTimeoutWarningProps {
  onExtendSession: () => void
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({ onExtendSession }) => {
  const [showWarning, setShowWarning] = useState(false)
  const { user } = useAuth()
  const extendButtonRef = useRef<HTMLButtonElement>(null)

  const handleSessionEvent = useCallback((event: 'warning' | 'timeout') => {
    if (event === 'warning') {
      setShowWarning(true)
    } else if (event === 'timeout') {
      setShowWarning(false)
    }
  }, [])

  useEffect(() => {
    if (!user?.uid) {
      setShowWarning(false)
      return
    }

    // Subscribe to session events
    const unsubscribe = sessionManager.subscribe(user.uid, handleSessionEvent)

    return () => {
      unsubscribe()
      setShowWarning(false)
    }
  }, [user?.uid, handleSessionEvent])

  useEffect(() => {
    // Focus the extend button when warning appears
    if (showWarning) {
      extendButtonRef.current?.focus()
    }
  }, [showWarning])

  const handleExtendSession = useCallback(() => {
    setShowWarning(false)
    sessionManager.updateActivity()
    onExtendSession()
  }, [onExtendSession])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleExtendSession()
    }
  }, [handleExtendSession])

  if (!showWarning || !user) return null

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      role="dialog"
      aria-labelledby="session-timeout-title"
      aria-describedby="session-timeout-description"
      onKeyDown={handleKeyDown}
    >
      <div 
        className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        role="alertdialog"
      >
        <div className="mt-3 text-center">
          <div 
            className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100"
            aria-hidden="true"
          >
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 
            id="session-timeout-title"
            className="text-lg leading-6 font-medium text-gray-900 mt-4"
          >
            Session Timeout Warning
          </h3>
          <div className="mt-2 px-7 py-3">
            <p 
              id="session-timeout-description"
              className="text-sm text-gray-500"
            >
              Your session will expire soon due to inactivity. Would you like to extend your session?
            </p>
          </div>
          <div className="items-center px-4 py-3">
            <button
              ref={extendButtonRef}
              onClick={handleExtendSession}
              className="px-4 py-2 bg-primary-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Extend session"
            >
              Extend Session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionTimeoutWarning 