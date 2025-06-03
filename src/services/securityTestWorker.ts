import { db } from '../config/firebase'
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { logSystemAction } from './activityLogger'
import { SecurityTest, TestResult, TestConfig, TestSummary } from './securityTestingService'
import axios from 'axios'
import { parse as cronParse } from 'cron-parser'

class SecurityTestWorker {
  private static TESTS_COLLECTION = 'securityTests'
  private static RESULTS_COLLECTION = 'testResults'
  private isRunning = false
  private workerInterval: NodeJS.Timeout | null = null

  async start() {
    if (this.isRunning) return
    this.isRunning = true

    // Start the worker loop
    this.workerInterval = setInterval(() => this.processTests(), 60000) // Check every minute
    await this.processTests() // Run immediately on start
  }

  async stop() {
    if (!this.isRunning) return
    this.isRunning = false

    if (this.workerInterval) {
      clearInterval(this.workerInterval)
      this.workerInterval = null
    }
  }

  private async processTests() {
    try {
      // Get scheduled tests
      const testsToRun = await this.getScheduledTests()

      for (const test of testsToRun) {
        await this.runTest(test)
      }
    } catch (error) {
      console.error('Error processing security tests:', error)
      await logSystemAction(
        'security_test_error',
        { message: error instanceof Error ? error.message : 'Unknown error' },
        'Error processing security tests',
        true,
        'error'
      )
    }
  }

