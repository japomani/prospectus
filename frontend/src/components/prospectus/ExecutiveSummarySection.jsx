import { Field } from './Field.jsx';
import PeerLogosRow from './PeerLogosRow.jsx';

const RESEARCH_PILLARS = [
  {
    title: 'Self-regulated learning',
    body: 'Students see where they\u2019ve been, where they are, and where they\u2019re going \u2014 and set their own goals.',
  },
  {
    title: 'Behavioral economics',
    body: 'Countdown timers, progress meters, prize boxes, and celebrations nudge students back into the course.',
  },
  {
    title: 'Social presence',
    body: '"Who\u2019s Near Me" and shared avatars help online students feel connected \u2014 countering quiet isolation.',
  },
];

const PERSONAS_K12 = [
  {
    title: 'For directors & budget holders',
    body: 'Lower failure rates protect what you already spend on every student, with one consistent experience across every course.',
  },
  {
    title: 'For principals',
    body: 'Teachers adopt it because there\u2019s nothing new to learn, parents can finally see how their student is doing, and your school reads as engaged to the district.',
  },
  {
    title: 'For teachers',
    body: 'Find and message every struggling student in under a minute \u2014 and get your Saturday nights back.',
  },
  {
    title: 'For IT & LMS admins',
    body: 'No migration, no new platform, FERPA-safe, and light enough for Chromebooks on constrained Wi-Fi.',
  },
];

const PERSONAS_UNIVERSITY = [
  {
    title: 'For deans & budget holders',
    body: 'Lower failure rates protect what you already spend on every student, with one consistent experience across every course.',
  },
  {
    title: 'For program leads',
    body: 'Instructors adopt it because there\u2019s nothing new to learn, and your program reads as engaged and supported to leadership.',
  },
  {
    title: 'For instructors',
    body: 'Find and message every struggling student in under a minute \u2014 and get your evenings back.',
  },
  {
    title: 'For IT & LMS admins',
    body: 'No migration, no new platform, FERPA-safe, and light enough for any device on constrained Wi-Fi.',
  },
];

