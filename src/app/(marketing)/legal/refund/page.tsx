import { LegalPage } from "@/components/marketing/legal-page";

export const metadata = { title: "Refund Policy" };

export default function Refund() {
  return (
    <LegalPage title="Refund Policy" updated="22 August 2026">
      <h2>1. Our promise</h2>
      <p>
        If a payment succeeds but your subscription does not activate, we will fix it or refund you in full.
        Write to supportprepclass@gmail.com with your payment reference and we will respond within 48 hours.
      </p>
      <h2>2. Change of mind</h2>
      <p>
        Because access to the full question bank and textbook library is granted immediately, we generally do
        not refund a subscription once practice sessions have been run. If you have paid and used nothing
        within 48 hours, contact us and we will consider a full refund.
      </p>
      <h2>3. Duplicate payments</h2>
      <p>
        Accidental duplicate charges are always refunded in full, or converted into extra subscription days if
        you prefer.
      </p>
      <h2>4. How refunds are paid</h2>
      <p>
        Approved refunds are returned through Paystack to the original payment method, typically within 5–10
        working days depending on your bank.
      </p>
      <h2>5. Contact</h2>
      <p>supportprepclass@gmail.com</p>
    </LegalPage>
  );
}
