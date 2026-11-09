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
