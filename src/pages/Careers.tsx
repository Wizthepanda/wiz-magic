import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Careers() {
  useEffect(() => {
    document.title = 'Careers at WIZUP';
  }, []);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-5xl mx-auto p-10 mt-10 mb-20">
        <div className="rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-lg p-10">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            Careers at WIZUP
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            We're assembling the next generation of builders.
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We're a small, fast-moving team building the creator economy's future.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We're not hiring just yet — but if you're passionate about community, design, or AI, stay tuned for open roles soon.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-8">
              🔔 <strong>Releasing soon — join our Discord to stay updated.</strong>
            </p>

            <div className="flex gap-4">
              <a
                href="https://discord.gg/wizup"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Join Discord
              </a>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

