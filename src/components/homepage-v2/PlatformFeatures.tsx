import { motion } from 'framer-motion';

const creatorTiles = [
  { name: 'Amara Bloom', category: 'Wellness & Balance', image: '/Amara Wellness Coach.png' },
  { name: 'Brandon Leaf', category: 'Ecommerce & Playbooks', image: '/Brandon Leaf Ecommerce.jpg' },
  { name: 'Dan Crypto King', category: 'Crypto & Finance', image: '/Dan Crypto King.png' },
  { name: 'Kai Rivers', category: 'Music & Performance', image: '/Kai Rivers Music.png' },
  { name: 'Lina Sol', category: 'Design & Product', image: '/Lina Sol Art .jpg' },
  { name: 'Milo Edge', category: 'Fitness & Discipline', image: '/Milo Edge Fitness.jpg' },
  { name: 'Naya Orion', category: 'Dating & Confidence', image: '/Naya Orion Dating.png' },
  { name: 'Wiz Premiere', category: 'Story Worlds', image: '/Wiz Premiere.png' },
];

export function PlatformFeatures() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <h2 className="text-4xl font-semibold text-gray-900">
            The best tooling to build learning worlds.
          </h2>
          <p className="text-lg text-gray-600">
            WIZUP gives creators everything they need to turn knowledge into living ecosystems — not
            static courses. Reward watch time, gate content by ZAPs, host private communities, and
            track learner progress in real time.
          </p>
          <p className="text-lg text-gray-600">
            It’s a complete operating system for million-dollar learning businesses — with rewards
            powering every interaction.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {creatorTiles.map((creator, index) => (
            <motion.div
              key={creator.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white via-white to-indigo-50 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
            >
              <img
                src={creator.image}
                alt={creator.name}
                className="h-24 w-24 rounded-2xl object-cover shadow-lg"
              />
              <div className="mt-4">
                <p className="text-base font-semibold text-gray-900">{creator.name}</p>
                <p className="text-sm text-gray-500">{creator.category}</p>
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-indigo-600/90 text-center text-sm font-semibold uppercase tracking-widest text-white opacity-0 transition group-hover:opacity-100">
                {creator.category}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
