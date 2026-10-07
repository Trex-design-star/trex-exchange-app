// Trex hosted API (Netlify Functions + Postgres). Same contract as api.rb:
// server-side trade state machine, capacity enforcement, idempotency,
// append-only ledger, audit. Minor units only in money fields that need
// precision; offer amounts stay in major units like the preview contract.
const { Pool } = require('pg');

const connStr = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL || '';
const pool = new Pool({
  // Netlify DB exposes NETLIFY_DATABASE_URL (pooled); plain DATABASE_URL
  // works too for local runs and other providers. Local proxies speak
  // plain Postgres — only use TLS against real hosts.
  connectionString: connStr,
  ssl: /localhost|127\.0\.0\.1/.test(connStr) ? false : { rejectUnauthorized: false },
  max: 3,
});

const rnd = (n) => Math.floor(Math.random() * n).toString().padStart(6, '0');
const uid = (p) => p + '-' + Math.random().toString(36).slice(2, 10).toUpperCase();
const now = () => new Date().toISOString();

async function kv(k, fallback) {
  const r = await pool.query('select value from kv where key=$1', [k]);
  return r.rows.length ? r.rows[0].value : fallback;
}
async function kvSet(k, v) {
  await pool.query('insert into kv(key,value) values($1,$2) on conflict(key) do update set value=$2', [k, v]);
}
async function audit(event) {
  await pool.query('insert into audit(event) values($1)', [event]);
}
function ok(body) {
  return { statusCode: 200, headers: jsonHeaders(), body: JSON.stringify(body) };
}
function err(message, status = 422) {
  return { statusCode: status, headers: jsonHeaders(), body: JSON.stringify({ ok: false, error: message }) };
}
function jsonHeaders() {
  return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
}

async function resendSend(to, subject, text) {
  const key = process.env.RESEND_API_KEY || '';
  if (!key) return { sent: false, reason: 'no-key' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.RESEND_FROM || 'Trex <onboarding@resend.dev>', to: [to], subject, text }),
    });
    return { sent: r.ok, status: r.status };
  } catch (e) {
    return { sent: false, reason: 'error' };
  }
}

async function tradeEmail(trade, subject, text) {
  const to = (trade.email || '').trim();
  if (!to) return;
  const r = await resendSend(to, subject, text);
  await audit(`Email to ${to}: ${subject} (${r.sent ? 'sent' : 'queued-no-key'})`);
}

const NEXT = { pay: 'payment_sent', confirm: 'payment_confirmed', deliver: 'delivery_sent', complete: 'completed', cancel: 'cancelled', dispute: 'disputed' };
const ALLOWED = {
  opened: ['pay', 'cancel'], payment_sent: ['confirm', 'dispute'],
  payment_confirmed: ['deliver', 'dispute'], delivery_sent: ['complete', 'dispute'],
  disputed: [], completed: [], cancelled: [], resolved: [],
};

async function withIdem(key, fn) {
  if (key) {
    const r = await pool.query('select response from idem where key=$1', [key]);
    if (r.rows.length) return r.rows[0].response;
  }
  const out = await fn();
  if (key && out && out.ok) {
    await pool.query('insert into idem(key,response) values($1,$2) on conflict do nothing', [key, out]);
  }
  return out;
}

