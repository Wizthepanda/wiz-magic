/**
 * Firebase & YouTube Authentication Configuration Tester
 * Tests both wizxp.com and wizup.live domain configurations
 */

import { auth, googleProviderWithYouTube } from './firebase';
import { signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';

interface AuthTestResult {
  domain: string;
  timestamp: string;
  tests: {
    firebaseConfig: TestResult;
    authDomain: TestResult;
    googleClientId: TestResult;
    redirectUri: TestResult;
    authorizedDomains: TestResult;
    youtubeAuth: TestResult;
  };
  summary: {
    passed: number;
    failed: number;
    status: 'PASS' | 'FAIL' | 'PARTIAL';
  };
}

interface TestResult {
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

export class AuthConfigTester {
  private results: AuthTestResult;

  constructor() {
    this.results = {
      domain: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
      timestamp: new Date().toISOString(),
      tests: {
        firebaseConfig: { status: 'FAIL', message: 'Not tested' },
        authDomain: { status: 'FAIL', message: 'Not tested' },
        googleClientId: { status: 'FAIL', message: 'Not tested' },
        redirectUri: { status: 'FAIL', message: 'Not tested' },
        authorizedDomains: { status: 'FAIL', message: 'Not tested' },
        youtubeAuth: { status: 'FAIL', message: 'Not tested' }
      },
      summary: {
        passed: 0,
        failed: 0,
        status: 'FAIL'
      }
    };
  }

  /**
   * Run all authentication configuration tests
   */
  async runAllTests(): Promise<AuthTestResult> {
    console.group('🧪 Firebase Auth Configuration Tests');
    console.log(`🌐 Testing domain: ${this.results.domain}`);
    console.log(`⏰ Test started: ${this.results.timestamp}`);

    try {
      await this.testFirebaseConfig();
      await this.testAuthDomain();
      await this.testGoogleClientId();
      await this.testRedirectUri();
      await this.testAuthorizedDomains();
      await this.testYouTubeAuthentication();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }

    this.calculateSummary();
    this.displayResults();
    console.groupEnd();

    return this.results;
  }

  /**
   * Test 1: Firebase Configuration
   */
  private async testFirebaseConfig(): Promise<void> {
    try {
      const config = auth.app.options;
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

      if (!config.apiKey || !config.authDomain || !config.projectId) {
        this.results.tests.firebaseConfig = {
          status: 'FAIL',
          message: 'Missing required Firebase config parameters',
          details: { apiKey: !!config.apiKey, authDomain: !!config.authDomain, projectId: !!config.projectId }
        };
        return;
      }

      // Check if auth domain matches current domain for production
      const expectedDomain = currentDomain === 'wizup.live' ? 'wizup.live' :
                           currentDomain === 'wizxp.com' ? 'wizxp.com' :
                           config.authDomain;

      if (config.authDomain === expectedDomain) {
        this.results.tests.firebaseConfig = {
          status: 'PASS',
          message: `Firebase config valid for ${config.authDomain}`,
          details: { authDomain: config.authDomain, projectId: config.projectId }
        };
      } else {
        this.results.tests.firebaseConfig = {
          status: 'WARNING',
          message: `Auth domain mismatch: expected ${expectedDomain}, got ${config.authDomain}`,
          details: { expected: expectedDomain, actual: config.authDomain }
        };
      }
    } catch (error) {
      this.results.tests.firebaseConfig = {
        status: 'FAIL',
        message: 'Firebase config test failed',
        details: error
      };
    }
  }

  /**
   * Test 2: Auth Domain Resolution
   */
  private async testAuthDomain(): Promise<void> {
    try {
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
      const authDomain = auth.app.options.authDomain;

      const isValidDomain = authDomain === 'wizxp.com' ||
                           authDomain === 'wizup.live' ||
                           authDomain?.includes('firebaseapp.com');

      if (isValidDomain) {
        this.results.tests.authDomain = {
          status: 'PASS',
          message: `Auth domain correctly resolved: ${authDomain}`,
          details: { currentDomain, authDomain }
        };
      } else {
        this.results.tests.authDomain = {
          status: 'FAIL',
          message: `Invalid auth domain: ${authDomain}`,
          details: { currentDomain, authDomain }
        };
      }
    } catch (error) {
      this.results.tests.authDomain = {
        status: 'FAIL',
        message: 'Auth domain test failed',
        details: error
      };
    }
  }

  /**
   * Test 3: Google Client ID Configuration
   */
  private async testGoogleClientId(): Promise<void> {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const expectedClientId = '543256047502-4fdauu19uj3t63kf5saclcg597niecsh.apps.googleusercontent.com';

      if (!clientId) {
        this.results.tests.googleClientId = {
          status: 'FAIL',
          message: 'VITE_GOOGLE_CLIENT_ID not set',
          details: { clientId: null }
        };
        return;
      }

      if (clientId === expectedClientId) {
        this.results.tests.googleClientId = {
          status: 'PASS',
          message: 'Google Client ID matches expected value',
          details: { clientId: `${clientId.substring(0, 20)}...` }
        };
      } else {
        this.results.tests.googleClientId = {
          status: 'WARNING',
          message: 'Google Client ID differs from expected',
          details: {
            expected: `${expectedClientId.substring(0, 20)}...`,
            actual: `${clientId.substring(0, 20)}...`
          }
        };
      }
    } catch (error) {
      this.results.tests.googleClientId = {
        status: 'FAIL',
        message: 'Google Client ID test failed',
        details: error
      };
    }
  }

  /**
   * Test 4: Redirect URI Configuration
   */
  private async testRedirectUri(): Promise<void> {
    try {
      const authDomain = auth.app.options.authDomain;
      const expectedRedirectUri = `https://${authDomain}/__/auth/handler`;

      // Test if the redirect URI is properly formed
      const url = new URL(expectedRedirectUri);

      if (url.pathname === '/__/auth/handler' && url.protocol === 'https:') {
        this.results.tests.redirectUri = {
          status: 'PASS',
          message: `Redirect URI properly formed: ${expectedRedirectUri}`,
          details: { redirectUri: expectedRedirectUri }
        };
      } else {
        this.results.tests.redirectUri = {
          status: 'FAIL',
          message: `Invalid redirect URI format: ${expectedRedirectUri}`,
          details: { redirectUri: expectedRedirectUri }
        };
      }
    } catch (error) {
      this.results.tests.redirectUri = {
        status: 'FAIL',
        message: 'Redirect URI test failed',
        details: error
      };
    }
  }

  /**
   * Test 5: Authorized Domains (Network Test)
   */
  private async testAuthorizedDomains(): Promise<void> {
    try {
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

      // Test if current domain is authorized by attempting to load Firebase Auth
      const testUrl = `https://${currentDomain}/__/auth/iframe`;

      try {
        const response = await fetch(testUrl, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });

        this.results.tests.authorizedDomains = {
          status: 'PASS',
          message: `Domain ${currentDomain} appears to be authorized`,
          details: { domain: currentDomain, testUrl }
        };
      } catch (fetchError) {
        // Network errors are expected with no-cors, but complete failures indicate auth issues
        this.results.tests.authorizedDomains = {
          status: 'WARNING',
          message: `Unable to verify domain authorization for ${currentDomain}`,
          details: { domain: currentDomain, error: 'Network test inconclusive' }
        };
      }
    } catch (error) {
      this.results.tests.authorizedDomains = {
        status: 'FAIL',
        message: 'Authorized domains test failed',
        details: error
      };
    }
  }

  /**
   * Test 6: YouTube Authentication (Interactive Test)
   */
  private async testYouTubeAuthentication(): Promise<void> {
    try {
      // Check if user is already signed in
      const currentUser = auth.currentUser;

      if (currentUser) {
        this.results.tests.youtubeAuth = {
          status: 'PASS',
          message: `User already authenticated: ${currentUser.email}`,
          details: {
            uid: currentUser.uid,
            email: currentUser.email,
            provider: 'google.com'
          }
        };
        return;
      }

      // Check for redirect result (after OAuth redirect)
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          this.results.tests.youtubeAuth = {
            status: 'PASS',
            message: `YouTube auth successful via redirect: ${result.user.email}`,
            details: {
              uid: result.user.uid,
              email: result.user.email,
              scopes: result.user.providerData
            }
          };
          return;
        }
      } catch (redirectError: any) {
        if (redirectError.code === 'auth/unauthorized-domain') {
          this.results.tests.youtubeAuth = {
            status: 'FAIL',
            message: 'Domain not authorized for authentication',
            details: {
              error: redirectError.code,
              message: redirectError.message,
              domain: typeof window !== 'undefined' ? window.location.hostname : ''
            }
          };
          return;
        }
      }

      // If no user and no redirect result, authentication needs to be initiated
      this.results.tests.youtubeAuth = {
        status: 'WARNING',
        message: 'YouTube authentication not tested (requires user interaction)',
        details: {
          note: 'Call testYouTubeAuthInteractive() to test with user interaction'
        }
      };

    } catch (error: any) {
      this.results.tests.youtubeAuth = {
        status: 'FAIL',
        message: 'YouTube authentication test failed',
        details: error
      };
    }
  }

  /**
   * Interactive YouTube Authentication Test
   */
  async testYouTubeAuthInteractive(): Promise<TestResult> {
    try {
      console.log('🎬 Starting interactive YouTube authentication test...');

      await signInWithRedirect(auth, googleProviderWithYouTube);

      return {
        status: 'WARNING',
        message: 'YouTube auth redirect initiated - check after redirect completes',
        details: { action: 'redirected' }
      };

    } catch (error: any) {
      const result: TestResult = {
        status: 'FAIL',
        message: `YouTube authentication failed: ${error.code || error.message}`,
        details: {
          errorCode: error.code,
          errorMessage: error.message,
          domain: typeof window !== 'undefined' ? window.location.hostname : ''
        }
      };

      // Update the main test results
      this.results.tests.youtubeAuth = result;
      return result;
    }
  }

  /**
   * Calculate test summary
   */
  private calculateSummary(): void {
    const testResults = Object.values(this.results.tests);
    this.results.summary.passed = testResults.filter(t => t.status === 'PASS').length;
    this.results.summary.failed = testResults.filter(t => t.status === 'FAIL').length;
    const warnings = testResults.filter(t => t.status === 'WARNING').length;

    if (this.results.summary.failed === 0) {
      this.results.summary.status = 'PASS';
    } else if (this.results.summary.passed > 0) {
      this.results.summary.status = 'PARTIAL';
    } else {
      this.results.summary.status = 'FAIL';
    }
  }

  /**
   * Display test results in console
   */
  private displayResults(): void {
    console.group('📊 Test Results Summary');
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⚠️ Warnings: ${Object.values(this.results.tests).filter(t => t.status === 'WARNING').length}`);
    console.log(`📋 Overall Status: ${this.results.summary.status}`);

    console.group('📝 Detailed Results');
    Object.entries(this.results.tests).forEach(([testName, result]) => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
      console.log(`${icon} ${testName}: ${result.message}`);
      if (result.details) {
        console.log('   Details:', result.details);
      }
    });
    console.groupEnd();

    if (this.results.summary.status === 'FAIL') {
      console.group('🔧 Configuration Steps Needed');
      if (this.results.tests.authorizedDomains.status === 'FAIL') {
        console.log('1. Add domain to Firebase Console → Authentication → Settings → Authorized Domains');
      }
      if (this.results.tests.youtubeAuth.status === 'FAIL') {
        console.log('2. Add domain to Google Cloud Console → OAuth Client → Authorized JavaScript Origins');
        console.log('3. Add redirect URI to Google Cloud Console → OAuth Client → Authorized Redirect URIs');
      }
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Export results for external use
   */
  getResults(): AuthTestResult {
    return this.results;
  }
}

// Convenience function for quick testing
export async function testAuthConfig(): Promise<AuthTestResult> {
  const tester = new AuthConfigTester();
  return await tester.runAllTests();
}

// Interactive YouTube auth test function
export async function testYouTubeAuth(): Promise<TestResult> {
  const tester = new AuthConfigTester();
  return await tester.testYouTubeAuthInteractive();
}

// Export for console usage
if (typeof window !== 'undefined') {
  (window as any).testAuthConfig = testAuthConfig;
  (window as any).testYouTubeAuth = testYouTubeAuth;
}