import CoverProductPage from './CoverProductPage.jsx';
import { Field } from './Field.jsx';
import { unselectedAddons, unselectedModules } from '../../lib/productCatalog.js';
import { formatAddonPrice } from '../../lib/productPricing.js';

function OtherProductsHeading() {
  return (
    <>
      <div className="doc-kicker">Explore more</div>
      <h2 className="doc-h2 other-products-heading">Check out our other great products</h2>
      <p className="doc-lead other-products-lead">
        Your quote includes the selections above. These modules and add-ons are also available if you want to expand later.
      </p>
    </>
  );
}

export default function OtherProductsSection({ quote, highlightFields, startPage = 1, pad = n => String(n).padStart(2, '0') }) {
  const modules = unselectedModules(quote);
  const addons = unselectedAddons(quote);
  if (modules.length === 0 && addons.length === 0) return null;

  const moduleStartPage = startPage + (addons.length > 0 ? 1 : 0);

  return (
    <>
      {addons.length > 0 && (
        <section className="sheet sheet-mint other-products-section">
          <div className="page-label screen-only page-label-mint">
            {pad(startPage)}
            {' '}
            · Other products
          </div>
          <OtherProductsHeading />
          <div className="additional-addons-grid">
            {addons.map(addon => (
              <div key={addon.key} className="dCard additional-addon-card">
                <div className="dH4">
                  {addon.name}
                  {' '}
                  <Field value={formatAddonPrice(quote, addon.quoteKey)} highlight={highlightFields} />
                </div>
                <div className="doc-caption" style={{ marginTop: '4px' }}>{addon.description}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {modules.map((mod, index) => {
        const labelPage = moduleStartPage + index;
        const showHeading = index === 0 && addons.length === 0;

        return (
          <section
            key={mod.key}
            className="sheet sheet-mint cover-section cover-product-sheet other-products-section"
          >
            <div className="page-label screen-only page-label-mint">
              {pad(labelPage)}
              {' '}
              · Other products
            </div>
            {showHeading && <OtherProductsHeading />}
            <CoverProductPage mod={mod} />
          </section>
        );
      })}
    </>
  );
}
