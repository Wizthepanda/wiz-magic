export function SeriousLearnersSection() {
  const stats = [
    { label: 'Active daily learners', value: '25K+' },
    { label: 'Lessons with ZAP rewards', value: '10K+' },
    { label: 'Communities you can unlock', value: '1,000+' },
  ];

  return (
    <section className="bg-[#f8f9fc] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <h2 className="text-4xl font-semibold text-gray-900">
            Designed for serious learners.
          </h2>
          <p className="text-lg text-gray-600">
            WIZUP rewards consistent watch time, not empty clicks. Our ZAP engine tracks real
            engagement across educational videos, live sessions, and community events — so the
            people who show up grow fastest.
          </p>
        </div>
        <div className="rounded-[32px] border border-white/60 bg-gradient-to-br from-indigo-50 via-violet-50 to-white p-10 shadow-[0_24px_60px_rgba(99,102,241,0.15)]">
          <p className="text-lg font-semibold text-gray-600">Upfront course fees</p>
          <div className="mt-6 flex items-baseline gap-4">
            <span className="text-6xl font-bold text-gray-400 line-through">0$</span>
            <span className="text-4xl font-semibold text-indigo-600">ZAPs</span>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Pay with the attention you already invest — not another credit card.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white bg-white/80 px-6 py-5 text-center shadow-sm"
          >
            <div className="text-3xl font-semibold text-gray-900">{stat.value}</div>
            <div className="mt-1 text-sm uppercase tracking-wide text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
