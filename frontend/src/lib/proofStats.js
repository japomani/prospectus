/** Shared academic-outcome proof stats for cover + executive summary. */

export const PROOF_K12 = {
  num: '31%',
  label: 'fewer failures overall',
  src: '6,000 students \u2022 72 classes',
};

/** Higher-ed experimental study (WFD academic outcomes). */
export const PROOF_HIGHER_ED = {
  num: '47%',
  label: 'fewer failures overall',
  src: '~420 students \u2022 14 sections',
  outcomes: [
    { pct: '65%', label: 'fewer failures for part-time faculty' },
    { pct: '68%', label: 'fewer withdrawals' },
    { pct: '66%', label: 'fewer dropouts' },
  ],
};

/** Page-2 “when engagement breaks down” crisis cards (problem frame, not Delphinium results). */
export const FRAME_STATS_K12 = [
  {
    tag: 'Attendance',
    num: '1 in 4',
    label: 'students are chronically absent — still elevated years after the shift online.',
    src: 'RAND / Return to Learn Tracker, 2024–25',
  },
  {
    tag: 'Achievement',
    num: '1 in 3',
    label: 'students score below grade level across all core subjects—below pre-pandemic levels. The lowest performers keep losing ground.',
    src: "The Nation's Report Card (NAEP), 2024",
  },
  {
    tag: 'Cost',
    num: '$229K',
    label: "— the cost of a K–12 education, and a student's lost potential, when they don't finish.",
    src: 'U.S. Census Bureau, FY2024',
    climax: true,
  },
];

export const FRAME_STATS_HIGHER_ED = [
  {
    tag: 'Retention',
    num: '~1 in 3',
    label: "first-year students don't return for year two — seats and tuition that never come back.",
    src: 'NCES / IPEDS retention',
  },
  {
    tag: 'Completion',
    num: '~40%',
    label: "of students finish a bachelor's in 4 years (≈60% in 6). Time-to-degree keeps stretching.",
    src: 'NCES graduation rates',
  },
  {
    tag: 'DFW / cost',
    num: 'DFW',
    label: 'spikes in gateway courses when students disengage — each withdrawal or failure is paid-for twice.',
    src: 'Campus DFW & cost-of-attrition patterns',
    climax: true,
  },
];
