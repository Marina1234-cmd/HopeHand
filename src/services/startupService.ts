import securityTestWorker from './securityTestWorker'
import { logSystemAction } from './activityLogger'

class StartupService {
  async initialize() {
    try {
      // Start security test worker
      await securityTestWorker.start()
      await logSystemAction(
        'service_started',
        { service: 'security_test_worker' },
        'Security test worker started',
        true,
        'info'
      )

      // Add other service initializations here
    } catch (error) {
      console.error('Error initializing services:', error)
      await logSystemAction(
        'service_error',
        { message: error instanceof Error ? error.message : 'Unknown error' },
        'Error initializing services',
        true,
        'error'
      )
    }
  }

  async shutdown() {
    try {
      // Stop security test worker
      await securityTestWorker.stop()
      await logSystemAction(
        'service_stopped',
        { service: 'security_test_worker' },
        'Security test worker stopped',
        true,
        'info'
      )

      // Add other service cleanup here
    } catch (error) {
      console.error('Error shutting down services:', error)
      await logSystemAction(
        'service_error',
        { message: error instanceof Error ? error.message : 'Unknown error' },
        'Error shutting down services',
        true,
        'error'
      )
    }
  }
}

const startupService = new StartupService()
export default startupService 