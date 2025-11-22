const steps = [
  {
    label: 'Step 1',
    title: 'Watch meaningful content.',
    body:
      'Access curated lessons from top creators across skills, careers, and creativity. No credit card required.',
  },
  {
    label: 'Step 2',
    title: 'Earn ZAPs in real time.',
    body:
      'As you watch and participate, ZAP points stack up automatically — reflecting your actual engagement, not just clicks.',
  },
  {
    label: 'Step 3',
    title: 'Unlock courses, coaching, and communities.',
    body:
      'Use your ZAPs to claim premium drops, 1-on-1 sessions, and private community access tailored to the goals you care about most.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-white px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            How WIZUP turns attention into access.
          </p>
          <h2 className="text-4xl font-semibold text-gray-900">
            Three simple steps to start earning rewards while you learn.
          </h2>
        </div>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-gray-100 bg-gray-50/60 p-8 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                {step.label}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-3 text-base text-gray-600">{step.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-center gap-4 text-sm font-semibold text-gray-700">
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-5 py-3">
          ⚡ 2.5M+ ZAPs distributed
        </span>
        <span className="rounded-full border border-violet-100 bg-violet-50 px-5 py-3">
          🎁 10,000+ rewards claimed
        </span>
        <span className="rounded-full border border-purple-100 bg-purple-50 px-5 py-3">
          👥 50,000+ active learners
        </span>
      </div>
    </section>
  );
}
