const SETUP_TIMES = [
  { label: 'Account setup', value: '~20 min', sub: 'one-time, account-wide' },
  { label: 'First class', value: '~3 min', sub: 'per teacher' },
  { label: 'Every class after', value: '~45 sec', sub: '' },
];

const SETUP_STEPS = [
  ['Enable developer keys', 'Enable the Delphinium developer keys that are already inherited in your account.'],
  ['Install the app', 'Install the Delphinium app using a simple client ID.'],
  ['Set up a service role', 'Set up a dedicated Delphinium service role and permissions.'],
  ['Connect Canvas Data', 'Connect Delphinium to Canvas Data 2 and Canvas Live Events.'],
];

const ONBOARDING_STEPS = [
  'We guide you through install, configuration, and designing your layout until you know Delphinium inside out',
  'We provide hands-on training to your first champion cohort over Zoom in the early months until they’re proficient',
  'Your champions spread adoption by bringing real expertise and peer reinforcement into professional development and staff meetings',
  'Together we bring everyone up to speed with train-the-trainer support, self-paced lessons, and a community forum',
  'We back your primary admin with dedicated ticket support, so you always have the answers you need',
];

export default function ImplementationSection({ pageLabel, pageLabelB }) {
  return (
    <>
      <section className="sheet">
        <div className="page-label screen-only">{pageLabel}</div>
        <div className="doc-kicker">Implementation</div>
        <h2 className="doc-h2" style={{ marginBottom: '8px' }}>Easy to enable</h2>
        <p className="doc-lead" style={{ marginBottom: '14px' }}>
          Delphinium is built to make adoption easy on everyone — including the people who support it. Setup
          is a one-time job, and teachers are up and running in minutes.
        </p>

        <div className="keep exec-stat-trio" style={{ marginBottom: '16px' }}>
          {SETUP_TIMES.map(({ label, value, sub }) => (
            <div key={label} className="exec-stat-trio-card">
              <div className="exec-stat-trio-label">{label}</div>
              <div className="exec-stat-trio-num" style={{ fontSize: '20px' }}>{value}</div>
              {sub && <div className="exec-stat-trio-src">{sub}</div>}
            </div>
          ))}
        </div>

        <div className="doc-security-section-title">Setup — done once</div>
        <p className="doc-body" style={{ fontSize: '12.5px', marginBottom: '10px' }}>
          Delphinium is already installed as an inherited app in your Canvas — enabling it account-wide takes
          about twenty minutes, once, and then you&apos;re finished.
        </p>
        <div className="keep doc-grid-2" style={{ marginBottom: '10px' }}>
          {SETUP_STEPS.map(([title, body], i) => (
            <div key={title} className="dCard" style={{ margin: 0 }}>
              <div className="doc-step-num">{i + 1}</div>
              <div className="doc-step-title">{title}</div>
              <div className="doc-step-body">{body}</div>
            </div>
          ))}
        </div>
        <p className="doc-caption" style={{ marginBottom: '14px' }}>
          That&apos;s it — every course is now ready for the moment a teacher decides to switch it on.
          {' '}
          <a
            className="doc-link"
            href="https://tutorials.delphi-me.com/deep_dive/admin/installing-delphinium"
            target="_blank"
            rel="noopener noreferrer"
          >
            View install details here
          </a>
        </p>

        <div className="doc-security-section-title">Teachers are ready in minutes</div>
        <ul className="doc-security-list" style={{ marginBottom: '8px' }}>
          <li>Teachers can set up their first class themselves in about three minutes</li>
          <li>Next classes are even easier — copy those settings and you&apos;re done in about 45 seconds</li>
          <li>Teachers use their Canvas course the way they always have, with no learning curve</li>
          <li>Every edit in Canvas passes through to Delphinium automatically and instantly</li>
        </ul>

        <div className="doc-security-section-title">One environment, one login</div>
        <ul className="doc-security-list">
          <li>Built on <b>LTI 1.3</b> — teachers and students launch Delphinium from inside Canvas, with no separate login or passwords to hand out</li>
          <li>Access follows the <b>Canvas roles and permissions</b> you already have — nothing new to provision</li>
          <li><b>Built for real students</b> — heavy work runs on our servers, not student devices, so Delphinium stays fast on Chromebooks and weak Wi-Fi</li>
        </ul>
      </section>

      <section className="sheet">
        <div className="page-label screen-only">{pageLabelB}</div>
        <div className="doc-kicker">Support</div>
        <h2 className="doc-h2" style={{ marginBottom: '8px' }}>Easy to support</h2>
        <p className="doc-lead" style={{ marginBottom: '14px' }}>
          Support is always there when you need it, and when a question does come up, the answer is usually
          already on the screen.
        </p>

        <div className="keep doc-process-strip" style={{ marginBottom: '16px' }}>
          {['Setup', 'Onboarding', 'Adoption', 'Training', 'Support'].map((step, i, arr) => (
            <span key={step} className="doc-process-step">
              {step}
              {i < arr.length - 1 && <span className="doc-process-arrow">&rarr;</span>}
            </span>
          ))}
        </div>

        <div className="doc-security-section-title">From hands-on onboarding to long-term support</div>
        <ol className="doc-security-list" style={{ marginBottom: '14px' }}>
          {ONBOARDING_STEPS.map(step => <li key={step}>{step}</li>)}
        </ol>

        <div className="doc-security-section-title">Support built right into Delphinium</div>
        <ul className="doc-security-list">
          <li>A guided walkthrough tour on every teacher&apos;s first load</li>
          <li>&ldquo;Learn More&rdquo; links and tooltips beside every feature</li>
          <li>Plain-language explanations embedded throughout the settings</li>
          <li>Self-paced Getting Started and feature lessons for every teacher, at any time</li>
        </ul>
      </section>
    </>
  );
}
