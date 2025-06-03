import React, { useEffect, useState } from 'react'
import { auth, db } from '../config/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'

interface ConnectionStatus {
  status: 'testing' | 'success' | 'error'
  message: string
}

const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<{
    auth: ConnectionStatus
    firestore: ConnectionStatus
  }>({
    auth: { status: 'testing', message: 'Testing connection...' },
    firestore: { status: 'testing', message: 'Testing connection...' }
  })

  useEffect(() => {
    console.log('Starting Firebase connection tests...')

    // Test Auth
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log('Auth state changed:', user ? 'User present' : 'No user')
        setStatus((prev) => ({
          ...prev,
          auth: {
            status: 'success',
            message: 'Authentication connection successful! ✅'
          }
        }))
      },
      (error) => {
        console.error('Auth error:', error)
        setStatus((prev) => ({
          ...prev,
          auth: {
            status: 'error',
            message: `Authentication error: ${error.message} ❌`
          }
        }))
      }
    )

    // Test Firestore
    const testFirestore = async () => {
      try {
        console.log('Testing Firestore connection...')
        const testCollection = collection(db, 'test')
        await getDocs(testCollection)
        console.log('Firestore connection successful')
        setStatus((prev) => ({
          ...prev,
          firestore: {
            status: 'success',
            message: 'Firestore connection successful! ✅'
          }
        }))
      } catch (error) {
        console.error('Firestore error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setStatus((prev) => ({
          ...prev,
          firestore: {
            status: 'error',
            message: `Firestore error: ${errorMessage} ❌`
          }
        }))
      }
    }

    testFirestore()

    return () => unsubscribe()
  }, [])

  const getStatusColor = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Firebase Connection Test</h2>
      <div className="space-y-4">
        <div>
          <div className="font-semibold mb-1">Authentication:</div>
          <div className={getStatusColor(status.auth.status)}>
            {status.auth.message}
          </div>
        </div>
        <div>
          <div className="font-semibold mb-1">Firestore:</div>
          <div className={getStatusColor(status.firestore.status)}>
            {status.firestore.message}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FirebaseTest 