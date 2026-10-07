import { api, type Offer } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let offers: Offer[] = [];
  try {
    const r = await api.get<Offer[] | { ok: boolean; offers: Offer[] }>('/offers');
    offers = Array.isArray(r) ? r : r.offers ?? [];
  } catch {
    offers = [];
  }
  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: 16 }}>
      <h1>Trex markets</h1>
      {offers.length === 0 && <p>No offers right now — check back soon.</p>}
      {offers.map((o) => (
        <article key={o.id} style={{ background: '#fff', borderRadius: 12, padding: 16, margin: '12px 0' }}>
          <strong>
            {o.provide} → {o.want}
          </strong>
          <p>
            {o.tier} • capacity {o.capacityMinor} {o.provide}
          </p>
        </article>
      ))}
    </main>
  );
}
