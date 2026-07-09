import CoverProductPage from './CoverProductPage.jsx';
import { selectedModules } from '../../lib/productCatalog.js';

export default function CoverProductSheetsSection({ quote, startPage, pad }) {
  const modules = selectedModules(quote);

  return (
    <>
      {modules.map((mod, index) => (
        <section
          key={mod.key}
          className={`sheet sheet-mint cover-section cover-product-sheet cover-product-sheet--${mod.key}`}
        >
          <div className="page-label screen-only page-label-mint">
            {pad(startPage + index)}
            {' '}
            ·
            {' '}
            {mod.name}
          </div>

          <CoverProductPage mod={mod} />
        </section>
      ))}
    </>
  );
}
