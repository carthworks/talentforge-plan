'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import TaskAssign from '@/components/TaskAssign';
import TaskNotes, { TaskNoteIndicator } from '@/components/TaskNotes';
import { useToast } from '@/components/Toast';
import { TEAM_MEMBERS } from '@/lib/auth';

const OWNER_COLORS: Record<string, string> = {
  DevOps: '#5BA3E0', BE: '#1D9E75', 'AI/ML': '#9B93F0', FE: '#D85A30',
  Product: '#BA7517', CIE: '#E06060', BC: '#378ADD', QA: '#7BBF44',
  GTM: '#D4A040',
};

/* ─── Sprint Data ──────────────────────────────────────── */
const PHASES = [
  {
    id: 1, name: 'Foundation MVP', period: 'M1–4', color: '#1D9E75', cl: 'rgba(29,158,117,0.08)',
    sprints: [
      { i: 1, n: 'Infrastructure & architecture', w: 'W1–2', m: 'Month 1', t: ['DevOps', 'BE'], tasks: [
        { t: 'GCP project setup: GKE cluster, VPC, IAM roles, Cloud Armor WAF', o: 'DevOps' },
        { t: 'Monorepo bootstrap: Node.js (API), FastAPI (AI services), React 18 (web), React Native (mobile)', o: 'BE' },
        { t: 'Database layer: PostgreSQL (users/projects) + MongoDB (behavioral logs) + Redis (session cache)', o: 'BE' },
        { t: 'Elasticsearch cluster for talent search and AI matching queries', o: 'BE' },
        { t: 'Auth service: mobile OTP + JWT, role-based access (student / employer / college admin / superadmin)', o: 'BE' },
        { t: 'CI/CD pipeline: GitHub Actions → staging auto-deploy; production gated on PR approval + test pass', o: 'DevOps' },
      ], dod: 'All services green on staging; auth flows tested; CI deploys in <5 min', dep: 'None — first sprint' },
      { i: 2, n: 'AI assessment engine core', w: 'W3–4', m: 'Month 1', t: ['AI/ML', 'BE'], tasks: [
        { t: 'GPT-4o API integration for NLP scoring and coaching nudge generation', o: 'AI/ML' },
        { t: 'Adaptive question bank schema: difficulty tiers 1–5, domain tags, question type', o: 'AI/ML' },
        { t: 'IRT engine: adjust difficulty in real time based on prior response accuracy', o: 'AI/ML' },
        { t: 'TFES v1 algorithm: weighted composite — technical 40%, cognitive 30%, behavioral 30%', o: 'AI/ML' },
        { t: 'Question bank seed: 200 questions across CS, ECE, Aptitude domains', o: 'Product' },
        { t: 'Assessment session API: start → answer → submit → async score → webhook callback', o: 'BE' },
      ], dod: 'Student completes 20-question adaptive test and receives TFES score via API in <15s', dep: 'Sprint 1: infra + auth' },
      { i: 3, n: 'Student UI + PWA shell', w: 'W5–6', m: 'Month 2', t: ['FE', 'Product'], tasks: [
        { t: 'Registration flow: mobile OTP, Aadhaar-lite profile, domain selection, college autocomplete', o: 'FE' },
        { t: 'Assessment UI: adaptive question renderer (MCQ, code snippet, fill-in), timer, progress bar', o: 'FE' },
        { t: 'TFES score card: radar chart (5 dimensions), strengths summary, career path suggestions', o: 'FE' },
        { t: 'PWA shell: service worker for offline assessment, low-bandwidth mode, install prompt', o: 'FE' },
        { t: 'Career pathway mapper: GPT-4o generates personalised role suggestions from TFES', o: 'AI/ML' },
        { t: 'Mobile-first responsive layout: React Native stub (iOS + Android) scaffolded', o: 'FE' },
      ], dod: 'Full student onboarding + assessment live on staging; PWA installable', dep: 'Sprint 2: assessment engine API' },
      { i: 4, n: 'CIE v1 — CS + ECE grading', w: 'W7–8', m: 'Month 2', t: ['CIE', 'BE'], tasks: [
        { t: 'Docker-sandboxed code execution: Python, C, Java, JS with CPU/memory limits', o: 'CIE' },
        { t: 'CS auto-grader: compile → run testbench → score correctness + complexity', o: 'CIE' },
        { t: 'ngspice integration: accept SPICE netlist, run transient/DC/AC sim, return waveform JSON', o: 'CIE' },
        { t: 'ECE waveform comparator: validate output against reference within tolerance', o: 'CIE' },
        { t: 'CIE submission API: async job queue (Celery + Redis), result webhook', o: 'BE' },
        { t: 'Plagiarism layer: AST-based code similarity check (>85% match → flag)', o: 'AI/ML' },
      ], dod: 'CIE grades a Python problem + ECE circuit sim with <30s turnaround', dep: 'Sprint 1: Docker infra' },
      { i: 5, n: 'Marketplace — employer side', w: 'W9–10', m: 'Month 3', t: ['BE', 'FE'], tasks: [
        { t: 'Employer registration + KYC lite: GST validation, company size, domain', o: 'BE' },
        { t: 'Project posting form: scope, budget (₹5K–₹5L), required tier, domain tags', o: 'FE' },
        { t: 'AI matching engine v1: Elasticsearch ranks candidates by TFES + domain + tier', o: 'AI/ML' },
        { t: 'Employer dashboard: project pipeline kanban, AI-generated candidate scorecards', o: 'FE' },
        { t: 'Escrow flow: Razorpay payment → hold → milestone approval → release to intern', o: 'BE' },
        { t: 'Intern acceptance flow: project details, scope agreement, kick-off confirmation', o: 'FE' },
      ], dod: 'Employer posts project, receives AI matches, funds escrow, releases payment', dep: 'Sprint 3: student profiles' },
      { i: 6, n: 'College white-label dashboard', w: 'W11–12', m: 'Month 3', t: ['FE', 'BE', 'Product'], tasks: [
        { t: 'College admin portal: student cohort management, bulk import via CSV + API', o: 'FE' },
        { t: 'Placement analytics dashboard: TFES heatmap by branch, employability distribution', o: 'FE' },
        { t: 'White-label config: logo upload, brand colour picker, custom subdomain', o: 'FE' },
        { t: 'College bulk assessment: scheduled link for entire batch, proctoring-lite', o: 'BE' },
        { t: 'PDF placement report: per-student TFES rank, recommended roles, exportable', o: 'BE' },
        { t: 'Role-based college access: principal, placement officer, faculty views', o: 'BE' },
      ], dod: 'College admin onboards batch, runs assessment, downloads PDF report', dep: 'Sprint 3 + Sprint 5' },
      { i: 7, n: 'Blockchain credential layer v1', w: 'W13–14', m: 'Month 4', t: ['BC', 'BE'], tasks: [
        { t: 'Solidity smart contract on Polygon PoS testnet: mint, verify, revoke (ERC-721)', o: 'BC' },
        { t: 'IPFS integration via Web3.Storage: store certificate metadata + PDF', o: 'BC' },
        { t: 'Batch minting job: nightly cron triggers NFT mint for completed projects', o: 'BC' },
        { t: 'Credential verification API: input credential ID → on-chain check → pass/fail <2s', o: 'BC' },
        { t: 'Student credential wallet UI: view badges, share link, LinkedIn deep-link', o: 'FE' },
        { t: 'Mainnet migration: Polygon PoS mainnet deploy; fund gas wallet', o: 'BC' },
      ], dod: 'Project completion triggers NFT mint; employer verifies via API in <2s', dep: 'Sprint 5: marketplace + escrow' },
      { i: 8, n: 'QA hardening + pilot launch', w: 'W15–16', m: 'Month 4', t: ['QA', 'GTM', 'All'], tasks: [
        { t: 'E2E test suite: Playwright covering student, employer, college, blockchain flows', o: 'QA' },
        { t: 'Load test: 500 concurrent assessment sessions with k6', o: 'DevOps' },
        { t: 'OWASP Top-10 security review on auth, payment, and file-upload', o: 'QA' },
        { t: 'Mixpanel event tracking: funnel instrumentation (register → hire)', o: 'Product' },
        { t: 'GTM: sign and onboard 3 pilot colleges (Chennai, Coimbatore, Pune)', o: 'GTM' },
        { t: 'GTM: activate 5 employer accounts on freemium', o: 'GTM' },
      ], dod: 'MVP live; 3 college pilots onboarded; 5 employers; 0 P0 bugs', dep: 'Sprints 1–7' },
    ],
  },
  {
    id: 2, name: 'Gamification + Engagement', period: 'M5–9', color: '#7F77DD', cl: 'rgba(127,119,221,0.08)',
    sprints: [
      { i: 9, n: 'XP engine + progression tiers', w: 'W17–18', m: 'Month 5', t: ['BE', 'FE'], tasks: [
        { t: 'XP schema: events → XP values table', o: 'BE' },
        { t: '5-tier level-up logic: Explorer → Master', o: 'BE' },
        { t: 'Badge engine: 30 starter badges', o: 'Product' },
        { t: 'Student profile v2: animated XP bar, badges', o: 'FE' },
        { t: 'FCM push notifications: streak, badge, match', o: 'BE' },
        { t: 'Daily micro-challenge: GPT-4o question, 50 XP', o: 'AI/ML' },
      ], dod: 'Students earn XP, level up, receive badges; streaks visible', dep: 'Sprint 3: student profiles' },
      { i: 10, n: 'Missions, leagues + leaderboard', w: 'W19–20', m: 'Month 5', t: ['Product', 'FE', 'BE'], tasks: [
        { t: 'Mission builder (admin): time-boxed challenges', o: 'Product' },
        { t: 'Weekly Skill League: auto-rank by XP per domain', o: 'BE' },
        { t: 'Leaderboard UI: national/regional/college tabs', o: 'FE' },
        { t: 'Sprint feed: mission cards with difficulty, XP, time', o: 'FE' },
        { t: 'Mission completion pipeline: submit → grade → XP → leaderboard', o: 'BE' },
        { t: 'Email digest: weekly league rank + recommended missions', o: 'BE' },
      ], dod: 'League resets weekly; top-100 leaderboard live; missions completable', dep: 'Sprint 9: XP engine' },
      { i: 11, n: 'CIE Mechanical — CAD + FEA', w: 'W21–24', m: 'Month 6–7', t: ['CIE', 'DevOps'], tasks: [
        { t: 'CAD file parser: SolidWorks + AutoCAD support', o: 'CIE' },
        { t: 'CAD evaluation rubric: dimensions, tolerances, features', o: 'CIE' },
        { t: 'FEA result grader: stress/displacement scoring', o: 'CIE' },
        { t: 'Kinematics validator: linkage ratios, motion path', o: 'CIE' },
        { t: 'GPU-backed node pool: dedicated GKE for Mechanical', o: 'DevOps' },
        { t: 'Mechanical mission pack: 20 starter challenges', o: 'Product' },
      ], dod: 'Student uploads SolidWorks part → receives CAD score within 60s', dep: 'Sprint 4: CIE architecture' },
      { i: 12, n: 'Non-tech simulations + Sandbox Work Lab', w: 'W25–28', m: 'Month 7–8', t: ['AI/ML', 'FE', 'CIE'], tasks: [
        { t: 'Sales simulation: AI roleplay, NLP scoring', o: 'AI/ML' },
        { t: 'Written communication grader: GPT-4o rubric', o: 'AI/ML' },
        { t: 'Negotiation engine: multi-turn dialogue sim', o: 'AI/ML' },
        { t: 'Browser-based IDE: Monaco editor in Work Lab', o: 'FE' },
        { t: 'In-browser circuit sim: ngspice WebAssembly', o: 'CIE' },
        { t: 'Team project mode: 3–5 person async workspace', o: 'BE' },
      ], dod: 'Non-tech sim with rubric score; CS student codes in Work Lab', dep: 'Sprint 4: CIE API' },
      { i: 13, n: 'Community pods + peer review', w: 'W29–30', m: 'Month 8', t: ['BE', 'FE'], tasks: [
        { t: 'Pod model: domain groups with join flow', o: 'BE' },
        { t: 'Pod async feed: threads, upvoting, replies', o: 'FE' },
        { t: 'Peer review engine: 3-rubric scoring form', o: 'BE' },
        { t: 'Reviewer quality score: flag poor reviewers', o: 'BE' },
        { t: 'Review XP economy: earn 25 XP/quality review', o: 'BE' },
        { t: 'Moderation tools: flagging, spam detection', o: 'AI/ML' },
      ], dod: 'Students join pods, post threads, submit work for peer review', dep: 'Sprint 9: XP system' },
      { i: 14, n: 'WhatsApp referral flywheel + M9 retro', w: 'W31–32', m: 'Month 9', t: ['BE', 'GTM', 'Product'], tasks: [
        { t: 'WhatsApp Business API: reminders + notifications', o: 'BE' },
        { t: 'Referral engine: unique code, ₹500 credit, fraud guard', o: 'BE' },
        { t: 'Campus ambassador portal: stats, balance, payout', o: 'FE' },
        { t: 'GTM: launch ambassador programme at 100 colleges', o: 'GTM' },
        { t: 'Y1 ARR live tracker: ₹4.2 Cr target vs actual', o: 'Product' },
        { t: 'Phase 2 retro: measure key conversion metrics', o: 'Product' },
      ], dod: 'WhatsApp firing; referral active; 500 ambassadors; retro done', dep: 'Sprint 9: student profiles' },
    ],
  },
  {
    id: 3, name: 'Blockchain + Trust Layer', period: 'M10–14', color: '#378ADD', cl: 'rgba(55,138,221,0.08)',
    sprints: [
      { i: 15, n: 'NFT credential marketplace', w: 'W33–36', m: 'Month 10', t: ['BC', 'FE'], tasks: [
        { t: 'Credential marketplace UI: searchable gallery', o: 'FE' },
        { t: 'Employer verification portal: paste ID or scan QR', o: 'FE' },
        { t: 'Public credential share page: shareable URL + blockchain proof', o: 'FE' },
        { t: 'Credential revocation: smart contract revoke function', o: 'BC' },
        { t: 'LinkedIn deep-link: one-click export to certifications', o: 'FE' },
        { t: 'Credential analytics: employer sees SBTs by domain', o: 'BE' },
      ], dod: 'Employer verifies in <2s; student shares URL; LinkedIn export works', dep: 'Sprint 7: blockchain v1' },
      { i: 16, n: 'Soulbound tokens + on-chain portfolio', w: 'W37–38', m: 'Month 11', t: ['BC', 'BE'], tasks: [
        { t: 'SBT contract: ERC-5114 non-transferable standard', o: 'BC' },
        { t: 'SBT issuance pipeline: CIE grade ≥70% → auto-mint', o: 'BC' },
        { t: 'On-chain proof-of-work: project linked to wallet', o: 'BC' },
        { t: 'Portfolio page: timeline with on-chain proof links', o: 'FE' },
        { t: 'Gas optimisation: batch minting, target <₹8/credential', o: 'BC' },
        { t: 'IPFS pinning: 3 nodes, automated pin health check', o: 'BC' },
      ], dod: 'Project completion auto-mints SBT; portfolio live; gas <₹8', dep: 'Sprint 15: credential marketplace' },
      { i: 17, n: 'Employer SaaS + ATS integration', w: 'W39–42', m: 'Month 12', t: ['BE', 'Product'], tasks: [
        { t: 'Enterprise dashboard: bulk candidate screening 500+', o: 'BE' },
        { t: 'ATS connectors: Greenhouse, Lever webhooks + CSV', o: 'BE' },
        { t: 'Candidate scorecard API: structured JSON output', o: 'BE' },
        { t: 'Bulk JD matching: GPT-4o parses → auto-rank pool', o: 'AI/ML' },
        { t: 'Hiring analytics: hire rate, avg TFES, time-to-hire', o: 'FE' },
        { t: 'Employer SaaS billing: ₹1L–₹5L/year tiered plans', o: 'BE' },
      ], dod: 'Enterprise screens 100 candidates, exports to ATS, subscribes', dep: 'Sprint 5 + Sprint 15' },
      { i: 18, n: 'NSDC + government registry', w: 'W43–44', m: 'Month 13', t: ['BE', 'GTM'], tasks: [
        { t: 'NSDC National Skills Passport API: push credentials', o: 'BE' },
        { t: 'NSQF tier mapping: TF tiers → NSQF levels 3–7', o: 'Product' },
        { t: 'NCS portal API: push verified profiles for job matching', o: 'BE' },
        { t: 'AICTE API stub: assessment data for credit mapping', o: 'BE' },
        { t: 'GTM: sign MOU with NSDC for credential recognition', o: 'GTM' },
        { t: 'State employment exchange pilot: 2 states', o: 'GTM' },
      ], dod: 'NSDC push live; NSQF mapping approved; MOU signed', dep: 'Sprint 16: SBT portfolio' },
      { i: 19, n: 'Security hardening + SOC 2', w: 'W45–46', m: 'Month 13', t: ['DevOps', 'QA'], tasks: [
        { t: 'DPDP Act 2023 compliance: data residency, consent, deletion', o: 'BE' },
        { t: 'SOC 2 Type II gap assessment with external auditor', o: 'DevOps' },
        { t: 'AI proctoring: webcam liveness + tab-switch detection', o: 'AI/ML' },
        { t: 'Full platform pen test: remediate all critical/high', o: 'QA' },
        { t: 'Solidity escrow contract audit by security firm', o: 'BC' },
        { t: 'Incident response playbook: SLA tiers, on-call rotation', o: 'DevOps' },
      ], dod: 'DPDP checklist done; pen test criticals = 0; SOC 2 roadmap signed', dep: 'Sprint 8: security baseline' },
      { i: 20, n: 'Series A readiness + Phase 3 review', w: 'W47–48', m: 'Month 14', t: ['GTM', 'Product'], tasks: [
        { t: 'Investor data room: live ARR, cohort retention, NPS', o: 'Product' },
        { t: 'Pitch deck v2: update with live traction', o: 'GTM' },
        { t: 'Series A target tracker: ₹4 Cr ARR + 50K MAU gap plan', o: 'Product' },
        { t: 'Employer reference programme: 5 marquee logos', o: 'GTM' },
        { t: 'Headcount plan: 30 → 50+ FTE breakdown', o: 'GTM' },
        { t: 'Phase 3 retro: blockchain adoption, NSDC status', o: 'Product' },
      ], dod: 'Data room complete; pitch deck live; VC outreach begins', dep: 'Sprints 15–19' },
    ],
  },
  {
    id: 4, name: 'AI Behavioral Engine + Scale', period: 'M15–24', color: '#BA7517', cl: 'rgba(186,117,23,0.08)',
    sprints: [
      { i: 21, n: 'AI Career Twin + Employability Score', w: 'W49–54', m: 'Month 15–16', t: ['AI/ML', 'BE'], tasks: [
        { t: 'Data pipeline: aggregate 12-month TFES + outcomes', o: 'AI/ML' },
        { t: 'Career Twin model v1: job-readiness prediction', o: 'AI/ML' },
        { t: 'Career Twin API: top-3 role recommendations', o: 'BE' },
        { t: 'ECS: TFES 40% + projects 25% + peer 15% + employer 20%', o: 'AI/ML' },
        { t: 'ECS update cadence: weekly, capped ±5 points', o: 'BE' },
        { t: 'ECS explainability UI: breakdown + improvement steps', o: 'FE' },
      ], dod: 'Career Twin live; ECS active with weekly updates; explainability shipped', dep: 'All Phase 1–3 data' },
      { i: 22, n: 'Outcome-based hiring + DAO governance', w: 'W55–58', m: 'Month 17–18', t: ['BC', 'BE', 'GTM'], tasks: [
        { t: 'OBH contract: 50% upfront + 50% at 90-day milestone', o: 'BC' },
        { t: '90-day performance tracker: employer rates at 30/60/90', o: 'BE' },
        { t: 'DAO structure: guild pool smart contracts', o: 'BC' },
        { t: 'Guild governance token: non-monetary, earned by top members', o: 'BC' },
        { t: 'Series A: target top-tier VCs with data room', o: 'GTM' },
        { t: 'Series A legal prep: term sheets, ESOP, cap table', o: 'GTM' },
      ], dod: 'OBH live with 10 pilots; Series A conversations started', dep: 'Sprint 7 + Sprint 20' },
      { i: 23, n: 'Enterprise GTM + localisation', w: 'W59–64', m: 'Month 19–21', t: ['GTM', 'FE', 'Product'], tasks: [
        { t: 'Enterprise tier: custom ATS, dedicated CSM, SLA', o: 'GTM' },
        { t: 'Localisation: Tamil, Telugu, Kannada, Hindi i18n', o: 'FE' },
        { t: 'Corporate CSR channel: sponsor free assessments', o: 'Product' },
        { t: 'Series A close: finalise round, begin hiring sprint', o: 'GTM' },
        { t: 'Enterprise reference wins: 3 lighthouse accounts', o: 'GTM' },
        { t: 'OBH expansion: 10 → 100 active contracts', o: 'GTM' },
      ], dod: 'Series A closed; 2 enterprise logos; localisation live; 40+ FTEs', dep: 'Sprint 21–22' },
      { i: 24, n: 'International expansion + Y3 scale', w: 'W65–72', m: 'Month 22–24', t: ['GTM', 'Product'], tasks: [
        { t: 'Singapore market entry: MOM credential alignment', o: 'GTM' },
        { t: 'UAE market entry: KHDA compliance + Arabic plan', o: 'GTM' },
        { t: 'DAO talent network launch: self-governed guilds', o: 'Product' },
        { t: 'AI data flywheel: 100K+ dataset retrains quarterly', o: 'AI/ML' },
        { t: 'Y3 ARR target: model path to ₹120 Cr', o: 'Product' },
        { t: 'Series B narrative: 12-month financial model', o: 'GTM' },
      ], dod: 'Singapore + UAE entry plans active; DAO guilds live; ₹120 Cr Y3 target', dep: 'Sprint 23: enterprise GTM' },
    ],
  },
];

