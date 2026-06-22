export const PRODUCT_LABELS = {
  engagementBuilder: 'Engagement Builder',
  communityBuilder: 'Community Builder',
  controlTowerUltra: 'Control Tower Ultra',
};

export function formatCustomItemLabel(item, fallback) {
  const name = item.name || fallback;
  const timing = item.isOneTime ? 'one time' : 'yearly';
  const pct = item.isPercent ? ` (${item.amount}%)` : '';
  return `${name}${pct} (${timing})`;
}
