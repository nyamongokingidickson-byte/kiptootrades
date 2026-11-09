/**
 * Deriv trading smoke test — proves the exact path a bot uses can place a trade.
 *
 *   authorize -> proposal -> buy -> contract update
 *
 * Run locally (never commit the token):
 *   DERIV_TOKEN=xxx node scripts/smoke-trade.mjs
 *
 * In CI it reads the DERIV_TOKEN secret. Demo accounts only, by default.
 *
 * Env:
 *   DERIV_TOKEN   (required) Deriv API token with trade scope
 *   DERIV_APP_ID  (default 36300)
 *   DERIV_SYMBOL  (default R_100)
 *   DERIV_STAKE   (default 0.35)
 *   ALLOW_REAL=1  permit a real-money account (otherwise aborts)
 */
import ws from 'ws';

const TOKEN = process.env.DERIV_TOKEN;
const APP_ID = process.env.DERIV_APP_ID || '36300';
const SYMBOL = process.env.DERIV_SYMBOL || 'R_100';
const STAKE = process.env.DERIV_STAKE || '0.35';
const ALLOW_REAL = process.env.ALLOW_REAL === '1';
const URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`;

if (!TOKEN) {
    console.error('✗ DERIV_TOKEN is not set');
    process.exit(1);
}

const results = [];
const log = (ok, label, extra = '') => {
    results.push({ ok, label, extra });
    console.log(`${ok ? '✓' : '✗'} ${label}${extra ? ` — ${extra}` : ''}`);
};

let socket;
let reqId = 0;
const pending = new Map();

const connect = () =>
    new Promise((resolve, reject) => {
        socket = new ws(URL);
        socket.on('open', () => resolve());
        socket.on('error', reject);
        socket.on('message', raw => {
            const msg = JSON.parse(raw.toString());
            // Some streams carry no req_id; ignore those for the promise map.
            const id = msg.req_id;
            if (id !== undefined && pending.has(id)) {
                const { resolve, reject } = pending.get(id);
                pending.delete(id);
                if (msg.error) reject(new Error(`${msg.error.code}: ${msg.error.message}`));
                else resolve(msg);
            }
        });
    });

const send = (payload, timeoutMs = 20000) =>
    new Promise((resolve, reject) => {
        const id = ++reqId;
        const timer = setTimeout(() => {
            pending.delete(id);
            reject(new Error(`timeout after ${timeoutMs}ms`));
        }, timeoutMs);
        pending.set(id, {
            resolve: v => {
                clearTimeout(timer);
                resolve(v);
            },
            reject: e => {
                clearTimeout(timer);
                reject(e);
            },
        });
        socket.send(JSON.stringify({ ...payload, req_id: id }));
    });

const run = async () => {
    console.log(`\nDeriv trading smoke test — app_id=${APP_ID} symbol=${SYMBOL} stake=${STAKE}\n`);

    await connect();
    log(true, 'websocket connected', URL.replace(TOKEN, '***'));

    const auth = await send({ authorize: TOKEN });
    const account = auth.authorize;
    log(true, 'token authorized', `${account.loginid} (${account.is_virtual ? 'demo' : 'REAL'}, ${account.currency})`);

    if (!account.is_virtual && !ALLOW_REAL) {
        log(false, 'real-money account detected — refusing to trade', 'set ALLOW_REAL=1 to override');
        return finish();
    }

    const activeSymbols = await send({ active_symbols: 'brief' });
    const found = activeSymbols.active_symbols?.some(s => s.symbol === SYMBOL);
    log(found, `symbol ${SYMBOL} is tradable`, `${activeSymbols.active_symbols?.length ?? 0} symbols available`);
    if (!found) return finish();

    const proposal = await send({ proposal: 1, amount: STAKE, basis: 'stake', contract_type: 'CALL', currency: account.currency, duration: 5, duration_unit: 't', symbol: SYMBOL });
    log(true, 'proposal received', `payout ${proposal.proposal.payout} ${account.currency}`);

    const buy = await send({ buy: proposal.proposal.id, price: Stake(proposal.proposal.ask_price) });
    const contractId = buy.buy.contract_id;
    log(true, 'TRADE PLACED', `contract ${contractId}, buy price ${buy.buy.buy_price} ${account.currency}`);

    // Confirm the position is live on the account (this is what the bot UI reads).
    const portfolio = await send({ portfolio: 1 });
    const held = portfolio.portfolio?.contracts?.some(c => c.contract_id === contractId);
    log(!!held, 'contract visible in portfolio', `${portfolio.portfolio?.contracts?.length ?? 0} open`);

    const statement = await send({ statement: 1, description: 1, limit: 5 });
    log(!!statement.statement, 'statement readable', `${statement.statement?.count ?? 0} transactions`);

    finish();
};

const Stake = v => Number(v);

const finish = () => {
    const failed = results.filter(r => !r.ok);
    console.log(`\n${failed.length === 0 ? '✓ ALL CHECKS PASSED — bots can place trades' : `✗ ${failed.length} check(s) failed`}\n`);
    try {
        socket?.close();
    } catch {}
    process.exit(failed.length === 0 ? 0 : 1);
};

run().catch(err => {
    console.error(`\n✗ ${err.message}\n`);
    try {
        socket?.close();
    } catch {}
    process.exit(1);
});
