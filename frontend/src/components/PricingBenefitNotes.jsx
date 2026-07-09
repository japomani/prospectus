export default function PricingBenefitNotes() {
  return (
    <aside className="doc-pricing-benefits">
      <h2 className="doc-pricing-benefits-title">Delphinium Benefit Details</h2>

      <div className="benefit-notes-section">
        <h3>Product license includes</h3>
        <ul>
          <li>Unlimited access for every student, course, and teacher in your Canvas account or subaccount</li>
          <li>Dedicated support for your primary contact</li>
          <li>Ongoing train-the-trainer support for teachers</li>
          <li>Self-paced online lessons for every teacher</li>
          <li>A community support forum for all teachers, monitored by our team</li>
        </ul>
      </div>

      <div className="benefit-notes-section">
        <h3>
          Implementation is a
          {' '}
          <strong>one-time fee</strong>
          {' '}
          that includes
        </h3>
        <ul>
          <li>Installation</li>
          <li>One-on-one onboarding training for your primary contact</li>
          <li>3 to 5 Zoom trainings to onboard an initial cohort of teachers</li>
        </ul>
      </div>

      <div className="benefit-notes-section">
        <h3>Multi-year agreements</h3>
        <ul>
          <li>Receive a discount for committing to multiple years</li>
          <li>Lock in today&apos;s pricing for the length of the agreement</li>
          <li>Pay in advance of the license term, with payment plans available</li>
        </ul>
      </div>
    </aside>
  );
}
