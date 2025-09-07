import { useState, useEffect } from 'react';
import { AlertTriangle, X, Shield, RefreshCw } from 'lucide-react';
import { ServiceDetection } from '@/lib/service-detection';

interface ServiceBlockedAlertProps {
  onRetry?: () => void;
}

export const ServiceBlockedAlert: React.FC<ServiceBlockedAlertProps> = ({ onRetry }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [blockedServices, setBlockedServices] = useState<string[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    checkServices();
  }, []);

  const checkServices = async () => {
    try {
      const results = await ServiceDetection.checkGoogleServices();
      if (results.blocked.length > 0) {
        setBlockedServices(results.blocked);
        setIsVisible(true);
        ServiceDetection.showServiceBlockedWarning(results.blocked);
      }
    } catch (error) {
      console.warn('Service detection failed:', error);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
      await checkServices();
      if (onRetry) {
        onRetry();
      }
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">
              🚫 Google Services Blocked
            </h3>
            <p className="text-sm text-yellow-700 mb-3">
              Your ad blocker is preventing access to essential Google services needed for authentication and data sync.
            </p>
            
            <div className="text-sm text-yellow-700 mb-3">
              <p className="font-medium mb-1">Blocked services:</p>
              <ul className="list-disc list-inside space-y-1">
                {blockedServices.map((service, index) => (
                  <li key={index}>{service}</li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-100 rounded p-3 mb-3">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                ✅ Quick Fix:
              </p>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Click your ad blocker icon (usually in browser toolbar)</li>
                <li>Disable it for <code className="bg-yellow-200 px-1 rounded">wizxp.com</code></li>
                <li>Or add these domains to whitelist:
                  <ul className="ml-4 mt-1 space-y-0.5">
                    <li>• <code className="bg-yellow-200 px-1 rounded">*.googleapis.com</code></li>
                    <li>• <code className="bg-yellow-200 px-1 rounded">*.google.com</code></li>
                  </ul>
                </li>
                <li>Click "Retry" below</li>
              </ol>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Checking...' : 'Retry'}
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};