import { unselectedAddons, unselectedModules } from '../../lib/productCatalog.js';
import AddonProductCard from './AddonProductCard.jsx';

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

function OtherProductQuote({ quote, mutedAttr }) {
  return (
    <figure className="cover-product-pullquote">
      <blockquote className="cover-product-pullquote-tx">
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      {quote.attr && (
        <figcaption className={`cover-product-pullquote-by${mutedAttr ? ' is-muted' : ''}`}>
          &mdash; {quote.attr}
        </figcaption>
      )}
    </figure>
  );
}

function OtherProductModulePage({ mod, titleSuffix }) {
  const content = mod.otherProduct;
  if (!content) return null;

  return (
    <div className={`other-product-module other-product-module--${mod.key}`}>
      <div className="ex-kicker">
        <span className="ex-tick" />
        <span className="other-product-kicker-name">{mod.name}{titleSuffix}</span>
      </div>
      <h2 className="ex-h">{content.headline}</h2>

      {content.sections?.map((section, index) => (
        <div key={section.title} className="other-product-block">
          <h3 className={`ex-subhead${index === 0 ? ' is-top' : ''}`}>{section.title}</h3>
          {section.lead && (
            <p className="ex-lead other-product-block-lead">{section.lead}</p>
          )}
          <ul className="cover-product-list">
            {section.items.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}

      {content.bullets && (
        <ul className="cover-product-list other-product-bullets">
          {content.bullets.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {content.quote && (
        <OtherProductQuote quote={content.quote} mutedAttr={content.quoteMutedAttr} />
      )}
    </div>
  );
}

export default function OtherProductsSection({ quote, startPage = 1, pad = n => String(n).padStart(2, '0') }) {
  const isUniversity = Boolean(quote?.isUniversity);
  const modules = unselectedModules(quote);
  const addons = unselectedAddons(quote).filter(a => !(isUniversity && a.key === 'clever'));
  if (modules.length === 0 && addons.length === 0) return null;

  const moduleStartPage = startPage + (addons.length > 0 ? 1 : 0);
  const sheetClass = 'sheet sheet-mint cover-section cover-product-sheet other-products-section';

  return (
    <>
      {addons.length > 0 && (
        <section className={sheetClass}>
          <div className="page-label screen-only page-label-mint">
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
                onMint
              />
            ))}
          </div>
        </section>
      )}

      {modules.map((mod, index) => {
        const labelPage = moduleStartPage + index;

        return (
          <section key={mod.key} className={`${sheetClass} cover-product-sheet--${mod.key}`}>
            <div className="page-label screen-only page-label-mint">
              {pad(labelPage)}
              {' '}
              · Other products
            </div>
            <OtherProductModulePage
              mod={mod}
              titleSuffix={mod.key === 'ctu' ? ' (coming soon)' : undefined}
            />
          </section>
        );
      })}
    </>
  );
}
