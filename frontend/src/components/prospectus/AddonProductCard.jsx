function localizeText(text, isUniversity) {
  return isUniversity ? text.replace(/families/g, 'students') : text;
}

export default function AddonProductCard({ addon, isUniversity = false }) {
  const lead = isUniversity && addon.key === 'sms'
    ? addon.lead.replace('families', 'students')
    : addon.lead;

  return (
    <div className="keep cover-product-block addon-product-block">
      {addon.badge ? (
        <div className="cover-product-section-badgerow">
          <h3 className="ex-subhead is-top addon-card-title">
            {addon.name}
            <span className="em">, in Delphinium</span>
          </h3>
          <span className="cover-product-section-badge">{addon.badge}</span>
        </div>
      ) : (
        <h3 className="ex-subhead is-top addon-card-title">
          {addon.name}
          <span className="em">, in Delphinium</span>
        </h3>
      )}

      <p className="ex-lead cover-product-block-lead addon-card-lead">{lead}</p>

      <ul className="cover-product-list">
        {addon.features.map(item => (
          <li key={item}>{localizeText(item, isUniversity)}</li>
        ))}
      </ul>

      {Array.isArray(addon.legal) && addon.legal.length > 0 && (
        <div className="ex-gap addon-legal-blocks">
          {addon.legal.map(block => (
            <div
              className="ex-gap-row"
              key={block.title}
              style={{ alignItems: 'start', padding: '6px 0', gridTemplateColumns: '100px 1fr' }}
            >
              <div className="ex-gap-who">{block.title}</div>
              <p className="ex-gap-tx" style={{ fontSize: '12px' }}>
                {localizeText(block.body, isUniversity)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
