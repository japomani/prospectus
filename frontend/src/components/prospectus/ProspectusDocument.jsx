import CoverSection from './CoverSection.jsx';
import ExecutiveSummarySection from './ExecutiveSummarySection.jsx';
import OtherProductsSection from './OtherProductsSection.jsx';
import PricingValueSection from './PricingValueSection.jsx';
import SelectedAddOnsSection from './SelectedAddOnsSection.jsx';
import { Field } from './Field.jsx';
import { selectedAddons, unselectedAddons, unselectedModules } from '../../lib/productCatalog.js';

function SecuritySection({ pageLabel }) {
  return (
    <section className="sheet">
      <div className="page-label screen-only">{pageLabel}</div>
      <div className="doc-kicker">Security &amp; privacy</div>
      <h2 className="doc-h2">SECURITY, PRIVACY, &amp; ACCESSIBILITY</h2>
      <p className="doc-lead-bold">Built for FERPA, hosted on AWS</p>
      <p className="doc-lead">Delphinium is a Canvas LTI 1.3 plugin running serverless on AWS.</p>

      <div className="dCard keep" style={{ margin: 0 }}>
        <div className="doc-security-section-title">Security</div>
        <ul className="doc-security-list">
          <li>
            Encrypted everywhere: AES-256 at rest plus S3 server-side encryption;
            HTTPS/TLS in transit; storage isolated from the public internet.
          </li>
          <li>
            Least-privilege access via AWS IAM with 2FA required; activity logged
            via CloudTrail.
          </li>
          <li>Encrypted, point-in-time backups and disaster recovery plan.</li>
          <li>
            Regular external penetration testing and continuous monitoring via AWS
            Security Hub and Snyk.
          </li>
          <li>
            Infrastructure compliance (SOC 2 / ISO 27001, physical security)
            inherited from AWS.
          </li>
          <li>Cyber-liability insurance in place ($1M per claim / $2M aggregate).</li>
        </ul>

        <div className="doc-security-section-title">Privacy</div>
        <ul className="doc-security-list">
          <li>All storage and processing in the United States.</li>
          <li>Student data is never sold or shared with third parties.</li>
        </ul>

        <div className="doc-security-section-title">Accessibility</div>
        <ul className="doc-security-list">
          <li>Published VPAT.</li>
        </ul>
        <a
          className="doc-link"
          href="https://tutorials.delphi-me.com/deep_dive/admin/compliance"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', marginTop: 10 }}
        >
          Click here to view all compliance documents
        </a>
      </div>
    </section>
  );
}

function otherProductsPageCount(quote) {
  const modules = unselectedModules(quote);
  const addons = unselectedAddons(quote);
  if (modules.length === 0 && addons.length === 0) return 0;
  return (addons.length > 0 ? 1 : 0) + modules.length;
}

function docPageLabels(quote) {
  const hasAddons = selectedAddons(quote).length > 0;
  let n = 2;
  const pages = {};
  if (hasAddons) {
    pages.addons = n;
    n += 1;
  }
  pages.executiveSummary = n;
  n += 1;
  pages.executiveSummaryB = n;
  n += 1;
  pages.pricing = n;
  n += 1;
  if (quote.includeFreeTrialPage !== false) {
    pages.freeTrial = n;
    n += 1;
  }
  if (quote.includePilotPage) {
    pages.pilot = n;
    n += 1;
  }
  pages.security = n;
  n += 1;
  pages.implementation = n;
  n += 1;
  const otherCount = otherProductsPageCount(quote);
  if (otherCount > 0) {
    pages.otherProducts = n;
  }
  n += otherCount;
  pages.pathForward = n;
  return pages;
}

