const STATS = [
  { tag: 'Peer-reviewed', num: '14 yrs', label: 'of published research behind the platform' },
  { tag: 'Publications', num: '10', label: 'peer-reviewed studies & book chapters' },
  { tag: 'Cited by the field', num: '230+', label: 'times by other researchers' },
];

const PUBLICATIONS = [
  {
    prefix: 'Chapman, J. R., & Andrade, M. (2024).',
    title: "Improving part-time instructors' student failure rate with an educational engagement information system.",
    suffix: 'Educational Technology Research and Development.',
    href: 'https://link.springer.com/article/10.1007/s11423-024-10352-2',
  },
  {
    prefix: 'Chapman, J. R., Kohler, T. B., Rich, P. J., & Trego, A. (2023).',
    title: "Maybe we've got it wrong: An experimental evaluation of self-determination and flow theory in gamification.",
    suffix: 'Journal of Research on Technology in Education, 57(2), 417–436.',
    href: 'https://www.tandfonline.com/doi/full/10.1080/15391523.2023.2242981',
  },
  {
    prefix: 'Chapman, J. R., Kohler, T. B., & Gedeborg, S. (2023).',
    title: 'So, why do students perform better in gamified courses? Understanding motivational styles in educational gamification.',
    suffix: 'Journal of Educational Computing Research, 61(5), 927–950.',
    href: 'https://doi.org/10.1177/07356331221127635',
  },
  {
    prefix: 'Nadolny, L., Malone, L., Chapman, J., & Alam, M. (2022).',
    title: 'Participatory gamification design: Navigating diverse perspectives.',
    suffix: 'In Proceedings of EdMedia + Innovate Learning (pp. 534–540). AACE.',
    href: 'https://www.learntechlib.org/primary/p/221337/',
  },
  {
    prefix: 'Brown, M. G., Lamm, M. H., & Nadolny, L. (2021).',
    title: 'Gamification of chemical engineering pathways: Evidence from introductory courses.',
    suffix: '2021 ASEE Virtual Annual Conference.',
    href: 'https://dr.lib.iastate.edu/bitstreams/a83f981b-fad6-4732-a879-02494cd65813/download',
  },
  {
    prefix: 'Chapman, J. R., & Rich, P. J. (2018).',
    title: "Does educational gamification improve students' motivation? If so, which game elements work best?",
    suffix: 'Journal of Education for Business, 93(7), 315–322.',
    href: 'https://www.tandfonline.com/doi/full/10.1080/08832323.2018.1490687',
  },
  {
    prefix: 'Chapman, J. R., & Rich, P. J. (2017).',
    title: 'Identifying motivational styles in educational gamification.',
    suffix: 'In Proceedings of the 50th Hawaii International Conference on System Sciences (pp. 1318–1327).',
    href: 'https://doi.org/10.24251/HICSS.2017.157',
  },
  {
    prefix: 'Barrus, A., Chapman, J., Bodily, R., & Rich, P. (2016).',
    title: "Using educational technologies to scaffold high school and college students' skill & will to plan, practice, and produce.",
    suffix: 'In L. Lin & R. Atkinson (Eds.), Educational technologies: Challenges, applications and learning outcomes. Nova Science Publishers.',
  },
  {
    prefix: 'Cieslewicz, J., Helquist, J., Chapman, J. R., & Baily, J. (submitted).',
    title: 'Impact on student performance of automated messages used to increase student perception of instructor presence.',
    suffix: 'Advances in Accounting Education.',
  },
  {
    prefix: 'Chapman, J. R., Odongo, G., Jacob, J., & Hansen, R. (in preparation).',
    title: "Delphinium's impact on academic outcomes for students with Individualized Education Programs (IEPs).",
    suffix: '',
  },
];

export default function ResearchFoundationSection({ pageLabel }) {
  return (
    <section className="sheet research-sheet">
      <div className="page-label screen-only">{pageLabel}</div>

      <div className="ex-kicker">
        <span className="ex-tick" />
        Research foundation
      </div>

      <h2 className="ex-h research-title">
        14 years of research{' '}
        <span className="em" style={{ fontStyle: 'normal' }}>behind</span>{' '}
        <span className="em" style={{ fontStyle: 'normal' }}>every design decision.</span>
      </h2>

      <p className="ex-lead research-lead">
        Long before Delphinium was a product, its founders were researchers — studying what actually drives
        students to engage, and publishing what they found.{' '}
        <b>Every engagement principle in the platform is grounded in peer-reviewed research</b>
        {' '}
        — built on decades of work by the field&apos;s leading scholars.
      </p>

      <div className="keep ex-stats research-stats">
        {STATS.map(({ tag, num, label }) => (
          <div key={tag} className="ex-stat">
            <div className="ex-stat-tag">{tag}</div>
            <div className="ex-stat-num">{num}</div>
            <div className="ex-stat-lbl">{label}</div>
          </div>
        ))}
      </div>

      <div className="research-validated">
        <p className="research-validated-tx">Validated by research. Demonstrated in classrooms.</p>
      </div>

      <ol className="research-citations">
        {PUBLICATIONS.map(({ prefix, title, suffix, href }) => (
          <li key={title} className="research-citation">
            {prefix}{' '}
            {href ? (
              <a
                className="research-citation-title"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {title}
              </a>
            ) : (
              title
            )}
            {suffix && (
              <>
                {' '}
                {suffix}
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
