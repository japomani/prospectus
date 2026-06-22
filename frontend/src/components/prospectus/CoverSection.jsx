import { BookOpenCheck, BrainCircuit, Zap } from 'lucide-react';
import CoverProductPage from './CoverProductPage.jsx';
import CoverModuleIcon from './CoverModuleIcon.jsx';
import { Field } from './Field.jsx';
import { selectedAddons, selectedModules } from '../../lib/productCatalog.js';

const STORY_LEAD_K12 =
  'Delphinium transforms the Canvas courses schools already have into engaging experiences for students and early-warning systems for parents and teachers.';

const STORY_LEAD_UNIVERSITY =
  'Delphinium transforms the Canvas courses schools already have into engaging experiences for students and early-warning systems for teachers.';

function storyLeadForQuote(quote) {
  return quote?.isUniversity ? STORY_LEAD_UNIVERSITY : STORY_LEAD_K12;
}

const COVER_QUOTE = {
  text: '\u201cWe can confidently say that we\u2019re seeing better success with Delphinium\u2026 we improved significantly.\u201d',
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

export default function CoverSection({ fields, quote, pricing, highlightFields }) {
  const modules = selectedModules(quote);

  const years = Number(quote.years) || 1;
  const isMultiYear = years > 1;
  const hasSavings = Boolean(pricing && pricing.totalSavings > 0);

  const productPage = index => index + 2;
  const coverSheetCount = 1 + modules.length;
  const hasAddons = selectedAddons(quote).length > 0;
  const pricingPage = coverSheetCount + (hasAddons ? 4 : 3);

  return (
    <>
      <section className="sheet sheet-mint cover-section cover-page-1">
        <div className="page-label screen-only page-label-mint">01 · Cover</div>

        <div className="cover-intro">
          <div className="dRow cover-header-row">
            <img
              src="/logo.png"
              alt="Delphinium"
              className="cover-logo"
            />
            <div>
              <div className="cover-tagline-muted">Canvas delivers content.</div>
              <div className="cover-headline">
                Delphinium delivers <span className="dl-accent">ENGAGEMENT.</span>
              </div>
            </div>
          </div>

          <div className="cover-kicker">Prospectus prepared for</div>
          <div className="cover-school-name">
            <Field value={fields.SCHOOL_NAME} highlight={highlightFields} />
          </div>
          <p className="cover-story-lead">{storyLeadForQuote(quote)}</p>
        </div>

        <div className="keep cover-story">
          <div className="cover-story-grid">
            <div className="cover-stat-tower">
              <div className="cover-stat-num">31%</div>
              <div className="cover-stat-label">fewer failures</div>
              <div className="cover-stat-src">6,000 online students &bull; 72 classes</div>
            </div>
            <div className="cover-story-body">
              <blockquote className="cover-quote-block">
                <p className="cover-quote-tx">{COVER_QUOTE.text}</p>
                <div className="cover-quote-by">{COVER_QUOTE.attribution}</div>
              </blockquote>
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

        <div className="cover-package-head">
          What
          {' '}
          <Field value={fields.SCHOOL_NAME} highlight={highlightFields} />
          {' '}
          gets
        </div>

        <div className="keep cover-package">
          <div className="cover-index">
            {modules.map((mod, index) => (
              <div
                key={mod.key}
                className={`cover-index-row${mod.includedLabel ? ' cover-index-row--included' : ''}`}
                style={{ '--product-color': mod.color }}
              >
                <span className="cover-index-icon">
                  <CoverModuleIcon moduleKey={mod.key} color={mod.color} />
                </span>
                <div className="cover-index-text">
                  <div className="cover-index-name-row">
                    <span className="cover-index-name">{mod.name}</span>
                  </div>
                  {mod.summary && (
                    <div className="cover-index-desc">{mod.summary}</div>
                  )}
                </div>
                <span className="cover-index-page">{`p.${productPage(index)}`}</span>
              </div>
            ))}
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
                  value={isMultiYear ? fields.TOTAL_SAVINGS : fields.ANNUAL_SAVINGS}
                  highlight={highlightFields}
                />
                {isMultiYear ? (
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

            <span
              className={`cover-package-link${hasAddons ? ' cover-package-link--wrap' : ''}`}
            >
              {hasAddons
                ? `Full breakdown with add-ons on page. ${pricingPage}`
                : `Full breakdown on p.${pricingPage}`}
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
            {' '}
            <b>
              Pricing held until
              {' '}
              <Field value={fields.VALID_UNTIL} highlight={highlightFields} />
            </b>
            .
            {' '}
            Target go-live:
            {' '}
            <b>
              <Field value={fields.TARGET_GO_LIVE} highlight={highlightFields} />
            </b>
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

      {modules.map(mod => (
        <section
          key={mod.key}
          className="sheet sheet-mint cover-section cover-product-sheet"
        >
          <div className="page-label screen-only page-label-mint">01 · Cover (continued)</div>

          {mod.key === 'core' && (
            <div className="cover-package-head cover-product-sheet-head">
              What
              {' '}
              <Field value={fields.SCHOOL_NAME} highlight={highlightFields} />
              {' '}
              gets
            </div>
          )}

          <CoverProductPage mod={mod} />
        </section>
      ))}
    </>
  );
}
