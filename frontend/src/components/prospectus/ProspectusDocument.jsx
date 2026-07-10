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
import { selectedAddons, selectedModules, unselectedAddons, unselectedModules } from '../../lib/productCatalog.js';

function otherProductsPageCount(quote) {
  const modules = unselectedModules(quote);
  const addons = unselectedAddons(quote);
  if (modules.length === 0 && addons.length === 0) return 0;
  return (addons.length > 0 ? 1 : 0) + modules.length;
}

function docPageLabels(quote) {
  const hasAddons = selectedAddons(quote).length > 0;
  const moduleCount = selectedModules(quote).length;
  let n = 2;
  const pages = {};

  pages.executiveSummary = n;
  n += 1;
  pages.executiveSummaryB = n;
  n += 1;
  pages.executiveSummaryC = n;
  n += 1;

  pages.productSheets = n;
  n += moduleCount;

  pages.adminControls = n;
  n += 1;

  if (hasAddons) {
    pages.addons = n;
    n += 1;
  }

  pages.pricing = n;
  n += 1;
  pages.security = n;
  n += 1;
  pages.implementation = n;
  n += 1;
  pages.implementationB = n;
  n += 1;
  pages.research = n;
  n += 1;

  if (quote.includeFreeTrialPage) {
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
    n += otherCount;
  }

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

              <AdminControlsSection pageLabel={`${pad(pages.adminControls)} · Admin controls`} />

              {pages.addons && (
                <SelectedAddOnsSection
                  quote={quote}
                  pageLabel={`${pad(pages.addons)} · Add-ons`}
                />
              )}

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

              <ResearchFoundationSection pageLabel={`${pad(pages.research)} · Research foundation`} />

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
