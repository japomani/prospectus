import CoverSection from './CoverSection.jsx';
import { Field } from './Field.jsx';

function SecuritySection() {
  return (
    <section className="sheet">
      <div className="page-label screen-only">08 · Security &amp; privacy</div>
      <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1.6px', textTransform: 'uppercase', color: '#1879cd', marginBottom: '6px' }}>
        Security &amp; privacy
      </div>
      <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#424242', margin: '0 0 10px' }}>
        SECURITY, PRIVACY &amp; ACCESSIBILITY
      </h2>
      <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: '#424242', margin: '0 0 8px', fontWeight: 'bold' }}>
        Built for FERPA, hosted on AWS
      </p>
      <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: '#424242', margin: '0 0 16px' }}>
        Delphinium is a Canvas LTI 1.3 plugin running serverless on AWS.
      </p>

      <div className="dCard keep" style={{ margin: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#424242', marginBottom: '10px' }}>Security</div>
        <ul style={{ margin: '0 0 16px', paddingLeft: '18px' }}>
          <li style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#424242', marginBottom: '10px' }}>
            Encrypted everywhere: AES-256 at rest plus S3 server-side encryption;
            HTTPS/TLS in transit; storage isolated from the public internet.
          </li>
          <li style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#424242', marginBottom: '10px' }}>
            Least-privilege access via AWS IAM with 2FA required; activity logged
            via CloudTrail.
          </li>
          <li style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#424242', marginBottom: '10px' }}>
            Encrypted, point-in-time backups and disaster recovery plan.
          </li>
          <li style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#424242', marginBottom: '10px' }}>
            Regular external penetration testing and continuous monitoring via AWS
            Security Hub and Snyk.
          </li>
          <li style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#424242', marginBottom: '10px' }}>
            Infrastructure compliance (SOC 2 / ISO 27001, physical security)
            inherited from AWS.
          </li>
          <li style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#424242', marginBottom: '10px' }}>
            Cyber-liability insurance in place ($1M per claim / $2M aggregate).
          </li>
        </ul>

        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#424242', marginBottom: '10px' }}>Privacy</div>
        <ul style={{ margin: '0 0 16px', paddingLeft: '18px' }}>
          <li style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#424242', marginBottom: '10px' }}>
            All storage and processing in the United States.
          </li>
          <li style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#424242', marginBottom: '10px' }}>
            Student data is never sold or shared with third parties.
          </li>
        </ul>

        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#424242', marginBottom: '10px' }}>Accessibility</div>
        <ul style={{ margin: 0, paddingLeft: '18px' }}>
          <li style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#424242', marginBottom: '10px' }}>
            Published VPAT.
          </li>
          <li style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#424242' }}>
            Full details: tutorials.delphi-me.com/deep_dive/admin/compliance
          </li>
        </ul>
      </div>
    </section>
  );
}

