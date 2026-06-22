export default function PricingBenefitNotes() {
  return (
    <aside className="doc-pricing-benefits">
      <h2 className="doc-pricing-benefits-title">Delphinium Benefit Details</h2>

      <div className="benefit-notes-section">
        <h3>Product license includes</h3>
        <p>
          Unlimited access for all students, courses, and teachers in Canvas, with product training
          so one teacher can train others, and ongoing support as needed on the use of your products.
        </p>
        <p>
          Pricing is based on student enrollment, includes volume discounts, does not require
          individual classroom licensing, and our base price includes a minimum number of students.
        </p>
      </div>

      <div className="benefit-notes-section">
        <h3>Implementation services</h3>
        <p>
          Implementation services are a
          {' '}
          <strong>one-time fee</strong>
          {' '}
          that includes:
        </p>
        <ul>
          <li>Installation</li>
          <li>Initial onboarding training</li>
        </ul>
      </div>

      <div className="benefit-notes-section">
        <h3>Multi-year agreements</h3>
        <p>Multi-year agreements can benefit you because you:</p>
        <ol>
          <li>Receive a discount</li>
          <li>Lock in the current pricing</li>
          <li>
            Require advance payment of the agreement (payment plans available)
          </li>
        </ol>
      </div>
    </aside>
  );
}
