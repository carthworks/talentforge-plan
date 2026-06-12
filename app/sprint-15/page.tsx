'use client';

import { useState } from 'react';

const AC = '#378ADD';

const TABS = [
  { id: 'adr', label: 'Architecture decisions', icon: 'ti-git-branch' },
  { id: 'risk', label: 'Risk register', icon: 'ti-alert-triangle' },
  { id: 'plan', label: 'Day-by-day plan', icon: 'ti-calendar' },
  { id: 'dod', label: 'Definition of done', icon: 'ti-circle-check' },
];

const PI: Record<string, { lbl: string; bg: string; tc: string; bc: string }> = {
  H: { lbl: 'High', bg: 'rgba(216,90,48,0.12)', tc: '#E08050', bc: '#D85A30' },
  M: { lbl: 'Med', bg: 'rgba(186,117,23,0.12)', tc: '#D4A040', bc: '#BA7517' },
  L: { lbl: 'Low', bg: 'rgba(59,109,17,0.12)', tc: '#7BBF44', bc: '#639922' },
};

const ADR = [
  { title: 'Contract upgrade: deploy v2 over UUPS proxy', rec: 'Deploy v2, dual-contract verify', why: 'Sprint 7 deployed a plain ERC-721 with no proxy. You cannot upgrade an immutable contract. Deploy v2 with all Sprint 15 features, keep v1 live and read-only, verification layer checks both by version prefix.', opts: [{ n: 'Deploy v2 + dual-contract verify', p: 'Zero migration risk. v1 stays valid. v2 gets all features.', c: 'Verification API must know which contract to query. Solved by version prefix.' }, { n: 'UUPS proxy upgrade of v1', p: 'Single contract address forever.', c: 'Requires v1 deployed with UUPS from start. It wasn\'t. Not viable.' }, { n: 'Abandon v1, reissue all on v2', p: 'Clean single contract state.', c: 'Impossible — NFT ownership is immutable. Students lose credentials.' }], action: 'Deploy TalentForgeCredentialV2.sol with UUPS proxy. Encode version in credential ID: tfv1-{tokenId} vs tfv2-{tokenId}.' },
  { title: 'Blockchain indexing: The Graph over direct RPC', rec: 'The Graph subgraph', why: 'Marketplace needs multi-filter queries like "all ECE credentials from VIT with tier ≥ Practitioner". Cannot be answered with direct RPC — need indexed GraphQL API.', opts: [{ n: 'The Graph subgraph', p: 'GraphQL API, <50ms queries, free for Polygon, native filters', c: '1–3 block indexing lag (~10s). Acceptable for batch workflows.' }, { n: 'Direct Polygon RPC', p: 'Real-time, no third-party dependency.', c: 'eth_getLogs rate-limited. 25K tokens full scan takes 10–30s.' }, { n: 'Mirror to PostgreSQL', p: 'Full SQL query power, sub-10ms queries.', c: 'Must maintain event listener, handle reorgs. Significant ops overhead.' }], action: 'Deploy subgraph for both v1 and v2 contracts. Use direct RPC only for real-time single-token verification.' },
  { title: 'IPFS gateway: Pinata dedicated gateway', rec: 'Pinata dedicated gateway', why: 'Every credential share page loads the certificate PDF from IPFS. Cloudflare public gateway has no SLA. Pinata dedicated (₹3,500/month) gives 99.9% SLA.', opts: [{ n: 'Pinata dedicated + custom domain', p: '99.9% SLA, no rate limits, custom subdomain, redundant pinning', c: '₹3,500/month. Non-negotiable for credential platform.' }, { n: 'Cloudflare public IPFS', p: 'Free, fast edge network.', c: 'No SLA. Rate limited. Has terminated free access before.' }, { n: 'Self-hosted IPFS on GKE', p: 'Full control, no third-party.', c: 'Operational overhead. If node goes down, all credentials unreachable.' }], action: 'Pinata primary, Cloudflare fallback. All fetches go to ipfs.talentforge.in/{cid}.' },
  { title: 'Revocation: soft flag over token burn', rec: 'On-chain soft revocation mapping', why: 'Hard burn destroys the token permanently. Soft revocation marks invalid while keeping the token on-chain — more trustworthy.', opts: [{ n: 'On-chain soft revocation', p: 'Token survives, history preserved. Revocation is auditable.', c: 'Revoked credentials still appear in searches unless filtered.' }, { n: 'Token burn (hard)', p: 'Clean — token no longer exists.', c: 'Student loses proof-of-work history permanently. Cannot undo.' }, { n: 'Centralised revocation list', p: 'No gas cost, instant revocation.', c: 'Defeats purpose of blockchain verification. Undermines trustlessness.' }], action: 'Add revoked mapping and revokeCredential(tokenId, reason) to v2. Redis cache TTL for revoked = 30 seconds.' },
  { title: 'Public share page: Next.js micro-app', rec: 'Next.js edge-rendered', why: 'LinkedIn crawlers see empty HTML shell from React SPAs — no OG tags for previews. SSR via Next.js renders real credential data server-side.', opts: [{ n: 'Next.js micro-app at credentials.talentforge.in', p: 'SSR OG tags, standalone deployment, CDN cacheable.', c: 'Another service to deploy. Worth it — primary trust surface.' }, { n: 'Express.js SSR on API', p: 'One less service.', c: 'Mixes rendering into API layer. Harder to CDN-cache.' }, { n: 'Pre-rendered static pages', p: 'Zero server cost, instant load.', c: 'User-generated content. Static generation not possible.' }], action: 'Deploy Next.js 14 at credentials.talentforge.in. generateMetadata() fetches from The Graph. CDN cache with s-maxage=3600.' },
];

