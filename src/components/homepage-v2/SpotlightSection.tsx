import ReactPlayer from 'react-player/lazy';
import { motion } from 'framer-motion';

const EPISODE = {
  title: 'THE SPARK AWAKENS',
  creator: '@wizsparkles',
  meta: 'Story Episode · +15 demo ZAPs',
  description:
    'In this pivotal moment from WIZ: THE LAST SPARK, Wiz steps forward to face a cursed bear and unlocks ancient power pulsing through the forest.',
  previewImage: '/assets/the-spark-awakens-preview.png',
  videoUrl: 'https://www.youtube.com/watch?v=2M4asXviuoo',
};

export function SpotlightSection() {
  return (
    <section
      id="spotlight"
      className="bg-white px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            About WIZUP
          </p>
          <h2 className="text-3xl font-semibold text-gray-900">
            WIZUP is a social learning platform where creators publish premium content and learners
            earn ZAP rewards for watching, engaging, and showing up.
          </h2>
          <p className="text-lg text-gray-600">
            Instead of paying upfront, you invest your attention — and unlock the content, coaching,
            and communities that move your life forward.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-[28px] border border-gray-100 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
        >
          <div className="overflow-hidden rounded-[28px]">
            <div className="relative aspect-[3/2] overflow-hidden">
              <ReactPlayer
                url={EPISODE.videoUrl}
                width="100%"
                height="100%"
                light={EPISODE.previewImage}
                controls
                playIcon={
                  <button
                    type="button"
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-indigo-600 shadow-xl"
                  >
                    ▶
                  </button>
                }
              />
            </div>
            <div className="space-y-2 px-8 py-6">
              <p className="text-sm font-semibold text-gray-500">{EPISODE.creator}</p>
              <h3 className="text-2xl font-semibold text-gray-900">{EPISODE.title}</h3>
              <p className="text-sm text-gray-500">{EPISODE.meta}</p>
              <p className="text-base text-gray-600">{EPISODE.description}</p>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 px-8 py-4 text-sm text-gray-600">
              This demo shows how ZAP rewards work. Log in on the full platform to earn real ZAPs.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
