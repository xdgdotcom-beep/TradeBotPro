/**
 * ForexBot Server — MetaAPI Multi-Account Trading Backend
 * Deploy to Railway: https://railway.app
 * Strategy: Bullish/Bearish Engulfing + Morning/Evening Star (M15)
 * Uses MetaAPI official Node.js SDK
 */

const express = require('express');
const cors    = require('cors');
const MetaApi = require('metaapi.cloud-sdk').default;

const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const META_API_TOKEN   = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIwNzBhYjFmZjJhMmExMDZhNWNmMGJlNzEzMjM3OWRjOSIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcnBjLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtZXRhc3RhdHMtYXBpIiwibWV0aG9kcyI6WyJtZXRhc3RhdHMtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6InJpc2stbWFuYWdlbWVudC1hcGkiLCJtZXRob2RzIjpbInJpc2stbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoiY29weWZhY3RvcnktYXBpIiwibWV0aG9kcyI6WyJjb3B5ZmFjdG9yeS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibXQtbWFuYWdlci1hcGkiLCJtZXRob2RzIjpbIm10LW1hbmFnZXItYXBpOnJlc3Q6ZGVhbGluZzoqOioiLCJtdC1tYW5hZ2VyLWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJiaWxsaW5nLWFwaSIsIm1ldGhvZHMiOlsiYmlsbGluZy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfV0sImlnbm9yZVJhdGVMaW1pdHMiOmZhbHNlLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiMDcwYWIxZmYyYTJhMTA2YTVjZjBiZTcxMzIzNzlkYzkiLCJpYXQiOjE3Nzg4MTM1NTAsImV4cCI6MTc4NjU4OTU1MH0.bRGafApvKmi_iWitugniKVdXMmj0tpSknYgCQk_ejmDrG7ZHsTtkMSB2c28ZKEdeR396qtTMd0KWvMQdEV6F07fIeKL5HNYOLdKAcjG1FHJ8paZaJKnoIuJg1MXyE3TfFwShAnuvoHPx_pBxY66gGD3frMlGvLvl84SakIbzVI1vepXfJc9fai90InbUr_AgcNB0TVHkoO7VURzMFfZjrmCJBMS4F3ux6xFBWQgvzeLlZxzsSaKFVsWQfv_OFgLDfh0EtCSuU3G51L6AGUOCYCE8bqACkPm5LFkeM52jQWkVVrOG2JOighv1eRhdSkba2icAceswfobMhZY1PSq24a3U8X5MCb9Z0xvGkzdbBsXL7Az0TUzq8uvxG9EEp9qo0DFF5VgbW5EjzbdpPrsjKF3MnzZHuOexDit_IEtdSeL52cHM1ZQpzzMj1PKUngQ01CtAkgYzX9SgBzklqFd0CBYrO5IoALZ3BrxOgfcLjRbTZOVIkhmd7R6xF01rmri8LQNftj48lCk0XwGs-mpSypQ7_Aet4a6YTDiQuQ4_yVgk5cC-MXIrQsQh8gq-H0d8PeVCQe7ovQ3vX2m7UJBfGL7CqeRWnhVrD1OYfPjWmu39NP8Q-FuvDC1KtUWYjq9_k6g7rFM6RF18hKPNWdmj2R3ZaPjYADcnSUg2XOYOF44';

const PAIRS            = ['EURUSD','GBPUSD','USDJPY','AUDUSD','USDCAD','GBPJPY','EURJPY'];
const LOT_SIZE         = 0.01;
const SL_PIPS          = 15;
const TP_PIPS          = 30;
const MIN_CONFIDENCE   = 70;
const MIN_BODY_RATIO   = 0.6;
const SCAN_INTERVAL_MS = 60000;

// ─────────────────────────────────────────────
// MetaAPI SDK INIT
// ─────────────────────────────────────────────
const metaApi = new MetaApi(META_API_TOKEN);

// ─────────────────────────────────────────────
// IN-MEMORY STATE
// ─────────────────────────────────────────────
const accounts   = {};
const scanTimers = {};

// ─────────────────────────────────────────────
// PATTERN DETECTORS
// ─────────────────────────────────────────────
function isBullishEngulfing(prev, curr) {
  if (prev.close >= prev.open || curr.close <= curr.open) return null;
  const prevBody  = Math.abs(prev.close - prev.open);
  const currBody  = Math.abs(curr.close - curr.open);
  const prevRange = prev.high - prev.low;
  if (prevRange === 0 || prevBody / prevRange < MIN_BODY_RATIO) return null;
  if (curr.open > prev.close || curr.close < prev.open) return null;
  return Math.min(100, 65 + (currBody / prevBody - 1) * 40);
}

