import { Field } from './Field.jsx';
import { selectedAddons } from '../../lib/productCatalog.js';
import { formatAddonPrice } from '../../lib/productPricing.js';

export default function SelectedAddOnsSection({ quote, highlightFields, pageLabel }) {
  const addons = selectedAddons(quote);
  if (addons.length === 0) return null;

  return (
    <section className="sheet">
      <div className="page-label screen-only">{pageLabel}</div>
      <div className="doc-kicker">Add-ons</div>
      <h2 className="doc-h2">Included add-ons</h2>
      <p className="doc-lead" style={{ marginBottom: '20px' }}>
        Your quote includes these optional capabilities on top of your selected modules.
      </p>

      <div className={`selected-addons-grid${addons.length === 1 ? ' selected-addons-grid--single' : ''}`}>
        {addons.map(addon => (
          <div key={addon.key} className="dCard selected-addon-card keep">
            <div className="selected-addon-header">
              <div className="dH3" style={{ margin: 0 }}>{addon.name}</div>
              <div className="selected-addon-price">
                <Field value={formatAddonPrice(quote, addon.quoteKey)} highlight={highlightFields} />
                {(addon.quoteKey === 'clever'
                  || (addon.quoteKey === 'sms' && (Number(quote.smsFee) || 0) > 0)) && (
                  <span className="selected-addon-price-note"> / year</span>
                )}
              </div>
            </div>
            <p className="doc-body selected-addon-lead">{addon.lead}</p>
            <ul className="doc-module-list selected-addon-features">
              {addon.features.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
