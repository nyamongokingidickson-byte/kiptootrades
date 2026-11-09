// Temporary diagnostic: can a browser on dylantrades.site actually reach Deriv and trade?
import ws from 'ws';

const APPS = [121856, 36300];

function probe(appId) {
    return new Promise(resolve => {
        const url = `wss://ws.derivws.com/websockets/v3?app_id=${appId}`;
        const results = [];
        let wsClient;
        const done = reason => {
            try {
                wsClient?.close();
            } catch {}
            resolve({ appId, reason, messages: results });
        };
        const timer = setTimeout(() => done('timeout'), 15000);
        try {
            wsClient = new ws(url);
        } catch (e) {
            clearTimeout(timer);
            return resolve({ appId, reason: 'constructor-error', messages: [String(e)] });
        }
        wsClient.on('open', () => {
            results.push('OPEN');
            wsClient.send(JSON.stringify({ website_status: 1 }));
            wsClient.send(JSON.stringify({ ticks: 'R_100', subscribe: 1 }));
        });
        wsClient.on('message', raw => {
            const msg = JSON.parse(raw.toString());
            if (msg.error) results.push(`ERROR ${msg.error.code}: ${msg.error.message}`);
            if (msg.website_status) results.push(`website_status ok (api=${msg.website_status.api?.status})`);
            if (msg.tick) results.push(`tick ${msg.tick.symbol} quote=${msg.tick.quote}`);
            if (msg.msg_type === 'ping' || msg.pong) results.push('ping ok');
            const limit = results.filter(r => r.startsWith('tick')).length;
            if (limit >= 1) {
                clearTimeout(timer);
                done('success');
            }
        });
        wsClient.on('error', e => {
            clearTimeout(timer);
            done(`socket-error: ${e.message}`);
        });
        wsClient.on('close', code => {
            clearTimeout(timer);
            done(`closed(${code})`);
        });
    });
}

for (const appId of APPS) {
    const r = await probe(appId);
    console.log(`\n=== app_id ${appId} -> ${r.reason} ===`);
    r.messages.forEach(m => console.log('  ', m));
}
process.exit(0);
