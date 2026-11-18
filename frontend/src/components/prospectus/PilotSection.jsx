import { Field } from './Field.jsx';

const FLOW_STEPS = ['Setup', 'Onboarding', 'Training', 'Support'];

const PILOT_STEPS = [
  'We guide you through install, configuration, and layout design until your pilot teachers know Delphinium inside out.',
  "We provide hands-on training to your pilot teachers over Zoom until they're proficient.",
  'Your pilot teachers become your champions — bringing real expertise and peer reinforcement into professional development and staff meetings as adoption spreads.',
  'Together we bring the rest of your staff up to speed with train-the-trainer support, self-paced lessons, and a community forum.',
  'We back your primary admin with dedicated ticket support, so you always have the answers you need.',
];

export default function PilotSection({ pageLabel, fields, highlightFields }) {
  return (
    <section className="sheet pilot-sheet" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="page-label screen-only">{pageLabel}</div>

      <div className="ex-kicker">
        <span className="ex-tick" />
        Guided pilot
      </div>
      <h2 className="ex-h">
        See it work{' '}
        <span className="em">before you scale it</span>
      </h2>
      <p className="ex-lead keep">
        In your guided pilot, we&apos;ll work with you to run Delphinium in real classes for a full term
        — typically with <b>3–7 teachers</b> for <b>2–4 months</b>.
      </p>

      <div className="ex-process keep">
        {FLOW_STEPS.flatMap((step, i, arr) =>
          i < arr.length - 1
            ? [
                <span key={step} className="ex-process-step">{step}</span>,
                <span key={`${step}-arrow`} className="ex-process-arrow">&rarr;</span>,
              ]
            : [<span key={step} className="ex-process-step">{step}</span>],
        )}
      </div>

      <h3 className="ex-subhead">
        Run a full pilot,{' '}
        <span className="em">not just a preview</span>
      </h3>
      <ol className="ex-steps keep">
        {PILOT_STEPS.map(step => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <p className="ex-cap keep">
        You&apos;ll see real engagement data build in your Control Tower the whole time — not a simulation.
      </p>

      <div className="ex-price-card keep">
        <div className="ex-price-band">
          <span className="ex-price-label">Guided pilot</span>
          <span className="ex-price-num">
            <Field value={fields.PILOT_FEE} highlight={highlightFields} />
            *
          </span>
        </div>
        <p className="ex-price-note">
          *Pilot fees are credited toward your license — so the pilot ultimately costs nothing when you
          move forward.
        </p>
      </div>
    </section>
  );
}
