import { LegalPage } from "@/components/marketing/legal-page";

export const metadata = { title: "Terms of Service" };

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="22 August 2026">
      <h2>1. Agreement</h2>
      <p>
        By creating an account you agree to these terms. If you do not agree, please do not use PrepAI.
      </p>
      <h2>2. The service</h2>
      <p>
        PrepAI provides computer-based test practice, automated performance analysis and study material for
        JAMB UTME, WAEC SSCE and NECO SSCE candidates. We are an independent study platform and are{" "}
        <strong>not affiliated with, endorsed by or connected to JAMB, WAEC or NECO</strong>. Past questions
        are reproduced for educational study purposes.
      </p>
      <h2>3. Accounts</h2>
      <p>
        You are responsible for keeping your password secure and for all activity on your account. One
        account is for one student — sharing login details may result in suspension.
      </p>
      <h2>4. Subscription and payment</h2>
      <ul>
        <li>The subscription is a flat fee granting 30 days of access from the date of payment.</li>
        <li>There is no automatic renewal. Access simply ends unless you pay again.</li>
        <li>Prices are shown in Nigerian Naira and processed by Paystack.</li>
      </ul>
      <h2>5. Acceptable use</h2>
      <p>
        You may not scrape, resell, republish or bulk-download our question bank or textbook content, nor
        attempt to bypass the paywall or interfere with the service.
      </p>
      <h2>6. No guarantee of results</h2>
      <p>
        We work hard to make our questions and analysis accurate, but we cannot guarantee any particular exam
        score, admission outcome or that every question mirrors a future paper.
      </p>
      <h2>7. Availability</h2>
      <p>
        We aim for continuous availability but may occasionally need to take the service down for maintenance
        or updates.
      </p>
      <h2>8. Termination</h2>
      <p>
        We may suspend accounts that breach these terms. You may stop using PrepAI at any time and request
        deletion of your data.
      </p>
      <h2>9. Contact</h2>
      <p>supportprepclass@gmail.com</p>
    </LegalPage>
  );
}
