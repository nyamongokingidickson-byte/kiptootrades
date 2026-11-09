#!/usr/bin/env bash
# Temporary diagnostic: validate the live OAuth client + its registered redirect URIs.
set -u
CLIENT="343L8uHEkfWwA0GctDOSC"

check() {
    local label="$1" url="$2"
    echo "-----------------------------------------------------------"
    echo "## $label"
    echo "URL: $url"
    curl -sS --max-redirs 0 -o /tmp/auth.html -D /tmp/auth.head.txt -w "status=%{http_code}\n" "$url" || true
    grep -iE '^(HTTP/|location:)' /tmp/auth.head.txt | head -6
    grep -oiE '<title>[^<]*</title>' /tmp/auth.html | head -2
    grep -oiE '(invalid[^<"]{0,140}|redirect_uri[^<"]{0,140}|not allowed[^<"]{0,100}|mismatch[^<"]{0,100}|error[^<"]{0,100})' /tmp/auth.html | head -4
    echo
}

echo "## OAuth client redirect probe — $(date -u)"
echo "client: $CLIENT"
echo

check "live apex /callback" \
    "https://auth.deriv.com/oauth2/authorize?app_id=$CLIENT&l=en&brand=deriv&redirect_uri=https%3A%2F%2Fdylantrades.site%2Fcallback"
check "live www /callback" \
    "https://auth.deriv.com/oauth2/authorize?app_id=$CLIENT&l=en&brand=deriv&redirect_uri=https%3A%2F%2Fwww.dylantrades.site%2Fcallback"
check "vercel alias /callback" \
    "https://auth.deriv.com/oauth2/authorize?app_id=$CLIENT&l=en&brand=deriv&redirect_uri=https%3A%2F%2Fkiptootrades.vercel.app%2Fcallback"
check "no redirect_uri (client default)" \
    "https://auth.deriv.com/oauth2/authorize?app_id=$CLIENT&l=en&brand=deriv"
check "control: bogus redirect" \
    "https://auth.deriv.com/oauth2/authorize?app_id=$CLIENT&l=en&brand=deriv&redirect_uri=https%3A%2F%2Fevil.example%2Fcallback"

echo "## WebSocket reachability from a runner (520 last time — IP block or endpoint?)"
for host in ws.derivws.com green.derivws.com; do
    printf "%-20s " "$host"
    curl -sS -o /dev/null -w "http=%{http_code} time=%{time_total}s\n" \
        -H "Connection: Upgrade" -H "Upgrade: websocket" \
        -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
        "https://$host/websockets/v3?app_id=36300" || true
done
