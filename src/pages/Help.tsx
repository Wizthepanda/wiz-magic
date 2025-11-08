import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Help() {
  useEffect(() => {
    document.title = 'Help Center - WIZUP';
  }, []);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-5xl mx-auto p-10 mt-10 mb-20">
        <div className="rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-lg p-10">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            Help Center
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              We're building something exciting — the WIZUP Help Center is coming soon!
            </p>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              In the meantime, feel free to reach out to us at{' '}
              <a href="mailto:wizuplive@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                wizuplive@gmail.com
              </a>{' '}
              with any questions or concerns.
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

