"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, Field, Input } from "@/components/ui/input";
import { loginAction, signupAction, type FormState } from "@/app/auth/actions";
import type { Exam } from "@/lib/types";

const initial: FormState = {};

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className="pr-11" />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-1 top-1 grid size-9 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function LoginForm({ next, adminLogin = false, hideSignup = false }: { next?: string; adminLogin?: boolean; hideSignup?: boolean }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="animate-fade-up space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950">Welcome back</h1>
        <p className="mt-1.5 text-sm text-ink-500">Log in to continue your preparation.</p>
      </div>

      {state.error && <Alert>{state.error}</Alert>}
      <input type="hidden" name="next" value={next ?? ""} />

      <input type="hidden" name="admin_login" value={adminLogin ? "1" : ""} />

      <Field label={adminLogin ? "Admin username or email" : "Email address"} htmlFor="email">
        <Input
          id="email"
          name="email"
          type={adminLogin ? "text" : "email"}
          autoComplete="username"
          required
          placeholder={adminLogin ? "khaleed or admin@example.com" : "you@example.com"}
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <PasswordInput id="password" name="password" autoComplete="current-password" required placeholder="••••••••" />
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={pending}>
        Log in
      </Button>

      {!hideSignup && (
        <p className="text-center text-sm text-ink-500">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-brand-700 hover:underline">
            Sign up
          </Link>
        </p>
      )}

    </form>
  );
}

export function SignupForm({ exam }: { exam?: Exam }) {
  const [state, action, pending] = useActionState(signupAction, initial);
  return (
    <form action={action} className="animate-fade-up space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950">Create your account</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Free to join. {exam ? `You are signing up for ${exam}.` : "Pick your exam on the next screen."}
        </p>
      </div>

      {state.error && <Alert>{state.error}</Alert>}
      {exam && <input type="hidden" name="exam" value={exam} />}

      <Field label="Full name" htmlFor="full_name">
        <Input id="full_name" name="full_name" required placeholder="Chidi Okafor" autoComplete="name" />
      </Field>

      <Field label="Email address" htmlFor="email">
        <Input id="email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
      </Field>

      <Field label="Password" htmlFor="password" hint="At least 6 characters.">
        <PasswordInput id="password" name="password" required placeholder="••••••••" autoComplete="new-password" minLength={6} />
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={pending}>
        Create account
      </Button>

      <p className="text-center text-xs leading-relaxed text-ink-400">
        By creating an account you agree to our{" "}
        <Link href="/legal/terms" className="underline hover:text-ink-600">Terms</Link> and{" "}
        <Link href="/legal/privacy" className="underline hover:text-ink-600">Privacy Policy</Link>.
      </p>

      <p className="text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
