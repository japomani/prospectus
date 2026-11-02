export const PRODUCT_LABELS = {
  communityBuilder: 'Community Builder',
  engagementBuilder: 'Engagement Builder',
  controlTowerUltra: 'Control Tower Ultra',
};

export function formatCustomItemLabel(item, fallback) {
  const name = item.name || fallback;
  const timing = item.isOneTime ? 'one time' : 'yearly';
  const pct = item.isPercent ? ` (${item.amount}%)` : '';
  return `${name}${pct} (${timing})`;
}
