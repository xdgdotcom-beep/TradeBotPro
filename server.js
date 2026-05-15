/**
 * ForexBot Server — MetaAPI Multi-Account Trading Backend
 * Deploy to Railway: https://railway.app
 * Strategy: Bullish/Bearish Engulfing + Morning/Evening Star (M15)
 */

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const META_API_TOKEN = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIwNzBhYjFmZjJhMmExMDZhNWNmMGJlNzEzMjM3OWRjOSIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcnBjLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtZXRhc3RhdHMtYXBpIiwibWV0aG9kcyI6WyJtZXRhc3RhdHMtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6InJpc2stbWFuYWdlbWVudC1hcGkiLCJtZXRob2RzIjpbInJpc2stbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoiY29weWZhY3RvcnktYXBpIiwibWV0aG9kcyI6WyJjb3B5ZmFjdG9yeS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibXQtbWFuYWdlci1hcGkiLCJtZXRob2RzIjpbIm10LW1hbmFnZXItYXBpOnJlc3Q6ZGVhbGluZzoqOioiLCJtdC1tYW5hZ2VyLWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJiaWxsaW5nLWFwaSIsIm1ldGhvZHMiOlsiYmlsbGluZy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfV0sImlnbm9yZVJhdGVMaW1pdHMiOmZhbHNlLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiMDcwYWIxZmYyYTJhMTA2YTVjZjBiZTcxMzIzNzlkYzkiLCJpYXQiOjE3Nzg4MTM1NTAsImV4cCI6MTc4NjU4OTU1MH0.bRGafApvKmi_iWitugniKVdXMmj0tpSknYgCQk_ejmDrG7ZHsTtkMSB2c28ZKEdeR396qtTMd0KWvMQdEV6F07fIeKL5HNYOLdKAcjG1FHJ8paZaJKnoIuJg1MXyE3TfFwShAnuvoHPx_pBxY66gGD3frMlGvLvl84SakIbzVI1vepXfJc9fai90InbUr_AgcNB0TVHkoO7VURzMFfZjrmCJBMS4F3ux6xFBWQgvzeLlZxzsSaKFVsWQfv_OFgLDfh0EtCSuU3G51L6AGUOCYCE8bqACkPm5LFkeM52jQWkVVrOG2JOighv1eRhdSkba2icAceswfobMhZY1PSq24a3U8X5MCb9Z0xvGkzdbBsXL7Az0TUzq8uvxG9EEp9qo0DFF5VgbW5EjzbdpPrsjKF3MnzZHuOexDit_IEtdSeL52cHM1ZQpzzMj1PKUngQ01CtAkgYzX9SgBzklqFd0CBYrO5IoALZ3BrxOgfcLjRbTZOVIkhmd7R6xF01rmri8LQNftj48lCk0XwGs-mpSypQ7_Aet4a6YTDiQuQ4_yVgk5cC-MXIrQsQh8gq-H0d8PeVCQe7ovQ3vX2m7UJBfGL7CqeRWnhVrD1OYfPjWmu39NP8Q-FuvDC1KtUWYjq9_k6g7rFM6RF18hKPNWdmj2R3ZaPjYADcnSUg2XOYOF44';

const PAIRS = ['EURUSD','GBPUSD','USDJPY','AUDUSD','USDCAD','GBPJPY','EURJPY'];
const LOT_SIZE = 0.01;
const SL_PIPS  = 15;
const TP_PIPS  = 30;
const MIN_CONFIDENCE = 70;
const MIN_BODY_RATIO = 0.6;
const SCAN_INTERVAL_MS = 60000; // 1 min (MetaAPI rate-limit friendly)

// ─────────────────────────────────────────────
// IN-MEMORY STATE
// ─────────────────────────────────────────────
const accounts   = {};   // accountId → { meta, connection, active, stats, logs }
const scanTimers = {};   // accountId → intervalId

