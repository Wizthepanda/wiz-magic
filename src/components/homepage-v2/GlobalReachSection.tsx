const reachStats = [
  { label: 'Learners worldwide', value: '50K+' },
  { label: 'Active communities', value: '1,000+' },
  { label: 'Countries represented', value: '120+' },
];

const regions = [
  { region: 'North America', highlight: 'Creator collectives in NYC, Toronto, SF' },
  { region: 'Europe', highlight: 'Design and AI guilds in Berlin & London' },
  { region: 'APAC', highlight: 'Web3 studios in Singapore & Seoul' },
];

export function GlobalReachSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <h2 className="text-4xl font-semibold text-gray-900">
            Global reach. Real learning momentum.
          </h2>
          <div className="space-y-4">
            {reachStats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-indigo-600">{stat.value}</div>
                <div className="text-sm uppercase tracking-[0.3em] text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-10 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="space-y-6">
            {regions.map((region) => (
              <div key={region.region} className="rounded-2xl bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                  {region.region}
                </p>
                <p className="mt-2 text-base text-gray-700">{region.highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