  private async getScheduledTests(): Promise<SecurityTest[]> {
    const snapshot = await getDocs(
      query(
        collection(db, SecurityTestWorker.TESTS_COLLECTION),
        where('status', '==', 'scheduled')
      )
    )

    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as SecurityTest)
      .filter(test => this.shouldRunTest(test))
  }

  private shouldRunTest(test: SecurityTest): boolean {
    if (!test.schedule) return true // Run immediately if no schedule

    try {
      const interval = cronParse(test.schedule)
      const prev = interval.prev()
      const now = new Date()
      const diff = now.getTime() - prev.getTime()

      // Run if the previous scheduled time was within the last minute
      return diff <= 60000
    } catch {
      return false
    }
  }

  private async runTest(test: SecurityTest): Promise<void> {
    try {
      // Update test status to running
      await updateDoc(doc(db, SecurityTestWorker.TESTS_COLLECTION, test.id), {
        status: 'running',
        startTime: serverTimestamp()
      })

      await logSystemAction(
        'security_test_started',
        { testId: test.id, testType: test.type },
        `Started security test: ${test.type}`,
        true,
        'info'
      )

      // Run the appropriate test type
      const results = await this.executeTest(test.type, test.configuration)

      // Update test with results
      await updateDoc(doc(db, SecurityTestWorker.TESTS_COLLECTION, test.id), {
        status: 'completed',
        endTime: serverTimestamp(),
        results,
        summary: this.calculateSummary(results)
      })

      await logSystemAction(
        'security_test_completed',
        { testId: test.id, testType: test.type },
        `Completed security test: ${test.type}`,
        true,
        'info'
      )

      // Handle critical findings
      await this.handleCriticalFindings(test, results)
    } catch (error) {
      console.error(`Error running security test ${test.id}:`, error)

      await updateDoc(doc(db, SecurityTestWorker.TESTS_COLLECTION, test.id), {
        status: 'failed',
        endTime: serverTimestamp(),
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      await logSystemAction(
        'security_test_failed',
        { testId: test.id, testType: test.type },
        `Failed security test: ${test.type}`,
        true,
        'error'
      )
    }
  }

  private async executeTest(
    type: SecurityTest['type'],
    config: TestConfig
  ): Promise<TestResult[]> {
    switch (type) {
      case 'vulnerability':
        return this.runVulnerabilityTest(config)
      case 'penetration':
        return this.runPenetrationTest(config)
      case 'dependency':
        return this.runDependencyTest(config)
      case 'configuration':
        return this.runConfigurationTest(config)
      default:
        throw new Error(`Unknown test type: ${type}`)
    }
  }

  private async runVulnerabilityTest(config: TestConfig): Promise<TestResult[]> {
    const results: TestResult[] = []

    for (const target of config.targets) {
      try {
        // Example: Use OWASP ZAP API
        const response = await axios.post('http://localhost:8080/JSON/ascan/action/scan', {
          url: target,
          recurse: true,
          inScopeOnly: true,
          scanPolicyName: 'Default Policy',
          method: 'GET',
          postData: ''
        })

        // Process and map ZAP results to our format
        const zapResults = response.data
        // ... implement ZAP result mapping

      } catch (error) {
        console.error(`Error scanning target ${target}:`, error)
      }
    }

    return results
  }

  private async runPenetrationTest(config: TestConfig): Promise<TestResult[]> {
    const results: TestResult[] = []

    // Implement penetration testing logic
    // This could include:
    // - Authentication testing
    // - Authorization testing
    // - Input validation testing
    // - Session management testing
    // - API security testing

    return results
  }

  private async runDependencyTest(config: TestConfig): Promise<TestResult[]> {
    const results: TestResult[] = []

    try {
      // Example: Use npm audit
      const { execSync } = require('child_process')
      const auditOutput = execSync('npm audit --json', {
        cwd: process.cwd(),
        encoding: 'utf8'
      })

      const auditResults = JSON.parse(auditOutput)
      
      // Map npm audit results to our format
      for (const vuln of auditResults.vulnerabilities) {
        results.push({
          id: vuln.id,
          severity: this.mapNpmSeverity(vuln.severity),
          category: 'dependency',
          title: vuln.title,
          description: vuln.description,
          affected: [vuln.module_name],
          recommendation: vuln.recommendation,
          cwe: vuln.cwe,
          cvss: vuln.cvss,
          references: vuln.references,
          falsePositive: false,
          verified: true,
          remediated: false
        })
      }
    } catch (error) {
      console.error('Error running dependency check:', error)
    }

    return results
  }

  private async runConfigurationTest(config: TestConfig): Promise<TestResult[]> {
    const results: TestResult[] = []

    // Implement configuration testing logic
    // This could include:
    // - Firebase security rules analysis
    // - Environment variables check
    // - API configuration check
    // - Server configuration analysis

    return results
  }

  private calculateSummary(results: TestResult[]): TestSummary {
    return {
      total: results.length,
      critical: results.filter(r => r.severity === 'critical').length,
      high: results.filter(r => r.severity === 'high').length,
      medium: results.filter(r => r.severity === 'medium').length,
      low: results.filter(r => r.severity === 'low').length,
      info: results.filter(r => r.severity === 'info').length,
      remediatedCount: results.filter(r => r.remediated).length,
      falsePositiveCount: results.filter(r => r.falsePositive).length,
      score: this.calculateScore(results)
    }
  }

  private calculateScore(results: TestResult[]): number {
    const weights = {
      critical: 10,
      high: 8,
      medium: 5,
      low: 2,
      info: 0
    }

    const totalWeight = results.reduce((sum, result) => {
      return sum + (weights[result.severity] || 0)
    }, 0)

    return Math.min(10, totalWeight / Math.max(1, results.length))
  }

  private mapNpmSeverity(severity: string): TestResult['severity'] {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'critical'
      case 'high':
        return 'high'
      case 'moderate':
        return 'medium'
      case 'low':
        return 'low'
      default:
        return 'info'
    }
  }

  private async handleCriticalFindings(
    test: SecurityTest,
    results: TestResult[]
  ): Promise<void> {
    const criticalResults = results.filter(r => r.severity === 'critical')
    if (criticalResults.length === 0) return

    // Log critical findings
    await logSystemAction(
      'security_critical_findings',
      {
        testId: test.id,
        testType: test.type,
        count: criticalResults.length
      },
      `Found ${criticalResults.length} critical security issues`,
      true,
      'error'
    )

    // Trigger alerts for critical findings
    // This could integrate with your existing alerts system
    for (const result of criticalResults) {
      // Create alert
      await this.createSecurityAlert(test, result)
    }
  }

  private async createSecurityAlert(
    test: SecurityTest,
    result: TestResult
  ): Promise<void> {
    // Implement alert creation
    // This should integrate with your existing alerts system
  }
}

const securityTestWorker = new SecurityTestWorker()
export default securityTestWorker 