exports.handler = async (event) => {
  const method = event.httpMethod;
  // Netlify may pass the original path (/api/health) or the rewritten
  // function path (/.netlify/functions/api/health) — accept all forms.
  let p = String(event.path || '').replace(/^\/+/, '');
  p = p.replace(/^\.netlify\/functions\/api\/?/, '').replace(/^api\/?/, '');
  const seg = p.split('/').filter(Boolean).map((s) => s.split('?')[0]);
  let body = {};
  try { body = event.body ? JSON.parse(event.body) : {}; } catch (e) { body = {}; }
  const key = (event.headers && (event.headers['x-idempotency-key'] || event.headers['X-Idempotency-Key'])) || body.idempotency_key;
  try {
    const route = method + ' ' + (seg[0] || '');
    if (route === 'GET health') return ok({ ok: true, service: 'trex-api', time: now() });
    if (route === 'GET integrations') {
      return ok({ ok: true, resend: !!process.env.RESEND_API_KEY, sms: !!(process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_FROM), paystack: !!process.env.PAYSTACK_SECRET_KEY });
    }
    if (route === 'POST otp') {
      const target = String(body.phone || body.email || '').trim();
      if (!target) return err('Phone number or email is required.');
      const code = rnd(1000000);
      await pool.query(`insert into otp(target,code,exp,attempts) values($1,$2,$3,0)
        on conflict(target) do update set code=$2, exp=$3, attempts=0`, [target, code, Math.floor(Date.now() / 1000) + 600]);
      await audit('OTP requested for ' + target);
      if (body.email) {
        const r = await resendSend(target, 'Your Trex code', `Your Trex code is ${code}. It expires in 10 minutes.`);
        if (r.sent) return ok({ ok: true, email_sent: true, expires_in: 600 });
        if (r.reason === 'no-key') return ok({ ok: true, demo_code: code, expires_in: 600, preview: true });
        return err('Email failed to send — check the address and try again.', 502);
      }
      return ok({ ok: true, demo_code: code, expires_in: 600, preview: true });
    }
    if (route === 'POST verify') {
      const target = String(body.phone || body.email || '').trim();
      const r = await pool.query('select * from otp where target=$1', [target]);
      const rec = r.rows[0];
      if (!rec || Date.now() / 1000 > Number(rec.exp)) return err('Code expired. Please request a new one.');
      if (Number(rec.attempts) >= 5) return err('Too many tries. Please request a new code.');
      if (String(body.code) === rec.code) {
        await pool.query('delete from otp where target=$1', [target]);
        await audit('Verified ' + target);
        return ok({ ok: true });
      }
      await pool.query('update otp set attempts=attempts+1 where target=$1', [target]);
      return err("That code doesn't match. Check and try again.");
    }
    if (route === 'GET offers') {
      const r = await pool.query('select data from offers order by id');
      const all = r.rows.map((x) => x.data);
      return ok({ ok: true, offers: all.filter((o) => o.live !== false) });
    }
    if (route === 'POST offers') {
      const b = body;
      if (b.id && b.delete) {
        await pool.query('delete from offers where id=$1', [b.id]);
        await audit('Offer deleted ' + b.id);
        return ok({ ok: true });
      }
      if (b.id) {
        const r = await pool.query('select data from offers where id=$1', [b.id]);
        if (!r.rows.length) return err('Offer not found.', 404);
        const o = r.rows[0].data;
        ['rate', 'min', 'max', 'methods', 'terms', 'avail', 'live', 'vendor'].forEach((k) => { if (b[k] !== undefined) o[k] = b[k]; });
        await pool.query('update offers set data=$1 where id=$2', [o, b.id]);
        await audit('Offer updated ' + b.id);
        return ok({ ok: true, offer: o });
      }
      if (!b.provide || !b.want) return err('Provide and want currencies are required.');
      if (b.provide === b.want) return err('Pick two different currencies.');
      if (!(Number(b.rate) > 0)) return err('Set a rate above zero.');
      if (!(Number(b.max) > Number(b.min))) return err('Maximum must be above minimum.');
      const o = { id: uid('OFR'), provide: b.provide, want: b.want, rate: Number(b.rate), min: Number(b.min), max: Number(b.max), vendor: b.vendor || 'You', country: b.country || 'NG', tier: 'Probation', capacity: Number(b.capacity || 5000), rating: null, trades: 0, methods: b.methods || ['Bank transfer'], terms: b.terms || '', live: true };
      await pool.query('insert into offers(id,data) values($1,$2)', [o.id, o]);
      await audit(`Offer published ${o.id} ${o.provide}->${o.want}`);
      return ok({ ok: true, offer: o });
    }
    if (route === 'POST trades') {
      return ok(await withIdem(key, async () => {
        const r = await pool.query('select data from offers where id=$1', [body.offer_id]);
        const o = r.rows[0] && r.rows[0].data;
        if (!o || o.live === false) return { ok: false, error: 'Offer unavailable.' };
        const amt = Number(body.amount);
        if (o.max && amt > o.max) return { ok: false, error: `Above this offer's maximum (${o.max} ${o.provide}).` };
        if (o.min && amt < o.min) return { ok: false, error: `Below this offer's minimum (${o.min} ${o.provide}).` };
        const bond = await kv('bond', { reserved: {} });
        const free = Number(o.capacity) - Number((bond.reserved || {})[o.id] || 0);
        if (amt > free) return { ok: false, error: 'This offer cannot cover that amount right now.' };
        bond.reserved = bond.reserved || {};
        bond.reserved[o.id] = Number(bond.reserved[o.id] || 0) + amt;
        await kvSet('bond', bond);
        const cfg = await kv('config', { fee_pct: 1.5 });
        const t = { id: uid('TXN'), offer_id: o.id, sell: body.sell, recv: body.recv, amount: amt, email: String(body.email || ''), provide: o.provide, rate: o.rate, fee_pct: cfg.fee_pct || 1.5, state: 'opened', proof: null, chat: [], created_at: now() };
        await pool.query('insert into trades(id,data) values($1,$2)', [t.id, t]);
        await pool.query('insert into ledger(id,kind,trade,amount,ccy) values($1,$2,$3,$4,$5)', [uid('evt').toLowerCase(), 'reserve', t.id, amt, o.provide]);
        await audit('Trade opened ' + t.id);
        await tradeEmail(t, `Your ${t.sell}→${t.recv} trade is open`, `Trade ${t.id} for ${amt} ${t.sell} is open and bond-protected.`);
        return { ok: true, trade: t };
      }));
    }
    if (route === 'GET trades') {
      const r = await pool.query('select data from trades order by data->>\'created_at\' desc limit 100');
      return ok({ ok: true, trades: r.rows.map((x) => x.data) });
    }
    if (route === 'POST trade_action') {
      return ok(await withIdem(key, async () => {
        const r = await pool.query('select data from trades where id=$1', [body.id]);
        const t = r.rows[0] && r.rows[0].data;
        if (!t) return { ok: false, error: 'Trade not found.' };
        const a = String(body.action);
        if (!(ALLOWED[t.state] || []).includes(a)) return { ok: false, error: `Cannot ${a} a ${t.state} trade.` };
        if (a === 'pay' && !(body.proof || '').trim()) return { ok: false, error: 'Attach your payment receipt first.' };
        t.state = NEXT[a];
        if (body.proof) t.proof = body.proof;
        if (body.text) t.chat.push({ from: body.from || 'you', text: body.text, at: now() });
        if (t.state === 'completed' || t.state === 'cancelled') {
          const bond = await kv('bond', { reserved: {} });
          bond.reserved = bond.reserved || {};
          bond.reserved[t.offer_id] = Math.max(0, Number(bond.reserved[t.offer_id] || 0) - Number(t.amount));
          await kvSet('bond', bond);
          await pool.query('insert into ledger(id,kind,trade,amount,ccy) values($1,$2,$3,$4,$5)', [uid('evt').toLowerCase(), t.state === 'completed' ? 'release' : 'refund', t.id, t.amount, t.provide]);
        }
        if (t.state === 'disputed') {
          const d = { id: uid('DSP'), trade: t.id, pair: t.sell + '-' + t.recv, amount: t.amount, cur: t.sell, vendor: body.vendor, proof: t.proof, rate: t.rate, method: body.method, chat: t.chat.map((m) => m.text).join('\n'), state: 'OPEN', at: now() };
          await pool.query('insert into disputes(id,data) values($1,$2)', [d.id, d]);
        }
        await pool.query('update trades set data=$1 where id=$2', [t, t.id]);
        await audit(`Trade ${t.id} → ${t.state}`);
        const pair = `${t.sell}→${t.recv}`;
        if (t.state === 'completed') await tradeEmail(t, `Receipt ${t.id} — your ${pair} trade is complete`, `You sent ${t.amount} ${t.sell}. Protection honoured. Ref ${t.id}.`);
        if (t.state === 'disputed') await tradeEmail(t, `Your ${pair} trade is under review`, `Trade ${t.id} is paused. Usually resolved within 24 hours.`);
        if (t.state === 'cancelled') await tradeEmail(t, `Trade ${t.id} cancelled`, 'Cancelled before payment. Nothing left your account.');
        return { ok: true, trade: t };
      }));
    }
    if (route === 'GET disputes') {
      const r = await pool.query('select data from disputes order by data->>\'at\' desc');
      return ok({ ok: true, disputes: r.rows.map((x) => x.data) });
    }
    if (route === 'POST resolve') {
      return ok(await withIdem(key, async () => {
        const r = await pool.query('select data from disputes where id=$1', [body.id]);
        const d = r.rows[0] && r.rows[0].data;
        if (!d) return { ok: false, error: 'Case not found.' };
        if (d.state !== 'OPEN') return { ok: false, error: 'Already resolved.' };
        const cfg = await kv('config', { thresh: 500000 });
        if (Number(d.amount) > Number(cfg.thresh || 500000) && !body.second_approval)
          return { ok: false, error: 'Large amount — second approval required.', need_second: true };
        d.state = 'RESOLVED-' + body.how; d.resolved_at = now();
        await pool.query('update disputes set data=$1 where id=$2', [d, d.id]);
        const tr = await pool.query('select data from trades where id=$1', [d.trade]);
        const t = tr.rows[0] && tr.rows[0].data;
        if (t) {
          t.state = 'resolved';
          await pool.query('update trades set data=$1 where id=$2', [t, t.id]);
          const bond = await kv('bond', { reserved: {} });
          bond.reserved = bond.reserved || {};
          bond.reserved[t.offer_id] = Math.max(0, Number(bond.reserved[t.offer_id] || 0) - Number(t.amount));
          await kvSet('bond', bond);
          const forfeit = body.how === 'VENDOR-AT-FAULT';
          await pool.query('insert into ledger(id,kind,trade,amount,ccy) values($1,$2,$3,$4,$5)', [uid('evt').toLowerCase(), forfeit ? 'forfeit' : 'release', t.id, forfeit ? 0 : t.amount, t.provide]);
          await tradeEmail(t, `Review complete — trade ${t.id}`, forfeit ? "Decided in your favour. Compensation comes from the vendor's bond." : `Decided: ${body.how}. Details in your Trex history.`);
        }
        await audit(`Dispute ${d.id} resolved ${body.how}`);
        return { ok: true, dispute: d };
      }));
    }
    if (route === 'GET bond') return ok({ ok: true, bond: await kv('bond', {}) });
    if (route === 'POST bond') {
      return ok(await withIdem(key, async () => {
        const bond = await kv('bond', { caps: {}, reserved: {} });
        const op = String(body.op), ccy = String(body.ccy), amt = Number(body.amount);
        bond.caps = bond.caps || {}; bond.reserved = bond.reserved || {};
        if (op === 'topup') {
          if (!(amt > 0)) return { ok: false, error: 'Amount must be above zero.' };
          bond.caps[ccy] = Number(bond.caps[ccy] || 0) + amt;
          await pool.query('insert into ledger(id,kind,trade,amount,ccy) values($1,$2,$3,$4,$5)', [uid('evt').toLowerCase(), 'topup', null, amt, ccy]);
        } else if (op === 'release') {
          const busy = Object.values(bond.reserved).some((v) => Number(v) > 0);
          if (busy) return { ok: false, error: 'Withdrawals need zero open trades.' };
          const free = Number(bond.caps[ccy] || 0);
          if (!(amt > 0) || amt > free) return { ok: false, error: 'That exceeds your free balance.' };
          if (amt > 5000 && !body.second_approval) return { ok: false, error: 'Large amount — second approval required.', need_second: true };
          bond.caps[ccy] = free - amt;
          await pool.query('insert into ledger(id,kind,trade,amount,ccy) values($1,$2,$3,$4,$5)', [uid('evt').toLowerCase(), 'release', null, amt, ccy]);
        } else if (op === 'switch') {
          return { ok: false, error: 'Trex uses one bond model: 50% per trade. Nothing to switch.' };
        } else return { ok: false, error: 'Unknown bond operation.' };
        await kvSet('bond', bond);
        await audit(`Bond ${op} ${amt} ${ccy}`);
        return { ok: true, bond };
      }));
    }
    if (route === 'GET config') return ok({ ok: true, config: await kv('config', {}) });
    if (route === 'POST config') {
      const cfg = await kv('config', {});
      ['fee_pct', 'confirm_mins', 'grace_hours', 'thresh', 'disabled', 'pausedPairs'].forEach((k) => { if (body[k] !== undefined) cfg[k] = body[k]; });
      await kvSet('config', cfg);
      await audit('Settings updated');
      return ok({ ok: true, config: cfg });
    }
    if (route === 'GET ledger') {
      const r = await pool.query('select kind,trade,amount,ccy,at from ledger order by at desc limit 200');
      return ok({ ok: true, ledger: r.rows });
    }
    if (route === 'GET ratings') {
      const r = await pool.query('select data from ratings order by data->>\'at\' desc limit 100');
      return ok({ ok: true, ratings: r.rows.map((x) => x.data) });
    }
    if (route === 'POST ratings') {
      const rec = { trade: body.trade, rating: body.rating, at: now() };
      await pool.query('insert into ratings(id,data) values($1,$2)', [uid('RTG'), rec]);
      return ok({ ok: true });
    }
    if (route === 'GET tickets') {
      const r = await pool.query('select data from tickets order by data->>\'at\' desc limit 100');
      return ok({ ok: true, tickets: r.rows.map((x) => x.data) });
    }
    if (route === 'POST tickets') {
      if (!String(body.title || '').trim()) return err('Describe the issue first.');
      const t = { id: uid('TCK'), cat: body.cat || 'General', title: body.title, at: now() };
      await pool.query('insert into tickets(id,data) values($1,$2)', [t.id, t]);
      await audit('Ticket opened');
      return ok({ ok: true });
    }
    if (route === 'GET audit') {
      const r = await pool.query('select at,event from audit order by at desc limit 100');
      return ok({ ok: true, audit: r.rows.map((x) => `${x.at.toISOString()} ${x.event}`) });
    }
    return err('Unknown endpoint.', 404);
  } catch (e) {
    console.error('api error', e);
    return err('Server error — please retry.', 500);
  }
};
