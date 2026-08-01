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
    title: 'Messages, ready before teachers need them',
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
      <div className="ex-kicker">
        <span className="ex-tick" />
        Admin controls
      </div>
      <h2 className="doc-h2" style={{ marginBottom: '8px' }}>
        Every teacher <span className="dl-accent">supported.</span> Every class <span className="dl-accent">consistent.</span>
      </h2>
      <p className="doc-lead">
        From the admin panel, a school can set defaults and templates that carry into every course
        automatically. A new teacher doesn&apos;t start from a blank page, and every class reflects the same
        standard, without each teacher building it themselves. The result: a school that looks and feels like
        {' '}
        <b>one school</b>
        , not a hundred separate classrooms.
      </p>

      <div className="keep cover-product-columns">
        {SECTIONS.map(section => (
          <div key={section.title} className="cover-product-block">
            <h3 className="ex-subhead cover-product-block-title">
              {section.title}
            </h3>
            <p className="ex-lead cover-product-block-lead">{section.lead}</p>
            <ul className="cover-product-list">
              {section.items.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="keep admin-controls-figures">
        <img
          src="/admin-layouts.png"
          alt="Delphinium admin course layouts dashboard"
          className="admin-controls-figure admin-controls-figure--back"
        />
        <img
          src="/admin-messages.png"
          alt="Delphinium message center templates"
          className="admin-controls-figure admin-controls-figure--front"
        />
      </div>
    </section>
  );
}
