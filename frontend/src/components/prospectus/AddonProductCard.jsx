function localizeText(text, isUniversity) {
  return isUniversity ? text.replace(/families/g, 'students') : text;
}

export function AddonIcon({ addonKey }) {
  if (addonKey === 'clever') {
    return (
      <div className="addon-icon addon-icon--sis">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="12" r="3" fill="var(--dl-indigo)" />
          <circle cx="12" cy="3.5" r="2" fill="var(--dl-indigo)" opacity="0.55" />
          <circle cx="20.5" cy="16.5" r="2" fill="var(--dl-indigo)" opacity="0.55" />
          <circle cx="3.5" cy="16.5" r="2" fill="var(--dl-indigo)" opacity="0.55" />
          <line x1="12" y1="9" x2="12" y2="5.5" stroke="var(--dl-indigo)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14.6" y1="13.5" x2="18.7" y2="15.4" stroke="var(--dl-indigo)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9.4" y1="13.5" x2="5.3" y2="15.4" stroke="var(--dl-indigo)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className="addon-icon addon-icon--sms">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M20 2H4C2.9 2 2 2.9 2 4v12c0 1.1.9 2 2 2h4l3 3 3-3h6c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="color-mix(in srgb, var(--dl-magenta) 15%, var(--dl-surface))" stroke="var(--dl-magenta)" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="8" cy="10" r="1.2" fill="var(--dl-magenta)" />
        <circle cx="12" cy="10" r="1.2" fill="var(--dl-magenta)" />
        <circle cx="16" cy="10" r="1.2" fill="var(--dl-magenta)" />
      </svg>
    </div>
  );
}

export default function AddonProductCard({ addon, isUniversity = false, onMint = false }) {
  const lead = isUniversity && addon.key === 'sms'
    ? addon.lead.replace('families', 'students')
    : addon.lead;

  return (
    <div className={`dCard keep addon-product-card${onMint ? ' addon-product-card--surface' : ' addon-product-card--blend'}`}>
      <div className="addon-card-header">
        <AddonIcon addonKey={addon.key} />
        <h3 className="ex-subhead is-top addon-card-title">
          {addon.name}
          <span className="em">, in Delphinium</span>
        </h3>
      </div>

      {addon.badge && (
        <span className="addon-req-chip">{addon.badge}</span>
      )}

      <p className="addon-card-lead">{lead}</p>

      <ul className="cover-product-list">
        {addon.features.map(item => (
          <li key={item}>{localizeText(item, isUniversity)}</li>
        ))}
      </ul>
    </div>
  );
}
