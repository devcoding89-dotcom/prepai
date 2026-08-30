import { Mail, MessageCircle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container-x max-w-3xl py-16">
      <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-brand-600">Contact</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">We are one message away</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-ink-600">
        Payment problem, a question that looks wrong, or a subject you want us to add — tell us and we will
        sort it out.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody className="pt-5">
            <Mail className="size-5 text-brand-600" />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-ink-400">Email</p>
            <a
              href="mailto:supportprepclass@gmail.com"
              className="mt-0.5 block text-sm font-semibold text-brand-700 hover:underline"
            >
              supportprepclass@gmail.com
            </a>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-500">We reply within 24 hours on weekdays.</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <MessageCircle className="size-5 text-green-600" />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-ink-400">WhatsApp</p>
            <a
              href="https://wa.me/2349045660915"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block text-sm font-semibold text-green-700 hover:underline"
            >
              09045660915
            </a>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-500">Fastest for payment &amp; urgent issues.</p>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardBody className="pt-6">
          <h2 className="text-lg font-bold text-ink-950">Reporting a question error</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
            Include the subject, topic and the first few words of the question. We review every report and fix
            or remove the question, usually within a day.
          </p>
          <h2 className="mt-6 text-lg font-bold text-ink-950">Schools and study centres</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
            We offer bulk accounts with a shared progress dashboard for tutorial centres. Email us at{" "}
            <a href="mailto:supportprepclass@gmail.com" className="font-semibold text-brand-700 hover:underline">
              supportprepclass@gmail.com
            </a>{" "}
            with the number of students and we will send pricing.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
