import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GdprCompliance() {
  useEffect(() => {
    document.title = 'GDPR Compliance - WIZUP';
  }, []);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-5xl mx-auto p-10 mt-10 mb-20">
        <div className="rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-lg p-10">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            GDPR Compliance Statement
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Your data, your rights.
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              WIZUP operates in compliance with the EU General Data Protection Regulation (GDPR).
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
              Key Principles:
            </h2>

            <ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-gray-300 mb-8">
              <li>
                <strong>Transparency:</strong> We clearly state what data we collect and why.
              </li>
              <li>
                <strong>Control:</strong> You can revoke Google permissions anytime.
              </li>
              <li>
                <strong>Right to Deletion:</strong> Request full data deletion via{' '}
                <a href="mailto:wizuplive@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  wizuplive@gmail.com
                </a>.
              </li>
              <li>
                <strong>Minimal Data:</strong> We collect only what's needed to verify watch time and engagement.
              </li>
              <li>
                <strong>Storage:</strong> All data is encrypted and stored securely in Firebase.
              </li>
            </ul>

            <p className="text-gray-700 dark:text-gray-300 mb-8">
              🌍 As of Alpha stage, all users retain full access to view, export, or delete their data.
            </p>

            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

