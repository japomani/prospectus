import { BookOpenCheck, BrainCircuit, Zap } from 'lucide-react';
import CoverModuleIcon from './CoverModuleIcon.jsx';
import { Field } from './Field.jsx';
import { docPageLabels } from '../../lib/docPages.js';
import { PROOF_HIGHER_ED, PROOF_K12 } from '../../lib/proofStats.js';
import { selectedModules } from '../../lib/productCatalog.js';

function storyLeadForQuote(quote) {
  const isUniversity = Boolean(quote?.isUniversity);
  return (
    <>
      Delphinium transforms your existing Canvas courses into{' '}
      <b>engaging</b>
      {' '}
      student experiences, and an{' '}
      <b>early-warning</b>
      {' '}
      system
      {' '}
      {isUniversity ? 'for teachers.' : 'for parents and teachers.'}
    </>
  );
}

const COVER_QUOTE = {
  text: '\u201cWe can confidently say that we\u2019re seeing better success with Delphinium \u2014 look at our data there and see that we improved significantly.\u201d',
  attribution: '\u2014 Ryan Hansen, Digital Learning Director, Davis School District',
};

const TRUST_BADGES = [
  {
    key: 'science',
    Icon: BrainCircuit,
    label: 'Built on science',
    sub: '14 years of published behavioral research',
  },
  {
    key: 'setup',
    Icon: Zap,
    label: 'Lightning fast setup',
    sub: 'Transform your class instantly \u2014 just turn Delphinium on',
  },
  {
    key: 'curve',
    Icon: BookOpenCheck,
    label: 'Zero learning curve',
    sub: 'Teachers keep using Canvas exactly as before',
  },
];

const COVER_PRODUCT_COLORS = {
  core: 'var(--dl-green)',
  cb: 'var(--dl-blue)',
  eb: 'var(--dl-indigo)',
};

function coverProductColor(mod) {
  return COVER_PRODUCT_COLORS[mod.key] || mod.color;
}

