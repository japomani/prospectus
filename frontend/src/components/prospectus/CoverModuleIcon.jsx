import { Plug, Radar, Smartphone, Sparkles, Users } from 'lucide-react';

function VennIcon({ size = 20, color, strokeWidth = 2.25 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="12" r="6" />
      <circle cx="16" cy="12" r="6" />
    </svg>
  );
}

const ICONS = {
  core: VennIcon,
  eb: Sparkles,
  cb: Users,
  ctu: Radar,
  clever: Plug,
  sms: Smartphone,
};

export default function CoverModuleIcon({ moduleKey, color }) {
  const Icon = ICONS[moduleKey];
  if (!Icon) return null;

  return (
    <span className="cover-module-icon" aria-hidden="true">
      <Icon size={20} color={color} strokeWidth={2.25} />
    </span>
  );
}
