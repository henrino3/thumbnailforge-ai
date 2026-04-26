import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    subtitle: "For trying ideas quickly",
    features: ["3 generations/day", "4 variants per prompt", "Subtle watermark", "1280x720 downloads"],
    cta: "Start free",
    href: "#generator",
    analyticsLabel: "start_free",
  },
  {
    name: "Pro",
    price: "$12/mo",
    subtitle: "For solo creators publishing weekly",
    features: ["50 generations/month", "No watermark", "Priority generation queue", "Commercial usage"],
    featured: true,
    cta: "Choose Pro",
    href: "#generator",
    analyticsLabel: "choose_pro",
  },
  {
    name: "Agency",
    price: "$29/mo",
    subtitle: "For teams shipping thumbnails at scale",
    features: ["Unlimited generations", "No watermark", "Multi-channel workflow", "Priority support"],
    cta: "Talk to us",
    href: "mailto:hello@thumbnailforge.ai",
    analyticsLabel: "talk_to_us",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="mt-24 scroll-mt-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">Pricing</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
          Start free. Upgrade when your channel starts moving.
        </h2>
        <p className="mt-4 text-base text-slate-300 md:text-lg">
          Built for creators who want more clicks without spending half an hour in Canva.
        </p>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`glass-panel flex rounded-3xl p-7 ${plan.featured ? "border-orange-400/50 shadow-[0_0_60px_rgba(249,115,22,0.18)]" : ""}`}
          >
            <div className="flex min-h-full flex-1 flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                  <p className="mt-2 text-sm text-slate-400">{plan.subtitle}</p>
                </div>
                {plan.featured ? (
                  <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
                    Popular
                  </span>
                ) : null}
              </div>
              <p className="mt-8 text-4xl font-bold tracking-tight text-white">{plan.price}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-200">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                data-analytics-event="cta_click"
                data-analytics-location="thumbnail_pricing"
                data-analytics-label={plan.analyticsLabel}
                className={`mt-8 inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${plan.featured ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:scale-[1.01]" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}
              >
                {plan.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
