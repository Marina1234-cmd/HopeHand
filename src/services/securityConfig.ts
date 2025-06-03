import { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import express from 'express'
import { logSystemAction } from './activityLogger'

interface SecurityConfig {
  enableHTTPS: boolean
  sslCertPath?: string
  sslKeyPath?: string
  hsts: {
    enabled: boolean
    maxAge: number
    includeSubDomains: boolean
    preload: boolean
  }
  csp: {
    enabled: boolean
    directives: Record<string, string[]>
  }
}

const defaultConfig: SecurityConfig = {
  enableHTTPS: process.env.NODE_ENV === 'production',
  sslCertPath: process.env.SSL_CERT_PATH,
  sslKeyPath: process.env.SSL_KEY_PATH,
  hsts: {
    enabled: process.env.NODE_ENV === 'production',
    maxAge: 31536000, // 1 year in seconds
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
}

// Force HTTPS middleware (only in production)
export const requireHTTPS = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'production') {
    next()
    return
  }

  if (req.secure) {
    next()
  } else if (req.headers['x-forwarded-proto'] === 'https') {
    next()
  } else {
    const httpsUrl = `https://${req.headers.host}${req.url}`
    res.redirect(301, httpsUrl)
    
    logSystemAction(
      'security',
      { id: 'security-service', name: 'Security Service', role: 'admin' },
      `Redirected insecure request to HTTPS: ${httpsUrl}`,
      true,
      'info'
    ).catch(console.error)
  }
}

// Configure security middleware
export const configureSecurityMiddleware = (app: express.Application, config: Partial<SecurityConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config }

  // Enable Helmet for various HTTP headers
  app.use(helmet({
    contentSecurityPolicy: finalConfig.csp.enabled ? {
      directives: finalConfig.csp.directives
    } : false,
    hsts: finalConfig.hsts.enabled ? {
      maxAge: finalConfig.hsts.maxAge,
      includeSubDomains: finalConfig.hsts.includeSubDomains,
      preload: finalConfig.hsts.preload
    } : false,
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true
  }))

  // Force HTTPS in production
  if (finalConfig.enableHTTPS) {
    app.use(requireHTTPS)
  }

  // Log security configuration
  logSystemAction(
    'security',
    { id: 'security-service', name: 'Security Service', role: 'admin' },
    `Security middleware configured (HTTPS ${finalConfig.enableHTTPS ? 'enabled' : 'disabled'})`,
    true,
    'info'
  ).catch(console.error)
}

// Create server (HTTP or HTTPS)
export const createServer = async (app: express.Application, config: SecurityConfig) => {
  try {
    if (config.enableHTTPS && config.sslCertPath && config.sslKeyPath) {
      // Create HTTPS server
      const https = require('https')
      const fs = require('fs')

      try {
        const options = {
          key: fs.readFileSync(config.sslKeyPath),
          cert: fs.readFileSync(config.sslCertPath),
          minVersion: 'TLSv1.2'
        }

        const server = https.createServer(options, app)

        await logSystemAction(
          'security',
          { id: 'security-service', name: 'Security Service', role: 'admin' },
          'HTTPS server created successfully',
          true,
          'info'
        )

        return server
      } catch (error) {
        console.warn('Failed to create HTTPS server, falling back to HTTP:', error)
        await logSystemAction(
          'security',
          { id: 'security-service', name: 'Security Service', role: 'admin' },
          `Failed to create HTTPS server, falling back to HTTP: ${error instanceof Error ? error.message : 'Unknown error'}`,
          false,
          'warning'
        )
      }
    }

    // Create HTTP server (fallback or development)
    const http = require('http')
    const server = http.createServer(app)

    if (process.env.NODE_ENV !== 'production') {
      await logSystemAction(
        'security',
        { id: 'security-service', name: 'Security Service', role: 'admin' },
        'HTTP server created for development environment',
        true,
        'info'
      )
    }

    return server
  } catch (error) {
    console.error('Failed to create server:', error)
    await logSystemAction(
      'security',
      { id: 'security-service', name: 'Security Service', role: 'admin' },
      `Failed to create server: ${error instanceof Error ? error.message : 'Unknown error'}`,
      false,
      'critical'
    )
    throw error
  }
} 