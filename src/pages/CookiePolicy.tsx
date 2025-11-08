import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CookiePolicy() {
  useEffect(() => {
    document.title = 'Cookie Policy - WIZUP';
  }, []);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-5xl mx-auto p-10 mt-10 mb-20">
        <div className="rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-lg p-10">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            Cookie Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            How WIZUP uses cookies and similar technologies.
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              WIZUP uses minimal cookies to enhance functionality and security.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We do <strong>not</strong> use tracking or advertising cookies.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-8">
              Cookies are limited to:
            </p>

            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-8">
              <li>Authentication sessions (Google Auth)</li>
              <li>Firestore caching</li>
              <li>Analytics (Firebase Performance)</li>
            </ul>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Users can clear cookies or revoke permissions anytime.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-8">
              We comply with major browser privacy frameworks.
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

