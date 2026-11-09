# Deploy runbook — putting this repo's build on dylantrades.site

Everything on the code side is ready: `npm ci` + `npm run build` succeed and produce a 41 MB
`dist/` in the same shape the live deployment serves. What is missing is **authorization**:

| Route | Needs | Who can do it |
| --- | --- | --- |
| Vercel Git integration | Vercel GitHub app installed + repo connected | account owner (dashboard, ~1 min) |
| GitHub Actions (wired) | `VERCEL_TOKEN` repo secret | account owner (token creation) |
| CLI from a laptop | `vercel login` already on that machine | account owner |

An agent session cannot do any of the three: creating a Vercel token or installing the GitHub app
requires your interactive login. That is why the last dispatch run finished in 3 s with
*"Add a VERCEL_TOKEN repository secret to enable deploys"*.

## Fastest path (Actions, ~2 minutes)

1. <https://vercel.com/account/tokens> → **Create Token**
   - Name: `github-actions-kiptootrades`
   - Scope: team **dylankingi**
   - Expiration: 90 days (or no expiry)
2. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `VERCEL_TOKEN`
   - Value: the token you just created
3. **Actions → Deploy to Vercel → Run workflow**
   - `target: preview` → returns a preview URL for a safe check
   - `target: production` → same build, promoted to `dylantrades.site`

Every later push to `main` deploys to production automatically.

## Alternative (Vercel Git integration)

<https://vercel.com/dylankingi/kiptootrades/settings/git> → *Connect Git Repository* →
`nyamongokingidickson-byte/kiptootrades`, production branch `main`, framework preset **Other**.
Then a `git push` is all it takes.

## Manual (from your laptop, in the project folder)

```bash
npm ci
vercel pull --yes --environment=production   # links .vercel/project.json
vercel build --prod
vercel deploy --prebuilt --prod
```

## Rollback

The current good build is `dpl_DH8Dy1WX6HhvqkePJM6ZmZwN2zfs`
(<https://vercel.com/dylankingi/kiptootrades/DH8Dy1WX6HhvqkePJM6ZmZwN2zfs>).
In the Vercel dashboard: *Deployments → that deployment → ⋯ → Promote to Production*.
Aliases `dylantrades.site`, `www.dylantrades.site`, `kiptootrades.vercel.app` move with it.

## Check after deploying

1. `https://dylantrades.site` loads the workspace shell.
2. `https://dylantrades.site/callback` loads (it is a client-side route).
3. Log in — the browser goes to `auth.deriv.com`, then returns to
   `https://dylantrades.site/callback?code=…` and lands in the app.
4. Actions → **Deriv trading smoke test** with a demo `DERIV_TOKEN` secret →
   `authorize → proposal → buy` must all pass.

## Known differences from the current live build

The live bundle was built from a later local copy than this repo. Before promoting, check these
in the preview URL:

- **API-token login**: the live build carries `is_api_token_login` / `api_token_app_id` helpers;
  this source does not reference them. If you (or your users) log in by pasting a Deriv API token,
  confirm that screen still exists in the preview before promoting.
- **OAuth**: this repo now calls `auth.deriv.com/oauth2/authorize` with PKCE and
  `redirect_uri=<origin>/callback`. The OAuth client must have
  `https://dylantrades.site/callback` **and** `https://www.dylantrades.site/callback` registered,
  or the return leg fails with `invalid redirect_uri`.
