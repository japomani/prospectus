const COMPLIANCE_URL = 'https://tutorials.delphi-me.com/deep_dive/admin/compliance';

const BADGES = [
  'FERPA',
  'HECVAT available',
  'US-hosted on AWS',
  'Canvas LTI 1.3',
  'WCAG 2.0 AA / Sec 508',
];

const LEFT_SECTIONS = [
  {
    title: 'Security',
    items: [
      'Authenticated through Canvas via LTI 1.3 — no separate Delphinium logins or passwords to manage. Access tokens expire hourly, renew over OAuth, and can be revoked by any admin, teacher, or student from Canvas at any time.',
      'Encrypted everywhere: AES-256 at rest plus S3 server-side encryption; HTTPS/TLS in transit; storage isolated from the public internet.',
      'Least-privilege access via AWS IAM with 2FA required; activity logged via CloudTrail.',
      'Regular external penetration testing and continuous monitoring via AWS Security Hub and Snyk.',
      'Cyber-liability insurance in place to cover the unlikely event of a breach.',
    ],
  },
  {
    title: 'Privacy & your data',
    items: [
      'All storage and processing in the United States.',
      'Student data is never sold, and never used for advertising.',
      'Canvas enforces exactly which API endpoints Delphinium can reach — a fixed, published scope list — and we intentionally request only the data needed to run the service.',
      'You own your data. Export or deletion is available on request, with full deletion at the end of the contract.',
      'Data is retained only as long as needed to provide the service.',
    ],
  },
];

const RIGHT_SECTIONS = [
  {
    title: 'AI',
    items: [
      'AI assists drafting only: It composes message text and images from teacher prompts — you review and send, nothing goes out on its own.',
      'System never sends student data to the AI service.',
      'AI runs on Amazon Bedrock under an AWS enterprise agreement — not a consumer AI account — and prompts are never used to train models.',
      'AI features are available to staff only — students have no access to them.',
      'AI features are optional.',
    ],
  },
  {
    title: 'Reliability & incident response',
    items: [
      'Encrypted, point-in-time backups with a documented disaster-recovery plan.',
      'Documented incident-response process with prompt breach notification to affected districts.',
      'Serverless AWS architecture scales automatically and removes single points of failure.',
    ],
  },
];

const EVIDENCE_ITEMS = [
  'Completed HECVAT',
  'Data scopes',
  'VPAT (accessibility)',
  'Privacy policy',
  'Penetration-test summary',
];

function CheckIcon() {
  return (
    <svg className="security-pill-icon" viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="6" fill="currentColor" />
      <path
        d="M3.5 6.1 5.2 7.8 8.6 4.4"
        fill="none"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SecurityBlock({ title, items, isFirst }) {
  return (
    <div className={`security-block${isFirst ? ' security-block--first' : ''}`}>
      <h3 className="ex-subhead is-top">{title}</h3>
      <ul className="doc-security-list">
        {items.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

export default function SecuritySection({ pageLabel }) {
  return (
    <section className="sheet security-sheet">
      <div className="page-label screen-only">{pageLabel}</div>

      <div className="ex-kicker">
        <span className="ex-tick" />
        Security &amp; privacy
      </div>
      <h2 className="ex-h security-title">FERPA-aligned, HECVAT-ready, independently tested</h2>
      <p className="ex-lead security-lead">
        Delphinium is a Canvas LTI 1.3 plugin running on AWS services, with student data encrypted end-to-end
        and stored entirely in the United States.
      </p>

      <div className="keep security-pills">
        {BADGES.map(badge => (
          <span key={badge} className="security-pill">
            <CheckIcon />
            {badge}
          </span>
        ))}
      </div>

      <div className="keep security-columns">
        <div className="security-column">
          {LEFT_SECTIONS.map((section, index) => (
            <SecurityBlock key={section.title} {...section} isFirst={index === 0} />
          ))}
        </div>
        <div className="security-column">
          {RIGHT_SECTIONS.map((section, index) => (
            <SecurityBlock key={section.title} {...section} isFirst={index === 0} />
          ))}
          <div className="keep security-docs">
            <h3 className="ex-subhead is-top">Compliance Documentation</h3>
            <ul className="doc-security-list security-docs-list">
              {EVIDENCE_ITEMS.map(item => (
                <li key={item}>
                  <a
                    className="security-doc-link"
                    href={COMPLIANCE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <a
              className="security-docs-all"
              href={COMPLIANCE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              View all compliance documents &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
