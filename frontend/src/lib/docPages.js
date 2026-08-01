import { selectedAddons, selectedModules, unselectedAddons, unselectedModules } from './productCatalog.js';

function otherProductsPageCount(quote) {
  const modules = unselectedModules(quote);
  const addons = unselectedAddons(quote);
  if (modules.length === 0 && addons.length === 0) return 0;
  return (addons.length > 0 ? 1 : 0) + modules.length;
}

/** 1-based prospectus page numbers for each section (cover is page 1). */
export function docPageLabels(quote) {
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

  if (hasAddons) {
    pages.addons = n;
    n += 1;
  }

  pages.pricing = n;
  n += 1;

  pages.adminControls = n;
  n += 1;

  pages.security = n;
  n += 1;
  pages.implementation = n;
  n += 1;
  pages.implementationB = n;
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

  // Research/citations always last so "See last page for research details" stays accurate.
  pages.research = n;

  return pages;
}

export function prospectusPageId(pageNumber) {
  return `prospectus-p-${pageNumber}`;
}
