# PrepAI — CBT + AI Learning Platform

Timed CBT practice for **JAMB UTME, WAEC SSCE and NECO SSCE**, an explainable AI weakness
engine, a matched textbook library, Paystack subscriptions and a full admin console.

Built with **Next.js 15 (App Router) · TypeScript · Tailwind v4 · Supabase-ready data layer**.

---

## 1. Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

That is the whole setup. With no environment variables the app runs on a built-in
JSON database (`data/db.json`, seeded automatically) and a simulated Paystack
checkout, so every flow — signup → practice → AI report → paywall → payment →
unlock → admin — works offline.

**Demo accounts**

| Role    | Email               | Password      |
| ------- | ------------------- | ------------- |
| Student | `student@prepai.ng` | `student1234` |
| Admin   | `admin@prepai.ng`   | `admin1234`   |

Delete `data/db.json` at any time to reseed from scratch.

---

## 2. What is in the box

### Public site (`/`)
Sticky nav, hero with live app mockup, exam-selection cards, feature grid, an
"inside the report" deep-dive, how-it-works, single-plan pricing, testimonials,
FAQ, CTA and footer. SEO metadata, Open Graph image, `manifest.webmanifest`
(installable PWA). Plus `/about`, `/contact`, `/legal/privacy`, `/legal/terms`,
`/legal/refund`.

### Student app
| Route | What it does |
| --- | --- |
| `/auth/signup`, `/auth/login` | Email + password, hashed with bcrypt, signed HTTP-only session cookie |
| `/onboarding` | Pick JAMB / WAEC / NECO |
| `/dashboard` | Stats, streak, score-trend chart, AI study plan, recent sessions, resume banner |
| `/practice` | Subject multi-select, quick / standard / full-mock, difficulty + topic filters, live session summary |
| `/practice/session/[id]` | The CBT engine — countdown, question grid, flag for review, autosave, keyboard shortcuts (A–E, ←/→, F), swipe on mobile, auto-submit at 00:00, resume after refresh |
| `/reports/[id]` | Score ring, projected JAMB score, full AI weakness report, subject bar chart, question-by-question review with explanations |
| `/reports` | Master study plan across all sessions + report history |
| `/sessions` | Full practice history |
| `/textbooks`, `/textbooks/[id]` | Library with subject filters + reader (inline HTML or uploaded PDF), bookmarks, "test yourself on this topic" |
| `/billing` | Plan card, Paystack checkout, payment history |
| `/settings` | Profile, exam switch, account, PWA install help |

### Admin console (`/admin`)
Overview KPIs · question bank CRUD with search/filter/pagination · **bulk import
from CSV or JSON with row-by-row validation and dry-run** · textbook chapters
(inline HTML editor or file upload) · users (grant/revoke 30 days, promote to
admin) · sessions · payments · settings (price, paywall toggle, weakness
threshold).

---

## 3. The AI weakness engine

`src/lib/engine.ts`. Deliberately explainable — every number traces back to an
answer. Per topic it combines:

1. **Accuracy** — wrong ÷ total, with skipped questions counted as half-wrong
   (a blank is a lost mark).
2. **Exposure** — few questions on a topic ⇒ flagged `low sample`, not a verdict.
3. **Pace** — average seconds vs. the session average ⇒ `rushed` / `steady` / `slow`.
4. **Difficulty mix** — each missed *easy* question adds +5 to the weakness score.

Output per topic: weakness score 0–100, severity (`critical` / `weak` / `fair` /
`strong`), a written recommendation, and the matching textbook chapter (via
shared topic tags). Across sessions `buildStudyPlan()` ranks topics by
`latest×0.6 + average×0.25 + recurrence`, and tags each as improving / flat /
worsening.

The same logic is mirrored as a Supabase Edge Function in
`supabase/functions/weakness-report/` if you would rather generate reports in the
database.

---

## 4. Going to production

### 4.1 Supabase

There are two ways to install PrepAI's tables. **Pick one and be consistent.**

**Option A — shared project (recommended for existing/multi-app projects).**
Run `supabase/migrations/0002_isolated_schema.sql`. Every PrepAI table lives in
a dedicated `prepai` schema so nothing collides with the tables of another app
in the same project. No RLS policies or `handle_new_user` trigger are added to
`public`.

1. SQL Editor → run `0002_isolated_schema.sql`.
2. Supabase Dashboard → Project Settings → API → **Exposed schemas** → add
   `prepai` (keep `public` and `graphql_public`).
3. Add to `.env.local` **and the Vercel dashboard** (this is the variable that
   is almost always missed on Vercel, causing a blank "Something went wrong"
   error):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_DB_SCHEMA=prepai
