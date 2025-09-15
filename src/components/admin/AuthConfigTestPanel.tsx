import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { testAuthConfig, testYouTubeAuth, AuthConfigTester } from '@/lib/auth-config-test';
import { CheckCircle, XCircle, AlertTriangle, Play, Youtube, RefreshCw } from 'lucide-react';

interface TestResult {
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

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

export const AuthConfigTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<AuthTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isTestingYouTube, setIsTestingYouTube] = useState(false);

  const runConfigTests = async () => {
    setIsRunning(true);
    try {
      console.log('🧪 Starting authentication configuration tests...');
      const results = await testAuthConfig();
      setTestResults(results);
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const testYouTubeAuthFlow = async () => {
    setIsTestingYouTube(true);
    try {
      console.log('🎬 Testing YouTube authentication flow...');
      const result = await testYouTubeAuth();
      console.log('YouTube auth test result:', result);
    } catch (error) {
      console.error('❌ YouTube auth test failed:', error);
    } finally {
      setIsTestingYouTube(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'FAIL':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'bg-green-100 text-green-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAIL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'unknown';

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Play className="w-5 h-5" />
          <span>Firebase Auth Configuration Tester</span>
          <Badge variant="outline">{currentDomain}</Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Test Firebase authentication and YouTube API configuration for both wizxp.com and wizup.live domains
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Test Controls */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={runConfigTests}
            disabled={isRunning}
            className="flex items-center space-x-2"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{isRunning ? 'Running Tests...' : 'Run Config Tests'}</span>
          </Button>

          <Button
            onClick={testYouTubeAuthFlow}
            disabled={isTestingYouTube}
            variant="outline"
            className="flex items-center space-x-2"
          >
            {isTestingYouTube ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Youtube className="w-4 h-4" />
            )}
            <span>{isTestingYouTube ? 'Testing YouTube...' : 'Test YouTube Auth'}</span>
          </Button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center space-x-2">
                {getStatusIcon(testResults.summary.status)}
                <span>Test Summary</span>
                <Badge className={getStatusColor(testResults.summary.status)}>
                  {testResults.summary.status}
                </Badge>
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{testResults.summary.passed}</div>
                  <div className="text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{testResults.summary.failed}</div>
                  <div className="text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Object.values(testResults.tests).filter(t => t.status === 'WARNING').length}
                  </div>
                  <div className="text-gray-600">Warnings</div>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-3">
              <h3 className="font-semibold">Detailed Test Results</h3>
              {Object.entries(testResults.tests).map(([testName, result]) => (
                <div
                  key={testName}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="font-medium capitalize">
                          {testName.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {result.message}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>

                  {result.details && (
                    <div className="mt-2 ml-7 p-2 bg-gray-100 rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Configuration Steps */}
            {testResults.summary.status !== 'PASS' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Required Configuration Steps:</h3>
                <div className="space-y-2 text-sm text-yellow-700">
                  {testResults.tests.authorizedDomains.status === 'FAIL' && (
                    <div>1. Add <code>{currentDomain}</code> to Firebase Console → Authentication → Settings → Authorized Domains</div>
                  )}
                  {testResults.tests.youtubeAuth.status === 'FAIL' && (
                    <>
                      <div>2. Add <code>https://{currentDomain}</code> to Google Cloud Console → OAuth Client → Authorized JavaScript Origins</div>
                      <div>3. Add <code>https://{currentDomain}/__/auth/handler</code> to Google Cloud Console → OAuth Client → Authorized Redirect URIs</div>
                    </>
                  )}
                  <div className="mt-2 text-xs">
                    💡 Changes may take 5-10 minutes to propagate
                  </div>
                </div>
              </div>
            )}

            {/* Test Metadata */}
            <div className="text-xs text-gray-500 pt-4 border-t">
              Test run: {new Date(testResults.timestamp).toLocaleString()} | Domain: {testResults.domain}
            </div>
          </div>
        )}

        {/* Console Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Console Commands:</h3>
          <div className="space-y-1 text-sm text-blue-700 font-mono">
            <div>• <code>testAuthConfig()</code> - Run all configuration tests</div>
            <div>• <code>testYouTubeAuth()</code> - Test YouTube authentication interactively</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};