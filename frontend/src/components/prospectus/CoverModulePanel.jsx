import CoverModuleIcon from './CoverModuleIcon.jsx';

export default function CoverModulePanel({ mod, detailed = false }) {
  const isDetailed = detailed || mod.sections?.length > 0;

  return (
    <div className={`cover-module-panel${isDetailed ? ' cover-module-panel--detailed' : ''}`}>
      <div className="cover-module-header">
        <div className="cover-module-header-main">
          <CoverModuleIcon moduleKey={mod.key} color={mod.color} />
          <span className="dH3 cover-module-title">{mod.name}</span>
        </div>
        {mod.includedLabel && (
          <span className="cover-module-included-pill">{mod.includedLabel}</span>
        )}
      </div>

      {mod.image && (
        <div className="cover-module-image-wrap">
          <img
            src={mod.image}
            alt={mod.imageAlt || ''}
            className="cover-module-image"
            style={mod.imageWidth ? { width: mod.imageWidth, margin: '0 auto' } : undefined}
          />
        </div>
      )}

      {mod.benefit && (
        <div className="dBody cover-module-benefit">{mod.benefit}</div>
      )}

      {mod.sections?.length > 0 ? (
        <div className="cover-module-sections">
          {mod.sections.map(section => (
            <div key={section.title} className="cover-module-section">
              <div className="cover-module-section-title">
                <b>{section.title}</b>
                {' — '}
                {section.lead}
              </div>
              <ul className="cover-module-features">
                {section.items.map(item => (
                  <li key={item} className="dBody">{item}</li>
                ))}
              </ul>
              {section.imageAfter && (
                <div className="cover-module-image-wrap cover-module-image-wrap--section">
                  <img
                    src={section.imageAfter}
                    alt={section.imageAfterAlt || ''}
                    className="cover-module-image"
                    style={section.imageAfterWidth ? { width: section.imageAfterWidth, margin: '0 auto' } : undefined}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <ul className="cover-module-features">
          {mod.features.map(feature => (
            <li key={feature} className="dBody">{feature}</li>
          ))}
        </ul>
      )}

      {mod.imageBottom && (
        <div className="cover-module-image-wrap cover-module-image-wrap--bottom">
          <img
            src={mod.imageBottom}
            alt={mod.imageBottomAlt || ''}
            className="cover-module-image"
            style={mod.imageBottomWidth ? { width: mod.imageBottomWidth, margin: '0 auto' } : undefined}
          />
        </div>
      )}
    </div>
  );
}
