# Can the bots take trades on dylantrades.site?

Audit performed 2026-11-09 against the **live deployment** (`dpl_DH8Dy1…`, commit `bb421d1`)
and this repo. Findings are split into *verified*, *fixed here*, and *needs a human*.

---

## 1. Verified — what the live site actually does

Probes were run from GitHub Actions runners (Deriv's WAF blocks datacenter IPs, including
this sandbox, so the sandbox itself cannot reach `ws.derivws.com` or `oauth.deriv.com`).

| Check | Result |
| --- | --- |
| `/`, `/callback`, `/manifest.json`, `/service-worker.js` | **200** — SPA shell served on every route, incl. `/callback` |
| Live OAuth client | `auth.deriv.com/oauth2/authorize?app_id=343L8uHEkfWwA0GctDOSC` (an OIDC **client id**, not a numeric app id) |
| Live token endpoints | `auth.deriv.com/oauth2/auth`, `auth.deriv.com/oauth2/token` |
| Live API-token login | **supported** — bundle contains `is_api_token_login`, `api_token_app_id`, `token1`/`acct1` |
| Legacy `oauth.deriv.com/oauth2/authorize` | **dead** — 301 → `deriv.com` for every app id, with or without `redirect_uri` |
| `wss://ws.derivws.com` from CI | **520** (Cloudflare) — Deriv blocks datacenter IPs; not a site fault |
| Vercel env vars on the project | **none** — the build uses hardcoded values only |

Conclusion: the live build **can** authenticate (OIDC + API-token login) and therefore can trade,
but nothing in the deployment is configurable via env, and the old OAuth endpoint it also
references is dead. Only a real browser session with a real account can prove a trade end-to-end —
that is what the smoke test below is for.

## 2. Fixed in this repo (were real defects)

| Defect | Impact | Fix |
| --- | --- | --- |
| `callback-page.tsx` used `DERIV_OAUTH_CLIENT_ID`, `popPKCEVerifier`, `validatePKCEState` **without importing them** | `ReferenceError` the moment Deriv returned `?code=…` → login dead-ends on `/callback` | imported; client id now comes from config (`VITE_DERIV_OAUTH_CLIENT_ID`, default the live value) |
| `login.ts` hardcoded `oauth.deriv.com/oauth2/authorize?app_id=121856` **with no `redirect_uri`** for `dylantrades.site` | endpoint 301s to `deriv.com`; even if it worked, Deriv would redirect to the client's default URI, not this site | new `oauthLoginUrl()`: `auth.deriv.com/oauth2/authorize` + PKCE (S256) + `state` + `redirect_uri=<origin>/callback` |
| `redirect_uri` could be built from the current deep path | any mismatch with the registered URI = `invalid redirect_uri` after login | single `getOAuthRedirectUri()` helper, always `<origin>/callback` |
| `VITE_DERIV_OAUTH_CLIENT_ID` was not inlined by the bundler | setting the env var would have had no effect | added to `rsbuild.config.ts` `define` |
| No way to test the trading path | "bots work" was unverifiable | `npm run smoke:trade` + `Deriv trading smoke test` workflow |

## 3. Needs a human — cannot be done from an agent session

1. **Deploy the fix.** Production currently runs the CLI-built bundle; Vercel has no Git
   connection and no `VERCEL_TOKEN` secret, so neither the repo nor Actions can publish.
   Either connect the repo (Vercel → Settings → Git) or add the `VERCEL_TOKEN` secret, then
   this repo's code can go live. See `DEPLOYMENT.md`.
2. **Confirm the OAuth client's registered redirect URI** in the Deriv app settings:
   `https://dylantrades.site/callback` **and** `https://www.dylantrades.site/callback`.
   If only one is registered, logging in from the other host fails after the redirect.
3. **Run the smoke test with a demo token** to certify trading end-to-end:
   - add a Deriv **demo** API token (scope: trade) as the `DERIV_TOKEN` repo secret,
   - Actions → *Deriv trading smoke test* → Run workflow.
   It performs `authorize → proposal → buy → portfolio` and fails loudly on any step.
   A demo token can be revoked at any time from app.deriv.com, so it is safe to keep there.

## 4. What the smoke test proves

```
✓ websocket connected        app_id=36300
✓ token authorized           VRTC… (demo, USD)
✓ symbol R_100 is tradable
✓ proposal received          payout 0.55 USD
✓ TRADE PLACED               contract 123456789, buy price 0.35 USD
✓ contract visible in portfolio
✓ statement readable
✓ ALL CHECKS PASSED — bots can place trades
```

If step 2 fails with `InvalidToken`, the token is wrong/expired. If step 5 fails with
`ContractBuyValidationError` or `AuthorizationRequired`, the token lacks the **trade** scope or
the account cannot trade that symbol. Those are the same errors the bot UI surfaces, so a green
run here means the bot path is healthy.

---

## 5. Root cause of "clicking Run does nothing" (found 2026-11-09)

**Symptom:** in the bot builder, pressing Run starts the bot but no trade is ever placed.

**Cause — two login worlds, one trading socket:**

| | what it stores | which socket the bot uses |
| --- | --- | --- |
| OAuth / OIDC login (the "Log in" button) | `new_api_access_token` (Bearer) | legacy socket, which only authorises from `authToken` |
| API-token login | `authToken` | legacy socket — authorised |

`API_MODE` was **hard-coded to `'legacy'`**, so an OIDC session got:
- `client.setIsLoggedIn(true)` (the account list populates the header), so Run was allowed,
- ticks streaming over the public socket, so the bot looked alive,
- and **zero trading permission** — every `buy` was rejected, silently.

Nothing told the user, and no credential was ever written to `authToken`, so `initLegacyApi()`
skipped `authorizeAndSubscribe()` entirely.

**Fixes shipped:**

1. `getApiMode()` — the stack is now chosen from the credentials actually present, not the constant.
2. `/token` (and `/token-login`) — logs in with a Deriv API token: validates via `authorize`,
   writes `authToken` + account list + cookie, forces `API_MODE=legacy`, redirects to the app.
   Also accepts `/token?token=a1-…`.
3. Run is now **blocked with an explanation** when the session has no trading permission, instead
   of failing silently, with a button straight to `/token`. A banner across the app does the same
   for anyone signed in without trade rights.
4. `[Run] API diagnostics` is logged on every run (mode, token presence, authorised, socket state).

**To trade right now:** open `https://dylantrades.site/token`, paste an API token created at
app.deriv.com/account/api-token with **Read + Trade** scopes (use a demo account token first),
then run the bot from the builder.
