'use client';

import Image from 'next/image';
import { useState } from 'react';

/* ─── Collapsible Section ──────────────────────────────── */
function Section({
  num,
  icon,
  title,
  titleExtra,
  defaultOpen = false,
  children,
}: {
  num: string;
  icon: string;
  title: string;
  titleExtra?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section">
      <div
        className="section-header"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); }
        }}
      >
        <span className="section-num">{num}</span>
        <i className={`ti ${icon} section-icon`} aria-hidden="true" />
        <h2 className="section-title">
          {title}
          {titleExtra}
        </h2>
        <i className={`ti ti-chevron-down chevron${open ? ' open' : ''}`} />
      </div>
      <div className={`section-body${open ? ' open' : ''}`}>
        <div className="section-body-inner">{children}</div>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main className="page">
      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-tag animate-in">Business Plan 2025–2030</div>
          <h1 className="animate-in animate-delay-1">
            <em>TalentForge</em> — Verified Skills,{' '}
            Real Work, Verified Outcomes
          </h1>
          <p className="hero-desc animate-in animate-delay-2">
            India&apos;s multi-disciplinary talent verification &amp; project
            marketplace. The only platform where employers get Aadhaar-linked,
            AI-scored, blockchain-certified engineers — across CS, Mechanical,
            ECE, and Civil — in under 10 minutes.
          </p>
          {/* <div className="hero-kpis animate-in animate-delay-3 hidden lg:block hide ">
            {[
              { label: 'Funding Ask', value: '₹25 Cr', note: 'Seed Round' },
              { label: 'Year 2 ARR', value: '₹246 Cr', note: '8 revenue streams' },
              { label: 'TAM', value: '8M', note: 'Graduates/year' },
              { label: 'Target Valuation', value: '₹280 Cr', note: 'Year 1 (8× ARR)' },
            ].map((k) => (
              <div className="kpi" key={k.label}>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">{k.value}</div>
                <div className="kpi-note">{k.note}</div>
              </div>
            ))}
          </div> */}
          <div className="hero-image animate-in animate-delay-4">
            <Image
              src="/student-journey.jpeg"
              alt="TalentForge Student Journey — Skill-First &amp; Adaptive Learning pathway from registration to job placement"
              width={1200}
              height={640}
              priority
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </div>
      </div>

      <h1 className="sr-only">
        TalentForge Business Plan — Comprehensive overview across 8 sections
      </h1>

      {/* ── SECTION 1: Problem & Opportunity ── */}
      <Section num="01" icon="ti-bulb" title="Problem & Opportunity" defaultOpen>
        <div className="two-col" style={{ marginBottom: '1rem' }}>
          <div className="card">
            <h3 className="card-title">
              <i className="ti ti-alert-circle" style={{ color: 'var(--tf-orange)' }} aria-hidden="true" />
              The Real Problem
            </h3>
            <ul>
              <li>65–80% of 8M graduates are unemployable due to zero verified real-world experience</li>
              <li>Employers waste 3–6 months and ₹3–8L per hire on wrong-fit candidates</li>
              <li>6.5M non-CS engineers (Mechanical, ECE, Civil) are completely ignored by existing platforms</li>
              <li>EdTechs teach but don&apos;t produce verifiable outcomes</li>
              <li>Internshala, Naukri have zero technical skill verification</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="card-title">
              <i className="ti ti-chart-bar" style={{ color: 'var(--tf-teal)' }} aria-hidden="true" />
              Market Breakdown
            </h3>
            {[
              { label: 'ECE / EEE', count: '3M / year', width: '37%', color: 'var(--tf-purple)' },
              { label: 'Mechanical', count: '2M / year', width: '25%', color: 'var(--tf-orange)' },
              { label: 'Computer Science', count: '1.5M / year', width: '19%', color: 'var(--tf-teal)' },
              { label: 'Civil + Others', count: '1.5M / year', width: '19%', color: 'var(--tf-amber)' },
            ].map((b) => (
              <div className="progress-bar-wrap" key={b.label}>
                <div className="pb-label"><span>{b.label}</span><span>{b.count}</span></div>
                <div className="pb-track">
                  <div className="pb-fill" style={{ width: b.width, background: b.color }} />
                </div>
              </div>
            ))}
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: 6 }}>
              Existing platforms address only the CS slice
            </div>
          </div>
        </div>
        <div className="summary-box">
          <strong>One-line pitch:</strong> TalentForge is the only platform where an employer can say
          &quot;show me a verified, Aadhaar-linked mechanical engineer who has completed 3 real FEA
          projects, scored 85+ on our assessment, and has a conscientiousness score in the top
          20%&quot; — and get a result in under 10 minutes.
        </div>
      </Section>

      {/* ── SECTION 2: Product ── */}
      <Section num="02" icon="ti-layers" title="Product — What We Actually Build" defaultOpen>
        <div className="what-missing">
          <div className="wm-title">
            <i className="ti ti-info-circle" aria-hidden="true" />
            Advisor note (what the original doc got right, simplified)
          </div>
          <div className="wm-desc">
            The original model has 5 strong pillars. Below is the simplified version — what we build,
            in plain language, in what order.
          </div>
        </div>
        <div className="three-col" style={{ marginBottom: '1rem' }}>
          {[
            {
              badge: 'Pillar 1', badgeClass: 'badge-orange', title: 'Verified Sandboxes',
              desc: 'Discipline-specific testing: code runs, CAD simulates, circuits are tested in LTSpice, structural loads validated. AI scores outputs — no human bias, no resume inflation.',
            },
            {
              badge: 'Pillar 2', badgeClass: 'badge-purple', title: 'Personality Matching',
              desc: '30-min OCEAN psychometric test. AI matches students to projects and roles. Employers get soft-skill reports. Reduces mis-hires by ~40%.',
            },
            {
              badge: 'Pillar 3', badgeClass: 'badge-teal', title: 'Gamified XP System',
              desc: '5 tiers (Trainee → Galaxy Explorer). Students earn real money (₹100–₹50K/project) while climbing tiers. Monthly college vs college "Clan Wars" drives virality.',
            },
          ].map((p) => (
            <div className="card" key={p.title}>
              <span className={`badge ${p.badgeClass}`}>{p.badge}</span>
              <h3 className="card-title">{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
        <div className="two-col">
          <div className="card">
            <span className="badge badge-amber">Pillar 4</span>
            <h3 className="card-title">Blockchain Credentials</h3>
            <p>
              Soulbound NFTs — non-transferable, Aadhaar-linked work history. One identity,
              tamper-proof. Employers pay ₹500/verification API call. Becomes the &quot;LinkedIn
              certificate&quot; India trusts.
            </p>
          </div>
          <div className="card">
            <span className="badge badge-blue">Pillar 5</span>
            <h3 className="card-title">Government SaaS</h3>
            <p>
              NSDC-certified, NSQF-mapped tiers. College white-label at ₹5–15L/year.
              Government-subsidized assessments at ₹500/student vs. ₹5,000 traditional. Gives us a
              regulatory moat from Day 1.
            </p>
          </div>
        </div>
        <div className="divider" />
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.6rem' }}>
          Build Order (critical — don&apos;t build everything at once)
        </div>
        {[
          { num: '1', label: 'Month 1–3', desc: 'Software sandbox only. Ship fast. Prove the verification engine works. Sign 3 design partners (employers).' },
          { num: '2', label: 'Month 4–6', desc: 'Add Mechanical sandbox + psychometric layer. First 10 paying colleges. Validate multi-discipline thesis.' },
          { num: '3', label: 'Month 7–12', desc: 'ECE/EEE sandbox, gamification (XP, leaderboards), blockchain credentials, NSDC partnership live.' },
          { num: '4', label: 'Month 13–24', desc: 'Civil sandbox, Cosmos Index public launch, Clan Wars, white-label SaaS at scale. Hit ₹12 Cr MRR.' },
        ].map((r) => (
          <div className="row-item" key={r.num}>
            <span className="row-icon"><i className={`ti ti-circle-${r.num}`} aria-hidden="true" /></span>
            <span className="row-label">{r.label}</span>
            <span className="row-desc">{r.desc}</span>
          </div>
        ))}
      </Section>

      {/* ── SECTION 3: Revenue ── */}
      <Section num="03" icon="ti-currency-rupee" title="Revenue Model — How We Make Money">
        <table className="fin-table" style={{ marginBottom: '1rem' }}>
          <thead>
            <tr><th>Stream</th><th>How it works</th><th>Year 1</th><th>Year 2</th><th>% of Rev</th></tr>
          </thead>
          <tbody>
            {[
              ['Employer Subscriptions', 'Pro ₹50K/mo, Enterprise ₹2.5L/mo', '₹16 Cr', '₹102 Cr', '45%'],
              ['Transaction Fees', '15–25% commission on project GMV', '₹9 Cr', '₹54 Cr', '25%'],
              ['College SaaS', '₹5–15L/year per institution', '₹7 Cr', '₹60 Cr', '20%'],
              ['Blockchain API', '₹500/verification + API licences', '₹2 Cr', '₹15 Cr', '5%'],
              ['Premium / Events', 'Cosmos Index Pro, Nova Challenges', '₹1 Cr', '₹15 Cr', '5%'],
            ].map(([stream, how, y1, y2, pct]) => (
              <tr key={stream}>
                <td>{stream}</td>
                <td className="soft">{how}</td>
                <td>{y1}</td>
                <td className="highlight">{y2}</td>
                <td>{pct}</td>
              </tr>
            ))}
            <tr>
              <td>Total ARR</td>
              <td></td>
              <td>₹35 Cr</td>
              <td style={{ color: 'var(--tf-teal)' }}>₹246 Cr</td>
              <td style={{ color: 'var(--color-text-tertiary)' }}>Breakeven Y1</td>
            </tr>
          </tbody>
        </table>
        <div className="summary-box">
          <strong>Key unit economics:</strong> CAC (employer) = ₹18,000 · LTV = ₹1,08,000 ·
          LTV:CAC = 6:1. College SaaS NRR = 125% (upsell from small → large tier). Gross margin =
          78% (simulation API costs are the main variable COGS — negotiated down by volume). Student
          CAC = ₹200 via college partnerships.
        </div>
      </Section>

      {/* ── SECTION 4: GTM ── */}
      <Section num="04" icon="ti-flag" title="Go-to-Market — How We Win the First 12 Months">
        <div className="timeline">
          {[
            {
              dot: 'var(--tf-orange)', phase: 'Month 1–3 · Foundation',
              title: '3 design-partner employers + 2 pilot colleges',
              desc: 'Cold-outreach 200 startups, sign 3 that need multi-discipline engineers at low cost. Partner with 2 Tier-2 engineering colleges. Run 500 free assessments. Goal: 1,000 active students, 50 completed projects, first ₹10L GMV.',
            },
            {
              dot: 'var(--tf-teal)', phase: 'Month 4–6 · Proof of concept',
              title: 'First paying college cohort + NSDC MOU signed',
              desc: 'Convert 10 colleges to paid SaaS (₹5L/year each = ₹50L ARR). Launch Orbit Tasks (₹100–500 micro-gigs). First Nova Challenge. Goal: 5,000 students, ₹1.5 Cr MRR.',
            },
            {
              dot: 'var(--tf-purple)', phase: 'Month 7–9 · Viral loop',
              title: 'Clan Wars launch + LinkedIn credential sharing',
              desc: 'College-vs-college pride — students recruit peers. NFT badges on LinkedIn drive employer inbound. Target 100 employers, 25,000 students. Goal: ₹4 Cr MRR.',
            },
            {
              dot: 'var(--tf-amber)', phase: 'Month 10–12 · Scale',
              title: '100 college licences, Series A ready',
              desc: 'Cosmos Index goes public. 75,000 students. 500 employers. ₹246 Cr ARR run rate visible in data room. Raise Series A at 8× ARR. Enter 5 new states.',
            },
          ].map((item, i) => (
            <div className="tl-item" key={i}>
              <div className="tl-dot" style={{ background: item.dot }} />
              <div className="tl-phase">{item.phase}</div>
              <div className="tl-title">{item.title}</div>
              <div className="tl-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SECTION 5: Team ── */}
      <Section
        num="05"
        icon="ti-users"
        title="Founding Team"
        titleExtra={
          <span className="inline-flag flag-critical" style={{ marginLeft: 6 }}>
            <i className="ti ti-alert-triangle" aria-hidden="true" /> Missing from original
          </span>
        }
      >
        <div className="what-missing" style={{ marginBottom: '1rem' }}>
          <div className="wm-title">
            <i className="ti ti-alert-triangle" aria-hidden="true" />
            Critical gap in the original document
          </div>
          <div className="wm-desc">
            No investor funds a business plan without a team. Below is the ideal founding team
            structure TalentForge needs to hire/identify before pitching.
          </div>
        </div>
        <div className="team-grid">
          {[
            { av: 'av-orange', code: 'CEO', name: 'Nelson M Sathya', role: 'Chief Product Manager · Full time', note: 'Must have: EdTech or HR-Tech startup experience. NSDC / government network is a major plus. Drives B2B sales, college partnerships, fundraising.' },
            { av: 'av-teal', code: 'CTTO', name: 'Dr. Ganesh Krish', role: 'Co-Founder & Chief Talent Transformation Officer (CTTO)', note: 'Must have: ML/AI background, prior experience building assessment or simulation platforms. Owns the Computational Informatics Engine and sandbox infrastructure.' },
            { av: 'av-purple', code: 'CPO', name: 'Chief Product', role: 'Co-founder · Full time', note: 'Must have: Gamification or marketplace product experience. Owns student experience, XP system, Cosmos Index, and the multi-discipline sandbox UX.' },
            // { av: 'av-amber', code: 'VP Ops', name: 'VP Operations', role: 'Early hire · Month 1', note: 'Runs employer onboarding, college SaaS delivery, project QA escalations. Ex-operations from Internshala, Naukri, or Flipkart preferred.' },
            // { av: 'av-purple', code: 'Psy', name: 'Industrial Psychologist', role: 'Early hire · Month 2', note: 'PhD in I/O Psychology. Validates the OCEAN assessment, personality-performance correlation, and mental health safeguards.' },
            // { av: 'av-blue', code: 'Gov', name: 'Government Relations', role: 'Advisor or BD hire', note: 'Ex-NSDC, AICTE, or Ministry of Skill Development insider. The government moat only works if someone can navigate the bureaucracy.' },
          ].map((t) => (
            <div className="team-card" key={t.code}>
              <div className={`team-avatar ${t.av}`}>{t.code}</div>
              <div className="team-name">{t.name}</div>
              <div className="team-role">{t.role}</div>
              <div className="team-note">{t.note}</div>
            </div>
          ))}
        </div>
        <div className="advisor-note" style={{ marginTop: '1rem' }}>
          <strong>Advisory Board needed:</strong> 1 ex-NASSCOM / CII leader (employer credibility),
          1 ANSYS/Autodesk partnership contact (simulation cost reduction), 1 blockchain/NFT
          architect (Polygon expertise). Advisors at 0.25–0.5% equity each.
        </div>
      </Section>

      {/* ── SECTION 6: Moats ── */}
      <Section num="06" icon="ti-shield" title="Competitive Moats — Why We Win Long-Term">
        <div className="moat-grid">
          {[
            { icon: 'ti-network', color: 'var(--tf-teal)', title: 'Multi-discipline network effects', desc: 'Employers come for software talent, stay for mechanical, return for ECE. Once embedded, switching costs are high. No competitor addresses all 4 disciplines.' },
            { icon: 'ti-brain', color: '#9B93F0', title: 'Proprietary psychometric dataset', desc: 'By Year 2, we have 500K personality-performance data pairs. No competitor can replicate this overnight. Makes "87% hire success probability" provable.' },
            { icon: 'ti-building-bank', color: 'var(--tf-amber)', title: 'Government certification lock-in', desc: 'NSDC official partner status requires 12–18 months of compliance work. Once NSQF tiers are mapped, government procurement flows to us by default.' },
            { icon: 'ti-flame', color: 'var(--tf-orange)', title: 'Gamification sunk cost', desc: 'A student with 80,000 XP, a "Lead" tier badge, and a 6-month project history will not restart from zero on a competitor platform.' },
          ].map((m) => (
            <div className="moat-card" key={m.title}>
              <div className="moat-icon"><i className={`ti ${m.icon}`} style={{ color: m.color }} aria-hidden="true" /></div>
              <h3 className="moat-title">{m.title}</h3>
              <div className="moat-desc">{m.desc}</div>
            </div>
          ))}
        </div>
        <div className="divider" />
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
          Honest competitive threats
        </div>
        {[
          { label: 'LinkedIn Skills', desc: 'If LinkedIn launches verified technical assessments, our B2C story weakens. Defence: multi-discipline depth and government certification.' },
          { label: 'Internshala / Unstop', desc: 'They have massive student distribution. If they add verification, they threaten supply side. Defence: go deeper on Mechanical + ECE.' },
          { label: 'NSDC building in-house', desc: 'Government can decide to build their own platform. Mitigation: become so embedded we are the infrastructure — not a vendor.' },
        ].map((t) => (
          <div className="row-item" key={t.label}>
            <span className="row-icon"><i className="ti ti-alert-triangle" style={{ color: 'var(--tf-orange)' }} aria-hidden="true" /></span>
            <span className="row-label">{t.label}</span>
            <span className="row-desc">{t.desc}</span>
          </div>
        ))}
      </Section>

      {/* ── SECTION 7: Risks ── */}
      <Section num="07" icon="ti-shield-exclamation" title="Honest Risk Register">
        {[
          { level: 'risk-high', badge: 'badge-red', label: 'High', title: 'Simulation API costs kill unit economics', desc: 'ANSYS Cloud at ₹500/simulation means 10,000 Mechanical projects = ₹50L/month COGS. Mitigation: negotiate volume pricing to ₹100–200/simulation before scaling Mechanical.' },
          { level: 'risk-high', badge: 'badge-red', label: 'High', title: 'Chicken-and-egg problem on both sides', desc: 'Employers won\'t post without students; students won\'t join without projects. Mitigation: use college SaaS as the supply-side wedge — lock in 10 colleges first.' },
          { level: 'risk-med', badge: 'badge-amber', label: 'Medium', title: 'Gig economy classification risk', desc: 'If government classifies earnings as employment, mandatory EPF/ESI could break the model. Mitigation: "educational platform" framing + AICTE credit recognition.' },
          { level: 'risk-med', badge: 'badge-amber', label: 'Medium', title: 'Psychometric validity claims face backlash', desc: 'If employer hires based on "87% success probability" and person fails, trust collapses. Mitigation: never guarantee outcomes; frame as "data-informed shortlisting."' },
          { level: 'risk-low', badge: 'badge-green', label: 'Low', title: 'Blockchain / NFT perception problem', desc: 'Indian enterprises distrust "blockchain" and "NFT" language after crypto crash. Mitigation: call it "tamper-proof digital credentialing." Lead with outcomes.' },
        ].map((r, i) => (
          <div className={`risk-item ${r.level}`} key={i}>
            <div className="risk-title"><span className={`badge ${r.badge}`}>{r.label}</span>{r.title}</div>
            <div className="risk-desc">{r.desc}</div>
          </div>
        ))}
      </Section>

      {/* ── SECTION 8: Funding & Exit ── */}
      <Section
        num="08"
        icon="ti-rocket"
        title="Funding Ask & Exit Strategy"
        titleExtra={
          <span className="inline-flag flag-critical" style={{ marginLeft: 6 }}>
            <i className="ti ti-alert-triangle" aria-hidden="true" /> Missing from original
          </span>
        }
      >
        <h3 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
          Seed Round — ₹25 Crore ask
        </h3>
        <div className="funding-row">
          {[
            { amount: '₹10 Cr', label: 'Technology', use: 'Computational Informatics Engine, 4 discipline sandboxes, blockchain infra, psychometric suite.' },
            { amount: '₹8 Cr', label: 'Team (18 months)', use: '65 hires: 30 engineering, 15 ops, 10 sales/partnerships, 5 psychology/content, 5 leadership.' },
            { amount: '₹7 Cr', label: 'GTM + Regulatory', use: 'College acquisition (₹2 Cr), employer demand gen (₹2 Cr), NSDC/AICTE compliance (₹1.5 Cr), brand + PR (₹1.5 Cr).' },
          ].map((f) => (
            <div className="funding-card" key={f.label}>
              <div className="funding-amount">{f.amount}</div>
              <div className="funding-label">{f.label}</div>
              <div className="funding-use">{f.use}</div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.75rem', marginTop: '1rem' }}>
          Funding Roadmap
        </h3>
        <table className="fin-table" style={{ marginBottom: '1rem' }}>
          <thead>
            <tr><th>Round</th><th>When</th><th>Amount</th><th>Milestone to unlock</th><th>Likely investors</th></tr>
          </thead>
          <tbody>
            {[
              ['Seed', 'Now', '₹25 Cr', '10K students, 100 employers, 20 college licenses', 'Blume, Stellaris, Elevation'],
              ['Series A', 'Month 18', '₹100–150 Cr', '75K students, ₹12 Cr MRR, NSDC live', 'Peak XV, Nexus, Tiger Global'],
              ['Series B', 'Month 36', '₹300–500 Cr', '300K students, ₹40 Cr MRR, 3 state contracts', 'SoftBank, Warburg, KKR'],
            ].map(([round, when, amount, milestone, investors]) => (
              <tr key={round}>
                <td>{round}</td>
                <td className="soft">{when}</td>
                <td>{amount}</td>
                <td className="soft">{milestone}</td>
                <td className="soft">{investors}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.75rem', marginTop: '1rem' }}>
          Exit paths (Year 5–7)
        </h3>
        <div className="exit-grid">
          {[
            { type: 'Strategic acquirer', who: 'Naukri / Info Edge', desc: 'They own job discovery. We own skill verification. Together they own the full hiring funnel. Target: 10–15× ARR at ₹1,200 Cr ARR.' },
            { type: 'Strategic acquirer', who: 'Coursera / Pearson', desc: 'Global EdTech giants want India\'s verified skill infrastructure. NSDC certification + blockchain gives them a government-endorsed India entry.' },
            { type: 'IPO path', who: 'NSE / BSE listing', desc: 'If ARR reaches ₹1,200+ Cr with 55% margins and government contracts, an India IPO is viable. TalentForge at 20× = ₹24,000 Cr market cap.' },
          ].map((e) => (
            <div className="exit-card" key={e.who}>
              <div className="exit-type">{e.type}</div>
              <div className="exit-who">{e.who}</div>
              <div className="exit-desc">{e.desc}</div>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