function isBearishEngulfing(prev, curr) {
  if (prev.close <= prev.open || curr.close >= curr.open) return null;
  const prevBody  = Math.abs(prev.close - prev.open);
  const currBody  = Math.abs(curr.close - curr.open);
  const prevRange = prev.high - prev.low;
  if (prevRange === 0 || prevBody / prevRange < MIN_BODY_RATIO) return null;
  if (curr.open < prev.close || curr.close > prev.open) return null;
  return Math.min(100, 65 + (currBody / prevBody - 1) * 40);
}

function isMorningStar(c1, c2, c3) {
  if (c1.close >= c1.open || c3.close <= c3.open) return null;
  const body1 = Math.abs(c1.close - c1.open);
  const body2 = Math.abs(c2.close - c2.open);
  const body3 = Math.abs(c3.close - c3.open);
  if (body2 > body1 * 0.3 || c2.high > c1.close) return null;
  if (c3.close < (c1.open + c1.close) / 2) return null;
  return Math.min(100, 70 + (body3 / body1) * 20);
}

function isEveningStar(c1, c2, c3) {
  if (c1.close <= c1.open || c3.close >= c3.open) return null;
  const body1 = Math.abs(c1.close - c1.open);
  const body2 = Math.abs(c2.close - c2.open);
  const body3 = Math.abs(c3.close - c3.open);
  if (body2 > body1 * 0.3 || c2.low < c1.close) return null;
  if (c3.close > (c1.open + c1.close) / 2) return null;
  return Math.min(100, 70 + (body3 / body1) * 20);
}

function detectPattern(candles) {
  if (candles.length < 4) return null;
  const n  = candles.length;
  const c1 = candles[n - 4];
  const c2 = candles[n - 3];
  const c3 = candles[n - 2];
  let conf;
  if ((conf = isBullishEngulfing(c2, c3)) !== null)
    return { pattern: 'Bullish Engulfing', signal: 'BUY', confidence: conf };
  if ((conf = isBearishEngulfing(c2, c3)) !== null)
    return { pattern: 'Bearish Engulfing', signal: 'SELL', confidence: conf };
  if ((conf = isMorningStar(c1, c2, c3)) !== null)
    return { pattern: 'Morning Star', signal: 'BUY', confidence: conf };
  if ((conf = isEveningStar(c1, c2, c3)) !== null)
    return { pattern: 'Evening Star', signal: 'SELL', confidence: conf };
  return null;
}

// ─────────────────────────────────────────────
// LOGS
// ─────────────────────────────────────────────
function pushLog(accountId, type, data) {
  const acc = accounts[accountId];
  if (!acc) return;
  acc.logs.unshift({ ...data, type, ts: Date.now() });
  if (acc.logs.length > 100) acc.logs.pop();
  if (type === 'analysis') acc.stats.signals++;
  if (type === 'trade')    acc.stats.trades++;
}

// ─────────────────────────────────────────────
// SCAN ACCOUNT
// ─────────────────────────────────────────────
async function scanAccount(accountId) {
  const acc = accounts[accountId];
  if (!acc || !acc.active || !acc.connection) return;

  const conn = acc.connection;

  for (const pair of PAIRS) {
    try {
      const candles = await conn.getHistoricalCandles(pair, '15m', new Date(), 6);
      if (!candles || candles.length < 4) continue;

      const result = detectPattern(candles);
      if (!result) continue;

      const price = candles[candles.length - 2].close;

      pushLog(accountId, 'analysis', {
        pair, ...result, price: parseFloat(price.toFixed(5))
      });

      console.log(`[${accountId}] ${pair} — ${result.pattern} | ${result.signal} | ${result.confidence.toFixed(1)}%`);

      if (result.confidence >= MIN_CONFIDENCE) {
        const positions = conn.terminalState.positions || [];
        const hasPos    = positions.some(p => p.symbol === pair);

        if (!hasPos) {
          const isBuy = result.signal === 'BUY';
          const point = pair.includes('JPY') ? 0.01 : 0.0001;
          const sl    = parseFloat((isBuy ? price - SL_PIPS * point * 10 : price + SL_PIPS * point * 10).toFixed(5));
          const tp    = parseFloat((isBuy ? price + TP_PIPS * point * 10 : price - TP_PIPS * point * 10).toFixed(5));

          const tradeResult = isBuy
            ? await conn.createMarketBuyOrder(pair, LOT_SIZE, sl, tp, { comment: result.pattern.substring(0, 20) })
            : await conn.createMarketSellOrder(pair, LOT_SIZE, sl, tp, { comment: result.pattern.substring(0, 20) });

          pushLog(accountId, 'trade', {
            pair, ...result, price: parseFloat(price.toFixed(5)),
            sl, tp,
            ticket: tradeResult.orderId || tradeResult.positionId || '—',
            status: 'SENT'
          });

          console.log(`[${accountId}] TRADE SENT — ${pair} ${result.signal}`);
        }
      }

      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`[${accountId}] Error scanning ${pair}:`, err.message);
    }
  }
}