// ─────────────────────────────────────────────
// MetaAPI REST HELPERS
// ─────────────────────────────────────────────
async function metaFetch(path, method = 'GET', body = null) {
  const fetch = (await import('node-fetch')).default;
  const opts = {
    method,
    headers: {
      'auth-token': META_API_TOKEN,
      'Content-Type': 'application/json'
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://mt-client-api-v1.new-york.agiliumtrade.ai${path}`, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`MetaAPI ${method} ${path} → ${res.status}: ${txt}`);
  }
  return res.json();
}

async function mgmtFetch(path, method = 'GET', body = null) {
  const fetch = (await import('node-fetch')).default;
  const opts = {
    method,
    headers: {
      'auth-token': META_API_TOKEN,
      'Content-Type': 'application/json'
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://trading-account-api.agiliumtrade.ai${path}`, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`MgmtAPI ${method} ${path} → ${res.status}: ${txt}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────
// CANDLE FETCH (MetaAPI historical candles)
// ─────────────────────────────────────────────
async function getCandles(accountId, symbol, count = 5) {
  const path = `/users/current/accounts/${accountId}/historical-market-data/symbols/${symbol}/timeframes/15m/candles?limit=${count}`;
  const data = await metaFetch(path);
  return Array.isArray(data) ? data : (data.candles || []);
}

// ─────────────────────────────────────────────
// PATTERN DETECTORS
// ─────────────────────────────────────────────
function isBullishEngulfing(prev, curr) {
  const bearPrev = prev.close < prev.open;
  const bullCurr = curr.close > curr.open;
  if (!bearPrev || !bullCurr) return null;
  const prevBody  = Math.abs(prev.close - prev.open);
  const currBody  = Math.abs(curr.close - curr.open);
  const prevRange = prev.high - prev.low;
  if (prevRange === 0 || prevBody / prevRange < MIN_BODY_RATIO) return null;
  if (curr.open > prev.close || curr.close < prev.open) return null;
  const conf = Math.min(100, 65 + (currBody / prevBody - 1) * 40);
  return conf;
}

function isBearishEngulfing(prev, curr) {
  const bullPrev = prev.close > prev.open;
  const bearCurr = curr.close < curr.open;
  if (!bullPrev || !bearCurr) return null;
  const prevBody  = Math.abs(prev.close - prev.open);
  const currBody  = Math.abs(curr.close - curr.open);
  const prevRange = prev.high - prev.low;
  if (prevRange === 0 || prevBody / prevRange < MIN_BODY_RATIO) return null;
  if (curr.open < prev.close || curr.close > prev.open) return null;
  const conf = Math.min(100, 65 + (currBody / prevBody - 1) * 40);
  return conf;
}

function isMorningStar(c1, c2, c3) {
  if (c1.close >= c1.open || c3.close <= c3.open) return null;
  const body1 = Math.abs(c1.close - c1.open);
  const body2 = Math.abs(c2.close - c2.open);
  const body3 = Math.abs(c3.close - c3.open);
  if (body2 > body1 * 0.3) return null;
  if (c2.high > c1.close)  return null;
  if (c3.close < (c1.open + c1.close) / 2) return null;
  return Math.min(100, 70 + (body3 / body1) * 20);
}

function isEveningStar(c1, c2, c3) {
  if (c1.close <= c1.open || c3.close >= c3.open) return null;
  const body1 = Math.abs(c1.close - c1.open);
  const body2 = Math.abs(c2.close - c2.open);
  const body3 = Math.abs(c3.close - c3.open);
  if (body2 > body1 * 0.3) return null;
  if (c2.low < c1.close)   return null;
  if (c3.close > (c1.open + c1.close) / 2) return null;
  return Math.min(100, 70 + (body3 / body1) * 20);
}

function detectPattern(candles) {
  if (candles.length < 4) return null;
  // candles[0] = oldest, candles[n-1] = newest forming
  // Use last 4 closed: indices length-4 to length-2 (skip forming)
  const n  = candles.length;
  const c1 = candles[n - 4];
  const c2 = candles[n - 3];
  const c3 = candles[n - 2]; // last fully closed

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
// CHECK OPEN POSITIONS
// ─────────────────────────────────────────────
async function hasOpenPosition(accountId, symbol) {
  try {
    const positions = await metaFetch(`/users/current/accounts/${accountId}/positions`);
    return positions.some(p => p.symbol === symbol);
  } catch { return false; }
}

// ─────────────────────────────────────────────
// PLACE ORDER
// ─────────────────────────────────────────────
async function placeOrder(accountId, symbol, signal, price, pattern, confidence) {
  const isBuy  = signal === 'BUY';
  const point  = symbol.includes('JPY') ? 0.01 : 0.0001;
  const sl     = isBuy ? price - SL_PIPS * point * 10 : price + SL_PIPS * point * 10;
  const tp     = isBuy ? price + TP_PIPS * point * 10 : price - TP_PIPS * point * 10;

  const order = {
    symbol,
    actionType: isBuy ? 'ORDER_TYPE_BUY' : 'ORDER_TYPE_SELL',
    volume: LOT_SIZE,
    stopLoss: parseFloat(sl.toFixed(5)),
    takeProfit: parseFloat(tp.toFixed(5)),
    comment: pattern.substring(0, 20)
  };

  const result = await metaFetch(
    `/users/current/accounts/${accountId}/trade`,
    'POST',
    order
  );
  return { ...result, sl: order.stopLoss, tp: order.takeProfit };
}

// ─────────────────────────────────────────────
// PUSH LOG TO ACCOUNT STATE
// ─────────────────────────────────────────────
function pushLog(accountId, type, data) {
  const acc = accounts[accountId];
  if (!acc) return;
  const entry = { ...data, type, ts: Date.now() };
  acc.logs.unshift(entry);
  if (acc.logs.length > 100) acc.logs.pop();
  if (type === 'analysis') acc.stats.signals++;
  if (type === 'trade')    acc.stats.trades++;
}

// ─────────────────────────────────────────────
// SCAN ONE ACCOUNT
// ─────────────────────────────────────────────
async function scanAccount(accountId) {
  const acc = accounts[accountId];
  if (!acc || !acc.active) return;

  for (const pair of PAIRS) {
    try {
      const candles = await getCandles(accountId, pair, 6);
      if (!candles || candles.length < 4) continue;

      const result = detectPattern(candles);
      if (!result) continue;

      const lastCandle = candles[candles.length - 2];
      const price = result.signal === 'BUY' ? lastCandle.close : lastCandle.close;

      pushLog(accountId, 'analysis', {
        pair, ...result, price: parseFloat(price.toFixed(5))
      });

      console.log(`[${accountId}] ${pair} — ${result.pattern} | ${result.signal} | conf: ${result.confidence.toFixed(1)}%`);

      if (result.confidence >= MIN_CONFIDENCE) {
        const hasPos = await hasOpenPosition(accountId, pair);
        if (!hasPos) {
          const tradeResult = await placeOrder(accountId, pair, result.signal, price, result.pattern, result.confidence);
          pushLog(accountId, 'trade', {
            pair, ...result, price: parseFloat(price.toFixed(5)),
            sl: tradeResult.sl, tp: tradeResult.tp,
            ticket: tradeResult.orderId || tradeResult.positionId || '—',
            status: 'SENT'
          });
          console.log(`[${accountId}] TRADE SENT — ${pair} ${result.signal}`);
        }
      }

      await new Promise(r => setTimeout(r, 500)); // small delay between pairs
    } catch (err) {
      console.error(`[${accountId}] Error scanning ${pair}:`, err.message);
    }
  }
}

// ─────────────────────────────────────────────
// START / STOP SCANNING
// ─────────────────────────────────────────────
function startScanning(accountId) {
  if (scanTimers[accountId]) return;
  scanAccount(accountId); // immediate first scan
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
// PROVISION MT5 ACCOUNT ON METAAPI
// ─────────────────────────────────────────────
async function provisionAccount(login, password, server, broker, name) {
  const payload = {
    login: String(login),
    password,
    name: name || `ForexBot-${login}`,
    server,
    platform: 'mt5',
    magic: 20250001,
    quoteStreamingIntervalInSeconds: 2.5,
    reliability: 'regular',
    region: 'new-york'
  };
  const result = await mgmtFetch('/users/current/accounts', 'POST', payload);
  return result;
}

// ─────────────────────────────────────────────
// REST ENDPOINTS
// ─────────────────────────────────────────────

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'ForexBot', accounts: Object.keys(accounts).length });
});

// Add a new MT5 account
app.post('/api/accounts', async (req, res) => {
  const { login, password, server, broker, name } = req.body;
  if (!login || !password || !server) {
    return res.status(400).json({ error: 'login, password, server required' });
  }
  try {
    const provisioned = await provisionAccount(login, password, server, broker, name);
    const accountId = provisioned.id;

    accounts[accountId] = {
      id: accountId,
      login,
      server,
      broker: broker || server,
      name: name || `Account ${login}`,
      active: false,
      stats: { signals: 0, trades: 0, startedAt: null },
      logs: [],
      meta: provisioned
    };

    res.json({ success: true, accountId, account: accounts[accountId] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all accounts
app.get('/api/accounts', (req, res) => {
  const list = Object.values(accounts).map(a => ({
    id: a.id, login: a.login, server: a.server,
    broker: a.broker, name: a.name, active: a.active,
    stats: a.stats
  }));
  res.json(list);
});

// Get account details + logs
app.get('/api/accounts/:id', (req, res) => {
  const acc = accounts[req.params.id];
  if (!acc) return res.status(404).json({ error: 'Not found' });
  res.json(acc);
});

// Toggle bot ON/OFF for an account
app.post('/api/accounts/:id/toggle', (req, res) => {
  const acc = accounts[req.params.id];
  if (!acc) return res.status(404).json({ error: 'Not found' });

  const { active } = req.body;
  acc.active = !!active;

  if (acc.active) {
    acc.stats.startedAt = Date.now();
    startScanning(acc.id);
  } else {
    stopScanning(acc.id);
  }

  res.json({ success: true, active: acc.active });
});

// Remove account
app.delete('/api/accounts/:id', async (req, res) => {
  const acc = accounts[req.params.id];
  if (!acc) return res.status(404).json({ error: 'Not found' });
  stopScanning(acc.id);
  try {
    await mgmtFetch(`/users/current/accounts/${acc.id}`, 'DELETE');
  } catch (e) { /* ignore if already removed */ }
  delete accounts[acc.id];
  res.json({ success: true });
});

// Get logs for account
app.get('/api/accounts/:id/logs', (req, res) => {
  const acc = accounts[req.params.id];
  if (!acc) return res.status(404).json({ error: 'Not found' });
  const type = req.query.type; // 'analysis' | 'trade' | undefined (all)
  const logs = type ? acc.logs.filter(l => l.type === type) : acc.logs;
  res.json(logs);
});

// Manual scan trigger
app.post('/api/accounts/:id/scan', async (req, res) => {
  const acc = accounts[req.params.id];
  if (!acc) return res.status(404).json({ error: 'Not found' });
  scanAccount(acc.id); // fire async, don't await
  res.json({ success: true, message: 'Scan triggered' });
});

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ForexBot server running on port ${PORT}`);
  console.log(`MetaAPI token loaded: ${META_API_TOKEN.substring(0, 20)}...`);
});
