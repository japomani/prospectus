import AdminControlsSection from './AdminControlsSection.jsx';
import CoverProductSheetsSection from './CoverProductSheetsSection.jsx';
import CoverSection from './CoverSection.jsx';
import ExecutiveSummarySection from './ExecutiveSummarySection.jsx';
import FreeTrialSection from './FreeTrialSection.jsx';
import ImplementationSection from './ImplementationSection.jsx';
import OtherProductsSection from './OtherProductsSection.jsx';
import PilotSection from './PilotSection.jsx';
import PricingValueSection from './PricingValueSection.jsx';
import ResearchFoundationSection from './ResearchFoundationSection.jsx';
import SecuritySection from './SecuritySection.jsx';
import SelectedAddOnsSection from './SelectedAddOnsSection.jsx';
import { Field } from './Field.jsx';
import { docPageLabels, prospectusPageId } from '../../lib/docPages.js';

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

              <ExecutiveSummarySection
                fields={f}
                quote={quote}
                highlightFields={hl}
                pageLabel={`${pad(pages.executiveSummary)} · The case for engagement`}
                pageLabelB={`${pad(pages.executiveSummaryB)} · Turn data into action`}
                pageLabelC={`${pad(pages.executiveSummaryC)} · Make Canvas work harder`}
              />

              <CoverProductSheetsSection
                quote={quote}
                startPage={pages.productSheets}
                pad={pad}
              />

              {pages.addons && (
                <SelectedAddOnsSection
                  quote={quote}
                  pageLabel={`${pad(pages.addons)} · Add-ons`}
                />
              )}

              <PricingValueSection
                id={prospectusPageId(pages.pricing)}
                quote={quote}
                pricing={pricing}
                fields={f}
                highlightFields={hl}
                pageLabel={`${pad(pages.pricing)} · Pricing & value`}
              />

              <AdminControlsSection pageLabel={`${pad(pages.adminControls)} · Admin controls`} />

              <SecuritySection pageLabel={`${pad(pages.security)} · Security & privacy`} />

              <ImplementationSection
                pageLabel={`${pad(pages.implementation)} · Implementation`}
                pageLabelB={`${pad(pages.implementationB)} · Support`}
              />

              {quote.includeFreeTrialPage && (
                <FreeTrialSection pageLabel={`${pad(pages.freeTrial)} · Free trial`} />
              )}

              {quote.includePilotPage && (
                <PilotSection
                  pageLabel={`${pad(pages.pilot)} · Guided pilot`}
                  fields={f}
                  highlightFields={hl}
                />
              )}

              {pages.otherProducts && (
                <OtherProductsSection
                  quote={quote}
                  highlightFields={hl}
                  startPage={pages.otherProducts}
                  pad={pad}
                />
              )}

              <ResearchFoundationSection pageLabel={`${pad(pages.research)} · Research foundation`} />
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