// ─────────────────────────────────────────────
// SCANNING TIMERS
// ─────────────────────────────────────────────
function startScanning(accountId) {
  if (scanTimers[accountId]) return;
  scanAccount(accountId);
  scanTimers[accountId] = setInterval(() => scanAccount(accountId), SCAN_INTERVAL_MS);
  console.log(`[${accountId}] Scanner started`);
}

function stopScanning(accountId) {
  if (scanTimers[accountId]) {
    clearInterval(scanTimers[accountId]);
    delete scanTimers[accountId];
  }
  console.log(`[${accountId}] Scanner stopped`);
}

// ─────────────────────────────────────────────
// CONNECT TO MT5 VIA SDK
// ─────────────────────────────────────────────
async function connectAccount(accountId) {
  try {
    const metaAccount = await metaApi.metatraderAccountApi.getAccount(accountId);
    if (metaAccount.state !== 'DEPLOYED') {
      await metaAccount.deploy();
      await metaAccount.waitDeployed(300);
    }
    const connection = metaAccount.getRPCConnection();
    await connection.connect();
    await connection.waitSynchronized({ timeoutInSeconds: 300 });
    accounts[accountId].connection = connection;
    accounts[accountId].connected  = true;
    console.log(`[${accountId}] MT5 connected and synchronized`);
    return connection;
  } catch (err) {
    accounts[accountId].connected = false;
    console.error(`[${accountId}] Connect failed:`, err.message);
    throw err;
  }
}

// ─────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'ForexBot', accounts: Object.keys(accounts).length });
});

// Add account
app.post('/api/accounts', async (req, res) => {
  const { login, password, server, broker, name } = req.body;
  if (!login || !password || !server)
    return res.status(400).json({ error: 'login, password, server required' });

  try {
    const metaAccount = await metaApi.metatraderAccountApi.createAccount({
      login:    String(login),
      password,
      name:     name || `ForexBot-${login}`,
      server,
      platform: 'mt5',
      magic:    20250001,
      quoteStreamingIntervalInSeconds: 2.5,
      reliability: 'regular'
    });

    const accountId = metaAccount.id;

    accounts[accountId] = {
      id:        accountId,
      login,
      server,
      broker:    broker || server,
      name:      name || `Account ${login}`,
      active:    false,
      connected: false,
      stats:     { signals: 0, trades: 0, startedAt: null },
      logs:      [],
      connection: null
    };

    // Connect in background
    connectAccount(accountId).catch(err =>
      console.error(`[${accountId}] Background connect failed:`, err.message)
    );

    res.json({ success: true, accountId, account: { ...accounts[accountId], connection: undefined } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List accounts
app.get('/api/accounts', (req, res) => {
  res.json(Object.values(accounts).map(a => ({
    id: a.id, login: a.login, server: a.server, broker: a.broker,
    name: a.name, active: a.active, connected: a.connected, stats: a.stats
  })));
});

// Single account
app.get('/api/accounts/:id', (req, res) => {
  const acc = accounts[req.params.id];
  if (!acc) return res.status(404).json({ error: 'Not found' });
  res.json({ ...acc, connection: undefined });
});

// Toggle ON/OFF
app.post('/api/accounts/:id/toggle', async (req, res) => {
  const acc = accounts[req.params.id];
  if (!acc) return res.status(404).json({ error: 'Not found' });

  acc.active = !!req.body.active;

  if (acc.active) {
    acc.stats.startedAt = Date.now();
    if (!acc.connection) {
      connectAccount(acc.id)
        .then(() => startScanning(acc.id))
        .catch(e => console.error(`Toggle connect failed:`, e.message));
    } else {
      startScanning(acc.id);
    }
  } else {
    stopScanning(acc.id);
  }

  res.json({ success: true, active: acc.active });
});

// Delete account
app.delete('/api/accounts/:id', async (req, res) => {
  const acc = accounts[req.params.id];
  if (!acc) return res.status(404).json({ error: 'Not found' });
  stopScanning(acc.id);
  try {
    const ma = await metaApi.metatraderAccountApi.getAccount(acc.id);
    await ma.undeploy();
    await ma.remove();
  } catch (e) { /* ignore */ }
  delete accounts[acc.id];
  res.json({ success: true });
});

// Logs
app.get('/api/accounts/:id/logs', (req, res) => {
  const acc = accounts[req.params.id];
  if (!acc) return res.status(404).json({ error: 'Not found' });
  const type = req.query.type;
  res.json(type ? acc.logs.filter(l => l.type === type) : acc.logs);
});

// Manual scan
app.post('/api/accounts/:id/scan', (req, res) => {
  const acc = accounts[req.params.id];
  if (!acc) return res.status(404).json({ error: 'Not found' });
  scanAccount(acc.id);
  res.json({ success: true });
});

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`ForexBot server running on port ${PORT}`);
  console.log(`MetaAPI SDK initialized`);
});