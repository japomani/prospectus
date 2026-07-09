// ExecutiveSummarySection — pages 07–10 of the Delphinium prospectus
// Source of truth: "Executive Summary Page Preview.dc.html"
// Synced: 2026-06-30

const CITATIONS = [
  'Chapman, J. R., Kohler, T. B., Rich, P. J., &amp; Trego, A. (2023). Maybe we\'ve got it wrong: An experimental evaluation of self-determination and flow theory in gamification. <em>Journal of Research on Technology in Education, 57</em>(2), 417–436.',
  'Chapman, J. R., &amp; Andrade, M. (2024). Improving part-time instructors\' student failure rate with an educational engagement information system. <em>Educational Technology Research and Development.</em>',
  'Chapman, J. R., Kohler, T. B., &amp; Gedeborg, S. (2023). So, why do students perform better in gamified courses? Understanding motivational styles in educational gamification. <em>Journal of Educational Computing Research, 61</em>(5), 927–950.',
  'Nadolny, L., Malone, L., Chapman, J., &amp; Alam, M. (2022). Participatory gamification design: Navigating diverse perspectives. In <em>Proceedings of EdMedia + Innovate Learning</em> (pp. 534–540). AACE.',
  'Brown, M. G., Lamm, M. H., &amp; Nadolny, L. (2021). Gamification of chemical engineering pathways: Evidence from introductory courses. <em>2021 ASEE Virtual Annual Conference.</em>',
  'Chapman, J. R., &amp; Rich, P. J. (2018). Does educational gamification improve students\' motivation? If so, which game elements work best? <em>Journal of Education for Business, 93</em>(7), 315–322.',
  'Chapman, J. R., &amp; Rich, P. J. (2017). Identifying motivational styles in educational gamification. In <em>Proceedings of the 50th Hawaii International Conference on System Sciences</em> (pp. 1318–1327).',
  'Barrus, A., Chapman, J., Bodily, R., &amp; Rich, P. (2016). Using educational technologies to scaffold high school and college students\' skill &amp; will to plan, practice, and produce. In L. Lin &amp; R. Atkinson (Eds.), <em>Educational technologies: Challenges, applications and learning outcomes.</em> Nova Science Publishers.',
  'Cieslewicz, J., Helquist, J., Chapman, J. R., &amp; Baily, J. <em>(Manuscript submitted to Advances in Accounting Education).</em> Impact on student performance of automated messages used to increase student perception of instructor presence.',
  'Chapman, J. R., Odongo, G., Jacob, J., &amp; Hansen, R. <em>(Manuscript in preparation).</em> Delphinium\'s impact on academic outcomes for students with Individualized Education Programs (IEPs).',
];

function InDelphiniumLabel() {
  return (
    <em
      style={{
        color: 'var(--dl-magenta)',
        fontStyle: 'normal',
        fontSize: '13px',
        textAlign: 'right',
        fontWeight: 700,
      }}
    >
      In Delphinium{' '}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: '11px', height: '11px', verticalAlign: '-1px' }}
      >
        <path d="M5 12h13M12 5l7 7-7 7" />
      </svg>
    </em>
  );
}

