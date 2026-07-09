const BADGES = [
  'FERPA-aligned',
  'HECVAT available',
  'Signs your DPA',
  'US-hosted on AWS',
  'Canvas LTI 1.3',
  'WCAG 2.0 AA / Section 508',
];

const SECTIONS = [
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
    title: 'AI',
    items: [
      'AI assists drafting only: it composes message text and images from teacher prompts — you review and send, nothing goes out on its own.',
      'System never sends student data to the AI service.',
      'AI runs on Amazon Bedrock under an AWS enterprise agreement — not a consumer AI account — and prompts are never used to train models.',
      'AI features are available to staff only — students have no access to them.',
      'AI features are optional.',
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
  'Penetration-test summary',
  'Privacy policy',
];

export default function SecuritySection({ pageLabel }) {
  return (
    <section className="sheet">
      <div className="page-label screen-only">{pageLabel}</div>
      <div className="doc-kicker">Security &amp; privacy</div>
      <h2 className="doc-h2" style={{ marginBottom: '8px' }}>FERPA-aligned, HECVAT-ready, independently tested</h2>
      <p className="doc-lead" style={{ marginBottom: '12px' }}>
        Delphinium is a Canvas LTI 1.3 plugin running on AWS services, with student data encrypted end to end
        and stored entirely in the United States.
      </p>

      <div className="keep security-badges">
        {BADGES.map(badge => (
          <span key={badge} className="security-badge">{badge}</span>
        ))}
      </div>

      <div className="keep security-grid">
        {SECTIONS.map(section => (
          <div key={section.title} className="dCard security-card">
            <div className="doc-security-section-title">{section.title}</div>
            <ul className="security-list">
              {section.items.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="keep security-evidence">
        <div className="security-evidence-title">Documentation available for your review</div>
        <div className="security-evidence-items">{EVIDENCE_ITEMS.join(' · ')}</div>
        <a
          className="doc-link"
          href="https://tutorials.delphi-me.com/deep_dive/admin/compliance"
          target="_blank"
          rel="noopener noreferrer"
        >
          Click here to view all compliance documents
        </a>
      </div>
    </section>
  );
}
