import CoverProductPage from './CoverProductPage.jsx';
import { prospectusPageId } from '../../lib/docPages.js';
import { selectedModules } from '../../lib/productCatalog.js';

export default function CoverProductSheetsSection({ quote, startPage, pad }) {
  const modules = selectedModules(quote);
  const isUniversity = Boolean(quote?.isUniversity);

  return (
    <>
      {modules.map((mod, index) => {
        const pageNum = startPage + index;
        return (
          <section
            key={mod.key}
            id={prospectusPageId(pageNum)}
            className={`sheet sheet-mint cover-section cover-product-sheet cover-product-sheet--${mod.key}`}
          >
            <div className="page-label screen-only page-label-mint">
              {pad(pageNum)}
              {' '}
              ·
              {' '}
              {mod.name}
            </div>

            <CoverProductPage mod={mod} isUniversity={isUniversity} />
          </section>
        );
      })}
    </>
  );
}
