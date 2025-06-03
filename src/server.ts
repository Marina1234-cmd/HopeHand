import express from 'express'
import path from 'path'
import { configureSecurityMiddleware, createServer } from './services/securityConfig'
import { logSystemAction } from './services/activityLogger'

const app = express()
const PORT = process.env.PORT || 3000

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')))

// Parse JSON payloads
app.use(express.json())

// Configure security middleware with default settings
configureSecurityMiddleware(app)

// API routes will go here
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Catch all other routes and return the index file
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

// Start the server
const startServer = async () => {
  try {
    const server = await createServer(app, {
      enableHTTPS: process.env.NODE_ENV === 'production',
      sslCertPath: process.env.SSL_CERT_PATH,
      sslKeyPath: process.env.SSL_KEY_PATH,
      hsts: {
        enabled: process.env.NODE_ENV === 'production',
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      csp: {
        enabled: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'", 'https://apis.google.com'],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'font-src': ["'self'", 'https:', 'data:'],
          'connect-src': ["'self'", 'https://*.firebaseio.com', 'https://*.googleapis.com'],
          'frame-src': ["'self'", 'https://*.firebaseapp.com'],
          'object-src': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
          'frame-ancestors': ["'none'"],
          'upgrade-insecure-requests': []
        }
      }
    })

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (${process.env.NODE_ENV})`)
      logSystemAction(
        'server',
        { id: 'server', name: 'Server', role: 'admin' },
        `Server started successfully on port ${PORT} (${process.env.NODE_ENV})`,
        true,
        'info'
      ).catch(console.error)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    logSystemAction(
      'server',
      { id: 'server', name: 'Server', role: 'admin' },
      `Server failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`,
      false,
      'critical'
    ).catch(console.error)
    process.exit(1)
  }
}

startServer() 