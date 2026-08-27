import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { LogOut, ShieldCheck, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { EXAMS, type Exam } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { Button, LinkButton } from "@/components/ui/button";
import { logoutAction } from "@/app/auth/actions";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

async function saveProfile(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const full_name = String(formData.get("full_name") ?? "").trim();
  const exam = String(formData.get("target_exam") ?? "") as Exam;
  const examDateRaw = String(formData.get("exam_date") ?? "").trim();
  const examDate = /^\d{4}-\d{2}-\d{2}$/.test(examDateRaw) ? examDateRaw : null;
  await repo.updateProfile(user.id, {
    full_name: full_name || user.full_name,
    target_exam: EXAMS.includes(exam) ? exam : user.target_exam,
    exam_date: examDate,
  });
  revalidatePath("/settings");
  redirect("/settings?saved=1");
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const { saved } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your profile and exam preference.</p>
      </div>

      {saved && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Your changes have been saved.
        </div>
      )}

      <Card>
        <CardHeader className="flex items-center gap-2.5">
          <User className="size-5 text-ink-400" />
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardBody>
          <form action={saveProfile} className="space-y-4">
            <Field label="Full name" htmlFor="full_name">
              <Input id="full_name" name="full_name" defaultValue={user.full_name ?? ""} />
            </Field>
            <Field label="Email address" hint="Contact support to change your email.">
              <Input value={user.email} disabled />
            </Field>
            <Field label="Target exam" htmlFor="target_exam" hint="Changes which question bank and textbooks you see.">
              <Select id="target_exam" name="target_exam" defaultValue={user.target_exam ?? "JAMB"}>
                {EXAMS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Exam date"
              htmlFor="exam_date"
              hint="Optional — shows a countdown on your dashboard so you know exactly how long you have."
            >
              <Input
                id="exam_date"
                name="exam_date"
                type="date"
                defaultValue={user.exam_date ? user.exam_date.slice(0, 10) : ""}
              />
            </Field>
            <Button type="submit">Save changes</Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2.5">
          <ShieldCheck className="size-5 text-ink-400" />
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <Row label="Role" value={<Badge tone={user.role === "admin" ? "brand" : "neutral"}>{user.role}</Badge>} />
          <Row
            label="Subscription"
            value={
              <Badge tone={user.subscription_status === "active" ? "success" : "warning"}>
                {user.subscription_status}
              </Badge>
            }
          />
          <Row label="Expires" value={formatDate(user.subscription_expires_at) } />
          <Row label="Member since" value={formatDate(user.created_at)} />
          <div className="flex flex-wrap gap-3 pt-2">
            <LinkButton href="/billing" variant="outline" size="sm">
              Manage subscription
            </LinkButton>
            {user.role === "admin" && (
              <LinkButton href="/admin" variant="outline" size="sm">
                Open admin panel
              </LinkButton>
            )}
            <form action={logoutAction}>
              <Button variant="danger" size="sm" type="submit">
                <LogOut className="size-4" />
                Log out
              </Button>
            </form>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Install as an app</CardTitle>
        </CardHeader>
        <CardBody className="text-sm leading-relaxed text-ink-600">
          On Android Chrome tap the ⋮ menu → <strong>Add to Home screen</strong>. On iPhone Safari tap Share →{" "}
          <strong>Add to Home Screen</strong>. PrepAI then opens fullscreen like a native app and keeps you
          logged in.
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 pb-2.5 text-sm last:border-0">
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  );
}