type Sprint = (typeof PHASES)[number]['sprints'][number];

const ALL_SPRINTS = PHASES.flatMap((p) => p.sprints.map((s) => ({ ...s, phase: p })));

export default function SprintsPage() {
  const [activePhase, setActivePhase] = useState(0);
  const [activeSprint, setActiveSprint] = useState(0);
  const { toggleTask, isTaskDone, getSprintProgress, setCurrentSprint, getTaskAssignee } = useStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNotesKey, setActiveNotesKey] = useState<string | null>(null);

  const phase = PHASES[activePhase];
  const sprint = phase.sprints[activeSprint];
  const sprintProg = getSprintProgress(sprint.i, sprint.tasks.length);

  return (
    <main className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="page-tag" style={{ background: 'rgba(29,158,117,0.12)', color: 'var(--tf-teal)', border: '0.5px solid rgba(29,158,117,0.2)' }}>
            Sprint Breakdown
          </div>
          <h1 className="page-title">26 Sprints · 148 Tasks · 24 Months</h1>
          <p className="page-subtitle">
            Full sprint-level task breakdown across 4 phases, each with tasks, owners, and definition of done.
          </p>
        </div>
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="ti ti-search search-icon-left" aria-hidden="true" />
            <input
              type="text"
              className="search-input"
              placeholder="Search all 148 tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')} title="Clear search">
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="kpi-row">
        {[
          { label: 'Total sprints', value: '26' },
          { label: 'Sprint length', value: '2 weeks' },
          { label: 'Total tasks', value: '148' },
          { label: 'Horizon', value: '24 months' },
        ].map((k) => (
          <div className="mcard" key={k.label}>
            <p className="mcard-label">{k.label}</p>
            <p className="mcard-value">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Phase tabs */}
      <div className="phase-tabs">
        {PHASES.map((p, i) => (
          <button
            key={p.id}
            className={`ptb${i === activePhase ? ' active' : ''}`}
            style={i === activePhase ? { borderColor: p.color, color: p.color, background: p.cl, fontWeight: 500 } : {}}
            onClick={() => { setActivePhase(i); setActiveSprint(0); }}
          >
            <span style={{ fontSize: '11px', color: i === activePhase ? p.color : 'var(--color-text-tertiary)', marginRight: 4 }}>
              Phase {p.id}
            </span>
            {p.name}
          </button>
        ))}
      </div>

      {/* Sprint list + detail */}
      <div className="sprint-layout">
        <div>
          {phase.sprints.map((s, i) => {
            const sp = getSprintProgress(s.i, s.tasks.length);
            const act = i === activeSprint;
            return (
              <div
                key={s.i}
                className={`sprint-card${act ? ' active' : ''}`}
                style={act ? { borderColor: phase.color, background: phase.cl } : {}}
                onClick={() => { setActiveSprint(i); setCurrentSprint(s.i, activePhase); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: act ? phase.color : 'var(--color-text-tertiary)' }}>
                    Sprint {s.i} · {s.m}
                  </span>
                  <span style={{ fontSize: 10, color: sp.done === sp.total ? phase.color : 'var(--color-text-tertiary)' }}>
                    {sp.done}/{sp.total}
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: act ? 500 : 400, color: act ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {s.n}
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
                  {s.t.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sprint-detail-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 2 }}>
                Sprint {sprint.i} · {sprint.w} · {sprint.m}
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {sprint.n}
              </div>
            </div>
            <span className="pill" style={{ borderColor: phase.color, color: phase.color, flexShrink: 0 }}>
              {sprintProg.done}/{sprintProg.total}
            </span>
          </div>

          <div style={{ height: 3, background: 'var(--color-background-primary)', borderRadius: 2, margin: '10px 0 14px' }}>
            <div style={{
              height: 3,
              background: phase.color,
              borderRadius: 2,
              width: `${sprintProg.pct}%`,
              transition: 'width 0.3s',
            }} />
          </div>

          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Tasks
          </p>

          {searchQuery ? (
            <>
              <div className="search-results-header">
                <span className="search-results-title">Search Results for &ldquo;{searchQuery}&rdquo;</span>
                <span className="search-results-badge">{allMatches.length} matches</span>
              </div>
              {allMatches.map((match) => {
                const done = isTaskDone(match.sprintId, match.taskIdx);
                const taskKey = match.taskKey;
                const notesOpen = activeNotesKey === taskKey;
                const assigneeId = getTaskAssignee(taskKey);
                const assignee = assigneeId ? TEAM_MEMBERS.find((m) => m.id === assigneeId) : null;

                return (
                  <div
                    key={taskKey}
                    className={`task-row${done ? ' done' : ''}`}
                    style={{ flexWrap: 'wrap', cursor: 'default' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                      <div
                        className={`task-checkbox${done ? ' checked' : ''}`}
                        style={done ? { background: match.phaseColor, borderColor: match.phaseColor, cursor: 'pointer' } : { cursor: 'pointer' }}
                        onClick={() => {
                          toggleTask(match.sprintId, match.taskIdx);
                          toast(!done ? 'Task completed!' : 'Task marked incomplete', 'success');
                        }}
                      >
                        {done && (
                          <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
                            <path d="M1.5 4.5l2 2L7.5 2" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      <span
                        className="task-text"
                        style={{ cursor: 'pointer', flex: 1 }}
                        onClick={() => {
                          toggleTask(match.sprintId, match.taskIdx);
                          toast(!done ? 'Task completed!' : 'Task marked incomplete', 'success');
                        }}
                      >
                        <span className="search-task-sprint-badge" style={{ background: `${match.phaseColor}20`, color: match.phaseColor, border: `0.5px solid ${match.phaseColor}40` }}>
                          S{match.sprintId}
                        </span>
                        {match.t}
                      </span>

                      <span className="task-owner" style={{ borderColor: `${OWNER_COLORS[match.o] || '#888'}40`, color: OWNER_COLORS[match.o] || '#888' }}>
                        {match.o}
                      </span>

                      {assignee && (
                        <span className="dash-task-assignee" style={{ marginRight: 4 }}>
                          <span className={`dash-task-avatar ${assignee.avatarColor}`} style={{ width: 14, height: 14, fontSize: 6 }}>
                            {assignee.avatar}
                          </span>
                          {assignee.name.split(' ')[0]}
                        </span>
                      )}

                      <TaskNoteIndicator taskKey={taskKey} />

                      <TaskAssign taskKey={taskKey} />

                      <button
                        className={`task-notes-trigger-btn${notesOpen ? ' active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveNotesKey(notesOpen ? null : taskKey); }}
                        title="Edit task notes"
                      >
                        <i className="ti ti-note" aria-hidden="true" />
                      </button>
                    </div>

                    <TaskNotes taskKey={taskKey} isOpen={notesOpen} onClose={() => setActiveNotesKey(null)} />
                  </div>
                );
              })}
              {allMatches.length === 0 && (
                <div className="dash-empty">
                  <i className="ti ti-search" style={{ fontSize: 24, color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                  <p>No matching tasks found</p>
                </div>
              )}
            </>
          ) : (
            sprint.tasks.map((task, i) => {
              const done = isTaskDone(sprint.i, i);
              const taskKey = `sprint-${sprint.i}-task-${i}`;
              const notesOpen = activeNotesKey === taskKey;
              const assigneeId = getTaskAssignee(taskKey);
              const assignee = assigneeId ? TEAM_MEMBERS.find((m) => m.id === assigneeId) : null;

              return (
                <div
                  key={i}
                  className={`task-row${done ? ' done' : ''}`}
                  style={{ flexWrap: 'wrap', cursor: 'default' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                    <div
                      className={`task-checkbox${done ? ' checked' : ''}`}
                      style={done ? { background: phase.color, borderColor: phase.color, cursor: 'pointer' } : { cursor: 'pointer' }}
                      onClick={() => {
                        toggleTask(sprint.i, i);
                        toast(!done ? 'Task completed!' : 'Task marked incomplete', 'success');
                      }}
                    >
                      {done && (
                        <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
                          <path d="M1.5 4.5l2 2L7.5 2" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    <span
                      className="task-text"
                      style={{ cursor: 'pointer', flex: 1 }}
                      onClick={() => {
                        toggleTask(sprint.i, i);
                        toast(!done ? 'Task completed!' : 'Task marked incomplete', 'success');
                      }}
                    >
                      {task.t}
                    </span>

                    <span className="task-owner" style={{ borderColor: `${OWNER_COLORS[task.o] || '#888'}40`, color: OWNER_COLORS[task.o] || '#888' }}>
                      {task.o}
                    </span>

                    {assignee && (
                      <span className="dash-task-assignee" style={{ marginRight: 4 }}>
                        <span className={`dash-task-avatar ${assignee.avatarColor}`} style={{ width: 14, height: 14, fontSize: 6 }}>
                          {assignee.avatar}
                        </span>
                        {assignee.name.split(' ')[0]}
                      </span>
                    )}

                    <TaskNoteIndicator taskKey={taskKey} />

                    <TaskAssign taskKey={taskKey} />

                    <button
                      className={`task-notes-trigger-btn${notesOpen ? ' active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setActiveNotesKey(notesOpen ? null : taskKey); }}
                      title="Edit task notes"
                    >
                      <i className="ti ti-note" aria-hidden="true" />
                    </button>
                  </div>

                  <TaskNotes taskKey={taskKey} isOpen={notesOpen} onClose={() => setActiveNotesKey(null)} />
                </div>
              );
            })
          )}

          <div style={{ marginTop: 14, background: 'var(--color-background-tertiary)', borderRadius: 'var(--border-radius-md)', padding: '10px 12px' }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
              Definition of done
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {sprint.dod}
            </p>
          </div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <i className="ti ti-git-branch" style={{ fontSize: 13, color: 'var(--color-text-tertiary)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{sprint.dep}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
