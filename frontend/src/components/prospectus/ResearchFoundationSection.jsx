const STATS = [
  { num: '14 years', label: 'of published research behind the platform' },
  { num: '10', label: 'peer-reviewed studies & book chapters' },
  { num: '230+', label: 'citations by other researchers' },
];

const PUBLICATIONS = [
  {
    text: "Chapman, J. R., & Andrade, M. (2024). Improving part-time instructors' student failure rate with an educational engagement information system. Educational Technology Research and Development.",
    href: 'https://link.springer.com/article/10.1007/s11423-024-10352-2',
  },
  {
    text: "Chapman, J. R., Kohler, T. B., Rich, P. J., & Trego, A. (2023). Maybe we've got it wrong: An experimental evaluation of self-determination and flow theory in gamification. Journal of Research on Technology in Education, 57(2), 417–436.",
    href: 'https://www.tandfonline.com/doi/full/10.1080/15391523.2023.2242981',
  },
  {
    text: 'Chapman, J. R., Kohler, T. B., & Gedeborg, S. (2023). So, why do students perform better in gamified courses? Understanding motivational styles in educational gamification. Journal of Educational Computing Research, 61(5), 927–950.',
    href: 'https://doi.org/10.1177/07356331221127635',
  },
  {
    text: 'Nadolny, L., Malone, L., Chapman, J., & Alam, M. (2022). Participatory gamification design: Navigating diverse perspectives. In Proceedings of EdMedia + Innovate Learning (pp. 534–540). AACE.',
    href: 'https://www.learntechlib.org/primary/p/221337/',
  },
  {
    text: 'Brown, M. G., Lamm, M. H., & Nadolny, L. (2021). Gamification of chemical engineering pathways: Evidence from introductory courses. 2021 ASEE Virtual Annual Conference.',
    href: 'https://dr.lib.iastate.edu/bitstreams/a83f981b-fad6-4732-a879-02494cd65813/download',
  },
  {
    text: "Chapman, J. R., & Rich, P. J. (2018). Does educational gamification improve students' motivation? If so, which game elements work best? Journal of Education for Business, 93(7), 315–322.",
    href: 'https://www.tandfonline.com/doi/full/10.1080/08832323.2018.1490687',
  },
  {
    text: 'Chapman, J. R., & Rich, P. J. (2017). Identifying motivational styles in educational gamification. In Proceedings of the 50th Hawaii International Conference on System Sciences (pp. 1318–1327).',
    href: 'https://doi.org/10.24251/HICSS.2017.157',
  },
  {
    text: "Barrus, A., Chapman, J., Bodily, R., & Rich, P. (2016). Using educational technologies to scaffold high school and college students' skill & will to plan, practice, and produce. In L. Lin & R. Atkinson (Eds.), Educational technologies: Challenges, applications and learning outcomes. Nova Science Publishers.",
  },
  {
    text: 'Cieslewicz, J., Helquist, J., Chapman, J. R., & Baily, J. (Manuscript submitted to Advances in Accounting Education.) Impact on student performance of automated messages used to increase student perception of instructor presence.',
  },
  {
    text: "Chapman, J. R., Odongo, G., Jacob, J., & Hansen, R. (Manuscript in preparation.) Delphinium's impact on academic outcomes for students with Individualized Education Programs (IEPs).",
  },
];

export default function ResearchFoundationSection({ pageLabel }) {
  return (
    <section className="sheet">
      <div className="page-label screen-only">{pageLabel}</div>
      <div className="doc-kicker">Research foundation</div>
      <h2 className="doc-h2" style={{ marginBottom: '8px' }}>14 years of research behind every design decision.</h2>
      <p className="doc-lead" style={{ marginBottom: '14px' }}>
        Long before Delphinium was a product, its founders were researchers — studying what actually drives
        students to engage, and publishing what they found. Every engagement principle in the platform is
        grounded in peer-reviewed research — built on decades of work by the field&apos;s leading scholars.
      </p>

      <div className="keep exec-stat-trio" style={{ marginBottom: '10px' }}>
        {STATS.map(({ num, label }) => (
          <div key={label} className="exec-stat-trio-card">
            <div className="exec-stat-trio-num">{num}</div>
            <div className="exec-stat-trio-body">{label}</div>
          </div>
        ))}
      </div>

      <blockquote className="exec-framing-quote" style={{ textAlign: 'center', marginBottom: '12px' }}>
        <p className="exec-framing-quote-tx">Validated by research. Demonstrated in classrooms.</p>
      </blockquote>

      <div className="doc-security-section-title">Publications</div>
      <ol className="research-pub-list">
        {PUBLICATIONS.map(({ text, href }) => (
          <li key={text}>
            {href ? (
              <a className="doc-link" href={href} target="_blank" rel="noopener noreferrer">{text}</a>
            ) : text}
          </li>
        ))}
      </ol>
    </section>
  );
}
