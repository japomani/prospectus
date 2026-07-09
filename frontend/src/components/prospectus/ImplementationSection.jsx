const INSTALL_URL = 'https://tutorials.delphi-me.com/deep_dive/admin/installing-delphinium';
const ENABLE_URL = 'https://tutorials.delphi-me.com/deep_dive/set-up-a-course/enable-delphinium';

const SETUP_TIMES = [
  {
    tag: 'Account setup',
    value: '~20 min',
    desc: 'One-time, account-wide install — then every course is ready.',
  },
  {
    tag: 'First class',
    value: '~3 min',
    desc: 'For a teacher to turn Delphinium on in their first course.',
  },
  {
    tag: 'Every class after',
    value: '~45 sec',
    desc: 'Copy the settings forward and the next course is done.',
  },
];

const SETUP_STEPS = [
  'Enable the Delphinium developer keys that are already inherited in your account',
  'Install the Delphinium app using a simple client ID',
  'Set up a dedicated Delphinium service role and permissions',
  'Connect Delphinium to Canvas Data 2 and Canvas Live Events',
];

const TEACHER_STEPS = [
  'Teachers can set up their first class themselves in about three minutes',
  'Next classes are even easier — copy those settings and you\'re done in about 45 seconds',
  'Teachers use their Canvas course the way they always have, with no learning curve',
  'Every edit in Canvas passes through to Delphinium automatically and instantly',
];

const LOGIN_POINTS = [
  {
    id: 'lti',
    content: (
      <>
        <b>Built on LTI 1.3</b> — teachers and students launch Delphinium from inside Canvas, with no
        separate login or passwords to hand out
      </>
    ),
  },
  {
    id: 'roles',
    content: (
      <>
        <b>Access follows the Canvas roles and permissions</b> you already have — nothing new to
        provision
      </>
    ),
  },
  {
    id: 'students',
    content: (
      <>
        <b>Built for real students</b> — heavy work runs on our servers, not student devices, so
        Delphinium stays fast on Chromebooks and weak Wi-Fi
      </>
    ),
  },
];

const FLOW_STEPS = ['Setup', 'Onboarding', 'Adoption', 'Training', 'Support'];

const ONBOARDING_STEPS = [
  'We guide you through install, configuration, and designing your layout until you know Delphinium inside out.',
  'We provide hands-on training to your first champion cohort over Zoom in the early months until they\'re proficient.',
  'Your champions spread adoption by bringing real expertise and peer reinforcement into professional development and staff meetings.',
  'Together we bring everyone up to speed with train-the-trainer support, self-paced lessons, and a community forum.',
  'We back your primary admin with a dedicated ticket support, so you always have the answers you need.',
];

const BUILT_IN_STEPS = [
  'A guided walkthrough tour on every teacher\'s first load.',
  '\u201cLearn More\u201d links and tooltips beside every feature.',
  'Plain-language explanations embedded throughout the settings.',
  'Self-paced Getting Started and feature lessons for every teacher, at any time.',
];

export default function ImplementationSection({ pageLabel, pageLabelB }) {
  return (
    <>
      <section className="sheet impl-sheet">
        <div className="page-label screen-only">{pageLabel}</div>

        <div className="ex-kicker">
          <span className="ex-tick" />
          Implementation
        </div>
        <h2 className="ex-h impl-title">
          <span className="em">Easy</span> to enable
        </h2>
        <p className="ex-lead impl-lead">
          Delphinium is built to make adoption easy on everyone — including the people who support it.
          Setup is a one-time job, and teachers are up and running in minutes.
        </p>

        <div className="keep ex-stats impl-stats">
          {SETUP_TIMES.map(({ tag, value, desc }) => (
            <div key={tag} className="ex-stat">
              <div className="ex-stat-tag">{tag}</div>
              <div className="ex-stat-num">{value}</div>
              <div className="ex-stat-lbl">{desc}</div>
            </div>
          ))}
        </div>

        <h3 className="ex-subhead">
          Setup — done <span className="em">once</span>
        </h3>
        <p className="impl-intro">
          Delphinium is already installed as an inherited app in your Canvas — enabling it account-wide
          takes about twenty minutes, once, and then you&apos;re finished.
        </p>
        <ol className="ex-steps keep">
          {SETUP_STEPS.map(step => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="impl-closing">
          That&apos;s it — every course is now ready for the moment a teacher decides to switch it on.
        </p>
        <a className="impl-detail-link" href={INSTALL_URL} target="_blank" rel="noopener noreferrer">
          View install details here &rarr;
        </a>

        <h3 className="ex-subhead">
          Teachers are ready in <span className="em">minutes</span>
        </h3>
        <p className="impl-intro">
          No changes to your courses, no new tool to learn. Courses can stay exactly as they are. Turn
          Delphinium on, answer a few quick questions, and it just works — fast!
        </p>
        <ul className="impl-list keep">
          {TEACHER_STEPS.map(step => (
            <li key={step}>{step}</li>
          ))}
        </ul>
        <a className="impl-detail-link" href={ENABLE_URL} target="_blank" rel="noopener noreferrer">
          View enabling Delphinium details here &rarr;
        </a>

        <h3 className="ex-subhead">
          One environment, <span className="em">one login</span>
        </h3>
        <p className="impl-intro">
          Delphinium lives inside the Canvas everyone is already familiar with, so there&apos;s no second
          system to run.
        </p>
        <ul className="impl-list">
          {LOGIN_POINTS.map(({ id, content }) => (
            <li key={id}>{content}</li>
          ))}
        </ul>
      </section>

      <section className="sheet support-sheet">
        <div className="page-label screen-only">{pageLabelB}</div>

        <div className="ex-kicker">
          <span className="ex-tick" />
          Support
        </div>
        <h2 className="ex-h support-title">
          <span className="em">Easy</span> to support
        </h2>
        <p className="ex-lead support-lead">
          Support is always there when you need it, and when a question does come up, the answer is usually
          already on the screen.
        </p>

        <div className="keep impl-flow support-flow">
          {FLOW_STEPS.flatMap((step, i, arr) => {
            const isLast = i === arr.length - 1;
            const stepEl = (
              <span
                key={step}
                className={`impl-flow-step${isLast ? ' impl-flow-step--active' : ''}`}
              >
                {step}
              </span>
            );
            return isLast
              ? [stepEl]
              : [stepEl, <span key={`${step}-arrow`} className="impl-flow-arrow">&rarr;</span>];
          })}
        </div>

        <h3 className="ex-subhead">
          From <span className="em">hands-on onboarding</span> to{' '}
          <span className="em">long-term support</span>
        </h3>
        <p className="impl-intro">
          Onboarding is a partnership that starts before we go live and stays until your team is running on
          its own.
        </p>
        <ol className="ex-steps keep">
          {ONBOARDING_STEPS.map(step => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <h3 className="ex-subhead">
          Support built <span className="em">right into Delphinium</span>
        </h3>
        <p className="impl-intro">
          The best support is the question that never has to be asked — so we put most answers one click
          away, right where teachers work.
        </p>
        <ul className="impl-list keep">
          {BUILT_IN_STEPS.map(step => (
            <li key={step}>{step}</li>
          ))}
        </ul>

        <div className="keep support-figure">
          <img
            src="/support-options.png?v=2"
            alt="Delphinium Support options including tutorials, community forum, support tickets, and message archives"
            className="support-figure-img"
          />
        </div>
      </section>
    </>
  );
}
