'use client';

import { useState } from 'react';

const C = '#1D9E75';

const TABS = [
  { id: 'adr', label: 'Architecture decisions', icon: 'ti-git-branch' },
  { id: 'risk', label: 'Risk register', icon: 'ti-alert-triangle' },
  { id: 'plan', label: 'Day-by-day plan', icon: 'ti-calendar' },
  { id: 'dod', label: 'Definition of done', icon: 'ti-circle-check' },
];

const ADR = [
  { title: 'GCP over AWS or Azure', rec: 'GCP', why: 'GKE is the gold standard for Kubernetes ops. Vertex AI and GCP\'s India CDN presence (Mumbai, Delhi PoPs) give Tier 2/3 latency advantage.', opts: [{ n: 'GCP', p: 'Best-in-class GKE, Vertex AI, India CDN, competitive committed-use discounts', c: 'Smaller Indian DevOps talent pool vs AWS' }, { n: 'AWS', p: 'Largest talent pool, most tutorials, EKS mature', c: 'ECS/EKS DX rougher; AI/ML infra less cohesive' }, { n: 'Azure', p: 'Strong enterprise sales channel, OpenAI partnership', c: 'GKE equivalent (AKS) less mature; India latency worse' }], action: 'Set up GCP org, enable billing, reserve committed-use credits (1-year CUD on n2 VMs for ~30% saving).' },
  { title: 'Monorepo structure', rec: 'pnpm + Turborepo', why: 'Shared TypeScript types between Node API and React frontend catch contract bugs at compile time. Turborepo remote caching cuts CI build time to <2 min on cache hit.', opts: [{ n: 'pnpm + Turborepo', p: 'Remote caching, parallel task graph, shared types', c: 'Steeper initial setup; team needs workspace conventions' }, { n: 'Nx', p: 'More powerful for large orgs; plugin ecosystem', c: 'Overkill at 22 FTEs; opinionated file structure' }, { n: 'Polyrepo', p: 'Maximum team independence, simpler per-service CI', c: 'API contract drift, duplicate dependencies' }], action: 'Bootstrap: packages/api (Node.js), packages/ai-service (FastAPI), apps/web (React 18 + Vite), apps/mobile (React Native 0.73).' },
  { title: 'Auth: JWT + refresh token rotation', rec: 'JWT + Redis blocklist', why: 'Stateless JWTs work well for microservices. Refresh token rotation gives near-session-like revocation without overhead.', opts: [{ n: 'JWT + Redis blocklist', p: 'Stateless verify, revocation via Redis, mobile-friendly', c: 'Redis dependency; slightly larger tokens' }, { n: 'Server-side sessions', p: 'Instant revocation, simple to reason about', c: 'Session store bottleneck at scale' }, { n: 'Auth0 / Clerk', p: 'Zero implementation effort, managed MFA', c: '₹3–8L/year at scale; vendor lock-in' }], action: 'Access token TTL = 15 min. Refresh token TTL = 30 days, HttpOnly cookie. Redis blocklist. MSG91 for OTP (₹0.09/SMS).' },
  { title: 'Database split: PostgreSQL + MongoDB', rec: 'Both — different data shapes', why: 'Structured entities need ACID transactions → PostgreSQL. Semi-structured behavioral logs → MongoDB. Don\'t fight the data shape.', opts: [{ n: 'PostgreSQL + MongoDB', p: 'Each DB optimised for its data shape', c: 'Two engines to operate' }, { n: 'PostgreSQL only', p: 'One DB, excellent JSONB', c: 'JSONB queries slow past 10M rows' }, { n: 'MongoDB only', p: 'Flexible schema everywhere', c: 'No joins = application-level joins = bugs' }], action: 'PostgreSQL on Cloud SQL + PgBouncer. MongoDB Atlas M10 in Mumbai.' },
  { title: 'Kubernetes from day 1', rec: 'GKE Autopilot', why: 'Placement season creates 10–30× traffic spikes. HPA on GKE handles this without thinking. Autopilot = Google manages nodes.', opts: [{ n: 'GKE Autopilot', p: 'Managed nodes, auto-scaling, pay per pod', c: 'Less control; not ideal for GPU (use Standard for CIE later)' }, { n: 'GKE Standard', p: 'Full control, GPU node pools', c: 'More ops burden for 1-person DevOps' }, { n: 'Cloud Run', p: 'True serverless, zero infra ops', c: 'Cold starts hurt exam UX; no WebSocket' }], action: 'GKE Autopilot for Sprint 1. Migrate CIE to GKE Standard GPU pool in Sprint 11.' },
];

