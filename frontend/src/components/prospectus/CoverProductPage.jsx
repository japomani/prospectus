import CoverModuleIcon from './CoverModuleIcon.jsx';

function ProductFigure({ src, alt, width }) {
  return (
    <figure className="cover-product-figure">
      <img
        src={src}
        alt={alt || ''}
        className="cover-product-figure-img"
        style={width ? { width } : undefined}
      />
    </figure>
  );
}

export default function CoverProductPage({ mod, kicker }) {
  const hasSections = mod.sections?.length > 0;
  const heroStyle = { '--product-color': mod.color };
  const heroSubtitle = mod.heroSubtitle
    ?? (mod.sections?.length
      ? mod.sections.map(section => section.title).join(' • ')
      : null);

  return (
    <div className="cover-product">
      {kicker && <div className="cover-kicker cover-kicker-modules">{kicker}</div>}

      <header className="cover-product-hero" style={heroStyle}>
        <span className="cover-product-hero-icon">
          <CoverModuleIcon moduleKey={mod.key} color={mod.color} />
        </span>
        <div className="cover-product-hero-text">
          <div className="cover-product-name">{mod.name}</div>
          {heroSubtitle && (
            <div className="cover-product-subtitle">{heroSubtitle}</div>
          )}
        </div>
        {mod.includedLabel && (
          <span className="cover-product-pill">{mod.includedLabel}</span>
        )}
      </header>

      <div className="cover-product-body">
        {hasSections ? (
          mod.sections.map(section => (
            <section
              key={section.title}
              className="cover-product-section"
              style={heroStyle}
            >
              <h3 className="cover-product-section-title">{section.title}</h3>
              {section.lead && (
                <p className="cover-product-section-lead">{section.lead}</p>
              )}
              <ul className="cover-product-list">
                {section.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {section.imageAfter && (
                <ProductFigure
                  src={section.imageAfter}
                  alt={section.imageAfterAlt}
                  width={section.imageAfterWidth}
                />
              )}
            </section>
          ))
        ) : (
          <section className="cover-product-section" style={heroStyle}>
            <ul className="cover-product-list">
              {mod.features.map(feature => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            {mod.imageBottom && (
              <ProductFigure
                src={mod.imageBottom}
                alt={mod.imageBottomAlt}
                width={mod.imageBottomWidth}
              />
            )}
          </section>
        )}
      </div>

      {mod.quote && (
        <figure className="cover-product-quote" style={heroStyle}>
          <blockquote className="cover-product-quote-tx">
            &ldquo;{mod.quote.text}&rdquo;
          </blockquote>
          <figcaption className="cover-product-quote-by">&mdash; {mod.quote.attr}</figcaption>
        </figure>
      )}
    </div>
  );
}