export default function ProspectusDocument({ fields, quote, pricing, highlightFields }) {
  const f = fields;
  const hl = highlightFields;
  const pages = docPageLabels(quote);
  const pad = n => String(n).padStart(2, '0');

  return (
    <main className={`doc${hl ? '' : ' nofld'}`}>
      <table className="doc-frame" role="presentation">
        <thead><tr><td className="hdr-space" /></tr></thead>
        <tbody>
          <tr>
            <td>
              <CoverSection fields={f} quote={quote} pricing={pricing} highlightFields={hl} />

              {pages.addons && (
                <SelectedAddOnsSection
                  quote={quote}
                  highlightFields={hl}
                  pageLabel={`${pad(pages.addons)} · Add-ons`}
                />
              )}

              <ExecutiveSummarySection
                fields={f}
                quote={quote}
                highlightFields={hl}
                pageLabel={`${pad(pages.executiveSummary)} · The reason to buy`}
                pageLabelB={`${pad(pages.executiveSummaryB)} · The reason to buy`}
              />

              <PricingValueSection
                quote={quote}
                pricing={pricing}
                fields={f}
                highlightFields={hl}
                pageLabel={`${pad(pages.pricing)} · Pricing & value`}
              />

              {quote.includeFreeTrialPage !== false && (
                <section className="sheet sheet-blue-fill">
                  <div className="page-label screen-only page-label-blue">
                    {pad(pages.freeTrial)}
                    {' '}
                    · Free trial
                  </div>
                  <div className="doc-kicker">Try it with low risk</div>
                  <h2 className="doc-h2" style={{ marginBottom: '18px' }}>See it on your own courses first</h2>
                  <div className="dCard keep" style={{ margin: '0 0 18px' }}>
                    <div className="doc-try-title">30-day free trial</div>
                    <p className="doc-lead" style={{ marginBottom: 0 }}>
                      Turn on the full Delphinium experience in your own Canvas courses for 30 days. No migration, no commitment — see the before-and-after for yourself before you decide.
                    </p>
                  </div>
                  <div className="keep doc-try-chips">
                    {['Works in your existing Canvas', 'No credit card required', 'Nothing new for teachers to learn'].map(label => (
                      <div key={label} className="doc-try-chip">
                        <span className="doc-try-chip-check">✓</span>
                        {' '}
                        {label}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {quote.includePilotPage && (
                <section className="sheet sheet-blue-fill">
                  <div className="page-label screen-only page-label-blue">
                    {pad(pages.pilot)}
                    {' '}
                    · Guided pilot
                  </div>
                  <div className="doc-kicker">Guided pilot</div>
                  <h2 className="doc-h2" style={{ marginBottom: '18px' }}>Structured evaluation across live courses</h2>
                  <div className="dCard keep" style={{ margin: 0 }}>
                    <div className="doc-try-title">Guided pilot</div>
                    <p className="doc-body" style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>
                      A guided pilot is available for
                      {' '}
                      <Field value={f.PILOT_FEE} highlight={hl} />
                      {' '}
                      (typically $5,000): we set up your templates, train your teachers, and run Delphinium across live courses. If you move to a full agreement, the entire pilot fee is credited toward your license.
                    </p>
                    <p className="doc-caption" style={{ margin: 0 }}>
                      References from
                      {' '}
                      <Field value={f.PEER_REFERENCE} highlight={hl} />
                      {' '}
                      available on request.
                    </p>
                  </div>
                </section>
              )}

              <SecuritySection pageLabel={`${pad(pages.security)} · Security & privacy`} />

              <section className="sheet">
                <div className="page-label screen-only">
                  {pad(pages.implementation)}
                  {' '}
                  · Implementation &amp; onboarding
                </div>
                <div className="doc-kicker">Implementation &amp; onboarding</div>
                <h2 className="doc-h2" style={{ marginBottom: '8px' }}>Live in 3 minutes per course</h2>
                <p className="doc-lead" style={{ marginBottom: '18px' }}>
                  Nothing new for teachers to learn — they keep using Canvas as they do today, and Delphinium reflects whatever they build. About 45 seconds by the second course.
                </p>
                <div className="keep doc-grid-2" style={{ marginBottom: '16px' }}>
                  {[
                    ['Year-1 setup', 'We configure Delphinium and build your school\'s layout and message templates.'],
                    ['4 live teacher trainings', 'We walk your teachers through setup and best practices over four sessions.'],
                    ['View customization', 'We tailor the default 3-minute experience to your school\'s look and priorities.'],
                    ['Support Center', 'H5P video lessons, an active community, and in-app "Learn More" guidance everywhere.'],
                  ].map(([title, body], i) => (
                    <div key={title} className="dCard" style={{ margin: 0 }}>
                      <div className="doc-step-num">{i + 1}</div>
                      <div className="doc-step-title">{title}</div>
                      <div className="doc-step-body">{body}</div>
                    </div>
                  ))}
                </div>
                <div className="keep doc-panel-mint doc-golive">
                  <div className="doc-panel-label-muted">Target go-live</div>
                  <div className="doc-body" style={{ fontSize: '14px', lineHeight: 1.55 }}>
                    <b><Field value={f.TARGET_GO_LIVE} highlight={hl} /></b>
                    . We recommend going live before a term starts so students meet the new experience on
                    day one.
                  </div>
                </div>
              </section>

              {pages.otherProducts && (
                <OtherProductsSection
                  quote={quote}
                  highlightFields={hl}
                  startPage={pages.otherProducts}
                  pad={pad}
                />
              )}

              <section className="sheet sheet-dark sheet-indigo cover-section">
                <div className="page-label screen-only page-label-indigo">
                  {pad(pages.pathForward)}
                  {' '}
                  · The path forward
                </div>
                <div className="cover-kicker">The path forward</div>
                <h2 className="doc-closing-h2">
                  {(quote.includeFreeTrialPage !== false && quote.includePilotPage)
                    ? 'Three ways to start'
                    : (quote.includeFreeTrialPage !== false || quote.includePilotPage)
                      ? 'Two ways to start'
                      : 'Next step'}
                </h2>
                <div className="keep doc-closing-card">
                  {quote.includeFreeTrialPage !== false && (
                    <div className="doc-closing-step">
                      <b className="doc-closing-step-num">1.</b>
                      {' '}
                      Start your 30-day free trial on your own courses — no migration, no commitment.
                    </div>
                  )}
                  {quote.includePilotPage && (
                    <div className="doc-closing-step">
                      <b className="doc-closing-step-num">
                        {quote.includeFreeTrialPage !== false ? '2.' : '1.'}
                      </b>
                      {' '}
                      Book a guided pilot (
                      <Field value={f.PILOT_FEE} highlight={hl} />
                      ) — templates, training, and live courses; credited toward your license if you proceed.
                    </div>
                  )}
                  <div className="doc-closing-step">
                    <b className="doc-closing-step-num">
                      {(quote.includeFreeTrialPage !== false ? 1 : 0) + (quote.includePilotPage ? 1 : 0) + 1}
                      .
                    </b>
                    {' '}
                    Book a 30-minute working session:
                    {' '}
                    <span className="doc-link">delphi-me.com/meetings/jared381/educate</span>
                  </div>
                </div>
                <div className="keep doc-closing-footer">
                  <div className="doc-logo-wrap">
                    <img src="/logo.png" alt="Delphinium" style={{ height: '40px', width: 'auto', display: 'block' }} />
                  </div>
                  <div>
                    <div className="doc-closing-name">
                      <Field value={f.PREPARED_BY_NAME} highlight={hl} />
                    </div>
                    <div className="doc-closing-title">
                      <Field value={f.PREPARED_BY_TITLE} highlight={hl} />
                      , Delphinium · delphi-me.com
                    </div>
                  </div>
                </div>
              </section>
            </td>
          </tr>
        </tbody>
        <tfoot><tr><td className="ftr-space" /></tr></tfoot>
      </table>

      <div className="running-ftr">
        <span>Delphinium · Engagement for Canvas</span>
        <span>
          Prepared for
          {' '}
          <Field value={f.SCHOOL_NAME} highlight={false} />
          {' '}
          · Confidential
        </span>
      </div>
    </main>
  );
}
