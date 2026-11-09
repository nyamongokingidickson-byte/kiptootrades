#!/usr/bin/env bash
# Temporary diagnostic: inspect what the *live* bundle actually does for auth/trading.
set -u
BASE="https://www.dylantrades.site"
CHUNKS=(
    "/static/js/index.52e00649.js"
    "/static/js/160.abd80728.js"
    "/static/js/lib-react.7e3f0832.js"
    "/static/js/async/165.c25945a3.js"
    "/static/js/async/212.c8bf078f.js"
    "/static/js/async/242.53ab05c2.js"
    "/static/js/async/932.f38d59fe.js"
    "/static/js/async/973.bb9db605.js"
)

echo "## Live bundle auth probe — $(date -u)"
mkdir -p /tmp/chunks
for c in "${CHUNKS[@]}"; do
    name=$(basename "$c")
    code=$(curl -sS -o "/tmp/chunks/$name" -w "%{http_code}" "$BASE$c" || echo 000)
    echo "$name -> $code ($(wc -c <"/tmp/chunks/$name" 2>/dev/null || echo 0) bytes)"
done

echo
echo "### OAuth endpoints referenced by the live build"
grep -ohE 'https://[a-z.]*deriv\.com/oauth2/[a-z]+' /tmp/chunks/* 2>/dev/null | sort | uniq -c | sort -rn | head

echo
echo "### app_id occurrences (minified forms)"
grep -ohE 'app_id=[0-9]{3,7}' /tmp/chunks/* 2>/dev/null | sort | uniq -c | sort -rn | head
grep -ohE 'APP_IDS[^;]{0,80}' /tmp/chunks/* 2>/dev/null | head -3
grep -ohE '(121856|36300|66900)' /tmp/chunks/* 2>/dev/null | sort | uniq -c | sort -rn | head

echo
echo "### redirect_uri construction"
grep -ohE '.{60}redirect_uri.{80}' /tmp/chunks/* 2>/dev/null | head -8

echo
echo "### new-auth hints (auth.deriv.com / client_id / PKCE)"
grep -ohE 'auth\.deriv\.com[^"'"'"']{0,60}' /tmp/chunks/* 2>/dev/null | sort | uniq -c | head
grep -ohE '.{40}client_id.{60}' /tmp/chunks/* 2>/dev/null | head -5
grep -ohE '.{30}code_challenge.{40}' /tmp/chunks/* 2>/dev/null | head -3

echo
echo "### token-based login hints"
grep -ohE '(token1|acct1|cur1)' /tmp/chunks/* 2>/dev/null | sort | uniq -c | head
grep -ohE '.{40}(oauth_token|api_token|deriv_token).{40}' /tmp/chunks/* 2>/dev/null | head -5

echo
echo "### WS endpoints"
grep -ohE 'wss://[a-z0-9.]*derivws\.com[^"'"'"']{0,40}' /tmp/chunks/* 2>/dev/null | sort | uniq -c | sort -rn | head