export default function ExecutiveSummarySection({
  fields,
  quote,
  highlightFields,
  pageLabel = '02 · The reason to buy',
  pageLabelB = '03 · The reason to buy',
}) {
  const hl = highlightFields;
  const isUniversity = Boolean(quote?.isUniversity);
  const painPoints = [fields.PAIN_POINT_1, fields.PAIN_POINT_2, fields.PAIN_POINT_3];
  const personas = isUniversity ? PERSONAS_UNIVERSITY : PERSONAS_K12;

  return (
    <>
      <section className="sheet exec-framing">
        <div className="page-label screen-only">{pageLabel}</div>
        <div className="doc-kicker">Executive summary</div>
        <h2 className="doc-h2 exec-framing-title">The reason to buy</h2>

        <p className="exec-framing-thesis">
          <Field value={fields.SCHOOL_NAME} highlight={hl} />
          {' '}
          already runs on Canvas. What it&apos;s missing is a reason for students to
          {' '}
          <span className="exec-framing-accent">want</span>
          {' '}
          to open it
          {isUniversity ? (
            <> &mdash; and a way for instructors to see who&apos;s slipping while there&apos;s still time to act.</>
          ) : (
            <> &mdash; and a way for parents and teachers to see who&apos;s slipping while there&apos;s still time to act.</>
          )}
        </p>

        <div className="keep exec-framing-block">
          <div className="exec-framing-label">The problem</div>
          <div className="exec-framing-problem">
            <div>
              <p className="exec-framing-body">
                Canvas is data-rich but insight-poor &mdash; a gray wall of text that delivers content
                without doing anything to make students want to engage with it. At
                {' '}
                <Field value={fields.SCHOOL_NAME} highlight={hl} />
                , you&apos;re working to solve
                {' '}
                <Field value={fields.PRIMARY_PAIN} highlight={hl} />
                , and a few specific pressures sit underneath it:
              </p>
              <div className="doc-pain-list exec-framing-pain-list">
                {painPoints.map(point => (
                  <div key={point} className="doc-pain-item exec-framing-pain-item">
                    <span className="doc-pain-arrow">&rarr;</span>
                    <div className="doc-pain-text">
                      <Field value={point} highlight={hl} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <blockquote className="exec-framing-quote">
              <p className="exec-framing-quote-tx">
                &ldquo;If you ask kids, they don&apos;t like Canvas. It&apos;s basic&hellip; it needs
                something else to engage.&rdquo;
              </p>
              <div className="exec-framing-quote-by">
                &mdash; Ryan Hansen, Digital Learning Director, Davis School District
              </div>
            </blockquote>
          </div>
        </div>

        <div className="keep exec-framing-cost">
          <b>The cost of doing nothing.</b>
          {' '}
          You already pay for teachers, content, and technology for every student. When a student fails,
          that spend is wasted &mdash; so cutting the failure rate multiplies the return on everything else.
        </div>

        <div className="keep exec-framing-block">
          <div className="exec-framing-label">The solution</div>
          <p className="exec-framing-body">
            Delphinium is the engagement layer for Canvas: a 3-minute makeover that turns existing courses
            into visual, motivating experiences, plus a Control Tower that shows who needs help before it&apos;s
            too late. No migration. Nothing new for teachers to learn &mdash; just turn it on.
          </p>
        </div>
      </section>

      <section className="sheet exec-framing">
        <div className="page-label screen-only">{pageLabelB}</div>
        <div className="doc-kicker">Executive summary</div>
        <h2 className="doc-h2 exec-framing-title">Why it works &mdash; and who it&apos;s for</h2>

        <div className="keep exec-framing-block">
          <div className="exec-framing-label">Why it works</div>
          <p className="exec-framing-body exec-framing-body--tight">
            Not gamification for its own sake &mdash; three research-backed principles applied to learning.
          </p>
          <div className="exec-framing-pillars">
            {RESEARCH_PILLARS.map(({ title, body }) => (
              <div key={title} className="exec-framing-pillar">
                <div className="exec-framing-pillar-title">{title}</div>
                <div className="exec-framing-pillar-body">{body}</div>
              </div>
            ))}
          </div>
          <div className="exec-framing-research">
            <b>Grounded in 14 years of published research.</b>
            {' '}
            Built by Dr. Jared R. Chapman (PhD, MBA, MEd), studying online engagement since 2012.
          </div>
        </div>

        <div className="keep doc-panel-mint exec-framing-reframe">
          <div className="exec-framing-label">Already getting good use out of Canvas?</div>
          <p className="exec-framing-body">
            That&apos;s exactly the point. Delphinium isn&apos;t for schools struggling with Canvas basics &mdash;
            it&apos;s for schools that already have Canvas working and want to go from functional to genuinely
            engaging. The Davis result happened at a district already using Canvas well.
          </p>
        </div>

        <div className="keep exec-framing-block">
          <div className="exec-framing-label">What Delphinium means for your team</div>
          <div className="exec-personas">
            {personas.map(({ title, body }) => (
              <div key={title} className="exec-persona">
                <div className="exec-persona-title">{title}</div>
                <div className="exec-persona-body">{body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="keep exec-framing-block">
          <div className="exec-framing-label">Reason to believe</div>
          <div className="exec-framing-proof">
            <div className="exec-framing-stat">
              <div className="exec-framing-stat-num">72%</div>
              <div className="exec-framing-stat-label">call it &ldquo;much more motivating&rdquo;</div>
              <div className="exec-framing-stat-src">
                Student survey &middot; most common one-word answer: &ldquo;Fun&rdquo;
              </div>
            </div>
            <blockquote className="exec-framing-quote exec-framing-quote--compact">
              <p className="exec-framing-quote-tx">
                &ldquo;We can confidently say we&apos;re seeing better success with Delphinium&hellip; we&apos;re in
                the process of going districtwide.&rdquo;
              </p>
              <div className="exec-framing-quote-by">
                &mdash; Ryan Hansen, Digital Learning Director, Davis School District
              </div>
            </blockquote>
          </div>
          <PeerLogosRow
            peerReference={fields.PEER_REFERENCE}
            highlight={hl}
            className="exec-framing-peers"
          />
        </div>

        <div className="keep doc-panel-green exec-framing-outcome">
          <div className="doc-panel-label-green">The outcome</div>
          <div className="exec-framing-body">
            Students who actually log in, teachers who catch trouble early, and hours of manual outreach
            handed back to your staff.
          </div>
        </div>
      </section>
    </>
  );
}
