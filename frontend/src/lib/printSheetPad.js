/** Letter page height in CSS px (matches @page size: letter). */
function letterPageHeightPx() {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:absolute;left:-9999px;top:0;height:11in;width:0;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  const h = probe.offsetHeight;
  probe.remove();
  return h || 1056;
}

function isFixedCoverSheet(sheet) {
  return (
    sheet.classList.contains('cover-section')
    && !sheet.classList.contains('cover-product-sheet')
    && !sheet.classList.contains('other-products-section')
  );
}

function removeFillers(sheet) {
  sheet.querySelectorAll(':scope > .sheet-print-filler').forEach((el) => el.remove());
  sheet.style.removeProperty('padding-bottom');
  delete sheet.dataset.printPadBottom;
}

/**
 * Only pad sheets that are shorter than one letter page.
 * Never pad multi-page sheets — scrollHeight ignores forced breaks from
 * `keep` / break-inside:avoid, and padding those invents blank pages
 * (seen after pricing, EB, and research).
 */
export function padSheetsToPageMultiple() {
  const pageH = letterPageHeightPx();

  document.querySelectorAll('.sheet').forEach((sheet) => {
    if (isFixedCoverSheet(sheet)) return;
    if (sheet.classList.contains('sheet-pricing')) return;
    if (sheet.classList.contains('research-sheet')) return;
    if (sheet.querySelector('.eb-page2, [class*="-page2"]')) return;
    if (sheet.querySelector('.keep, [style*="break-inside"]')) {
      // Sheets with keep-together blocks: height ≠ printed page count
      // Only safe to pad when clearly under one page (handled below).
    }

    removeFillers(sheet);
    void sheet.offsetHeight;

    const height = Math.max(sheet.scrollHeight, sheet.getBoundingClientRect().height);
    if (height <= 0) return;

    // Multi-page (or anything over one letter page): do not pad
    if (height > pageH + 2) return;

    // Shorter than one page: grow to fill the letter page with sheet tint
    appendFiller(sheet, pageH - height);
  });
}

function appendFiller(sheet, deficitPx) {
  if (deficitPx <= 1) return;
  const filler = document.createElement('div');
  filler.className = 'sheet-print-filler';
  filler.setAttribute('aria-hidden', 'true');
  filler.style.cssText = [
    'display:block',
    `height:${Math.ceil(deficitPx)}px`,
    'width:100%',
    'margin:0',
    'padding:0',
    'border:0',
    'pointer-events:none',
  ].join(';');
  sheet.appendChild(filler);
  sheet.dataset.printPadBottom = '1';
}

export function clearSheetPrintPads() {
  document.querySelectorAll('.sheet[data-print-pad-bottom], .sheet:has(> .sheet-print-filler)').forEach((sheet) => {
    removeFillers(sheet);
  });
  document.querySelectorAll('.sheet-print-filler').forEach((el) => el.remove());
}
