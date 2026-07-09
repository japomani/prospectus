import CoverSection from './CoverSection.jsx';
import ExecutiveSummarySection from './ExecutiveSummarySection.jsx';
import OtherProductsSection from './OtherProductsSection.jsx';
import PricingValueSection from './PricingValueSection.jsx';
import SelectedAddOnsSection from './SelectedAddOnsSection.jsx';
import SecuritySection from './SecuritySection.jsx';
import ImplementationSection from './ImplementationSection.jsx';
import ResearchFoundationSection from './ResearchFoundationSection.jsx';
import AdminControlsSection from './AdminControlsSection.jsx';
import { Field } from './Field.jsx';
import {
  selectedAddons, selectedModules, unselectedAddons, unselectedModules,
} from '../../lib/productCatalog.js';

function otherProductsPageCount(quote) {
  const modules = unselectedModules(quote);
  const addons = unselectedAddons(quote);
  if (modules.length === 0 && addons.length === 0) return 0;
  return (addons.length > 0 ? 1 : 0) + modules.length;
}

function docPageLabels(quote) {
  const hasAddons = selectedAddons(quote).length > 0;
  const coverSheetCount = 1 + selectedModules(quote).length;
  let n = coverSheetCount + 1;
  const pages = {};
  if (hasAddons) {
    pages.addons = n;
    n += 1;
  }
  pages.executiveSummary = n;
  n += 1;
  pages.executiveSummaryB = n;
  n += 1;
  pages.executiveSummaryC = n;
  n += 1;
  pages.pricing = n;
  n += 1;
  pages.security = n;
  n += 1;
  pages.implementation = n;
  n += 1;
  pages.implementationB = n;
  n += 1;
  pages.researchFoundation = n;
  n += 1;
  if (quote.includeFreeTrialPage !== false) {
    pages.freeTrial = n;
    n += 1;
  }
  if (quote.includePilotPage) {
    pages.pilot = n;
    n += 1;
  }
  const otherCount = otherProductsPageCount(quote);
  if (otherCount > 0) {
    pages.otherProducts = n;
  }
  n += otherCount;
  pages.adminControls = n;
  n += 1;
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
                pageLabel={`${pad(pages.executiveSummary)} · The case for engagement`}
                pageLabelB={`${pad(pages.executiveSummaryB)} · Why it pays off`}
                pageLabelC={`${pad(pages.executiveSummaryC)} · Why it pays / trust`}
              />

              <PricingValueSection
                quote={quote}
                pricing={pricing}
                fields={f}
                highlightFields={hl}
                pageLabel={`${pad(pages.pricing)} · Pricing & value`}
              />

              <SecuritySection pageLabel={`${pad(pages.security)} · Security & privacy`} />

              <ImplementationSection
                pageLabel={`${pad(pages.implementation)} · Implementation`}
                pageLabelB={`${pad(pages.implementationB)} · Support`}
              />

              <ResearchFoundationSection pageLabel={`${pad(pages.researchFoundation)} · Research foundation`} />

              {quote.includeFreeTrialPage !== false && (
                <section className="sheet sheet-blue-fill">
                  <div className="page-label screen-only page-label-blue">
                    {pad(pages.freeTrial)}
                    {' '}
                    · Free trial
                  </div>
                  <div className="doc-kicker">Try Delphinium with no risk</div>
                  <h2 className="doc-h2" style={{ marginBottom: '18px' }}>See it in your own courses first</h2>
                  <div className="dCard keep" style={{ margin: '0 0 18px' }}>
                    <div className="doc-try-title">14-day free trial</div>
                    <p className="doc-lead" style={{ marginBottom: 0 }}>
                      Turn on the full Delphinium experience in your own Canvas courses for 14 days. Your
                      course gets the full makeover instantly, and your Control Tower fills in with real
                      student data from day one — so you&apos;re not imagining the difference, you&apos;re
                      watching it happen. No migration, no commitment — see it for yourself!
                    </p>
                  </div>
                  <div className="keep doc-try-chips" style={{ marginBottom: '18px' }}>
                    {[
                      'Works in your existing Canvas',
                      'No credit card required',
                      'Nothing new for teachers to learn',
                      'Turn it off anytime — your courses go right back to normal',
                    ].map(label => (
                      <div key={label} className="doc-try-chip">
                        <span className="doc-try-chip-check">✓</span>
                        {' '}
                        {label}
                      </div>
                    ))}
                  </div>
                  <p className="doc-body" style={{ fontWeight: 'bold' }}>
                    Ask your Delphinium contact to activate your free trial today.
                  </p>
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
                  <h2 className="doc-h2" style={{ marginBottom: '10px' }}>See it work before you scale it</h2>
                  <p className="doc-lead" style={{ marginBottom: '14px' }}>
                    In your guided pilot, we&apos;ll work with you to run Delphinium in real classes for a full
                    term — typically with
                    {' '}
                    <b>3–7 teachers</b>
                    {' '}
                    for
                    {' '}
                    <b>2–4 months</b>
                    .
                  </p>
                  <div className="keep doc-process-strip" style={{ marginBottom: '14px' }}>
                    {['Setup', 'Onboarding', 'Training', 'Support'].map((step, i, arr) => (
                      <span key={step} className="doc-process-step">
                        {step}
                        {i < arr.length - 1 && <span className="doc-process-arrow">&rarr;</span>}
                      </span>
                    ))}
                  </div>
                  <div className="doc-security-section-title">Run a full pilot, not just a preview</div>
                  <ol className="doc-security-list" style={{ marginBottom: '14px' }}>
                    <li>We guide you through install, configuration, and layout design until your pilot teachers know Delphinium inside out</li>
                    <li>We provide hands-on training to your pilot teachers over Zoom until they&apos;re proficient</li>
                    <li>Your pilot teachers become your champions — bringing real expertise and peer reinforcement into professional development and staff meetings as adoption spreads</li>
                    <li>Together we bring the rest of your staff up to speed with train-the-trainer support, self-paced lessons, and a community forum</li>
                    <li>We back your primary admin with dedicated ticket support, so you always have the answers you need</li>
                  </ol>
                  <p className="doc-body" style={{ fontWeight: 'bold', marginBottom: '14px' }}>
                    You&apos;ll see real engagement data build in your Control Tower the whole time — not a
                    simulation.
                  </p>
                  <div className="keep doc-panel-mint doc-golive">
                    <div className="doc-panel-label-muted">Guided pilot fee</div>
                    <div className="doc-body" style={{ fontSize: '14px', lineHeight: 1.55 }}>
                      <b><Field value={f.PILOT_FEE} highlight={hl} /></b>
                      {' '}
                      * (typically $5,000)
                    </div>
                    <p className="doc-caption" style={{ margin: '4px 0 0' }}>
                      * Pilot fees are credited toward your license — so the pilot ultimately costs nothing
                      when you move forward.
                    </p>
                  </div>
                </section>
              )}

              {pages.otherProducts && (
                <OtherProductsSection
                  quote={quote}
                  highlightFields={hl}
                  startPage={pages.otherProducts}
                  pad={pad}
                />
              )}

              <AdminControlsSection pageLabel={`${pad(pages.adminControls)} · Admin controls`} />

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
                      Start your 14-day free trial on your own courses — no migration, no commitment.
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