const RISKS = [
  { name: 'GKE complexity overwhelms 1-person DevOps', area: 'Infrastructure', prob: 'H', impact: 'M', mit: 'Use GKE Autopilot. All infra via Terraform + Helm. Pair DevOps with backend for Sprint 1. Fallback: Cloud Run for stateless services.', signals: 'Sprint 1 CI/CD not green by Day 5' },
  { name: 'MSG91 OTP rate limits during batch onboarding', area: 'Auth', prob: 'M', impact: 'H', mit: 'Own rate limit (5 OTPs/phone/hour). Twilio failover. Pre-warm batch sends off-peak.', signals: 'OTP delivery P99 >5s during college batch test' },
  { name: 'IAM misconfiguration leaks data', area: 'Security', prob: 'M', impact: 'H', mit: 'Least privilege via Terraform. Run IAM Recommender Week 1. All secrets in Secret Manager. gitleaks pre-commit hook.', signals: 'IAM Recommender flags >10 excess permissions' },
  { name: 'Monorepo CI build time degrades', area: 'Developer XP', prob: 'M', impact: 'L', mit: 'Turborepo remote cache. Target >80% hit rate. Only build affected packages per PR.', signals: 'PR CI time >10 min by Sprint 3' },
  { name: 'PostgreSQL connection pool exhaustion', area: 'Database', prob: 'L', impact: 'H', mit: 'PgBouncer in transaction mode from day 1 (20 server connections serving 500 client connections).', signals: 'pg_stat_activity shows >80% connections active' },
];

const DAYS = [
  { range: 'Days 1–2', focus: 'GCP foundation', team: 'DevOps + 1 BE', color: '#1D9E75', tasks: ['Create GCP org, billing, project (tf-prod, tf-staging, tf-dev)', 'Enable APIs: GKE, Cloud SQL, Memorystore, Secret Manager, Cloud Armor, Artifact Registry', 'Terraform: VPC, private subnets, Cloud NAT, firewall rules', 'GKE Autopilot cluster in asia-south1 with Workload Identity', 'Cloud Armor WAF: OWASP CRS, rate limit 100 req/min/IP', 'Artifact Registry: Docker repos for each service'], dod: 'terraform apply zero drift; GKE cluster reachable via kubectl from CI' },
  { range: 'Days 3–4', focus: 'Monorepo + databases', team: 'BE × 2 + DevOps', color: '#1D9E75', tasks: ['pnpm workspace + Turborepo pipeline config', 'Scaffold packages: api, ai-service, apps/web, apps/mobile', 'Shared tsconfig, ESLint, shared types package', 'Cloud SQL PostgreSQL 15 + PgBouncer sidecar', 'MongoDB Atlas M10 in Mumbai', 'Memorystore Redis 7 (1GB, single zone)'], dod: 'All services boot locally; DB connections from dev machine confirmed' },
  { range: 'Days 5–6', focus: 'Auth service', team: 'BE × 2', color: '#7F77DD', tasks: ['POST /auth/otp/send (MSG91, 6-digit, 5-min TTL in Redis)', 'POST /auth/otp/verify → JWT (15-min) + refresh token (30-day)', 'Refresh token rotation: new refresh + old to Redis blocklist', 'RBAC middleware: STUDENT, EMPLOYER, COLLEGE_ADMIN, SUPER_ADMIN', 'Rate limiting: 5 OTP/phone/hour, Twilio failover', 'Auth unit tests: 100% coverage on auth module'], dod: 'Full auth flow tested end-to-end: OTP → tokens → rotation → role guard' },
  { range: 'Days 7–8', focus: 'Elasticsearch + Razorpay', team: 'BE + AI/ML', color: '#7F77DD', tasks: ['Elasticsearch 8.x on GKE: 3-node cluster', 'Student profile mapping: user_id, domain, tfes_score, tier', 'Indexing pipeline: Kafka consumer → ES on registration event', 'Search API: GET /talent/search with domain, tier, TFES filters', 'Razorpay sandbox setup: test keys, payment order endpoint', 'Webhook endpoint: /webhooks/razorpay with HMAC validation'], dod: 'ES query returns ranked candidates in <200ms; Razorpay webhook fires' },
  { range: 'Days 9–10', focus: 'CI/CD + staging deploy', team: 'DevOps + QA + All', color: '#378ADD', tasks: ['GitHub Actions: PR workflow (lint → type-check → test)', 'Production deploy: manual trigger + reviewer approval + Slack alert', 'Helm charts: Deployment, Service, HPA, PDB, ConfigMap, SecretProviderClass', 'Staging smoke tests: auth, ES, Razorpay, DB read/write', 'Load test auth: k6, 100 VUs, 60s, p99 <300ms', 'OpenAPI spec published at /docs'], dod: 'CI green; staging deploys in <7 min; smoke tests pass; p99 <300ms' },
];