export default function ExecutiveSummarySection({
  fields,
  quote,
  highlightFields,
  pageLabel,
  pageLabelB,
  pageLabelC,
  pageLabelD,
}) {
  return (
    <>
      {/* ==================== PAGE A — THE CASE FOR ENGAGEMENT ==================== */}
      <section className="sheet" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="page-label screen-only">{pageLabel}</div>

        <div className="ex-kicker">
          <span className="ex-tick"></span>The case for engagement
        </div>
        <h2 className="ex-h">
          Education moved online.{' '}
          <span className="em" style={{ fontStyle: 'normal' }}>Engagement</span>{' '}
          didn't follow.
        </h2>

        <p className="ex-lead" style={{ marginBottom: 0 }}>
          More education has moved online — and students and families expect that access now. But
          delivering content online is not the same as engaging students. In a classroom, teachers
          can read the room, catch a glance, stand by a student who is drifting, or capture focus
          with a quick activity.{' '}
          <b>None of that survives the move to a screen.</b> Engagement has been waiting for online
          tools to catch up.
        </p>

        <blockquote className="ex-pullquote">
          <p className="ex-pullquote-tx">
            &ldquo;There&rsquo;s downsides to Canvas, if you ask kids, they don&rsquo;t like Canvas.
            It&rsquo;s basic, it needs something else to engage in the way we&rsquo;re looking for.
            Canvas itself falls way short.&rdquo;
          </p>
          <div className="ex-pullquote-by">&mdash; Ryan Hansen, Digital Learning Director</div>
        </blockquote>

        <h3 className="ex-subhead">When engagement breaks down...</h3>

        <div className="ex-stats">
          <div className="ex-stat">
            <div className="ex-stat-tag">Attendance</div>
            <div className="ex-stat-num">1 in 4</div>
            <div className="ex-stat-lbl">
              students are chronically absent — still elevated years after the shift online.
            </div>
            <div className="ex-stat-src">RAND / Return to Learn Tracker, 2024–25</div>
          </div>
          <div className="ex-stat">
            <div className="ex-stat-tag">Achievement</div>
            <div className="ex-stat-num">1 in 3</div>
            <div className="ex-stat-lbl">
              students score below grade level across all core subjects—below pre-pandemic levels.
              The lowest performers keep losing ground.
            </div>
            <div className="ex-stat-src">The Nation's Report Card (NAEP), 2024</div>
          </div>
          <div className="ex-stat is-climax">
            <div className="ex-stat-tag">Cost</div>
            <div className="ex-stat-num">$229K</div>
            <div className="ex-stat-lbl">
              — the cost of a K–12 education, and a student's lost potential, when they don't
              finish.
            </div>
            <div className="ex-stat-src">U.S. Census Bureau, FY2024</div>
          </div>
        </div>

        <p className="ex-lead" style={{ margin: '12px 0 16px' }}>
          These aren't three separate crises. They share one&nbsp;common driver:{' '}
          <b>disengagement</b>.&nbsp;When students aren't engaged, the conditions for learning —
          and for finishing — quietly disappear.
        </p>

        <div className="ex-thesis">
          <div className="ex-thesis-h">
            Everything moved online except{' '}
            <span className="em">the part that matters most.</span>
          </div>
          <p className="ex-thesis-p">
            Your school has strong curriculum, capable teachers, and a platform to deliver it all.
            But <b>great teaching was never really about content</b> — it's about knowing when a
            student is winning and when they're slipping, and making sure they <b>feel seen</b> and{' '}
            <b>feel progress</b> along the way. The tools built for online learning were designed to
            deliver content, not to <span className="em">spark engagement</span> with it. That
            signal, that connection — <b>that's what's been missing.</b>
          </p>
        </div>

        <h3 className="ex-subhead">
          Canvas is data-rich, but <span className="em">insight-poor.</span>
        </h3>
        <p className="ex-lead" style={{ margin: '0 0 10px' }}>
          Canvas captures a LOT of information—Assignments, Gradebook, Syllabus, Modules,
          Analytics, etc. But it is scattered across pages built for storage, not engagement.
        </p>

        <div className="ex-gap">
          <div className="ex-gap-row">
            <div className="ex-gap-who">THE STUDENT SEES...</div>
            <p className="ex-gap-tx">
              <b>a gray wall of text</b>. The signals they need—success, direction, progress—are
              buried. A slipping student can quietly fade, and nothing pulls them back.
            </p>
          </div>
          <div className="ex-gap-row">
            <div className="ex-gap-who">THE PARENT wants...</div>
            <p className="ex-gap-tx">
              <b>to be the cheerleader and coach </b>their kid needs, but Canvas gives opaque data
              without a story they can act on.
            </p>
          </div>
          <div className="ex-gap-row">
            <div className="ex-gap-who">THE TEACHER FACES...</div>
            <p className="ex-gap-tx">
              <b>hours of slow manual work</b> to find and reach at-risk students, one student at a
              time. Paid for in lost evenings.
            </p>
          </div>
        </div>

        <p className="ex-lead" style={{ margin: '10px 0 0' }}>
          <b style={{ fontSize: '16px' }}>
            What you need is the tools to turn that data into action —{' '}
            <span style={{ color: 'var(--dl-magenta)' }}>Delphinium</span>.
          </b>
        </p>
      </section>

      {/* ==================== PAGE B — WHY IT PAYS OFF ==================== */}
      <section className="sheet" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="page-label screen-only">{pageLabelB}</div>

        <div className="ex-kicker">
          <span className="ex-tick"></span>Delphinium turns data into action
        </div>
        <h2 className="ex-h" style={{ marginBottom: '10px', whiteSpace: 'nowrap' }}>
          Canvas delivers <span className="em">content</span>. Delphinium delivers{' '}
          <span className="em" style={{ fontStyle: 'normal' }}>engagement.</span>
        </h2>

        <p className="ex-lead" style={{ margin: '0 0 6px' }}>
          For an online student, <b>Canvas is the entire school experience.</b> Delphinium adds a
          quick layer over your existing Canvas courses — no rebuild, no new platform. It
          re-engages students, gives parents a clear picture, and hands teachers early warnings
          instead of spreadsheets.
        </p>

        <h3 className="ex-subhead" style={{ marginBottom: '12px' }}>Proof it works</h3>

        <div className="ex-proof-bento">
          {/* Cards 1+2: headline result + bar chart */}
          <div className="ex-piw-card ex-proof-card ex-proof-card--merged">
            <div className="ex-proof-col ex-proof-col--result">
              <div className="ex-stat-tag">Fewer Failures</div>
              <div className="ex-proof-num ex-proof-num--green">31%</div>
              <div className="ex-piw-lbl">
                Across <b>72 classes</b> and <b>6,000+ students</b>
              </div>
              <div className="ex-piw-cap ex-proof-cap">
                Davis Connect case study · &rsquo;22 vs. &rsquo;23
              </div>
            </div>
            <div className="ex-proof-divider" aria-hidden="true" />
            <div className="ex-proof-col ex-proof-col--chart ex-proof-chart">
              <div className="ex-stat-tag">Course Failure Rate</div>
              <div className="ex-chart">
                <div className="ex-barwrap">
                  <div className="ex-bar before" style={{ height: '86.7%' }}>
                    <span className="ex-bar-val">26%</span>
                  </div>
                </div>
                <div className="ex-barwrap">
                  <div className="ex-bar after" style={{ height: '60%' }}>
                    <span className="ex-bar-val">18%</span>
                  </div>
                </div>
              </div>
              <div className="ex-chart-axis">
                <div className="ex-axis-lbl">without Delphinium</div>
                <div className="ex-axis-lbl">with Delphinium</div>
              </div>
            </div>
          </div>

          {/* Card 3: motivation */}
          <div className="ex-piw-card ex-proof-card">
            <div className="ex-stat-tag">Motivation</div>
            <div className="ex-proof-num ex-proof-num--indigo">72%</div>
            <div className="ex-piw-lbl">
              of students say Delphinium is{' '}
              <b>more or much more motivating</b> than a traditional course
            </div>
          </div>
        </div>

        <p className="ex-lead" style={{ margin: '10px 0 0' }}>
          Delphinium is built on 14 years of published research.{' '}
          <b>The results are measured, not promised.</b> The results come from real schools, with
          real students. The courses didn&apos;t change. The teachers didn&apos;t change. Engagement
          did — and so did the outcomes.
        </p>

        <p className="ex-lead" style={{ margin: '10px 0 0', fontSize: '14px' }}>
          In our research, when we ask students how a Delphinium course is different than a
          traditional course and one of the most common words we hear back is &ldquo;<b>Fun</b>.&rdquo;
          They also report doing their work earlier — and with higher quality. One student put it
          this way: &ldquo;I was sitting on the couch watching Netflix and the thought popped into my
          head — I could be doing homework right now — and I did!&rdquo; That is intrinsic motivation
          — not a reminder, not a deadline, but a student who wants to engage. That is what
          Delphinium was built to create — and the data proves it works.
        </p>

        <h3 className="ex-subhead">Why it works — the research behind the design</h3>

        <div className="ex-gap">
          <div className="ex-gap-row" style={{ alignItems: 'start', padding: '6px 0', gridTemplateColumns: '118px 1fr', rowGap: '2px' }}>
            <div className="ex-gap-who">Self-Regulated Learning</div>
            <p className="ex-gap-tx" style={{ margin: '0 0 6px', fontSize: '12px' }}>
              When students have the right information, they can set meaningful goals, monitor
              their progress, and reflect on what&apos;s working —{' '}
              <b>adapting and driving their own learning.</b>
            </p>
            <InDelphiniumLabel />
            <ul className="ex-lever-list">
              <li>Students see their progress, performance, and priorities at a glance</li>
              <li>Progress updates create a feedback loop students use to adjust and improve</li>
              <li>A clear view of the whole journey helps students set goals and take ownership</li>
            </ul>
          </div>
          <div className="ex-gap-row" style={{ alignItems: 'start', padding: '6px 0', gridTemplateColumns: '118px 1fr', rowGap: '2px' }}>
            <div className="ex-gap-who">Behavioral Economics</div>
            <p className="ex-gap-tx" style={{ margin: '0 0 6px', fontSize: '12px' }}>
              When next steps are clear, timely, and easy to act on, students are more likely to
              follow through and <b>build momentum toward success.</b>
            </p>
            <InDelphiniumLabel />
            <ul className="ex-lever-list">
              <li>Clear visual cues make priorities and next steps easy to follow</li>
              <li>Timely nudges prompt action before students fall behind</li>
              <li>Celebrations and success signals reinforce momentum and persistence</li>
            </ul>
          </div>
          <div className="ex-gap-row" style={{ alignItems: 'start', padding: '6px 0', gridTemplateColumns: '118px 1fr', rowGap: '2px' }}>
            <div className="ex-gap-who">Social Presence</div>
            <p className="ex-gap-tx" style={{ margin: '0 0 6px', fontSize: '12px' }}>
              When students feel seen, connected, and supported, they are more likely to{' '}
              <b>engage, participate, and persist.</b>
            </p>
            <InDelphiniumLabel />
            <ul className="ex-lever-list">
              <li>Personalized outreach helps students feel seen and valued</li>
              <li>Students can feel the class moving around them — and know they&apos;re not alone</li>
              <li>Teachers can reach the right student at the right moment — before silence turns into withdrawal</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==================== PAGE C — WHY IT PAYS / TRUST ==================== */}
      <section className="sheet" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="page-label screen-only">{pageLabelC}</div>

        <div>
          <h3 className="ex-subhead is-top ex-canvas-title">
            Your school already runs on Canvas — make it work harder for you
          </h3>
          <svg width="100%" viewBox="0 0 1400 500" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', fontFamily: 'inherit' }}>
            <defs>
              <filter id="shadow-p09" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.18" />
              </filter>
              <marker id="arrow-p09" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" style={{ fill: 'var(--dl-text)' }} />
              </marker>
            </defs>

            {/* Start (top-left, gray) */}
            <rect x="10" y="60" width="612" height="120" rx="12" fill="#f0f0f0" strokeWidth="1.5" filter="url(#shadow-p09)" style={{ stroke: 'var(--dl-border)' }} />
            <text x="35" y="100" fontSize="26" fontWeight="bold" style={{ fill: 'var(--dl-text)' }}>Start with what you have…</text>
            <text x="35" y="140" fontSize="20" style={{ fill: 'var(--dl-text)' }}>Great teachers, curriculum, and tools</text>

            {/* Multiply (bottom-left, magenta tint) */}
            <rect x="10" y="250" width="612" height="130" rx="12" strokeWidth="1.5" filter="url(#shadow-p09)" style={{ fill: 'color-mix(in srgb, var(--dl-magenta) 10%, #fff)', stroke: 'var(--dl-magenta)' }} />
            <text x="35" y="292" fontSize="26" fontWeight="bold" style={{ fill: 'var(--dl-text)' }}>Multiply by Delphinium…</text>
            <text x="38" y="328" fontSize="20" style={{ fill: 'var(--dl-text)' }}>• The engagement and early-warning layer over your Canvas</text>
            <text x="38" y="360" fontSize="20" style={{ fill: 'var(--dl-text)' }}>• Students connect, build momentum, and drive their learning</text>

            {/* And you get (top-right, white) */}
            <rect x="700" y="10" width="680" height="216" rx="12" strokeWidth="1.5" filter="url(#shadow-p09)" style={{ fill: 'var(--dl-surface)', stroke: 'var(--dl-border)' }} />
            <text x="725" y="52" fontSize="26" fontWeight="bold" style={{ fill: 'var(--dl-text)' }}>And you get…</text>

            {/* pill: Students */}
            <rect x="725" y="72" width="132" height="40" rx="20" strokeWidth="1.5" style={{ fill: 'color-mix(in srgb, var(--dl-indigo) 10%, #fff)', stroke: 'var(--dl-indigo)' }} />
            <text x="791" y="98" fontSize="20" fontWeight="bold" textAnchor="middle" style={{ fill: 'var(--dl-indigo)' }}>Students</text>
            <text x="872" y="98" fontSize="20" style={{ fill: 'var(--dl-text)' }}>that see the whole path — and own it</text>

            {/* pill: Families */}
            <rect x="725" y="120" width="132" height="40" rx="20" strokeWidth="1.5" style={{ fill: 'color-mix(in srgb, var(--dl-indigo) 10%, #fff)', stroke: 'var(--dl-indigo)' }} />
            <text x="791" y="146" fontSize="20" fontWeight="bold" textAnchor="middle" style={{ fill: 'var(--dl-indigo)' }}>Families</text>
            <text x="872" y="146" fontSize="20" style={{ fill: 'var(--dl-text)' }}>armed with the knowledge to encourage and coach</text>

            {/* pill: Teachers */}
            <rect x="725" y="168" width="132" height="40" rx="20" strokeWidth="1.5" style={{ fill: 'color-mix(in srgb, var(--dl-indigo) 10%, #fff)', stroke: 'var(--dl-indigo)' }} />
            <text x="791" y="194" fontSize="20" fontWeight="bold" textAnchor="middle" style={{ fill: 'var(--dl-indigo)' }}>Teachers</text>
            <text x="872" y="194" fontSize="20" style={{ fill: 'var(--dl-text)' }}>that reach the right student at the right time</text>

            {/* Better outcomes (bottom-right, green tint) */}
            <rect x="700" y="284" width="680" height="196" rx="12" strokeWidth="1.5" filter="url(#shadow-p09)" style={{ fill: 'color-mix(in srgb, var(--dl-green) 10%, #fff)', stroke: 'var(--dl-green)' }} />
            <text x="725" y="324" fontSize="26" fontWeight="bold" style={{ fill: 'var(--dl-text)' }}>Better outcomes, top to bottom</text>
            <text x="728" y="360" fontSize="20" style={{ fill: 'var(--dl-text)' }}>• More students succeed — the first time</text>
            <text x="728" y="392" fontSize="20" style={{ fill: 'var(--dl-text)' }}>• Attendance, completion, and retention rise</text>
            <text x="728" y="424" fontSize="20" style={{ fill: 'var(--dl-text)' }}>• Families feel connected, informed, and confident</text>
            <text x="728" y="456" fontSize="20" style={{ fill: 'var(--dl-text)' }}>• Teachers do more in less time, with less frustration</text>

            {/* Start → Multiply (down) */}
            <path d="M305,180 L305,246" fill="none" strokeWidth="3" markerEnd="url(#arrow-p09)" style={{ stroke: 'var(--dl-text)' }} />

            {/* Multiply → And you get (elbow) */}
            <path d="M622,315 H644 A16,16 0 0 0 660,299 V111 A16,16 0 0 1 676,95 H696" fill="none" strokeWidth="3" markerEnd="url(#arrow-p09)" style={{ stroke: 'var(--dl-text)' }} />

            {/* And you get → Better outcomes (down) */}
            <path d="M970,226 L970,278" fill="none" strokeWidth="3" markerEnd="url(#arrow-p09)" style={{ stroke: 'var(--dl-text)' }} />
          </svg>
          <p className="ex-mult-roi">
            Results like a 31% drop in failures <b>means more</b> of the ~$229K invested in each
            student actually reaches the finish line — the same budget, working harder, every
            year.&nbsp;<b>Doing nothing is the most expensive option on the table.</b>
          </p>
        </div>

        {/* In their words — above logo panel (synced from DC 2026-07-08) */}
        <div className="ex-voices">
          <h3 className="ex-subhead">In their words...</h3>
          <div className="ex-voices-grid">
            <div className="ex-voice">
              <p className="ex-voice-tx">
                &ldquo;The enthusiasm generated by Delphinium has translated into increased
                engagement and work completion.&rdquo;
              </p>
              <div className="ex-voice-by">&mdash; Instructional Coach</div>
            </div>
            <div className="ex-voice">
              <p className="ex-voice-tx">
                &ldquo;We have had students redo a quiz that they did poorly on to earn more points
                so they could just earn googly eyes for their avatar!&rdquo;
              </p>
              <div className="ex-voice-by">&mdash; Online Teacher</div>
            </div>
            <div className="ex-voice">
              <p className="ex-voice-tx">
                &ldquo;[Delphinium has] given me so much more opportunity to work one-on-one with
                my students. That&apos;s why I went into teaching!
                <br />
                <br />
                This has saved most of my Saturday nights!&rdquo;
              </p>
              <div className="ex-voice-by">&mdash; Math Teacher</div>
            </div>
          </div>
        </div>

        <h3 className="ex-subhead">Over 125,000 Delphinium enrollments this year</h3>
        <p className="ex-lead ex-enroll-lead">
          The investment in engagement has already paid off, at scale, in schools like yours!
        </p>
        <div className="ex-clients">
          <div className="ex-logos">
            <div className="ex-logo-card">
              <img
                src="https://delphi-me.com/hs-fs/hubfs/Davis%20School%20District.png?width=1340&height=250&name=Davis%20School%20District.png"
                alt="Davis School District"
              />
            </div>
            <div className="ex-logo-card">
              <img
                src="https://delphi-me.com/hs-fs/hubfs/vpw_logo_no_motto.webp?width=398&height=250&name=vpw_logo_no_motto.webp"
                alt="VPW"
              />
            </div>
            <div className="ex-logo-card">
              <img
                src="https://delphi-me.com/hs-fs/hubfs/cropped-utva_pbk12_logo_rgb-1.webp?width=908&height=250&name=cropped-utva_pbk12_logo_rgb-1.webp"
                alt="UTVA PBK12"
              />
            </div>
            <div className="ex-logo-card">
              <img
                src="https://delphi-me.com/hs-fs/hubfs/bakerwebacademylogo.webp?width=250&height=250&name=bakerwebacademylogo.webp"
                alt="Baker Web Academy"
              />
            </div>
            <div className="ex-logo-card">
              <img
                src="https://delphi-me.com/hs-fs/hubfs/weblogo-e1668897946927.png?width=750&height=250&name=weblogo-e1668897946927.png"
                alt="School logo"
              />
            </div>
            <div className="ex-logo-card">
              <img
                src="https://delphi-me.com/hs-fs/hubfs/web_kelseypeak_logo.png?width=750&height=250&name=web_kelseypeak_logo.png"
                alt="Kelsey Peak"
              />
            </div>
            <div className="ex-logo-card">
              <img
                src="https://delphi-me.com/hs-fs/hubfs/web_rockypeak_logo.png?width=750&height=250&name=web_rockypeak_logo.png"
                alt="Rocky Peak"
              />
            </div>
            <div className="ex-logo-card">
              <img
                src="https://images.squarespace-cdn.com/content/v1/582f38b737c581192c45a53d/5ec03609-0938-417f-95ce-a4b4b849d250/logo.gif"
                alt="School logo"
              />
            </div>
          </div>
        </div>

        {/* Video cards */}
        <h3 className="ex-subhead">Hear the full story</h3>
        <p className="ex-lead" style={{ margin: '0 0 10px' }}>
          Meet the educators who use Delphinium every day to drive better outcomes for their
          students.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <a
            href="https://www.youtube.com/watch?v=Tp3IO0TzvM0"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: 'var(--dl-surface)',
              border: '1px solid var(--dl-border)',
              borderRadius: 'var(--dl-radius)',
              padding: '14px 16px',
              textDecoration: 'none',
              color: 'inherit',
              boxShadow: '0 2px 8px rgba(46,49,146,0.08), 0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ flex: 'none', width: '40px', height: '40px', borderRadius: '50%', background: 'color-mix(in srgb, var(--dl-indigo) 12%, #fff)', border: '1px solid color-mix(in srgb, var(--dl-indigo) 25%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" style={{ fill: 'var(--dl-indigo)', marginLeft: '2px' }}><path d="M8 5v14l11-7z" /></svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
              <div style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '1.3px', textTransform: 'uppercase', color: 'var(--dl-indigo)' }}>Watch video</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', lineHeight: 1.3, color: 'var(--dl-text)' }}>Digital learning &amp; curriculum directors</div>
            </div>
          </a>

          <a
            href="https://www.youtube.com/watch?v=3N0SXpFT36w"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: 'var(--dl-surface)',
              border: '1px solid var(--dl-border)',
              borderRadius: 'var(--dl-radius)',
              padding: '14px 16px',
              textDecoration: 'none',
              color: 'inherit',
              boxShadow: '0 2px 8px rgba(46,49,146,0.08), 0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ flex: 'none', width: '40px', height: '40px', borderRadius: '50%', background: 'color-mix(in srgb, var(--dl-indigo) 12%, #fff)', border: '1px solid color-mix(in srgb, var(--dl-indigo) 25%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" style={{ fill: 'var(--dl-indigo)', marginLeft: '2px' }}><path d="M8 5v14l11-7z" /></svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
              <div style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '1.3px', textTransform: 'uppercase', color: 'var(--dl-indigo)' }}>Watch video</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', lineHeight: 1.3, color: 'var(--dl-text)' }}>Teachers &amp; instructional coaches</div>
            </div>
          </a>
        </div>
      </section>

      {/* ==================== PAGE D — RESEARCH CITATIONS (optional; use ResearchFoundationSection when omitted) ==================== */}
      {pageLabelD && (
      <section className="sheet" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="page-label screen-only">{pageLabelD}</div>

        <div className="ex-kicker">
          <span className="ex-tick"></span>Research foundation
        </div>
        <h2 className="ex-h">
          Published &amp; peer-reviewed research
        </h2>
        <p className="ex-lead" style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--dl-text-muted)' }}>
          Delphinium is built on 14 years of academic research by the founding team. The following
          studies underpin the engagement science behind the platform.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {CITATIONS.map((cit, i) => (
            <div key={i} style={{ padding: '8px 0' }}>
              <div
                style={{ fontSize: '12px', lineHeight: 1.55, color: 'var(--dl-text)' }}
                dangerouslySetInnerHTML={{ __html: cit }}
              />
            </div>
          ))}
        </div>
      </section>
      )}
    </>
  );
}
