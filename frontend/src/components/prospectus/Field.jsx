export function Field({ value, highlight = false }) {
  if (highlight) {
    return <span className="fld">{value}</span>;
  }
  return <>{value}</>;
}
