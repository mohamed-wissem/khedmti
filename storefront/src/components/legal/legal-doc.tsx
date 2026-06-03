export interface LegalSection {
  heading: string;
  body: string;
}

export function LegalDoc({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
      <header className="mb-8 border-b border-ash/40 pb-6">
        <h1 className="font-display text-3xl font-bold tracking-wide text-moon">{title}</h1>
        <p className="mt-1 text-xs uppercase tracking-wider text-smoke">Last updated {updated}</p>
        <p className="mt-4 text-sm leading-relaxed text-smoke">{intro}</p>
      </header>

      <div className="space-y-8">
        {sections.map((s, i) => (
          <section key={s.heading}>
            <h2 className="font-display text-lg font-semibold tracking-wide text-moon">
              {i + 1}. {s.heading}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-smoke">{s.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 rounded-bf border border-bronze/30 bg-bronze/5 px-4 py-3 text-xs text-bronze">
        This is template copy for a demo storefront, not legal advice. Replace with counsel-reviewed
        terms before going live.
      </p>
    </div>
  );
}
