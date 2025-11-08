import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  useEffect(() => {
    document.title = 'About WIZUP';
  }, []);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-5xl mx-auto p-10 mt-10 mb-20">
        <div className="rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-lg p-10">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            About WIZUP
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Empowering the next generation of creators.
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              WIZUP is an alpha-stage creator economy platform that rewards users for learning, watching, and engaging through XP (ZAPs).
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Our mission is to bridge education, entertainment, and earning through authentic community participation.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-8">
              We're building a new wave of digital empowerment — where creators, learners, and fans thrive together.
            </p>

            <div className="space-y-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Our Vision</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Democratize opportunity through creator-driven learning.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Our Model</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Watch → Earn ZAPs → Level Up → Unlock Opportunities.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Status</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  🚀 Currently in Alpha — expect new drops and features soon.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Contact</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  <a href="mailto:wizuplive@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    wizuplive@gmail.com
                  </a>
                </p>
              </div>
            </div>

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