export default function ProspectusDocument({ fields, quote, highlightFields }) {
  const f = fields;
  const hl = highlightFields;

  return (
    <main className={`doc${hl ? '' : ' nofld'}`}>
      <table className="doc-frame" role="presentation">
        <thead><tr><td className="hdr-space" /></tr></thead>
        <tbody>
          <tr>
            <td>
              <CoverSection fields={f} quote={quote} highlightFields={hl} />

              {/* 02 · Executive summary */}
              <section className="sheet">
                <div className="page-label screen-only">02 · Executive summary</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1.6px', textTransform: 'uppercase', color: '#1879cd', marginBottom: '6px' }}>Executive summary</div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#424242', margin: '0 0 20px' }}>At a glance</h2>

                <div className="keep" style={{ textAlign: 'center', padding: '20px 0 26px', borderBottom: '1px solid #e3e8e7', marginBottom: '24px' }}>
                  <div style={{ fontSize: '80px', fontWeight: 'bold', color: '#1879cd', lineHeight: 1 }}>31%</div>
                  <div style={{ fontSize: '13px', color: '#5b6361', marginTop: '6px' }}>fewer course failures · Davis School District · 6,000 fully online students</div>
                </div>

                <div className="keep" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#e3f0fb', borderRadius: '6px', padding: '18px 20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1.4px', textTransform: 'uppercase', color: '#1879cd', marginBottom: '8px' }}>The challenge</div>
                    <div style={{ fontSize: '14px', lineHeight: 1.55, color: '#424242' }}>
                      <Field value={f.SCHOOL_NAME} highlight={hl} />
                      {' '}
                      runs a
                      {' '}
                      <Field value={f.SCHOOL_TYPE} highlight={hl} />
                      {' '}
                      program where students work asynchronously in Canvas. The pain:
                      {' '}
                      <Field value={f.PRIMARY_PAIN} highlight={hl} />
                      . Every student who doesn&apos;t finish wastes resources you&apos;ve already spent.
                    </div>
                  </div>
                  <div style={{ background: '#e2f4ea', borderRadius: '6px', padding: '18px 20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1.4px', textTransform: 'uppercase', color: '#00A652', marginBottom: '8px' }}>The outcome</div>
                    <div style={{ fontSize: '14px', lineHeight: 1.55, color: '#424242' }}>
                      A 31% drop in course failure rates across 6,000 fully online students — plus an early-warning system that gives teachers their Saturday nights back.
                    </div>
                  </div>
                  <div style={{ background: '#FBFAD2', borderRadius: '6px', padding: '18px 20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1.4px', textTransform: 'uppercase', color: '#5b6361', marginBottom: '8px' }}>The recommended plan</div>
                    <div style={{ fontSize: '14px', lineHeight: 1.55, color: '#424242' }}>
                      Core (included) plus your selected modules and add-ons.
                      {' '}
                      <Field value={f.ANNUAL_PRICE} highlight={hl} />
                      {' '}
                      per year,
                      {' '}
                      <Field value={f.TERM_TOTAL} highlight={hl} />
                      {' '}
                      over
                      {' '}
                      <Field value={f.TERM_YEARS} highlight={hl} />
                      .
                    </div>
                  </div>
                  <div style={{ background: '#fde0f0', borderRadius: '6px', padding: '18px 20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1.4px', textTransform: 'uppercase', color: '#ED008C', marginBottom: '8px' }}>The next step</div>
                    <div style={{ fontSize: '14px', lineHeight: 1.55, color: '#424242' }}>Start a 30-day free trial on your own courses, or book a 30-minute working session. No migration, no commitment.</div>
                  </div>
                </div>
              </section>

              {/* 03 · The problem */}
              <section className="sheet">
                <div className="page-label screen-only">03 · The problem</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1.6px', textTransform: 'uppercase', color: '#1879cd', marginBottom: '6px' }}>The problem</div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#424242', margin: '0 0 16px' }}>Which class would your students rather take?</h2>
                <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: '#424242', margin: '0 0 14px' }}>
                  Canvas is data-rich but insight-poor — a gray wall of text. Teachers find it frustrating, students find it boring, and parents can&apos;t tell how their child is doing. At
                  {' '}
                  <Field value={f.SCHOOL_NAME} highlight={hl} />
                  , you&apos;re trying to solve:
                </p>
                {[f.PAIN_POINT_1, f.PAIN_POINT_2, f.PAIN_POINT_3].map((point, i) => (
                  <div
                    key={point}
                    className="keep"
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      padding: '12px 16px',
                      borderLeft: '3px solid #1879cd',
                      background: '#e3f0fb',
                      borderRadius: '0 6px 6px 0',
                      marginBottom: i < 2 ? '8px' : '20px',
                    }}
                  >
                    <span style={{ color: '#1879cd', fontWeight: 'bold', fontSize: '16px', lineHeight: 1, flex: 'none' }}>→</span>
                    <div style={{ fontSize: '14.5px', fontWeight: 'bold', color: '#424242' }}>
                      <Field value={point} highlight={hl} />
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: '13px', color: '#5b6361', marginBottom: '10px' }}>The same Canvas course, before and after Delphinium.</div>
                <div className="keep" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                  <div style={{ border: '1.5px dashed #c9cdd0', borderRadius: '6px', height: '148px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9aa1a0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>Before</div>
                    <div style={{ fontSize: '11.5px', marginTop: '4px' }}>Standard Canvas screenshot</div>
                  </div>
                  <div style={{ border: '1.5px dashed #1879cd', borderRadius: '6px', height: '148px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#1879cd', background: '#e3f0fb' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>After</div>
                    <div style={{ fontSize: '11.5px', marginTop: '4px', color: '#1366af' }}>Delphinium screenshot</div>
                  </div>
                </div>
                <div className="keep" style={{ background: '#FBFAD2', borderRadius: '6px', padding: '16px 20px' }}>
                  <div style={{ fontSize: '14.5px', lineHeight: 1.6, color: '#424242' }}>
                    <b>The cost of doing nothing.</b>
                    {' '}
                    You already pay for teachers, content, and technology for every student. When a student fails, that spend is wasted — so cutting the failure rate multiplies the return on everything else.
                  </div>
                </div>
              </section>

              {/* 04 · Why it works */}
              <section className="sheet" style={{ background: '#D2EBE8' }}>
                <div className="page-label screen-only" style={{ color: '#4a8a80' }}>04 · Why it works</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1.6px', textTransform: 'uppercase', color: '#1F7A6A', marginBottom: '6px' }}>Why it works</div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#424242', margin: '0 0 8px' }}>Do more, in less time</h2>
                <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: '#424242', margin: '0 0 18px' }}>Not gamification for its own sake — three research-backed principles, the same forces that make apps hard to put down, applied to learning.</p>
                <div className="keep" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                  {[
                    ['Self-regulated learning', 'Students see where they\'ve been, where they are, and where they\'re going — and set their own goals.'],
                    ['Behavioral economics', 'Countdown timers, progress meters, prize boxes, and celebrations nudge students back into the course.'],
                    ['Social presence', '"Who\'s Near Me" and shared avatars help online students feel connected — countering quiet isolation.'],
                  ].map(([title, body]) => (
                    <div key={title} className="dCard" style={{ margin: 0 }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#424242', marginBottom: '8px' }}>{title}</div>
                      <div style={{ fontSize: '13.5px', lineHeight: 1.5, color: '#424242' }}>{body}</div>
                    </div>
                  ))}
                </div>
                <div className="keep" style={{ background: '#2E3192', borderRadius: '6px', padding: '18px 22px' }}>
                  <div style={{ fontSize: '14.5px', lineHeight: 1.6, color: '#fff' }}>
                    <b style={{ color: '#B4DED9' }}>Grounded in 14 years of research.</b>
                    {' '}
                    Built by Dr. Jared R. Chapman (PhD, MBA, MEd), studying online engagement since 2012. The peer-reviewed work is on Google Scholar.
                  </div>
                </div>
              </section>

              {/* 05 · What you get */}
              <section className="sheet">
                <div className="page-label screen-only">05 · What you get</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1.6px', textTransform: 'uppercase', color: '#1879cd', marginBottom: '6px' }}>What you get</div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#424242', margin: '0 0 16px' }}>
                  What
                  {' '}
                  <Field value={f.SCHOOL_NAME} highlight={hl} />
                  {' '}
                  gets
                </h2>
                <div className="keep" style={{ background: '#D2EBE8', borderRadius: '6px', padding: '18px 20px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#424242' }}>Delphinium Core</span>
                    <span className="dBadge dBadgeSuccess">Included</span>
                  </div>
                  <div style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#424242' }}>Control Tower (student data at a glance, engagement / progress / performance tracking, assignment &amp; class stats, message history), data management, and support — the foundation in every plan.</div>
                </div>
                <div className="keep" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  {[
                    { name: 'Engagement Builder', bg: '#e3f0fb', price: f.EB_PRICE, show: quote.engagementBuilder, items: ['The 3-minute Makeover', 'Gamification: avatars, prize boxes, Who\'s Near Me', 'Parent view, Periscope, Layout Editor'] },
                    { name: 'Community Builder', bg: '#FBFAD2', price: f.CB_PRICE, show: quote.communityBuilder, items: ['Message Center: scheduled & targeted', 'Templates, blocks, banners', 'Auto-translation, 160 languages'] },
                    { name: 'Control Tower Ultra', bg: '#fde0f0', price: f.CTU_PRICE, show: quote.controlTowerUltra, items: ['Cross-course visibility', 'Students, parents, teachers, admins', 'Research access'] },
                  ].filter(m => m.show).map(mod => (
                    <div key={mod.name} className="dCard" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
                      <div style={{ padding: '12px 20px', background: mod.bg, borderRadius: '6px 6px 0 0', marginBottom: '14px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#424242' }}>{mod.name}</div>
                      </div>
                      <div style={{ padding: '0 20px 20px' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ED008C', marginBottom: '2px' }}><Field value={mod.price} highlight={hl} /></div>
                        <div style={{ fontSize: '10.5px', letterSpacing: '1px', textTransform: 'uppercase', color: '#5b6361', marginBottom: '12px' }}>per year</div>
                        <ul style={{ margin: 0, paddingLeft: '16px' }}>
                          {mod.items.map(item => (
                            <li key={item} style={{ fontSize: '13px', lineHeight: 1.5, color: '#424242', marginBottom: '4px' }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
                {(quote.clever || quote.sms) && (
                  <div className="keep" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {quote.clever && (
                      <div className="dCard" style={{ margin: 0 }}>
                        <div style={{ fontSize: '14.5px', fontWeight: 'bold', color: '#424242' }}>
                          Clever integration
                          {' '}
                          <Field value={f.CLEVER_FEE} highlight={hl} />
                        </div>
                        <div style={{ fontSize: '13px', color: '#5b6361', marginTop: '4px' }}>Add-on — expanded parent communication.</div>
                      </div>
                    )}
                    {quote.sms && (
                      <div className="dCard" style={{ margin: 0 }}>
                        <div style={{ fontSize: '14.5px', fontWeight: 'bold', color: '#424242' }}>
                          SMS texting
                          {' '}
                          <Field value={f.SMS_FEE} highlight={hl} />
                        </div>
                        <div style={{ fontSize: '13px', color: '#5b6361', marginTop: '4px' }}>Add-on — reach families on their phones.</div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* 06 · Pricing & value */}
              <section className="sheet">
                <div className="page-label screen-only">06 · Pricing &amp; value</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1.6px', textTransform: 'uppercase', color: '#1879cd', marginBottom: '6px' }}>Pricing &amp; value</div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#424242', margin: '0 0 16px' }}>Your investment</h2>
                <div className="keep" style={{ background: '#fde0f0', borderRadius: '6px', padding: '22px', textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#ED008C', marginBottom: '8px' }}>
                    Annual price for
                    {' '}
                    <Field value={f.SCHOOL_NAME} highlight={hl} />
                  </div>
                  <div style={{ fontSize: '46px', fontWeight: 'bold', color: '#ED008C', lineHeight: 1, marginBottom: '6px' }}><Field value={f.ANNUAL_PRICE} highlight={hl} /></div>
                  <div style={{ fontSize: '13px', color: '#5b6361' }}>Core + selected modules + add-ons, priced by school.</div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1.4px', textTransform: 'uppercase', color: '#00A652', marginBottom: '8px' }}>What you save</div>
                <div className="keep" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                  {[
                    ['Per year', f.ANNUAL_SAVINGS],
                    ['Volume discount', f.VOLUME_DISCOUNT],
                    ['Multi-product', f.MULTI_DISCOUNT],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: '#e2f4ea', borderRadius: '6px', padding: '16px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#00A652', marginBottom: '6px' }}>{label}</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#424242' }}><Field value={val} highlight={hl} /></div>
                    </div>
                  ))}
                  <div style={{ background: '#00A652', borderRadius: '6px', padding: '16px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#d6f0e1', marginBottom: '6px' }}>
                      Over
                      {' '}
                      <Field value={f.TERM_YEARS} highlight={hl} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}><Field value={f.TOTAL_SAVINGS} highlight={hl} /></div>
                  </div>
                </div>
                <table className="dTable keep" style={{ marginBottom: '16px' }}>
                  <tbody>
                    <tr style={{ background: '#D2EBE8' }}><td style={{ color: '#424242' }}>Delphinium Core <span style={{ color: '#5b6361', fontSize: '12px' }}>included</span></td><td style={{ textAlign: 'right', fontWeight: 'bold', color: '#00A652' }}>Included</td></tr>
                    {quote.engagementBuilder && <tr><td style={{ color: '#424242' }}>Engagement Builder</td><td style={{ textAlign: 'right', fontWeight: 'bold', color: '#ED008C' }}><Field value={f.EB_PRICE} highlight={hl} /></td></tr>}
                    {quote.communityBuilder && <tr><td style={{ color: '#424242' }}>Community Builder</td><td style={{ textAlign: 'right', fontWeight: 'bold', color: '#ED008C' }}><Field value={f.CB_PRICE} highlight={hl} /></td></tr>}
                    {quote.controlTowerUltra && <tr><td style={{ color: '#424242' }}>Control Tower Ultra</td><td style={{ textAlign: 'right', fontWeight: 'bold', color: '#ED008C' }}><Field value={f.CTU_PRICE} highlight={hl} /></td></tr>}
                    {quote.clever && <tr><td style={{ color: '#424242' }}>Clever integration <span style={{ color: '#5b6361', fontSize: '12px' }}>(add-on)</span></td><td style={{ textAlign: 'right', fontWeight: 'bold', color: '#ED008C' }}><Field value={f.CLEVER_FEE} highlight={hl} /></td></tr>}
                    {quote.sms && <tr><td style={{ color: '#424242' }}>SMS texting <span style={{ color: '#5b6361', fontSize: '12px' }}>(add-on)</span></td><td style={{ textAlign: 'right', fontWeight: 'bold', color: '#ED008C' }}><Field value={f.SMS_FEE} highlight={hl} /></td></tr>}
                    <tr><td style={{ fontWeight: 'bold', color: '#424242' }}>List price <span style={{ color: '#5b6361', fontSize: '12px', fontWeight: 'normal' }}>before discounts</span></td><td style={{ textAlign: 'right', fontWeight: 'bold', color: '#424242' }}><Field value={f.LIST_TOTAL} highlight={hl} /></td></tr>
                    <tr style={{ background: '#fde0f0' }}><td style={{ fontWeight: 'bold', color: '#ED008C' }}>Annual price <span style={{ color: '#5b6361', fontSize: '12px', fontWeight: 'normal' }}>after discounts</span></td><td style={{ textAlign: 'right', fontWeight: 'bold', color: '#ED008C' }}><Field value={f.ANNUAL_PRICE} highlight={hl} /></td></tr>
                    <tr><td style={{ color: '#424242' }}>One-time implementation <span style={{ color: '#5b6361', fontSize: '12px' }}>Year 1 — setup, templates, training</span></td><td style={{ textAlign: 'right', fontWeight: 'bold', color: '#ED008C' }}><Field value={f.IMPLEMENTATION_FEE} highlight={hl} /></td></tr>
                  </tbody>
                </table>
                <div className="keep" style={{ background: '#FBFAD2', borderRadius: '6px', padding: '16px 20px' }}>
                  <div style={{ fontSize: '14.5px', lineHeight: 1.6, color: '#424242' }}>
                    Over the full term,
                    {' '}
                    <Field value={f.SCHOOL_NAME} highlight={hl} />
                    {' '}
                    invests
                    {' '}
                    <Field value={f.TERM_TOTAL} highlight={hl} />
                    {' '}
                    and saves
                    {' '}
                    <Field value={f.TOTAL_SAVINGS} highlight={hl} />
                    {' '}
                    versus list price.
                  </div>
                </div>
              </section>

              {/* 07 · Try it */}
              <section className="sheet" style={{ background: '#e3f0fb' }}>
                <div className="page-label screen-only" style={{ color: '#4a7aaa' }}>07 · Try it with low risk</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1.6px', textTransform: 'uppercase', color: '#1879cd', marginBottom: '6px' }}>Try it with low risk</div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#424242', margin: '0 0 18px' }}>See it on your own courses first</h2>
                <div className="dCard keep" style={{ margin: '0 0 18px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ED008C', marginBottom: '10px' }}>30-day free trial</div>
                  <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: '#424242', margin: '0 0 12px' }}>Turn on the full Delphinium experience in your own Canvas courses for 30 days. No migration, no commitment — see the before-and-after for yourself before you decide.</p>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#424242', margin: '0 0 12px' }}>
                    Want a more structured evaluation? A guided pilot is available for
                    {' '}
                    <Field value={f.PILOT_FEE} highlight={hl} />
                    {' '}
                    (typically $5,000): we set up your templates, train your teachers, and run Delphinium across live courses. If you move to a full agreement, the entire pilot fee is credited toward your license.
                  </p>
                  <p style={{ fontSize: '13px', color: '#5b6361', margin: 0 }}>
                    References from
                    {' '}
                    <Field value={f.PEER_REFERENCE} highlight={hl} />
                    {' '}
                    available on request.
                  </p>
                </div>
                <div className="keep" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {['Works in your existing Canvas', 'No credit card required', 'Nothing new for teachers to learn'].map(label => (
                    <div key={label} style={{ background: '#fff', border: '1px solid #c8ddf0', borderRadius: '4px', padding: '8px 16px', fontSize: '12.5px', fontWeight: 'bold', color: '#1879cd' }}>
                      <span style={{ color: '#00A652' }}>✓</span>
                      {' '}
                      {label}
                    </div>
                  ))}
                </div>
              </section>

              <SecuritySection />

              {/* 09 · Implementation */}
              <section className="sheet">
                <div className="page-label screen-only">09 · Implementation &amp; onboarding</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1.6px', textTransform: 'uppercase', color: '#1879cd', marginBottom: '6px' }}>Implementation &amp; onboarding</div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#424242', margin: '0 0 8px' }}>Live in 3 minutes per course</h2>
                <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: '#424242', margin: '0 0 18px' }}>Nothing new for teachers to learn — they keep using Canvas as they do today, and Delphinium reflects whatever they build. About 45 seconds by the second course.</p>
                <div className="keep" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  {[
                    ['Year-1 setup', 'We configure Delphinium and build your school\'s layout and message templates.'],
                    ['4 live teacher trainings', 'We walk your teachers through setup and best practices over four sessions.'],
                    ['View customization', 'We tailor the default 3-minute experience to your school\'s look and priorities.'],
                    ['Support Center', 'H5P video lessons, an active community, and in-app "Learn More" guidance everywhere.'],
                  ].map(([title, body], i) => (
                    <div key={title} className="dCard" style={{ margin: 0 }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1879cd', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>{i + 1}</div>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#424242', marginBottom: '6px' }}>{title}</div>
                      <div style={{ fontSize: '13.5px', lineHeight: 1.5, color: '#424242' }}>{body}</div>
                    </div>
                  ))}
                </div>
                <div className="keep" style={{ background: '#fde0f0', borderRadius: '6px', padding: '16px 20px' }}>
                  <div style={{ fontSize: '14.5px', lineHeight: 1.6, color: '#424242' }}>
                    Target go-live:
                    {' '}
                    <Field value={f.TARGET_GO_LIVE} highlight={hl} />
                    . We recommend going live before a term starts so students meet the new experience on day one.
                  </div>
                </div>
              </section>

              {/* 10 · Testimonials */}
              <section className="sheet">
                <div className="page-label screen-only">10 · In their words</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1.6px', textTransform: 'uppercase', color: '#1879cd', marginBottom: '6px' }}>In their words</div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#424242', margin: '0 0 18px' }}>What people say</h2>
                <div className="keep" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                  <blockquote className="dCard" style={{ margin: 0 }}>
                    <div style={{ fontSize: '52px', lineHeight: 0.6, fontWeight: 'bold', color: '#ED008C', marginBottom: '10px' }}>&ldquo;</div>
                    <div style={{ fontSize: '15.5px', lineHeight: 1.55, color: '#424242', marginBottom: '14px', fontStyle: 'italic' }}>Delphinium has been a game changer for our teachers and students.</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#5b6361', borderTop: '1px solid #eef1f0', paddingTop: '10px' }}>— Online School Principal</div>
                  </blockquote>
                  <blockquote className="dCard" style={{ margin: 0 }}>
                    <div style={{ fontSize: '52px', lineHeight: 0.6, fontWeight: 'bold', color: '#ED008C', marginBottom: '10px' }}>&ldquo;</div>
                    <div style={{ fontSize: '15.5px', lineHeight: 1.55, color: '#424242', marginBottom: '14px', fontStyle: 'italic' }}>The ease of Delphinium gives me much more opportunity to work one-on-one with my students.</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#5b6361', borderTop: '1px solid #eef1f0', paddingTop: '10px' }}>— Math Teacher, Davis Connect</div>
                  </blockquote>
                </div>
                <div style={{ fontSize: '13px', color: '#5b6361', textAlign: 'center', lineHeight: 1.6 }}>
                  Schools already using Delphinium, including peers like
                  {' '}
                  <Field value={f.PEER_REFERENCE} highlight={hl} />
                  :
                  {' '}
                  <b style={{ color: '#424242' }}>Davis School District</b>
                  {' '}
                  ·
                  {' '}
                  <b style={{ color: '#424242' }}>Utah Virtual Academy</b>
                  {' '}
                  ·
                  {' '}
                  <b style={{ color: '#424242' }}>Baker Web Academy</b>
                  {' '}
                  ·
                  {' '}
                  <b style={{ color: '#424242' }}>Virtual Prince William</b>
                </div>
              </section>

              {/* 11 · Path forward */}
              <section className="sheet sheet-dark" style={{ background: '#2E3192' }}>
                <div className="page-label screen-only" style={{ color: '#9d99c8' }}>11 · The path forward</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1.6px', textTransform: 'uppercase', color: '#B4DED9', marginBottom: '6px' }}>The path forward</div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', margin: '0 0 24px' }}>Two ways to start</h2>
                <div className="keep" style={{ background: '#fff', borderRadius: '6px', padding: '26px', marginBottom: '24px', boxShadow: '0 4px 18px rgba(0,0,0,.30)' }}>
                  <div style={{ fontSize: '16px', lineHeight: 1.7, color: '#424242', marginBottom: '12px' }}>
                    <b style={{ color: '#ED008C', fontSize: '18px' }}>1.</b>
                    {' '}
                    Start your 30-day free trial on your own courses — no migration, no commitment.
                  </div>
                  <div style={{ fontSize: '16px', lineHeight: 1.7, color: '#424242' }}>
                    <b style={{ color: '#ED008C', fontSize: '18px' }}>2.</b>
                    {' '}
                    Book a 30-minute working session:
                    {' '}
                    <span style={{ color: '#1879cd', fontWeight: 'bold' }}>delphi-me.com/meetings/jared381/educate</span>
                  </div>
                </div>
                <div className="keep" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid rgba(255,255,255,.18)', paddingTop: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,.96)', borderRadius: '8px', padding: '6px 12px', flex: 'none', display: 'inline-block' }}>
                    <img src="/logo.png" alt="Delphinium" style={{ height: '40px', width: 'auto', display: 'block' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                      <Field value={f.PREPARED_BY_NAME} highlight={hl} />
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.65)' }}>
                      <Field value={f.PREPARED_BY_TITLE} highlight={hl} />
                      , Delphinium · delphi-me.com
                    </div>
                  </div>
                </div>
              </section>
            </td>
          </tr>
        </tbody>
        <tfoot><tr><td className="ftr-space" /></tr></tfoot>
      </table>

      <div className="running-ftr">
        <span>Delphinium · Engagement for Canvas</span>
        <span>
          Prepared for
          {' '}
          <Field value={f.SCHOOL_NAME} highlight={false} />
          {' '}
          · Confidential
        </span>
      </div>
    </main>
  );
}
