const creators = [
  { name: 'Amara Bloom', focus: 'Wellness & Balance', image: '/Amara Wellness Coach.png' },
  { name: 'Brandon Leaf', focus: 'Ecommerce & Playbooks', image: '/Brandon Leaf Ecommerce.jpg' },
  { name: 'Dan Crypto King', focus: 'Crypto & Finance', image: '/Dan Crypto King.png' },
  { name: 'Lina Sol', focus: 'Design & Product', image: '/Lina Sol Art .jpg' },
  { name: 'Kai Rivers', focus: 'Music & Performance', image: '/Kai Rivers Music.png' },
];

export function FeaturedCreators() {
  return (
    <section id="creators" className="bg-white">
      <div className="border-t border-b border-gray-100 bg-gray-50/60 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            Backed by creators across disciplines
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {creators.map((creator) => (
              <div
                key={creator.name}
                className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 p-4 shadow-sm"
              >
                <img
                  src={creator.image}
                  alt={creator.name}
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{creator.name}</p>
                  <p className="text-xs text-gray-500">{creator.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-30">
          <img
            src="/Wiz Premiere.png"
            alt="Live session"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-indigo-900/60 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl space-y-6">
          <p className="text-3xl font-semibold leading-tight sm:text-4xl">
            “WIZUP doesn’t just host my content — it actually rewards the students who show up day
            after day. I’ve never seen learners this motivated.”
          </p>
          <p className="text-lg font-semibold text-white/80">
            — Amara Bloom, Wellness & Balance Creator
          </p>
        </div>
      </div>
    </section>
  );
}
