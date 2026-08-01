import { unselectedAddons, unselectedModules } from '../../lib/productCatalog.js';
import AddonProductCard from './AddonProductCard.jsx';
import CoverProductPage from './CoverProductPage.jsx';

function AddonsLandingHeading() {
  return (
    <>
      <div className="ex-kicker">
        <span className="ex-tick" />
        <span className="other-products-kicker-label">Optional add-ons</span>
      </div>
      <h2 className="ex-h">Add more reach to your Delphinium</h2>
    </>
  );
}

export default function OtherProductsSection({ quote, startPage = 1, pad = n => String(n).padStart(2, '0') }) {
  const isUniversity = Boolean(quote?.isUniversity);
  const modules = unselectedModules(quote);
  const addons = unselectedAddons(quote);
  if (modules.length === 0 && addons.length === 0) return null;

  const moduleStartPage = startPage + (addons.length > 0 ? 1 : 0);
  const moduleSheetClass = 'sheet sheet-mint cover-section cover-product-sheet other-products-section';

  return (
    <>
      {addons.length > 0 && (
        <section className="sheet other-products-section" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="page-label screen-only">
            {pad(startPage)}
            {' '}
            · Other products
          </div>
          <AddonsLandingHeading />
          <div className={`addon-cards-grid${addons.length === 1 ? ' addon-cards-grid--single' : ''}`}>
            {addons.map(addon => (
              <AddonProductCard
                key={addon.key}
                addon={addon}
                isUniversity={isUniversity}
              />
            ))}
          </div>
        </section>
      )}

      {modules.map((mod, index) => {
        const labelPage = moduleStartPage + index;

        return (
          <section
            key={mod.key}
            className={`${moduleSheetClass} cover-product-sheet--${mod.key}`}
          >
            <div className="page-label screen-only page-label-mint">
              {pad(labelPage)}
              {' '}
              · Other products
            </div>
            <CoverProductPage mod={mod} isUniversity={isUniversity} />
          </section>
        );
      })}
    </>
  );
}
