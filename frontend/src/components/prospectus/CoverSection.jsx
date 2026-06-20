import { Field } from './Field.jsx';

const MODULES = [
  {
    key: 'core',
    dot: '#00A652',
    name: 'Delphinium Core',
    benefit: 'Student data at a glance — the foundation in every plan.',
    features: [
      'Control Tower: engagement, progress & performance',
      'Assignment & class stats, message history',
      'Data management and support',
    ],
    included: true,
    priceKey: null,
    quoteKey: null,
  },
  {
    key: 'eb',
    dot: '#1879cd',
    name: 'Engagement Builder',
    benefit: 'Turn the gray wall into an experience students want to open.',
    features: ['3-minute Makeover', 'Gamification & Who\'s Near Me', 'Parent view, Periscope, Layout Editor'],
    quoteKey: 'engagementBuilder',
    priceKey: 'EB_PRICE',
  },
  {
    key: 'cb',
    dot: '#F1EC1C',
    name: 'Community Builder',
    benefit: 'Reach the right families without drowning in manual email.',
    features: ['Message Center: scheduled & targeted', 'Templates, blocks, banners', 'Auto-translation, 160 languages'],
    quoteKey: 'communityBuilder',
    priceKey: 'CB_PRICE',
  },
  {
    key: 'ctu',
    dot: '#ED008C',
    name: 'Control Tower Ultra',
    benefit: 'Cross-course visibility for students, parents, teachers, and admins.',
    features: ['Cross-course visibility', 'Students, parents, teachers, admins', 'Research access'],
    quoteKey: 'controlTowerUltra',
    priceKey: 'CTU_PRICE',
  },
];

