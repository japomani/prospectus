import { adaptModuleForAudience } from '../../lib/productCatalog.js';

function ProductFigure({ src, alt, width, className = 'cover-product-figure' }) {
  return (
    <figure className={className}>
      <img
        src={src}
        alt={alt || ''}
        className="cover-product-figure-img"
        style={width ? { width } : undefined}
      />
    </figure>
  );
}

function HeroImages({ images, heroTitle, plain }) {
  if (!images || images.length === 0) return null;
  if (plain && images.length > 1) {
    return (
      <div className="cover-product-hero-grid">
        {images.map(img => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt || ''}
            className="cover-product-hero-grid-img"
          />
        ))}
      </div>
    );
  }
  if (images.length === 1) {
    const img = images[0];
    const figure = (
      <ProductFigure
        src={img.src}
        alt={img.alt}
        className={`cover-product-figure cover-product-hero-figure${img.card ? ' cover-product-hero-figure--card' : ''}`}
      />
    );
    if (!heroTitle && !img.card) return figure;
    return (
      <div className="cover-product-hero-single">
        {heroTitle && <h3 className="ex-subhead cover-product-hero-title">{heroTitle}</h3>}
        {img.card ? (
          <div className="cover-product-hero-card">
            <img
              src={img.src}
              alt={img.alt || ''}
              className="cover-product-hero-card-img"
            />
          </div>
        ) : (
          figure
        )}
      </div>
    );
  }
  return (
    <div className="cover-product-hero-grid">
      {images.map(img => (
        <div
          key={img.src}
          className={`cover-product-hero-grid-cell${img.contain ? ' is-contain' : ''}${img.tall ? ' is-tall' : ''}`}
        >
          <img
            src={img.src}
            alt={img.alt || ''}
            className="cover-product-hero-grid-img"
          />
        </div>
      ))}
    </div>
  );
}

function SectionBlock({ section, isFirst }) {
  const items = section.items || [];
  return (
    <div className="cover-product-block">
      {section.badge ? (
        <div className="cover-product-section-badgerow">
          <h3 className={`ex-subhead cover-product-block-title${isFirst ? ' cover-product-block-title--first' : ''}`}>
            {section.title}
          </h3>
          <span className="cover-product-section-badge">{section.badge}</span>
        </div>
      ) : (
        <h3 className={`ex-subhead cover-product-block-title${isFirst ? ' cover-product-block-title--first' : ''}`}>
          {section.title}
        </h3>
      )}
      {section.lead && (
        <p className="ex-lead cover-product-block-lead">{section.lead}</p>
      )}
      {items.length > 0 && (
        <ul className="cover-product-list">
          {items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {section.imageAfter && (
        <ProductFigure
          src={section.imageAfter}
          alt={section.imageAfterAlt}
          width={section.imageAfterWidth}
        />
      )}
    </div>
  );
}

function PullQuote({ quote, mutedAttr }) {
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

export default function CoverProductPage({ mod: rawMod, kicker, titleSuffix, isUniversity = false }) {
  const mod = adaptModuleForAudience(rawMod, isUniversity);
  const sections = mod.sections ?? [];
  const quotes = mod.quotes ?? (mod.quote ? [mod.quote] : []);
  const usesTitleHeader = Boolean(mod.heroSubtitle);
  const firstSection = sections[0];
  const columnSections = sections.slice(1);
  const eyebrow = kicker ?? mod.sheetKicker;

  const quotesEl = quotes.length > 1 ? (
    <div className="cover-product-quote-grid">
      {quotes.map(q => (
        <PullQuote key={q.attr} quote={q} mutedAttr={mod.quoteMutedAttr} />
      ))}
    </div>
  ) : (
    quotes.length === 1 && (
      <PullQuote quote={quotes[0]} mutedAttr={mod.quoteMutedAttr} />
    )
  );

  const columnsEl = columnSections.length > 0 && (
    <div className="cover-product-columns">
      {columnSections.map(section => (
        <SectionBlock key={section.title} section={section} />
      ))}
    </div>
  );

  return (
    <div className={`cover-product cover-product--${mod.key}`}>
      {eyebrow && mod.key !== 'cb' && (
        <div className="ex-chip cover-product-eyebrow">{eyebrow}</div>
      )}

      {usesTitleHeader ? (
        <>
          <div className="cover-product-title-row">
            <h2 className="ex-h cover-product-title">{mod.name}{titleSuffix ?? mod.titleSuffix}</h2>
            {mod.includedLabel && (
              <span className="ex-chip cover-product-chip">{mod.includedLabel}</span>
            )}
          </div>
          <div className="ex-subhead is-top cover-product-subtitle">{mod.heroSubtitle}</div>
        </>
      ) : (
        <>
          <div className="ex-kicker">
            <span className="ex-tick" />
            <span className="cover-product-kicker-name">{mod.name}</span>
          </div>
          <h2 className="ex-h cover-product-headline">{mod.headline}</h2>
        </>
      )}

      {mod.intro && (
        <p className="ex-lead cover-product-intro">{mod.intro}</p>
      )}

      <HeroImages
        images={mod.heroImages}
        heroTitle={mod.heroTitle}
        plain={mod.plainHero ?? mod.key === 'core'}
      />

      {firstSection && <SectionBlock section={firstSection} isFirst />}

      {mod.imageBottom && (
        <div className="cover-product-image-card">
          <img
            src={mod.imageBottom}
            alt={mod.imageBottomAlt || ''}
            className="cover-product-image-card-img"
          />
        </div>
      )}

      {/* page2Class (e.g. EB): keep quote with remaining columns on the next page */}
      {mod.page2Class ? (
        <div className={mod.page2Class}>
          {quotesEl}
          {columnsEl}
        </div>
      ) : (
        <>
          {quotesEl}
          {columnsEl}
        </>
      )}

      {mod.bottomQuote && (
        <PullQuote quote={mod.bottomQuote} mutedAttr={mod.quoteMutedAttr} />
      )}
    </div>
  );
}