const DOD = [
  { cat: 'Infrastructure', icon: 'ti-server', checks: ['GKE Autopilot running in asia-south1 with Workload Identity', 'All Terraform state in GCS with remote locking', 'VPC, subnets, Cloud NAT, Cloud Armor validated', 'Artifact Registry repos for all service images'] },
  { cat: 'Monorepo & services', icon: 'ti-code', checks: ['pnpm workspace with Turborepo: remote cache hit on build', 'All 4 services boot: api (3001), ai-service (8000), web (5173), mobile (Metro)', 'Shared TypeScript types package imported without errors', 'ESLint + Prettier on pre-commit; gitleaks blocks secrets'] },
  { cat: 'Databases', icon: 'ti-database', checks: ['Cloud SQL PostgreSQL via PgBouncer (pool 20/200)', 'MongoDB Atlas M10 connected from GKE pod', 'Memorystore Redis: PING → PONG from GKE', 'Init migrations run; rollback script tested'] },
  { cat: 'Auth service', icon: 'ti-lock', checks: ['OTP send + verify + JWT + refresh rotation: 100% pass', 'Twilio failover fires on MSG91 429', 'Role guard returns 403 for cross-role access', 'Access token 15min TTL enforced; blocklist works'] },
  { cat: 'CI/CD', icon: 'ti-settings-automation', checks: ['PR workflow: lint + type-check + test in <4 min', 'Merge-to-main deploys to staging in <7 min', 'Production requires CTO/Head of Eng approval', 'Staging smoke tests pass before merge gate opens'] },
  { cat: 'Performance', icon: 'ti-rocket', checks: ['Auth load test: 100 VUs, p99 <300ms, error <0.1%', 'ES search: p99 <200ms on 5K profiles', 'Zero P0 bugs open'] },
];

const PI: Record<string, { lbl: string; bg: string; tc: string; bc: string }> = {
  H: { lbl: 'High', bg: 'rgba(216,90,48,0.12)', tc: '#E08050', bc: '#D85A30' },
  M: { lbl: 'Med', bg: 'rgba(186,117,23,0.12)', tc: '#D4A040', bc: '#BA7517' },
  L: { lbl: 'Low', bg: 'rgba(59,109,17,0.12)', tc: '#7BBF44', bc: '#639922' },
};

export default function Sprint1Page() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main className="page">
      <div className="page-header">
        <div className="page-tag" style={{ background: 'rgba(29,158,117,0.12)', color: C, border: `0.5px solid rgba(29,158,117,0.2)` }}>Sprint 1 · W1–2 · Month 1</div>
        <h1 className="page-title">Infrastructure & Architecture</h1>
        <p className="page-subtitle">Architecture decisions, risk register, and day-by-day execution plan for TalentForge Sprint 1.</p>
      </div>

      <div className="phase-tabs">
        {TABS.map((t, i) => (
          <button key={t.id} className={`ptb${i === activeTab ? ' active' : ''}`} style={i === activeTab ? { borderColor: C, color: C, background: 'rgba(29,158,117,0.08)', fontWeight: 500 } : {}} onClick={() => setActiveTab(i)}>
            <i className={`ti ${t.icon}`} style={{ fontSize: 13, marginRight: 5, verticalAlign: -1 }} aria-hidden="true" />{t.label}
          </button>
        ))}
      </div>

      {/* ADR Tab */}
      {activeTab === 0 && ADR.map((a) => (
        <div className="adr-card" key={a.title}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
            <div>
              <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{a.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>{a.why}</p>
            </div>
            <span className="pill" style={{ borderColor: C, color: C, flexShrink: 0 }}>{a.rec}</span>
          </div>
          <div className="adr-options">
            {a.opts.map((o) => (
              <div className="adr-option" key={o.n}>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>{o.n}</p>
                <p style={{ margin: '0 0 3px', fontSize: 11, color: 'var(--color-text-secondary)' }}><i className="ti ti-check" style={{ fontSize: 11, color: C }} aria-hidden="true" /> {o.p}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-tertiary)' }}><i className="ti ti-x" style={{ fontSize: 11, color: '#D85A30' }} aria-hidden="true" /> {o.c}</p>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: 8, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <i className="ti ti-bolt" style={{ fontSize: 13, color: C, flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>{a.action}</p>
          </div>
        </div>
      ))}

      {/* Risk Tab */}
      {activeTab === 1 && RISKS.map((r) => (
        <div className="adr-card" key={r.name}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{r.name}</p>
              <span className="tag">{r.area}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 3 }}>Likelihood</div>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: PI[r.prob].bg, color: PI[r.prob].tc, border: `0.5px solid ${PI[r.prob].bc}` }}>{PI[r.prob].lbl}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 3 }}>Impact</div>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: PI[r.impact].bg, color: PI[r.impact].tc, border: `0.5px solid ${PI[r.impact].bc}` }}>{PI[r.impact].lbl}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <i className="ti ti-shield-check" style={{ fontSize: 13, color: C, flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            <div>
              <p style={{ margin: '0 0 3px', fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Mitigation</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>{r.mit}</p>
              <p style={{ margin: '5px 0 0', fontSize: 11, color: 'var(--color-text-tertiary)' }}><i className="ti ti-radar" style={{ fontSize: 11 }} aria-hidden="true" /> Early signal: {r.signals}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Plan Tab */}
      {activeTab === 2 && DAYS.map((d) => (
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

      {/* DoD Tab */}
      {activeTab === 3 && DOD.map((s) => (
        <div className="adr-card" key={s.cat}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            <i className={`ti ${s.icon}`} style={{ fontSize: 12, marginRight: 5 }} aria-hidden="true" />{s.cat}
          </p>
          {s.checks.map((c, i) => (
            <div className="row" key={i}>
              <div className="dod-check">
                <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><path d="M1 4l2 2L7 1.5" fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{c}</span>
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}