export default function CoverSection({ fields, quote, pricing, highlightFields }) {
  const modules = selectedModules(quote);
  const pages = docPageLabels(quote);
  const isUniversity = Boolean(quote?.isUniversity);

  const years = Number(quote.years) || 1;
  const isMultiYear = years > 1;
  // Prefer term savings for multi-year; else annual (volume / multi-product / etc.).
  // Do not gate on totalSavings alone — one-time deal charges can zero it out.
  const showTermSavings = Boolean(isMultiYear && pricing && pricing.totalSavings > 0);
  const showAnnualSavings = Boolean(
    !showTermSavings && pricing && pricing.annualSavings > 0,
  );
  const hasSavings = showTermSavings || showAnnualSavings;

  const productPage = index => pages.productSheets + index;
  const pricingPage = pages.pricing;
  const proof = isUniversity ? PROOF_HIGHER_ED : PROOF_K12;

  return (
    <>
      <section className="sheet sheet-mint cover-section cover-page-1">
        <div className="page-label screen-only page-label-mint">01 · Cover</div>

        <div className="cover-intro">
          <div className="dRow cover-header-row">
            <div style={{ flex: 1 }}>
              <div className="cover-tagline-muted">Canvas delivers content.</div>
              <div className="cover-headline">
                Delphinium delivers <span className="dl-accent">ENGAGEMENT!</span>
              </div>
            </div>
            <img
              src="/logo.png"
              alt="Delphinium"
              className="cover-logo"
            />
          </div>

          <div className="ex-kicker cover-intro-kicker">
            <span className="ex-tick" />
            Prospectus prepared for
          </div>
          <div className="cover-school-name">
            <Field value={fields.SCHOOL_NAME} highlight={highlightFields} />
          </div>
          <p className="cover-story-lead">{storyLeadForQuote(quote)}</p>
        </div>

        <div className="keep cover-story">
          <div className="cover-story-grid">
            <div className="cover-stat-tower">
              <div className="cover-stat-num">
                {proof.num}
                {isUniversity && <sup className="cover-stat-asterisk">*</sup>}
              </div>
              <div className="cover-stat-label">{proof.label}</div>
              <div className="cover-stat-src">{proof.src}</div>
            </div>
            <div className="cover-story-body">
              {isUniversity ? (
                <div className="cover-quote-block cover-he-proof">
                  <ul className="cover-he-outcomes">
                    {PROOF_HIGHER_ED.outcomes.map(row => (
                      <li key={row.label}>
                        <span className="cover-he-outcomes-pct">{row.pct}</span>
                        <span>{row.label}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="cover-he-proof-note">
                    <span className="cover-he-proof-note-star">*</span> See last page for research details
                  </div>
                </div>
              ) : (
                <blockquote className="cover-quote-block">
                  <p className="cover-quote-tx">{COVER_QUOTE.text}</p>
                  <div className="cover-quote-by">{COVER_QUOTE.attribution}</div>
                </blockquote>
              )}
            </div>
          </div>
        </div>

        <div className="cover-trust-cards">
          {TRUST_BADGES.map(({ key, Icon, label, sub }) => (
            <div key={key} className="cover-trust-card">
              <span className="cover-trust-ic">
                <Icon size={14} color="var(--dl-indigo)" strokeWidth={2.2} />
              </span>
              <div className="cover-trust-tx">
                {label}
                <span>{sub}</span>
              </div>
            </div>
          ))}
        </div>

        <h3 className="ex-subhead is-top keep">
          What
          {' '}
          <Field value={fields.SCHOOL_NAME} highlight={highlightFields} />
          {' '}
          gets…
        </h3>

        <div className="keep cover-package">
          <div className="cover-index">
            {modules.map((mod, index) => {
              const productColor = coverProductColor(mod);
              const pageNum = productPage(index);
              return (
              <div
                key={mod.key}
                className={`cover-index-row${mod.key === 'core' ? ' cover-index-row--core' : ''}`}
                style={{ '--product-color': productColor }}
              >
                <span className="cover-index-icon">
                  <CoverModuleIcon moduleKey={mod.key} color={productColor} />
                </span>
                <div className="cover-index-text">
                  <div className="cover-index-name-row">
                    <span className="cover-index-name">{mod.name}</span>
                    {mod.includedLabel && (
                      <span className="cover-index-tag">{mod.includedLabel}</span>
                    )}
                  </div>
                  {mod.summary && (
                    <div className="cover-index-desc">{mod.summary}</div>
                  )}
                </div>
                <span className="cover-index-page">
                  {`p.${pageNum}`}
                </span>
              </div>
              );
            })}
          </div>

          <div className="cover-package-price">
            <div>
              <div className="cover-package-price-label">Your investment</div>
              <div className="cover-package-price-amt">
                <Field value={fields.ANNUAL_PRICE} highlight={highlightFields} />
                <small> / year</small>
              </div>
            </div>

            {hasSavings && (
              <span className="cover-package-save">
                Save
                {' '}
                <Field
                  value={showTermSavings ? fields.TOTAL_SAVINGS : fields.ANNUAL_SAVINGS}
                  highlight={highlightFields}
                />
                {showTermSavings ? (
                  <>
                    {' '}
                    over
                    {' '}
                    <Field value={fields.TERM_YEARS} highlight={highlightFields} />
                  </>
                ) : (
                  ' / yr'
                )}
              </span>
            )}

            <span className="cover-price-breakdown">
              {`See total pricing on p.${pricingPage}`}
            </span>
          </div>

          <div className="cover-package-meta">
            <span className="cover-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dl-indigo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="cover-meta-item-tx">
                Pricing held until
                {' '}
                <b><Field value={fields.VALID_UNTIL} highlight={highlightFields} /></b>
              </span>
            </span>
            <span className="cover-meta-divider" aria-hidden="true" />
            <span className="cover-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dl-indigo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span className="cover-meta-item-tx">
                Go-live Target:
                {' '}
                <b><Field value={fields.TARGET_GO_LIVE} highlight={highlightFields} /></b>
              </span>
            </span>
          </div>
        </div>

        <div className="cover-page-footer">
          <div className="cover-footer">
            Prepared by
            {' '}
            <b>
              <Field value={fields.PREPARED_BY_NAME} highlight={highlightFields} />
            </b>
            ,
            {' '}
            <Field value={fields.PREPARED_BY_TITLE} highlight={highlightFields} />
            , Delphinium, on
            {' '}
            <Field value={fields.PREPARED_DATE} highlight={highlightFields} />
            .
          </div>

          <div className="cover-footnote">
            This proposal is confidential and prepared exclusively for
            {' '}
            <Field value={fields.SCHOOL_NAME} highlight={highlightFields} />
            . The pricing and terms within apply only to
            {' '}
            <Field value={fields.SCHOOL_NAME} highlight={highlightFields} />
            {' '}
            and are not to be shared outside your organization.
          </div>
        </div>
      </section>
    </>
  );
}