```

**Option B — clean project / single-app.**
Run `supabase/migrations/0001_init.sql`. Tables are created in the `public`
schema with plain names (`profiles`, `questions`, …). Do **not** set
`SUPABASE_DB_SCHEMA` in this case (it stays unset; the code defaults to
`public`).

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The data layer switches automatically (`src/lib/db/index.ts`) — no code change.
Auth then uses Supabase Auth; profiles are created by the signup trigger.

> **Troubleshooting a Vercel 500 ("Something went wrong"):** this is almost
> always a schema mismatch. If you used the isolated `prepai` schema, the
> `SUPABASE_DB_SCHEMA=prepai` variable **must** be set in the Vercel dashboard
> (Settings → Environment Variables), not just in `.env.local`. With it missing
> the app queries `public`, which has no PrepAI session/answer/textbook tables,
> so every lookup 404s.

### 4.2 Paystack

1. Create an account, complete KYC, copy your keys.
2. Add `PAYSTACK_SECRET_KEY` (and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`).
3. Point the Paystack webhook at `https://yourdomain.com/api/webhooks/paystack`
   — the signature is verified with HMAC-SHA512.

Without a secret key the app uses `/payment/simulate`, an internal mock of the
Paystack checkout, so you can test the whole flow before KYC clears.

### 4.3 Deploy

Vercel works out of the box. Set `AUTH_SECRET` (long random string) and
`NEXT_PUBLIC_SITE_URL`. Note the local JSON driver is for development only —
production should use Supabase, since serverless filesystems are ephemeral.

```bash
npm run build && npm start
```

---

## 4.4 Email behaviour — PrepAI sends none

PrepAI does **not** send email to students. There is no mailer, no SMTP config
and no email dependency anywhere in the codebase. Specifically:

| Event | Email sent? |
| --- | --- |
| Student signs up | **No** — created via `admin.createUser({ email_confirm: true })`, so the account is already verified |
| Student logs in | No — password only |
| Payment succeeds | No — the subscription updates in-app |
| Session submitted / report ready | No — shown in-app |

The only way a student would start receiving mail is if someone replaced the
signup call with the client-side `supabase.auth.signUp()`, which asks Supabase
to send a "Confirm your email" message. That line in `src/lib/auth.ts` is
commented accordingly — leave it as the admin call.

> **Do not disable "Confirm email" in Supabase → Authentication → Providers**
> if the project is shared with another application. PrepAI does not need that
> setting either way, and switching it off would let anyone register with an
> address they do not own in the *other* app.

If you later add a "Forgot password" flow, that one genuinely does email the
student — it is not implemented today.

---

## 5. Loading your own questions

Admin → Questions → **Import**. Paste or drop a `.csv` / `.json` file, click
**Validate** (dry run, nothing is written), then **Import**.

```csv
exam,subject,topic,question_text,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,year
JAMB,Mathematics,Quadratic Equations,"Solve x² - 5x + 6 = 0","x = 2 or 3","x = -2 or -3","x = 1 or 6","x = -1 or -6",A,"(x-2)(x-3)=0",medium,2023
```

* `options` may instead be a single pipe-separated column: `a|b|c|d`.
* `correct_answer` accepts the letter **A–E** or the exact option text.
* Optional: `explanation`, `difficulty`, `year`, `image_url`, `is_active`.
* Template: `/templates/questions-template.csv`.

**Keep topic names consistent** (always `Quadratic Equations`, never
`Quadratics`) — the AI report groups on this exact string and uses it to match
textbook chapters.

Textbooks: Admin → Textbooks → New chapter. Write inline HTML (helper classes
`.eq` for formulas and `.example` for worked examples) or upload a PDF/HTML file,
then list the topic tags that should link to it.

---

## 6. Project layout

```
src/
├── app/
│   ├── (marketing)/        landing, about, contact, legal
│   ├── (app)/              dashboard, practice, reports, sessions, textbooks, billing, settings
│   ├── (exam)/             distraction-free CBT session runner
│   ├── admin/              admin console
│   ├── auth/               login, signup
│   ├── onboarding/         exam picker
│   ├── payment/            Paystack callback + simulated checkout
│   └── api/                answers, submit, bulk import, upload, Paystack webhook
├── components/
│   ├── ui/                 button, card, input primitives
│   ├── marketing/          nav, footer, hero mockup, legal wrapper
│   ├── app/                shell, charts, session runner, practice setup
│   └── admin/              nav, question form, importer, textbook form, settings
├── lib/
│   ├── db/                 repo interface + local JSON driver + Supabase driver + seed
│   ├── services/practice   session lifecycle (start, answer, submit)
│   ├── engine.ts           the AI weakness analysis
│   ├── auth.ts             sessions, signup/signin, subscription checks
│   ├── paystack.ts         init, verify, activate, webhook signature
│   └── stats.ts, csv.ts, utils.ts, types.ts
└── supabase/
    ├── migrations/0001_init.sql
    └── functions/weakness-report/
```

The data layer is a single `Repo` interface (`src/lib/db/repo.ts`) with two
implementations, so swapping storage never touches a page or component.

---

## 7. Roadmap ideas

Offline PWA caching of an entire session · WhatsApp reminders · leaderboards and
study groups · spaced-repetition scheduling of weak topics · school/tutorial
centre dashboards · handwriting-free maths keypad for theory questions.