const RISKS = [
  { name: 'v2 UUPS proxy introduces reentrancy or access control bug', area: 'Smart contract', prob: 'M', impact: 'H', mit: 'Use OpenZeppelin UUPS verbatim. 3-day Certik/Hacken audit. Test on Mumbai 7 days. Multi-sig (3-of-5 Gnosis Safe). Slither in CI.', signals: 'Slither reports reentrancy/access-control warnings' },
  { name: 'The Graph indexing lag causes stale revocation data', area: 'Indexing', prob: 'M', impact: 'H', mit: 'Bypass The Graph for employer verification — use direct RPC. Dual-source: The Graph for gallery, direct RPC for point-in-time verification.', signals: 'The Graph lags latest block by >10 blocks' },
  { name: 'IPFS metadata schema error is permanent', area: 'Blockchain', prob: 'L', impact: 'H', mit: 'Lock metadata schema before Day 1. JSON schema validation in CI. Test 10 mints on testnet. Inspect each IPFS CID via Pinata.', signals: 'JSON schema validation test fails in CI' },
  { name: 'Polygon RPC rate limits under bulk verification', area: 'Performance', prob: 'M', impact: 'M', mit: 'Use Alchemy/QuickNode (not public endpoint). Redis verification cache: valid=5min, revoked=30s. Request deduplication.', signals: 'Alchemy >60% compute unit consumption in first week' },
  { name: 'LinkedIn deep-link URL format changes', area: 'Integration', prob: 'L', impact: 'M', mit: 'Abstract URL builder into single function with feature flag. Weekly E2E test. Fallback: "Copy details" button.', signals: 'Weekly E2E test reports non-200 from LinkedIn' },
];

const DAYS = [
  { range: 'Days 1–2', focus: 'Contract v2 + The Graph subgraph', team: 'BC × 2', color: AC, tasks: ['Write TalentForgeCredentialV2.sol with UUPS proxy + revoked mapping', 'Add credentialVersion field to mint metadata', 'Deploy v2 to Mumbai testnet; run Slither — zero high/medium findings', 'Write The Graph subgraph schema: Credential entity. Deploy for v1 + v2', 'Test 20 mints on testnet; confirm in The Graph within 3 blocks', 'Deploy v2 to Polygon mainnet; update batch minting cron'], dod: 'v2 live on mainnet; The Graph syncing both contracts; Slither clean' },
  { range: 'Days 3–4', focus: 'Credential marketplace UI', team: 'FE × 2', color: AC, tasks: ['Gallery page: grid of credential cards, filterable by domain, tier, institution', 'Credential card component: domain icon, tier badge, institution, blockchain link', 'Search + filter panel: multi-select, autocomplete, date range', 'Infinite scroll pagination: 24 cards/page, skeleton loading', 'Employer "My candidates" credential roster view', 'All queries default to { revoked: false } filter'], dod: 'Gallery loads in <1.5s; filters work correctly; revoked absent from default' },
  { range: 'Days 5–6', focus: 'Verification portal + QR scanner', team: 'FE + BC', color: AC, tasks: ['Paste credential ID or scan QR → direct Polygon RPC → pass/fail', 'QR code generation: qrcode.react, downloadable PNG', 'Mobile QR scanner: jsQR in-browser camera scanning', 'Verification result card: status, token ID, owner, mint date, Polygonscan link', 'Batch verification: up to 50 IDs, parallel RPC (max 10 concurrent)', 'Redis verification cache: valid=5min, revoked=30s, deduplication'], dod: 'Single verify <2s; QR works on Chrome mobile; batch 50 in <15s' },
  { range: 'Days 7–8', focus: 'Public share page — Next.js SSR', team: 'FE + BC', color: '#7F77DD', tasks: ['Next.js 14 App Router at credentials.talentforge.in', 'generateMetadata(): fetch from The Graph → OG tags for social preview', 'Certificate preview image: 1200×630 PNG via @vercel/og', 'Page body: credential detail + real-time verification widget', 'Pinata IPFS certificate embed: react-pdf with download fallback', 'Cloudflare CDN: s-maxage=3600, revocation triggers cache purge'], dod: 'LinkedIn preview correct; page loads <1.5s; PDF renders; revocation shows in 60s' },
  { range: 'Days 9–10', focus: 'LinkedIn + analytics + E2E', team: 'FE + BC + QA', color: '#1D9E75', tasks: ['LinkedIn "Add to Profile" deep-link builder with feature flag', 'LinkedIn E2E test: weekly Playwright test for deep-link validation', 'Employer credential analytics: domain pie, tier distribution', 'Student analytics: view count, verifier categories', 'E2E suite: mint → marketplace → verify → share → revoke → cache purge', 'Load test: 500 concurrent verifications, p99 <2s'], dod: 'LinkedIn confirmed; E2E green; load test p99 <2s; analytics live' },
];