export default function CoverSection({ fields, quote, highlightFields }) {
  const studentLabel = fields.STUDENT_COUNT || 'your';

  return (
    <section className="sheet sheet-dark cover-section" style={{ background: '#3A3A47' }}>
      <div className="page-label screen-only" style={{ color: '#9d99c8' }}>01 · Cover</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '36px' }}>
        <div style={{
          background: 'rgba(255,255,255,.96)',
          borderRadius: '8px',
          padding: '8px 14px',
          flex: 'none',
          display: 'inline-block',
        }}
        >
          <img src="/logo.png" alt="Delphinium" style={{ height: '58px', width: 'auto', display: 'block' }} />
        </div>
        <div>
          <div style={{ fontSize: '17px', fontWeight: 'bold', color: 'rgba(255,255,255,.65)', lineHeight: 1.2 }}>
            Canvas delivers content.
          </div>
          <div style={{ fontSize: '31px', fontWeight: 'bold', color: '#fff', lineHeight: 1.08 }}>
            Delphinium delivers <span style={{ color: '#ED008C' }}>ENGAGEMENT!</span>
          </div>
        </div>
      </div>

      <div style={{
        fontSize: '12px',
        fontWeight: 'bold',
        letterSpacing: '1.6px',
        textTransform: 'uppercase',
        color: '#B4DED9',
        marginBottom: '8px',
      }}
      >
        Prospectus prepared for
      </div>
      <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fff', marginBottom: '28px' }}>
        <Field value={fields.SCHOOL_NAME} highlight={highlightFields} />
      </div>

      <div className="keep cover-proof" style={{
        background: '#fff',
        borderRadius: '6px',
        padding: '22px 24px',
        marginBottom: '20px',
        boxShadow: '0 4px 18px rgba(0,0,0,.30)',
      }}
      >
        <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1.4px', textTransform: 'uppercase', color: '#1879cd', marginBottom: '8px' }}>
          Fewer failures
        </div>
        <div style={{ fontSize: '46px', fontWeight: 'bold', color: '#1879cd', lineHeight: 1 }}>31%</div>
        <div style={{ fontSize: '14px', color: '#424242', marginTop: '8px', lineHeight: 1.5 }}>
          decrease in course failure rates — at {studentLabel} students, that is real seats saved and dollars multiplied across everything you already spend on teachers, content, and technology.
        </div>
      </div>

      <div className="keep cover-setup-strip" style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '24px',
      }}
      >
        {['3-minute setup per course', 'No migration required', 'Nothing new for teachers to learn'].map(label => (
          <div
            key={label}
            style={{
              background: 'rgba(255,255,255,.12)',
              border: '1px solid rgba(255,255,255,.22)',
              borderRadius: '4px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 'bold',
              color: '#fff',
            }}
          >
            <span style={{ color: '#00A652' }}>✓</span>
            {' '}
            {label}
          </div>
        ))}
      </div>

      <div style={{
        fontSize: '12px',
        fontWeight: 'bold',
        letterSpacing: '1.6px',
        textTransform: 'uppercase',
        color: '#B4DED9',
        marginBottom: '12px',
      }}
      >
        What
        {' '}
        <Field value={fields.SCHOOL_NAME} highlight={highlightFields} />
        {' '}
        gets
      </div>

      <div className="keep" style={{ marginBottom: '16px' }}>
        {MODULES.filter(m => m.included).map(mod => (
          <div
            key={mod.key}
            style={{
              background: '#E2F2EC',
              borderRadius: '6px',
              padding: '16px 18px',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: mod.dot, flex: 'none' }} />
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#424242' }}>{mod.name}</span>
              <span className="dBadge dBadgeSuccess">Included</span>
            </div>
            <div style={{ fontSize: '13.5px', color: '#424242', marginBottom: '6px' }}>{mod.benefit}</div>
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
              {mod.features.map(f => (
                <li key={f} style={{ fontSize: '13px', lineHeight: 1.5, color: '#424242' }}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {MODULES.filter(m => !m.included && quote[m.quoteKey]).map(mod => (
        <div
          key={mod.key}
          className="keep"
          style={{
            background: 'rgba(255,255,255,.96)',
            borderRadius: '6px',
            padding: '14px 18px',
            marginBottom: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,.18)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: mod.dot, flex: 'none' }} />
                <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#424242' }}>{mod.name}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#565663', marginBottom: '6px' }}>{mod.benefit}</div>
              <ul style={{ margin: 0, paddingLeft: '16px' }}>
                {mod.features.map(f => (
                  <li key={f} style={{ fontSize: '12.5px', lineHeight: 1.45, color: '#424242' }}>{f}</li>
                ))}
              </ul>
            </div>
            <div style={{ textAlign: 'right', flex: 'none' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ED008C' }}>
                <Field value={fields[mod.priceKey]} highlight={highlightFields} />
              </div>
              <div style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: '#5b6361' }}>per year</div>
            </div>
          </div>
        </div>
      ))}

      {(quote.clever || quote.sms) && (
        <div className="keep" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
          {quote.clever && (
            <div style={{ background: 'rgba(255,255,255,.96)', borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#424242' }}>
                Clever integration
                {' '}
                <Field value={fields.CLEVER_FEE} highlight={highlightFields} />
              </div>
              <div style={{ fontSize: '12px', color: '#565663', marginTop: '4px' }}>Add-on — expanded parent communication.</div>
            </div>
          )}
          {quote.sms && (
            <div style={{ background: 'rgba(255,255,255,.96)', borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#424242' }}>
                SMS texting
                {' '}
                <Field value={fields.SMS_FEE} highlight={highlightFields} />
              </div>
              <div style={{ fontSize: '12px', color: '#565663', marginTop: '4px' }}>Add-on — reach families on their phones.</div>
            </div>
          )}
        </div>
      )}

      <div className="keep" style={{
        display: 'flex',
        gap: '30px',
        flexWrap: 'wrap',
        padding: '14px 0',
        borderTop: '1px solid rgba(255,255,255,.18)',
        borderBottom: '1px solid rgba(255,255,255,.18)',
        marginBottom: '14px',
      }}
      >
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.6)' }}>
          <b style={{ color: '#fff' }}>Students</b>
          {' '}
          <Field value={fields.STUDENT_COUNT} highlight={highlightFields} />
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.6)' }}>
          <b style={{ color: '#fff' }}>Term</b>
          {' '}
          <Field value={fields.TERM_YEARS} highlight={highlightFields} />
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.6)' }}>
          <b style={{ color: '#fff' }}>Prepared</b>
          {' '}
          <Field value={fields.PREPARED_DATE} highlight={highlightFields} />
        </div>
      </div>

      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>
        Prepared by
        {' '}
        <b style={{ color: '#fff' }}>
          <Field value={fields.PREPARED_BY_NAME} highlight={highlightFields} />
        </b>
        ,
        {' '}
        <Field value={fields.PREPARED_BY_TITLE} highlight={highlightFields} />
        , Delphinium.
        {' '}
        Pricing held until
        {' '}
        <Field value={fields.VALID_UNTIL} highlight={highlightFields} />
        .
      </div>
    </section>
  );
}
