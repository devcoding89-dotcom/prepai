# Connecting PrepAI to GitHub

The project is already a git repository with one commit containing all 108 source
files. Your secrets are **not** in it — `.env.local`, `data/db.json`,
`node_modules/`, `.next/` and `public/uploads/` are all ignored. Only
`.env.example` (the blank template) is tracked.

Pick whichever option below suits you.

---

## Option A — Push from this workspace (fastest)

### 1. Create an empty repo on GitHub
Go to <https://github.com/new>:

* **Repository name:** `prepai`
* **Public** or **Private** — your choice
* **Do NOT** tick "Add a README", ".gitignore" or "license". The repo must be
  empty or the first push will be rejected.

Click **Create repository**.

### 2. Create a fine-grained token
Go to <https://github.com/settings/personal-access-tokens/new>:

* **Token name:** `prepai-push`
* **Expiration:** 7 days (short is safer)
* **Repository access:** *Only select repositories* → pick `prepai`
* **Permissions:** Repository permissions → **Contents: Read and write**

Click **Generate token** and copy it (starts with `github_pat_...`).

### 3. Tell me the repo URL and paste the token
I will run the push for you. **Delete the token from GitHub straight after**
(Settings → Developer settings → revoke) — it only needs to live long enough for
one push.

Or run it yourself in the workspace terminal:

```bash
cd ~/prepai
git remote add origin https://USERNAME:TOKEN@github.com/USERNAME/prepai.git
git branch -M main
git push -u origin main
git remote set-url origin https://github.com/USERNAME/prepai.git   # strip the token back out
```

---

## Option B — Download the code and push from your own computer

Safer if you would rather not share a token.

1. Download **`prepai-source.zip`** from the workspace file list.
2. Unzip it on your machine.
3. Install [Git](https://git-scm.com/downloads) if you do not have it, then:

```bash
cd prepai
git init
git add -A
git commit -m "feat: PrepAI CBT + AI learning platform"
git branch -M main
git remote add origin https://github.com/USERNAME/prepai.git
git push -u origin main
```

Git will open a browser window to log you into GitHub the first time.

---

## Option C — GitHub Desktop (no terminal at all)

1. Download the zip and unzip it.
2. Install [GitHub Desktop](https://desktop.github.com/).
3. **File → Add local repository** → choose the `prepai` folder.
4. It will offer to create a repository — accept, write a commit message, click
   **Commit to main**, then **Publish repository**.

---

## After it is on GitHub: deploy in 3 clicks

1. Go to <https://vercel.com/new> and sign in **with GitHub**.
2. Import the `prepai` repo. Vercel detects Next.js automatically — no build
   settings to change.
3. Before deploying, add environment variables (Settings → Environment
   Variables):

| Variable | Value |
| --- | --- |
| `AUTH_SECRET` | any long random string |
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` |

Deploy. Every future `git push` redeploys automatically.

> **Important for production:** the built-in JSON database writes to disk, which
> Vercel wipes on each deploy. Before taking real payments, create a Supabase
> project and add the connection variables below — the app switches drivers on
> its own. Then add `PAYSTACK_SECRET_KEY` and point the Paystack webhook at
> `https://yourdomain.com/api/webhooks/paystack`. Full walkthrough in README
> section 4.

### Supabase variables — set ALL of these on Vercel

Pick one install mode and use the matching schema variable.

**Isolated `prepai` schema (migration `0002_isolated_schema.sql`) — use when the
project is shared with another app (the common case):**

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service-role key |
| `SUPABASE_DB_SCHEMA` | `prepai` |
| `SUPABASE_STORAGE_BUCKET` | `textbooks` |

> **This is the #1 cause of a blank "Something went wrong" page on Vercel:**
> `SUPABASE_DB_SCHEMA=prepai` is set in `.env.local` but not added to the Vercel
> dashboard, so the app queries the (empty) `public` schema and every lookup
> 404s. Add it to Settings → Environment Variables and redeploy.

**Plain `public` schema (migration `0001_init.sql`) — use for a clean,
single-app project:**
set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
`SUPABASE_SERVICE_ROLE_KEY` (do **not** set `SUPABASE_DB_SCHEMA`).

---

## Everyday git commands

```bash
cd ~/prepai
git status                      # what changed
git add -A
git commit -m "add 200 JAMB physics questions"
git push                        # send to GitHub
```

## Never commit these

`.env.local` · `data/db.json` · any file with a Paystack secret key or Supabase
service-role key. The `.gitignore` already blocks them — if you ever add a new
secrets file, add it there too.