const DOD = [
  { cat: 'Smart contract', icon: 'ti-file-code', c: AC, checks: ['v2 deployed to Polygon mainnet with UUPS proxy', 'Slither: zero high/medium findings', 'revokeCredential() tested: mapping updates, event emitted', 'isValid() returns false for revoked and non-existent tokens', 'All new mints go to v2; v1 still verifiable via dual-contract lookup', '3-of-5 Gnosis Safe multi-sig is sole upgrade owner'] },
  { cat: 'The Graph indexing', icon: 'ti-database', c: AC, checks: ['Subgraph synced for both v1 and v2 from genesis block', 'All Credential entity fields populated correctly', 'New mint appears within 3 confirmed blocks (~15s)', 'Revocation updates revoked=true within 3 blocks', 'Sync lag monitored; alert fires if lag >10 blocks'] },
  { cat: 'Verification API + caching', icon: 'ti-shield-check', c: AC, checks: ['Single credential: direct RPC, p99 <2s under 500 concurrent', 'Batch 50 credentials: p99 <15s', 'Redis cache: valid=5min, revoked=30s, deduplication working', 'Revocation invalidates Redis within 5s of event', 'Response includes: isValid, isRevoked, revokedAt, reason, owner, mintedAt'] },
  { cat: 'Frontend + share page', icon: 'ti-world', c: '#7F77DD', checks: ['Marketplace gallery loads in <1.5s with correct filters', 'Public share page returns correct OG tags (tested via opengraph.xyz)', 'LinkedIn preview shows credential title + thumbnail on mobile and desktop', 'QR scanner works in Chrome mobile (Android + iOS)', 'Certificate PDF renders via react-pdf; Pinata → Cloudflare fallback works', 'Revoked credential shows badge within 60s of on-chain event'] },
  { cat: 'Analytics + integration', icon: 'ti-chart-bar', c: '#1D9E75', checks: ['Employer dashboard: domain pie, tier distribution, verification count', 'Student view count + verifier categories displayed', 'LinkedIn deep-link confirmed on iOS Chrome, Android Chrome, LinkedIn app', 'Weekly E2E Playwright test scheduled and passing', 'Zero P0 bugs open'] },
];

