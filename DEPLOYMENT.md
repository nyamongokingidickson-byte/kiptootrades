# Deployment — keeping the live site in step with GitHub

Live site: **https://www.dylantrades.site** (also `kiptootrades.vercel.app`)
Vercel project: `kiptootrades` · team `dylankingi`
GitHub repo: `nyamongokingidickson-byte/kiptootrades` (branch `main`)

Historically this project was deployed by hand with `vercel --prod` from a laptop, so the live
build drifted ahead of GitHub. Two ways to fix that — pick **one**.

---

## Option A — connect the repo in Vercel (recommended, zero secrets)

Vercel's GitHub app is **not installed** on this GitHub account yet, so Vercel cannot read the
repo. One-time setup, ~1 minute:

1. Open <https://vercel.com/dylankingi/kiptootrades/settings/git>
2. **Connect Git Repository** → GitHub → authorize/install the Vercel app on
   `nyamongokingidickson-byte/kiptootrades`
3. Leave **Production Branch** = `main`, framework preset **Other**, and save.

From then on: every push/merge to `main` builds with `npm run build` (`vercel.json` →
`outputDirectory: dist`) and promotes to production. Pull requests get preview URLs.

---

## Option B — GitHub Actions (already wired in this repo)

`.github/workflows/deploy-vercel.yml` deploys production on every push to `main`
using the Vercel CLI. No GitHub app needed.

One-time setup:

1. Create a token: <https://vercel.com/account/tokens> → *Create* → scope `dylankingi`,
   expiry of your choice.
2. In GitHub: *Settings → Secrets and variables → Actions → New repository secret*
   - Name: `VERCEL_TOKEN`
   - Value: the token
3. (Optional) add `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` if you ever move the project —
   the workflow already defaults to `team_GcCxHEyleTtU3vsRUkvqia9r` /
   `prj_21Hj7hOx209vofPcxVIdW1ebVrAx`.

Never commit the token or paste it into chat. Until it is set, the workflow runs green but
**skips** the deploy with a notice.

---

## ⚠️ Before the first auto-deploy

The code in this repo is dated **2026-10-15** (`dylantrades@092ec59`), while the live build was
made from a later local copy. The live build contains fixes that are **not** in this repo yet:

| Live fix | Repo state |
| --- | --- |
| OAuth `redirect_uri` uses the registered `/callback` route | absent |
| `service-worker.js` PWA registration 404 fix | `public/service-worker.js` added, but `src/utils/pwa-utils.ts` still registers `/sw.js` |
| Restored static assets (chunk, 2 CSS, hero images, mp3 sounds) | partial |

So the **first** deploy from `main` would roll production back to the older build. Either:

- push your newer local working copy to `main` first (recommended), **or**
- accept the rollback, **or**
- point Production Branch at a different branch until the delta is merged.

Preview deployments are safe at any time — they never touch production.

## Manual deploy (fallback)

```bash
npm install
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod
```
