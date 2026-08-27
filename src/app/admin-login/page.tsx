import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Admin login" };

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");

  return <LoginForm next="/admin" adminLogin hideSignup />;
}