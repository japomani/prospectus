export default function CheckIcon({ className = 'security-pill-icon' }) {
  return (
    <svg className={className} viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="6" fill="currentColor" />
      <path
        d="M3.5 6.1 5.2 7.8 8.6 4.4"
        fill="none"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
