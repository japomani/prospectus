import { selectedAddons } from '../../lib/productCatalog.js';
import AddonProductCard from './AddonProductCard.jsx';

export default function SelectedAddOnsSection({ quote, pageLabel }) {
  const addons = selectedAddons(quote);
  if (addons.length === 0) return null;
  const isUniversity = quote.isUniversity;

  return (
    <section className="sheet" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="page-label screen-only">{pageLabel}</div>

      <div className="ex-kicker">
        <span className="ex-tick" />
        <span className="other-products-kicker-label">Optional add-ons</span>
      </div>
      <h2 className="ex-h">Add more reach to your Delphinium</h2>

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
  );
}
