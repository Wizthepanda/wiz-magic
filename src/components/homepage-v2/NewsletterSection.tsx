import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function NewsletterSection() {
  const [email, setEmail] = useState('');

  return (
    <section className="bg-gradient-to-br from-indigo-50 via-white to-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-[32px] border border-white/60 bg-white/80 p-10 shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            Where Learning Compounds
          </p>
          <h2 className="text-3xl font-semibold text-gray-900">
            Get early creator drops and ZAP insights.
          </h2>
          <p className="text-lg text-gray-600">
            Be the first to know when new creator worlds launch, high-value rewards drop, and ZAP
            mechanics evolve.
          </p>
        </div>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-base text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <Button
            type="submit"
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 px-8 py-4 text-lg font-semibold text-white shadow-lg"
          >
            Subscribe
          </Button>
          <p className="text-xs text-gray-500">We value your attention. No spam, ever.</p>
        </form>
      </div>
    </section>
  );
}
