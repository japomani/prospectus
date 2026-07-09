const CHIPS = [
  'Works in your existing Canvas',
  'No credit card required',
  'Nothing new for teachers to learn',
  'Turn it off anytime — your courses go right back to normal',
];

export default function FreeTrialSection({ pageLabel }) {
  return (
    <section className="sheet" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="page-label screen-only">{pageLabel}</div>

      <div className="ex-kicker">
        <span className="ex-tick" />
        Try Delphinium with no risk
      </div>
      <h2 className="ex-h">See it in your own courses first</h2>

      <h3 className="ex-subhead is-top keep">Free 14-day trial</h3>
      <p className="ex-lead keep">
        Turn on the full Delphinium experience in your own Canvas courses for 14 days. Your course gets
        the full makeover instantly, and your Control Tower fills in with real student data from day one
        — so you&apos;re not imagining the difference, you&apos;re watching it happen. No migration, no
        commitment — see it for yourself!
      </p>

      <ul className="ex-checklist keep">
        {CHIPS.map(chip => (
          <li key={chip}>{chip}</li>
        ))}
      </ul>

      <p className="ex-cap keep">Ask your Delphinium contact to activate your free trial today.</p>

      <div className="keep free-trial-figure">
        <img
          src="/free-trial-final.png"
          alt="Delphinium course view with Control Tower countdown and weekly assignment modules"
          className="free-trial-figure-img"
        />
      </div>
    </section>
  );
}
