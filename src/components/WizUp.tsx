import React from "react";
import { Play, Star } from "lucide-react";

/**
 * WizUp - polished, minimal, glassmorphic WHY WIZUP section
 * - Tailwind utility classes (v3) used
 * - Mobile-first, stacks on small screens, two-column on md+
 * - Avoids negative transforms & overflow issues
 */

const viewersPoints = [
  "Watch videos → earn XP automatically",
  "Unlock perks from creators",
  "70% discounts on premium courses", // UPDATED
  "Get rewards for your progress",
  "Climb the leaderboard & flex your rank",
];

const creatorsPoints = [
  "No fees — upload free",
  "Sell courses (Stripe / USDT / BTC)",
  "Get tips in USDT or BTC — cash out anytime",
  "No chargebacks, no holds",
  "Accept anonymous tips securely",
];

export default function WizUp() {
  return (
    <section
      id="why-wizup"
      aria-labelledby="wizup-title"
      className="relative w-full"
    >
      {/* container keeps hero background untouched */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-14">
        {/* Header */}
        <header className="text-center mb-10">
          <h2
            id="wizup-title"
            className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent
                       bg-gradient-to-r from-[#7C3AED] to-[#A78BFA]"
          >
            WHY WIZUP
          </h2>
          <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">
            Because viewers level up, and creators earn fairly.
          </p>
        </header>

        {/* Grid: stacks on mobile, 2 cols on md */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Card: Viewers */}
          <Card
            icon={<Play size={20} className="text-white" />}
            iconBg="from-[#7C3AED] to-[#A78BFA]"
            title="Watch. Earn. Level Up."
            small="For Viewers"
            bullets={viewersPoints}
            cta={{ label: "Start Watching", href: "/discover", aria: "Start Watching" }}
          />

          {/* Card: Creators */}
          <Card
            icon={<Star size={20} className="text-white" />}
            iconBg="from-[#F973B3] to-[#A78BFA]"
            title="Create. Share. Earn."
            small="For Creators"
            bullets={creatorsPoints}
            cta={{ label: "Start Creating", href: "/?section=create", aria: "Start Creating" }}
          />
        </div>
      </div>
    </section>
  );
}

function Card({
  icon,
  iconBg,
  title,
  small,
  bullets,
  cta,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  small?: string;
  bullets: string[];
  cta: { label: string; href: string; aria?: string };
}) {
  return (
    <article
      className="relative bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-6
                 shadow-[0_20px_40px_rgba(16,24,40,0.06)] hover:shadow-xl transition-shadow
                 focus-within:outline-none"
      // ensure no overflow causing odd scrollbars:
      style={{ overflow: "hidden" }}
    >
      {/* small floating icon block — kept modest to avoid overflow */}
      <div
        className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${iconBg} bg-gradient-to-br shadow-md mb-3`}
        aria-hidden
      >
        {icon}
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
        {small && <div className="text-sm text-slate-500 mt-1 mb-4">{small}</div>}

        <ul className="space-y-3 mt-4">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-1 w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
              <p className="text-sm text-slate-700">{b}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <a
            className="inline-block px-5 py-3 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white font-medium
                       shadow-md hover:scale-[1.02] transition-transform focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/40"
            href={cta.href}
            aria-label={cta.aria ?? cta.label}
          >
            {cta.label}
          </a>
        </div>
      </div>
    </article>
  );
}