export default function Sprint15Page() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main className="page">
      <div className="page-header">
        <div className="page-tag" style={{ background: 'rgba(55,138,221,0.12)', color: AC, border: `0.5px solid rgba(55,138,221,0.2)` }}>Sprint 15 · W33–36 · Month 10</div>
        <h1 className="page-title">NFT Credential Marketplace</h1>
        <p className="page-subtitle">Architecture decisions, risk register, and execution plan for the credential marketplace, employer verification portal, and public share pages.</p>
      </div>

      <div className="kpi-row">
        {[{ l: 'Sprint', v: '15 of 26' }, { l: 'Window', v: 'W33–34' }, { l: 'Teams', v: 'BC + FE' }, { l: 'Hardest part', v: 'Contract v2' }].map((k) => (
          <div className="mcard" key={k.l}><p className="mcard-label">{k.l}</p><p className="mcard-value" style={k.l === 'Hardest part' ? { color: AC, fontSize: 16 } : {}}>{k.v}</p></div>
        ))}
      </div>

      <div style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '10px 14px', marginBottom: 14, border: '0.5px solid var(--color-border-tertiary)' }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Context:</strong> Sprint 7 delivered a basic ERC-721 contract with mint, verify, and batch minting via Polygon PoS. ~25,000 credentials minted. Sprint 15 adds the full marketplace UI, employer verification, revocation, and share pages — without breaking any existing credential.
        </p>
      </div>

      <div className="phase-tabs">
        {TABS.map((t, i) => (
          <button key={t.id} className={`ptb${i === activeTab ? ' active' : ''}`} style={i === activeTab ? { borderColor: AC, color: AC, background: 'rgba(55,138,221,0.08)', fontWeight: 500 } : {}} onClick={() => setActiveTab(i)}>
            <i className={`ti ${t.icon}`} style={{ fontSize: 13, marginRight: 5, verticalAlign: -1 }} aria-hidden="true" />{t.label}
          </button>
        ))}
      </div>

      {activeTab === 0 && ADR.map((a) => (
        <div className="adr-card" key={a.title} style={{ borderLeft: `3px solid ${AC}`, borderRadius: `0 var(--border-radius-lg) var(--border-radius-lg) 0` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
            <div>
              <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{a.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{a.why}</p>
            </div>
            <span className="pill" style={{ borderColor: AC, color: AC, flexShrink: 0, marginTop: 2 }}>{a.rec}</span>
          </div>
          <div className="adr-options">
            {a.opts.map((o) => (
              <div className="adr-option" key={o.n}>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>{o.n}</p>
                <p style={{ margin: '0 0 3px', fontSize: 11, color: 'var(--color-text-secondary)' }}><i className="ti ti-check" style={{ fontSize: 11, color: '#1D9E75' }} aria-hidden="true" /> {o.p}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-tertiary)' }}><i className="ti ti-x" style={{ fontSize: 11, color: '#D85A30' }} aria-hidden="true" /> {o.c}</p>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: 8, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <i className="ti ti-bolt" style={{ fontSize: 13, color: AC, flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>{a.action}</p>
          </div>
        </div>
      ))}

      {activeTab === 1 && RISKS.map((r) => (
        <div className="adr-card" key={r.name}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
            <div>
              <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{r.name}</p>
              <span className="tag">{r.area}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {[{ label: 'Likelihood', key: r.prob }, { label: 'Impact', key: r.impact }].map((x) => (
                <div key={x.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 3 }}>{x.label}</div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: PI[x.key].bg, color: PI[x.key].tc, border: `0.5px solid ${PI[x.key].bc}` }}>{PI[x.key].lbl}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <i className="ti ti-shield-check" style={{ fontSize: 13, color: AC, flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            <div>
              <p style={{ margin: '0 0 3px', fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Mitigation</p>
              <p style={{ margin: '0 0 5px', fontSize: 12, color: 'var(--color-text-secondary)' }}>{r.mit}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-tertiary)' }}><i className="ti ti-radar" style={{ fontSize: 11 }} aria-hidden="true" /> Early signal: {r.signals}</p>
            </div>
          </div>
        </div>
      ))}

      {activeTab === 2 && (<>
        <div className="adr-card" style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Sprint pre-condition checklist</p>
          {['Sprint 7 v1 contract address and ABI confirmed', 'Pinata paid-tier active; ipfs.talentforge.in CNAME resolving', 'Alchemy Polygon mainnet API key provisioned', 'The Graph Hosted Service account created', 'credentials.talentforge.in pointed to Cloud Run', 'Gnosis Safe multi-sig wallet created (3-of-5 signers)'].map((c, i) => (
            <div className="row" key={i}>
              <i className="ti ti-checkbox" style={{ fontSize: 13, color: AC, flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
              <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{c}</span>
            </div>
          ))}
        </div>
        {DAYS.map((d) => (
          <div className="day-card" key={d.range}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 3, height: 36, background: d.color, borderRadius: 2, flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{d.range} — {d.focus}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>{d.team}</p>
              </div>
            </div>
            {d.tasks.map((t, i) => (
              <div className="row" key={i}>
                <i className="ti ti-arrow-right" style={{ fontSize: 13, color: d.color, flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{t}</span>
              </div>
            ))}
            <div className="day-dod">
              <i className="ti ti-circle-check" style={{ fontSize: 13, color: d.color, flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>{d.dod}</p>
            </div>
          </div>
        ))}
      </>)}

      {activeTab === 3 && (<>
        <div className="adr-card" style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Sprint 15 complete when every item below is checked</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>No partial credit. Every item is a pass/fail gate. Do not ship with an open DoD item on a blockchain surface.</p>
        </div>
        {DOD.map((s) => (
          <div className="adr-card" key={s.cat}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 12, marginRight: 5 }} aria-hidden="true" />{s.cat}
            </p>
            {s.checks.map((c, i) => (
              <div className="row" key={i}>
                <div className="dod-check" style={{ borderColor: s.c }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true"><path d="M1.5 4.5l2 2L7.5 2" fill="none" stroke={s.c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{c}</span>
              </div>
            ))}
          </div>
        ))}
      </>)}
    </main>
  );
}
