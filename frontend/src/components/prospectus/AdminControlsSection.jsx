const SECTIONS = [
  {
    title: 'One class design, applied everywhere',
    lead: 'Create a school-wide layout and make it the default look and feel for all classes.',
    items: [
      'Teachers can apply consistent layouts to their courses in just a few seconds automatically',
      'Celebrations and prize boxes can be created at the school level, for a shared experience from class to class',
      'Give teachers the option to customize their own classes',
      "Students get a consistent experience no matter whose class they're in",
    ],
  },
  {
    title: 'Messages, ready before a teacher ever needs them',
    lead: 'Set up message templates once, and every course has access to them.',
    items: [
      'Pre-built message templates available to teachers from day one',
      'Default message templates appear automatically in new courses',
      'The right message is already there for teachers, so communication stays consistent and on-brand',
    ],
  },
];

export default function AdminControlsSection({ pageLabel }) {
  return (
    <section className="sheet">
      <div className="page-label screen-only">{pageLabel}</div>
      <div className="doc-kicker">Admin controls</div>
      <h2 className="doc-h2" style={{ marginBottom: '8px' }}>
        Every teacher <span className="dl-accent">supported.</span> Every class <span className="dl-accent">consistent.</span>
      </h2>
      <p className="doc-lead" style={{ marginBottom: '16px' }}>
        From the admin panel, a school can set defaults and templates that carry into every course
        automatically. A new teacher doesn&apos;t start from a blank page, and every class reflects the same
        standard, without each teacher building it themselves. The result: a school that looks and feels like
        {' '}
        <b>one school</b>
        , not a hundred separate classrooms.
      </p>

      <div className="keep doc-grid-2">
        {SECTIONS.map(section => (
          <div key={section.title} className="dCard" style={{ margin: 0 }}>
            <div className="doc-step-title">{section.title}</div>
            <p className="doc-step-body" style={{ marginBottom: '6px' }}>{section.lead}</p>
            <ul className="security-list">
              {section.items.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
