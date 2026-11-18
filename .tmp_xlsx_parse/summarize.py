"""Extract structured summaries from parsed Excel dumps."""
import json
from pathlib import Path

out_dir = Path(r"C:\Users\10618071\Projects\prospectus\.tmp_xlsx_parse")


def fmt_cell(e):
    if not e:
        return None
    raw, calc = e.get("raw"), e.get("calc")
    if isinstance(raw, str) and str(raw).startswith("="):
        return f"{raw} => {calc}"
    return raw if calc is None or calc == raw else f"{raw} / calc={calc}"


def sheet_grid(detail):
    """Return list of non-empty rows as list of (col_letter_or_idx, value) sparse."""
    lines = []
    for row in detail.get("rows", []):
        cells = []
        for e in row:
            if e is None:
                continue
            cells.append(f"{e['addr']}={fmt_cell(e)}")
        if cells:
            lines.append(cells)
    return lines


for jp in sorted(out_dir.glob("*_dump.json")):
    data = json.loads(jp.read_text(encoding="utf-8"))
    summary_path = out_dir / (jp.stem.replace("_dump", "") + "_summary.txt")
    lines = []
    lines.append(f"FILE: {data['file']}")
    lines.append(f"SHEETS: {data['sheets']}")
    lines.append(f"DEFINED NAMES: {data.get('defined_names')}")
    for sname, detail in data["sheet_details"].items():
        lines.append("")
        lines.append("=" * 70)
        lines.append(
            f"SHEET: {sname}  rows={detail['max_row']} cols={detail['max_col']} formulas={detail['formula_count']}"
        )
        lines.append("=" * 70)
        for row_cells in sheet_grid(detail):
            lines.append("  " + " | ".join(row_cells))
        if detail.get("formulas"):
            lines.append("--- FORMULAS ---")
            for f in detail["formulas"]:
                lines.append(f"  {f['addr']}: {f['raw']} => {f['calc']}")
    summary_path.write_text("\n".join(lines), encoding="utf-8")
    print("Wrote", summary_path, "chars", summary_path.stat().st_size)

print("DONE")
