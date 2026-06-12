'use client';

import { useState } from 'react';

const TABS = [
  { id: 'ngspice', label: 'ngspice Pipeline', icon: 'ti-bolt', color: '#9B93F0' },
  { id: 'tfes', label: 'TFES Calibration', icon: 'ti-chart-radar', color: '#1D9E75' },
  { id: 'cold', label: 'Cold-Start Marketplace', icon: 'ti-flame', color: '#D85A30' },
];

export default function Phase1Page() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main className="page">
      <div className="page-header">
        <div className="page-tag" style={{ background: 'rgba(127,119,221,0.12)', color: '#9B93F0', border: '0.5px solid rgba(127,119,221,0.2)' }}>
          Phase 1 · Deep Dives
        </div>
        <h1 className="page-title">Technical Deep Dives</h1>
        <p className="page-subtitle">
          Three critical technical investigations for Phase 1: ngspice circuit pipeline, TFES scoring calibration, and cold-start marketplace strategy.
        </p>
      </div>

      <div className="phase-tabs">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            className={`ptb${i === activeTab ? ' active' : ''}`}
            style={i === activeTab ? { borderColor: t.color, color: t.color, background: `${t.color}12`, fontWeight: 500 } : {}}
            onClick={() => setActiveTab(i)}
          >
            <i className={`ti ${t.icon}`} style={{ fontSize: 13, marginRight: 5, verticalAlign: -1 }} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── ngspice Pipeline ──────────────────────────── */}
      {activeTab === 0 && (
        <div>
          <div className="summary-box" style={{ marginBottom: '1rem' }}>
            The ECE/EEE sandbox is the hardest engineering problem in TalentForge. Students submit SPICE netlists, TalentForge runs them through ngspice inside a secure Docker container, compares output waveforms to reference, and auto-grades. This deep dive maps the full 8-stage pipeline.
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 10 }}>
            8-Stage Pipeline Architecture
          </h3>

          {[
            { n: 1, title: 'Netlist Intake & Sanitisation', desc: 'Accept student .spice/.cir file via CIE API. Validate: max 500 lines, no .include or .lib (prevents arbitrary file reads), no .system (prevents shell escape). Reject with error message on failure.', impl: 'FastAPI endpoint with pydantic model. Regex-based line scanner. Return 422 with specific violation.', code: '# Sanitisation rules\nFORBIDDEN = [".include", ".lib", ".system", ".shell"]\nMAX_LINES = 500\nMAX_FILE_SIZE = 64_000  # 64 KB' },
            { n: 2, title: 'Docker Container Provisioning', desc: 'Spin up ephemeral Docker container with ngspice 42+ pre-installed. CPU: 0.5 vCPU. Memory: 512MB. Network: none. No volume mounts except /tmp/work. Timeout: 30 seconds hard kill.', impl: 'GKE Job with pod security context: no-new-privileges, read-only root filesystem, non-root user.', code: 'securityContext:\n  runAsNonRoot: true\n  readOnlyRootFilesystem: true\n  allowPrivilegeEscalation: false\nresources:\n  limits: { cpu: "500m", memory: "512Mi" }\n  requests: { cpu: "250m", memory: "256Mi" }' },
            { n: 3, title: 'Simulation Execution', desc: 'Copy sanitised netlist into container. Run: ngspice -b -r output.raw -o output.log netlist.cir. Capture exit code, stdout, stderr. Hard-kill at 30s.', impl: 'subprocess.run() with timeout=30. Capture returncode for pass/fail/timeout classification.', code: 'result = subprocess.run(\n  ["ngspice", "-b", "-r", "output.raw", "-o", "output.log", "netlist.cir"],\n  capture_output=True, timeout=30, cwd="/tmp/work"\n)' },
            { n: 4, title: 'Raw Output Parsing', desc: 'Parse ngspice binary .raw file → extract voltage/current vectors as numpy arrays. Handle both real and complex (AC analysis) data. Extract simulation type from header.', impl: 'Custom parser or ltspice-raw-reader. Output: dict of signal_name → numpy array.', code: '# Output format\n{\n  "type": "transient",\n  "time": np.array([...]),\n  "V(out)": np.array([...]),\n  "I(R1)": np.array([...])\n}' },
            { n: 5, title: 'Waveform Comparison', desc: 'Compare student waveform against reference. Metrics: RMSE, peak error, frequency match (for AC), settling time (for transient). Each metric has a tolerance band defined per challenge.', impl: 'scipy.signal for frequency domain. numpy for time-domain. Each metric returns 0–100 sub-score.', code: '# Grading rubric per challenge type\nTRANSIENT_RUBRIC = {\n  "rmse": { "weight": 0.4, "tolerance": 0.05 },\n  "peak_error": { "weight": 0.3, "tolerance": 0.10 },\n  "settling_time": { "weight": 0.3, "tolerance": 0.15 }\n}' },
            { n: 6, title: 'Anti-Cheat Layer', desc: 'Detect: (1) identical netlists (hash match), (2) netlists that embed reference output as voltage source (topology analysis), (3) trivially modified netlists (AST similarity >90%).', impl: 'SHA-256 hash + SPICE AST parser. Flag for manual review if suspicious. Don\'t auto-reject.', code: '# AST similarity check\ndef spice_ast_similarity(a: str, b: str) -> float:\n  tokens_a = tokenize_spice(a)\n  tokens_b = tokenize_spice(b)\n  return difflib.SequenceMatcher(None, tokens_a, tokens_b).ratio()' },
            { n: 7, title: 'Scoring & Feedback', desc: 'Weighted composite: waveform match 60%, code quality 20% (netlist neatness, comments, naming), efficiency 20% (component count, power consumption if applicable).', impl: 'Score engine returns JSON with breakdown. GPT-4o generates natural language feedback from scores.', code: '# Score output\n{\n  "total": 78,\n  "waveform_match": 82,\n  "code_quality": 70,\n  "efficiency": 75,\n  "feedback": "Good transient response. Consider..."\n}' },
            { n: 8, title: 'Result Persistence & Webhook', desc: 'Store: raw netlist, .raw output, parsed waveforms (S3/GCS), scores (PostgreSQL), feedback (PostgreSQL). Fire webhook to CIE submission API. Update XP if Sprint 9+ is live.', impl: 'Celery result backend → PostgreSQL. GCS for binary files. Webhook with HMAC signature.', code: '# Webhook payload\n{\n  "event": "cie.grading.complete",\n  "submission_id": "sub_abc123",\n  "score": 78,\n  "breakdown": {...},\n  "artifacts": { "raw": "gs://...", "waveform": "gs://..." }\n}' },
          ].map((stage) => (
            <div className="adr-card" key={stage.n} style={{ borderLeft: '3px solid #9B93F0', borderRadius: '0 var(--border-radius-lg) var(--border-radius-lg) 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#9B93F0', background: 'rgba(155,147,240,0.15)', padding: '3px 8px', borderRadius: 4, flexShrink: 0 }}>
                  Stage {stage.n}
                </span>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{stage.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{stage.desc}</p>
                </div>
              </div>
              <div style={{ background: 'var(--color-background-tertiary)', borderRadius: 'var(--border-radius-md)', padding: '8px 10px', marginBottom: 8 }}>
                <p style={{ margin: '0 0 3px', fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>Implementation</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>{stage.impl}</p>
              </div>
              <div className="pre">
                {stage.code.split('\n').map((line, i) => {
                  if (line.trim().startsWith('#')) return <div key={i}><span className="cm">{line}</span></div>;
                  return <div key={i}>{line.replace(/ /g, '\u00A0')}</div>;
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── TFES Calibration ──────────────────────────── */}
      {activeTab === 1 && (
        <div>
          <div className="summary-box" style={{ marginBottom: '1rem' }}>
            The TalentForge Employability Score (TFES) is the platform&apos;s core metric. It must be accurate enough that employers trust it for hiring decisions, fair enough that students don&apos;t game it, and transparent enough that students know how to improve. This deep dive covers the scoring formula, calibration methodology, adaptive difficulty, and anti-gaming mechanisms.
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 10 }}>Scoring Formula</h3>
          <div className="adr-card" style={{ borderLeft: '3px solid #1D9E75', borderRadius: '0 var(--border-radius-lg) var(--border-radius-lg) 0', marginBottom: 16 }}>
            <div className="pre" style={{ fontSize: 13 }}>
              <span className="cm"># TFES v1 composite formula</span>{'\n'}
              <span className="kw">TFES</span> = (<span className="num">0.40</span> × <span className="fn">Technical_Score</span>){'\n'}
              {'     '}+ (<span className="num">0.30</span> × <span className="fn">Cognitive_Score</span>){'\n'}
              {'     '}+ (<span className="num">0.30</span> × <span className="fn">Behavioral_Score</span>)
            </div>
            <div className="three-col" style={{ marginTop: 12 }}>
              {[
                { n: 'Technical (40%)', c: '#1D9E75', items: ['Domain-specific assessment score (IRT-adjusted)', 'CIE sandbox output score', 'Code/design quality sub-scores'] },
                { n: 'Cognitive (30%)', c: '#9B93F0', items: ['Aptitude: logical reasoning, numerical, verbal', 'Problem-solving speed (time-adjusted)', 'Pattern recognition (matrix puzzles)'] },
                { n: 'Behavioral (30%)', c: '#D85A30', items: ['OCEAN psychometric results', 'Conscientiousness and agreeableness weighted higher', 'Self-reported validated against project behavior'] },
              ].map((s) => (
                <div key={s.n} className="card">
                  <h4 className="card-title" style={{ color: s.c }}>{s.n}</h4>
                  <ul>{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 10 }}>Adaptive Difficulty Engine</h3>
          {[
            { title: 'IRT-based item selection', desc: 'Each question has difficulty (b), discrimination (a), and guessing (c) parameters estimated via 3-Parameter Logistic model. Student ability (θ) updated after each response using Expected A Posteriori.', detail: 'Cold start: θ = 0 (average). After 5 responses, θ estimate stabilises. Questions selected to maximise Fisher information at current θ.' },
            { title: 'Domain-specific question banks', desc: 'Separate question banks per domain (CS, ECE, Mech, Civil). Each bank calibrated independently with domain-specific difficulty curves. Cross-domain comparisons normalised via percentile mapping.', detail: 'Minimum bank size: 200 items per domain. Target: 500+ per domain by Month 6. Items retired when discrimination (a) drops below 0.4.' },
            { title: 'Score normalisation', desc: 'Raw IRT θ scores mapped to 0–100 scale using domain-specific percentile curves. Recalibrated monthly as population grows. Ensures "75 in CS" and "75 in ECE" have equivalent difficulty.', detail: 'Initial calibration: 500 scored assessments per domain. Monthly recalibration with expanding population. Flag if distribution skew > |0.5|.' },
          ].map((item) => (
            <div className="adr-card" key={item.title} style={{ marginBottom: 10 }}>
              <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.title}</p>
              <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
              <div style={{ background: 'var(--color-background-tertiary)', borderRadius: 'var(--border-radius-md)', padding: '8px 10px' }}>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>{item.detail}</p>
              </div>
            </div>
          ))}

          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', margin: '16px 0 10px' }}>Anti-Gaming Mechanisms</h3>
          {[
            { title: 'Assessment farming prevention', desc: 'Students can re-take assessment once per 30 days. Score = max of last 2 attempts. Prevents "keep trying until lucky."', level: 'risk-med' },
            { title: 'Question exposure control', desc: 'Any question shown to >500 students is flagged for exposure. Questions with >40% identical answer distribution in 24hr window are quarantined and reviewed.', level: 'risk-high' },
            { title: 'Behavioral score manipulation', desc: 'OCEAN scores validated against actual project behavior (deadlines met, communication quality, peer review scores). Discrepancy >2σ triggers re-assessment flag.', level: 'risk-med' },
            { title: 'Collaborative cheating detection', desc: 'If two students from same IP submit same assessment within 5 minutes with >85% answer overlap, both flagged. Don\'t auto-penalise — flag for review.', level: 'risk-low' },
          ].map((item) => (
            <div className={`risk-item ${item.level}`} key={item.title}>
              <div className="risk-title">{item.title}</div>
              <div className="risk-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Cold-Start Marketplace ────────────────────── */}
      {activeTab === 2 && (
        <div>
          <div className="summary-box" style={{ marginBottom: '1rem' }}>
            The biggest existential risk for TalentForge is the chicken-and-egg problem: employers won&apos;t post projects without verified talent, and students won&apos;t join without real projects. This deep dive maps the sequencing strategy, matching algorithm, and escrow mechanics to break the cold-start deadlock.
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 10 }}>Sequencing Strategy</h3>
          <div className="timeline">
            {[
              { dot: '#D85A30', phase: 'Week 1–4 · Supply-first wedge', title: 'Lock in 3 pilot colleges as free design partners', desc: 'Offer free assessments for one semester. In return, get 500+ assessed students with real TFES scores. This creates the initial verified talent pool that employers can browse.' },
              { dot: '#1D9E75', phase: 'Week 5–8 · Demand seeding', title: 'Cold-outreach 200 startups that need interns', desc: 'Target: funded startups (Seed to Series B) that struggle to find multi-discipline talent. Offer first 3 hires at zero platform fee. Goal: 10 employers posting 25 projects.' },
              { dot: '#9B93F0', phase: 'Week 9–12 · Orbit Tasks bridge', title: 'Micro-gigs fill the gap when full projects are sparse', desc: 'Employers post ₹100–₹500 tasks: "review this schematic", "test this API", "annotate this CAD model." Students earn first money within 48 hours. Creates dopamine loop before full projects.' },
              { dot: '#BA7517', phase: 'Month 4–6 · Network effects kick in', title: 'First completed projects generate credentials + referrals', desc: 'Students share NFT credentials on LinkedIn → employers discover TalentForge organically. College placement officers see dashboard → recommend to peer colleges. Employer NPS >50 → inbound demand.' },
            ].map((item, i) => (
              <div className="tl-item" key={i}>
                <div className="tl-dot" style={{ background: item.dot }} />
                <div className="tl-phase">{item.phase}</div>
                <div className="tl-title">{item.title}</div>
                <div className="tl-desc">{item.desc}</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', margin: '20px 0 10px' }}>AI Matching Algorithm</h3>
          <div className="adr-card" style={{ marginBottom: 16 }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              The matching engine ranks candidates for each project using a weighted composite score. Elasticsearch handles the initial filter; a re-ranker applies the composite scoring.
            </p>
            <div className="pre" style={{ fontSize: 12 }}>
              <span className="cm"># Matching score formula</span>{'\n'}
              <span className="kw">match_score</span> = ({'\n'}
              {'  '}<span className="num">0.35</span> × <span className="fn">domain_relevance</span>(student.domain, project.domain){'\n'}
              {'  '}+ <span className="num">0.25</span> × <span className="fn">tfes_percentile</span>(student.tfes, project.min_tfes){'\n'}
              {'  '}+ <span className="num">0.20</span> × <span className="fn">tier_match</span>(student.tier, project.required_tier){'\n'}
              {'  '}+ <span className="num">0.10</span> × <span className="fn">availability_score</span>(student.calendar, project.timeline){'\n'}
              {'  '}+ <span className="num">0.10</span> × <span className="fn">personality_fit</span>(student.ocean, project.team_profile){'\n'}
              )
            </div>
            <div className="two-col" style={{ marginTop: 12 }}>
              {[
                { title: 'Hard filters (pre-scoring)', items: ['Domain match: exact or adjacent (ECE matches EEE)', 'TFES ≥ project minimum', 'Tier ≥ project requirement', 'Student available in project window', 'Student not at max concurrent projects (2)'] },
                { title: 'Soft signals (re-ranking)', items: ['Past project completion rate (>80% → boost)', 'Peer review average (>3.5/5 → boost)', 'Employer rating from previous projects', 'Response time to past invitations (<24h → boost)', 'Domain sub-specialty match (e.g., "power electronics" within ECE)'] },
              ].map((col) => (
                <div className="card" key={col.title}>
                  <h4 className="card-title">{col.title}</h4>
                  <ul>{col.items.map((i) => <li key={i}>{i}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 10px' }}>Escrow & Payment Mechanics</h3>
          {[
            { n: 1, title: 'Employer funds escrow', desc: 'Project budget deposited via Razorpay → held in TF escrow account. Student sees "funded" badge. No work starts until escrow confirmed.', color: '#D85A30' },
            { n: 2, title: 'Milestone-based release', desc: 'Project split into milestones. Each milestone has deliverables. Employer reviews → approves → funds released. Dispute triggers 48h mediation.', color: '#1D9E75' },
            { n: 3, title: 'TF commission structure', desc: '15% on projects <₹25K, 20% on ₹25K–₹1L, 25% on >₹1L. Commission deducted from employer payment before escrow. Student receives full milestone amount.', color: '#9B93F0' },
            { n: 4, title: 'Dispute resolution', desc: 'Employer or student can raise dispute. 48h window for response. If unresolved: TF mediator reviews deliverables + communication log. Decision within 72h. Final.', color: '#BA7517' },
          ].map((step) => (
            <div className="adr-card" key={step.n} style={{ borderLeft: `3px solid ${step.color}`, borderRadius: '0 var(--border-radius-lg) var(--border-radius-lg) 0', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: step.color, background: `${step.color}20`, padding: '3px 8px', borderRadius: 4, flexShrink: 0 }}>
                  Step {step.n}
                </span>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{step.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
