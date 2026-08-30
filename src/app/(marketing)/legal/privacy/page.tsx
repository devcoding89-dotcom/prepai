import { LegalPage } from "@/components/marketing/legal-page";

export const metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="22 August 2026">
      <h2>1. What we collect</h2>
      <p>
        When you create a PrepAI account we collect your name, email address and the exam you are preparing
        for. As you use the platform we store your practice sessions, the answers you select, the time you
        spend per question and the weakness reports generated from them.
      </p>
      <h2>2. Payments</h2>
      <p>
        Subscription payments are processed by Paystack. We never see or store your card number, PIN or OTP.
        We keep only the transaction reference, amount, channel and status so we can prove your subscription
        and show you a receipt history.
      </p>
      <h2>3. How we use your data</h2>
      <ul>
        <li>To generate your AI weakness reports and study plan.</li>
        <li>To show your progress over time and recommend textbook chapters.</li>
        <li>To operate your subscription and provide support.</li>
        <li>In aggregate and anonymised form, to improve the question bank.</li>
      </ul>
      <h2>4. What we never do</h2>
      <p>
        We do not sell your data. We do not share your individual scores with schools, employers or third
        parties. We do not use your answers to train models sold to other companies.
      </p>
      <h2>5. Storage and security</h2>
      <p>
        Data is stored in a managed database with row-level security so one account cannot read another&apos;s
        records. Passwords are hashed; sessions use signed, HTTP-only cookies.
      </p>
      <h2>6. Your rights</h2>
      <p>
        You may request a copy of your data or ask us to delete your account at any time by writing to
        <strong>supportprepclass@gmail.com</strong>. Deletion removes your profile, sessions and reports permanently.
      </p>
      <h2>7. Children</h2>
      <p>
        PrepAI is intended for secondary school students. If you are under 18, please have a parent or
        guardian review this policy with you.
      </p>
      <h2>8. Contact</h2>
      <p>Questions about this policy: supportprepclass@gmail.com</p>
    </LegalPage>
  );
}
