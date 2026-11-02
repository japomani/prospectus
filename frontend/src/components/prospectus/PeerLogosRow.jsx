import { Field } from './Field.jsx';
import { getPeerLogos } from '../../lib/peerLogos.js';

export default function PeerLogosRow({
  highlight,
  className = 'doc-peers',
  isUniversity = false,
}) {
  const peers = getPeerLogos(isUniversity);

  return (
    <div className={className}>
      <p className="peer-logos-intro">
        {isUniversity ? (
          <>
            Universities already using Delphinium, including peers like
            {' '}
            <Field value="a comparable institution" highlight={highlight} />
            :
          </>
        ) : (
          <>
            Schools already using Delphinium, including peers like
            {' '}
            <Field value="a comparable virtual academy" highlight={highlight} />
            :
          </>
        )}
      </p>
      <div
        className={`peer-logos-row${isUniversity ? ' peer-logos-row--he' : ''}`}
        role="list"
      >
        {peers.map(({ name, logo, logoClass }) => (
          <figure
            key={name}
            className={`peer-logo${logoClass ? ` ${logoClass}` : ''}`}
            role="listitem"
          >
            <img src={logo} alt={name} loading="lazy" />
          </figure>
        ))}
      </div>
    </div>
  );
}
