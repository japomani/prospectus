import { Field } from './Field.jsx';
import { PEER_SCHOOLS } from '../../lib/peerLogos.js';

export default function PeerLogosRow({ peerReference, highlight, className = 'doc-peers' }) {
  return (
    <div className={className}>
      <p className="peer-logos-intro">
        Schools already using Delphinium, including peers like
        {' '}
        <Field value={peerReference} highlight={highlight} />
        :
      </p>
      <div className="peer-logos-row" role="list">
        {PEER_SCHOOLS.map(({ name, logo }) => (
          <figure key={name} className="peer-logo" role="listitem">
            <img src={logo} alt={name} loading="lazy" />
          </figure>
        ))}
      </div>
    </div>
  );
}
