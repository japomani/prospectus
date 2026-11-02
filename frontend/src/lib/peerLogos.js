/** Customer logos sourced from delphi-me.com homepage logo slider (K-12)
 *  and Higher Ed peer institutions provided for university prospectuses. */

export const PEER_SCHOOLS = [
  {
    name: 'Davis School District',
    logo: '/logos/davis-school-district.png',
  },
  {
    name: 'Utah Virtual Academy',
    logo: '/logos/utah-virtual-academy.webp',
  },
  {
    name: 'Baker Web Academy',
    logo: '/logos/baker-web-academy.webp',
  },
  {
    name: 'Virtual Prince William',
    logo: '/logos/virtual-prince-william.webp',
  },
];

export const PEER_UNIVERSITIES = [
  {
    name: 'Utah State University',
    logo: '/logos/utah-state-university.png',
    logoClass: 'ex-logo--usu',
  },
  {
    name: 'University of Tampa',
    logo: '/logos/university-of-tampa.png',
    /** Square asset with heavy internal whitespace — scale up in HE row. */
    logoClass: 'ex-logo--tampa',
  },
  {
    name: 'Utah Valley University',
    logo: '/logos/utah-valley-university.png',
    /** PNG has a baked-in black background (not transparent); padded — scale up. */
    logoClass: 'ex-logo--uvu',
  },
];

export function getPeerLogos(isUniversity) {
  return isUniversity ? PEER_UNIVERSITIES : PEER_SCHOOLS;
}
