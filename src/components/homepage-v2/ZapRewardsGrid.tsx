const rewards = [
  {
    title: 'Premium Courses',
    description: 'Deep dives you would normally pay hundreds for.',
    color: 'from-violet-200/80 to-violet-100',
  },
  {
    title: 'Creator Communities',
    description: 'Private spaces with direct access to mentors.',
    color: 'from-emerald-200/70 to-emerald-100',
  },
  {
    title: 'Live Coaching',
    description: '1-on-1 and group calls to push you forward.',
    color: 'from-amber-200/80 to-amber-100',
  },
  {
    title: 'Exclusive Drops',
    description: 'Limited-time series, challenges, and collabs.',
    color: 'from-sky-200/80 to-sky-100',
  },
  {
    title: 'Unlockable Events',
    description: 'Private live sessions, office hours, and summits.',
    color: 'from-rose-200/80 to-rose-100',
  },
  {
    title: 'Collectible Rewards',
    description: 'Badges, tiers, and perks that compound over time.',
    color: 'from-indigo-200/80 to-indigo-100',
  },
];

export function ZapRewardsGrid() {
  return (
    <section className="bg-[#f8f9fc] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-4xl font-semibold text-gray-900">
            ZAP Rewards, your new learning currency.
          </h2>
          <p className="text-lg text-gray-600">
            Swap attention for access across courses, communities, and coaching drops.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {rewards.map((reward) => (
            <div
              key={reward.title}
              className={`rounded-3xl border border-white/60 bg-gradient-to-br ${reward.color} p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]`}
            >
              <h3 className="text-2xl font-semibold text-gray-900">{reward.title}</h3>
              <p className="mt-2 text-base text-gray-700">{reward.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
