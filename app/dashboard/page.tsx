'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useAuth, TEAM_MEMBERS } from '@/lib/auth';
import TaskAssign from '@/components/TaskAssign';
import TaskNotes, { TaskNoteIndicator } from '@/components/TaskNotes';
import { useToast } from '@/components/Toast';

/* ─── Sprint Data (shared with sprints page) ───────────── */
const PHASES = [
  {
    id: 1, name: 'Foundation MVP', period: 'M1–4', color: '#1D9E75', icon: 'ti-rocket',
    sprints: [
      { i: 1, n: 'Infrastructure & architecture', w: 'W1–2', m: 'M1', t: ['DevOps', 'BE'], tasks: [
        { t: 'GCP project setup: GKE cluster, VPC, IAM roles, Cloud Armor WAF', o: 'DevOps' },
        { t: 'Monorepo bootstrap: Node.js (API), FastAPI (AI), React 18, React Native', o: 'BE' },
        { t: 'Database layer: PostgreSQL + MongoDB + Redis', o: 'BE' },
        { t: 'Elasticsearch cluster for talent search', o: 'BE' },
        { t: 'Auth service: mobile OTP + JWT, role-based access', o: 'BE' },
        { t: 'CI/CD pipeline: GitHub Actions → staging auto-deploy', o: 'DevOps' },
      ]},
      { i: 2, n: 'AI assessment engine core', w: 'W3–4', m: 'M1', t: ['AI/ML', 'BE'], tasks: [
        { t: 'GPT-4o API integration for NLP scoring', o: 'AI/ML' },
        { t: 'Adaptive question bank schema', o: 'AI/ML' },
        { t: 'IRT engine: real-time difficulty adjustment', o: 'AI/ML' },
        { t: 'TFES v1 algorithm: technical 40%, cognitive 30%, behavioral 30%', o: 'AI/ML' },
        { t: 'Question bank seed: 200 questions', o: 'Product' },
        { t: 'Assessment session API', o: 'BE' },
      ]},
      { i: 3, n: 'Student UI + PWA shell', w: 'W5–6', m: 'M2', t: ['FE', 'Product'], tasks: [
        { t: 'Registration flow: mobile OTP, domain selection', o: 'FE' },
        { t: 'Assessment UI: adaptive question renderer', o: 'FE' },
        { t: 'TFES score card: radar chart', o: 'FE' },
        { t: 'PWA shell: service worker, offline mode', o: 'FE' },
        { t: 'Career pathway mapper: GPT-4o suggestions', o: 'AI/ML' },
        { t: 'React Native stub scaffolded', o: 'FE' },
      ]},
      { i: 4, n: 'CIE v1 — CS + ECE grading', w: 'W7–8', m: 'M2', t: ['CIE', 'BE'], tasks: [
        { t: 'Docker-sandboxed code execution', o: 'CIE' },
        { t: 'CS auto-grader: compile → test → score', o: 'CIE' },
        { t: 'ngspice integration: circuit simulation', o: 'CIE' },
        { t: 'ECE waveform comparator', o: 'CIE' },
        { t: 'CIE submission API: async job queue', o: 'BE' },
        { t: 'Plagiarism layer: AST-based similarity', o: 'AI/ML' },
      ]},
      { i: 5, n: 'Marketplace — employer side', w: 'W9–10', m: 'M3', t: ['BE', 'FE'], tasks: [
        { t: 'Employer registration + KYC lite', o: 'BE' },
        { t: 'Project posting form: scope, budget, tier', o: 'FE' },
        { t: 'AI matching engine v1', o: 'AI/ML' },
        { t: 'Employer dashboard: pipeline kanban', o: 'FE' },
        { t: 'Escrow flow: Razorpay → milestone release', o: 'BE' },
        { t: 'Intern acceptance flow', o: 'FE' },
      ]},
      { i: 6, n: 'College white-label dashboard', w: 'W11–12', m: 'M3', t: ['FE', 'BE'], tasks: [
        { t: 'College admin portal: cohort management', o: 'FE' },
        { t: 'Placement analytics dashboard', o: 'FE' },
        { t: 'White-label config: logo, colors, subdomain', o: 'FE' },
        { t: 'College bulk assessment', o: 'BE' },
        { t: 'PDF placement report', o: 'BE' },
        { t: 'Role-based college access', o: 'BE' },
      ]},
      { i: 7, n: 'Blockchain credential layer v1', w: 'W13–14', m: 'M4', t: ['BC', 'BE'], tasks: [
        { t: 'Solidity smart contract on Polygon PoS (ERC-721)', o: 'BC' },
        { t: 'IPFS integration via Web3.Storage', o: 'BC' },
        { t: 'Batch minting job: nightly cron', o: 'BC' },
        { t: 'Credential verification API', o: 'BC' },
        { t: 'Student credential wallet UI', o: 'FE' },
        { t: 'Mainnet migration: Polygon PoS', o: 'BC' },
      ]},
      { i: 8, n: 'QA hardening + pilot launch', w: 'W15–16', m: 'M4', t: ['QA', 'GTM'], tasks: [
        { t: 'E2E test suite: Playwright', o: 'QA' },
        { t: 'Load test: 500 concurrent with k6', o: 'DevOps' },
        { t: 'OWASP Top-10 security review', o: 'QA' },
        { t: 'Mixpanel event tracking', o: 'Product' },
        { t: 'GTM: 3 pilot colleges', o: 'GTM' },
        { t: 'GTM: 5 employer accounts', o: 'GTM' },
      ]},
    ],
  },
  {
    id: 2, name: 'Gamification + Engagement', period: 'M5–9', color: '#7F77DD', icon: 'ti-trophy',
    sprints: [
      { i: 9, n: 'XP engine + progression tiers', w: 'W17–18', m: 'M5', t: ['BE', 'FE'], tasks: [
        { t: 'XP schema: events → XP values', o: 'BE' },
        { t: '5-tier level-up logic', o: 'BE' },
        { t: 'Badge engine: 30 starter badges', o: 'Product' },
        { t: 'Student profile v2: animated XP bar', o: 'FE' },
        { t: 'FCM push notifications', o: 'BE' },
        { t: 'Daily micro-challenge: GPT-4o', o: 'AI/ML' },
      ]},
      { i: 10, n: 'Missions, leagues + leaderboard', w: 'W19–20', m: 'M5', t: ['Product', 'FE'], tasks: [
        { t: 'Mission builder (admin)', o: 'Product' },
        { t: 'Weekly Skill League: auto-rank', o: 'BE' },
        { t: 'Leaderboard UI: tabs', o: 'FE' },
        { t: 'Sprint feed: mission cards', o: 'FE' },
        { t: 'Mission completion pipeline', o: 'BE' },
        { t: 'Email digest: weekly rank', o: 'BE' },
      ]},
      { i: 11, n: 'CIE Mechanical — CAD + FEA', w: 'W21–24', m: 'M6–7', t: ['CIE', 'DevOps'], tasks: [
        { t: 'CAD file parser: SolidWorks + AutoCAD', o: 'CIE' },
        { t: 'CAD evaluation rubric', o: 'CIE' },
        { t: 'FEA result grader', o: 'CIE' },
        { t: 'Kinematics validator', o: 'CIE' },
        { t: 'GPU-backed node pool', o: 'DevOps' },
        { t: 'Mechanical mission pack: 20 challenges', o: 'Product' },
      ]},
      { i: 12, n: 'Non-tech simulations + Work Lab', w: 'W25–28', m: 'M7–8', t: ['AI/ML', 'FE'], tasks: [
        { t: 'Sales simulation: AI roleplay', o: 'AI/ML' },
        { t: 'Written communication grader', o: 'AI/ML' },
        { t: 'Negotiation engine: dialogue sim', o: 'AI/ML' },
        { t: 'Browser-based IDE: Monaco', o: 'FE' },
        { t: 'In-browser circuit sim: ngspice WASM', o: 'CIE' },
        { t: 'Team project mode: async workspace', o: 'BE' },
      ]},
      { i: 13, n: 'Community pods + peer review', w: 'W29–30', m: 'M8', t: ['BE', 'FE'], tasks: [
        { t: 'Pod model: domain groups', o: 'BE' },
        { t: 'Pod async feed: threads, upvoting', o: 'FE' },
        { t: 'Peer review engine', o: 'BE' },
        { t: 'Reviewer quality score', o: 'BE' },
        { t: 'Review XP economy', o: 'BE' },
        { t: 'Moderation tools', o: 'AI/ML' },
      ]},
      { i: 14, n: 'WhatsApp referral flywheel', w: 'W31–32', m: 'M9', t: ['BE', 'GTM'], tasks: [
        { t: 'WhatsApp Business API', o: 'BE' },
        { t: 'Referral engine: unique code, fraud guard', o: 'BE' },
        { t: 'Campus ambassador portal', o: 'FE' },
        { t: 'GTM: 100 college ambassador programme', o: 'GTM' },
        { t: 'Y1 ARR live tracker', o: 'Product' },
        { t: 'Phase 2 retro', o: 'Product' },
      ]},
    ],
  },
  {
    id: 3, name: 'Blockchain + Trust', period: 'M10–14', color: '#378ADD', icon: 'ti-link',
    sprints: [
      { i: 15, n: 'NFT credential marketplace', w: 'W33–36', m: 'M10', t: ['BC', 'FE'], tasks: [
        { t: 'Credential marketplace UI', o: 'FE' },
        { t: 'Employer verification portal', o: 'FE' },
        { t: 'Public credential share page', o: 'FE' },
        { t: 'Credential revocation: smart contract', o: 'BC' },
        { t: 'LinkedIn deep-link export', o: 'FE' },
        { t: 'Credential analytics', o: 'BE' },
      ]},
      { i: 16, n: 'Soulbound tokens + portfolio', w: 'W37–38', m: 'M11', t: ['BC', 'BE'], tasks: [
        { t: 'SBT contract: ERC-5114', o: 'BC' },
        { t: 'SBT issuance pipeline', o: 'BC' },
        { t: 'On-chain proof-of-work', o: 'BC' },
        { t: 'Portfolio page: timeline', o: 'FE' },
        { t: 'Gas optimisation: batch minting', o: 'BC' },
        { t: 'IPFS pinning: 3 nodes', o: 'BC' },
      ]},
      { i: 17, n: 'Employer SaaS + ATS', w: 'W39–42', m: 'M12', t: ['BE', 'Product'], tasks: [
        { t: 'Enterprise dashboard: bulk screening', o: 'BE' },
        { t: 'ATS connectors: Greenhouse, Lever', o: 'BE' },
        { t: 'Candidate scorecard API', o: 'BE' },
        { t: 'Bulk JD matching: GPT-4o', o: 'AI/ML' },
        { t: 'Hiring analytics', o: 'FE' },
        { t: 'Employer SaaS billing', o: 'BE' },
      ]},
      { i: 18, n: 'NSDC + government registry', w: 'W43–44', m: 'M13', t: ['BE', 'GTM'], tasks: [
        { t: 'NSDC National Skills Passport API', o: 'BE' },
        { t: 'NSQF tier mapping', o: 'Product' },
        { t: 'NCS portal API', o: 'BE' },
        { t: 'AICTE API stub', o: 'BE' },
        { t: 'GTM: sign MOU with NSDC', o: 'GTM' },
        { t: 'State employment exchange pilot', o: 'GTM' },
      ]},
      { i: 19, n: 'Security hardening + SOC 2', w: 'W45–46', m: 'M13', t: ['DevOps', 'QA'], tasks: [
        { t: 'DPDP Act 2023 compliance', o: 'BE' },
        { t: 'SOC 2 Type II gap assessment', o: 'DevOps' },
        { t: 'AI proctoring: webcam + tab detection', o: 'AI/ML' },
        { t: 'Full platform pen test', o: 'QA' },
        { t: 'Solidity escrow contract audit', o: 'BC' },
        { t: 'Incident response playbook', o: 'DevOps' },
      ]},
      { i: 20, n: 'Series A readiness', w: 'W47–48', m: 'M14', t: ['GTM', 'Product'], tasks: [
        { t: 'Investor data room', o: 'Product' },
        { t: 'Pitch deck v2', o: 'GTM' },
        { t: 'Series A target tracker', o: 'Product' },
        { t: 'Employer reference programme', o: 'GTM' },
        { t: 'Headcount plan: 30 → 50+', o: 'GTM' },
        { t: 'Phase 3 retro', o: 'Product' },
      ]},
    ],
  },
  {
    id: 4, name: 'AI Behavioral + Scale', period: 'M15–24', color: '#BA7517', icon: 'ti-brain',
    sprints: [
      { i: 21, n: 'AI Career Twin + ECS', w: 'W49–54', m: 'M15–16', t: ['AI/ML', 'BE'], tasks: [
        { t: 'Data pipeline: aggregate TFES + outcomes', o: 'AI/ML' },
        { t: 'Career Twin model v1', o: 'AI/ML' },
        { t: 'Career Twin API: top-3 roles', o: 'BE' },
        { t: 'ECS: composite scoring', o: 'AI/ML' },
        { t: 'ECS update cadence: weekly', o: 'BE' },
        { t: 'ECS explainability UI', o: 'FE' },
      ]},
      { i: 22, n: 'Outcome-based hiring + DAO', w: 'W55–58', m: 'M17–18', t: ['BC', 'BE'], tasks: [
        { t: 'OBH contract: 50%+50% model', o: 'BC' },
        { t: '90-day performance tracker', o: 'BE' },
        { t: 'DAO structure: guild pool contracts', o: 'BC' },
        { t: 'Guild governance token', o: 'BC' },
        { t: 'Series A: target top-tier VCs', o: 'GTM' },
        { t: 'Series A legal prep', o: 'GTM' },
      ]},
      { i: 23, n: 'Enterprise GTM + localisation', w: 'W59–64', m: 'M19–21', t: ['GTM', 'FE'], tasks: [
        { t: 'Enterprise tier: custom ATS, SLA', o: 'GTM' },
        { t: 'Localisation: Tamil, Telugu, Kannada, Hindi', o: 'FE' },
        { t: 'Corporate CSR channel', o: 'Product' },
        { t: 'Series A close', o: 'GTM' },
        { t: 'Enterprise reference wins: 3 logos', o: 'GTM' },
        { t: 'OBH expansion: 10 → 100', o: 'GTM' },
      ]},
      { i: 24, n: 'International expansion', w: 'W65–72', m: 'M22–24', t: ['GTM', 'Product'], tasks: [
        { t: 'Singapore market entry', o: 'GTM' },
        { t: 'UAE market entry', o: 'GTM' },
        { t: 'DAO talent network launch', o: 'Product' },
        { t: 'AI data flywheel: 100K+ dataset', o: 'AI/ML' },
        { t: 'Y3 ARR target: ₹120 Cr', o: 'Product' },
        { t: 'Series B narrative', o: 'GTM' },
      ]},
    ],
  },
];

const ALL_SPRINTS = PHASES.flatMap((p) => p.sprints.map((s) => ({ ...s, phase: p })));

const OWNER_COLORS: Record<string, string> = {
  DevOps: '#5BA3E0', BE: '#1D9E75', 'AI/ML': '#9B93F0', FE: '#D85A30',
  Product: '#BA7517', CIE: '#E06060', BC: '#378ADD', QA: '#7BBF44',
  GTM: '#D4A040',
};

export default function DashboardPage() {
  const { user, users } = useAuth();
  const { toggleTask, isTaskDone, getSprintProgress, setCurrentSprint, getTaskAssignee, getOverallProgress, progress } = useStore();
  const { toast } = useToast();
  const [selectedSprint, setSelectedSprint] = useState(progress.currentSprintId);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNotesKey, setActiveNotesKey] = useState<string | null>(null);

  const overall = getOverallProgress();
  const sprint = ALL_SPRINTS.find((s) => s.i === selectedSprint) || ALL_SPRINTS[0];
  const sp = getSprintProgress(sprint.i, sprint.tasks.length);

  // Calculate stats per phase
  const phaseStats = PHASES.map((p) => {
    let total = 0;
    let done = 0;
    p.sprints.forEach((s) => {
      s.tasks.forEach((_, taskIdx) => {
        total++;
        if (isTaskDone(s.i, taskIdx)) done++;
      });
    });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      period: p.period,
      total,
      done,
      pct,
    };
  });

  // Team workload: count assigned tasks per team member
  const workload = users.reduce<Record<string, number>>((acc, m) => {
    acc[m.id] = progress.assignments.filter((a) => a.assigneeId === m.id).length;
    return acc;
  }, {});

  // Filter tasks
  const filteredTasks = sprint.tasks.filter((_, i) => {
    if (filter === 'todo') return !isTaskDone(sprint.i, i);
    if (filter === 'done') return isTaskDone(sprint.i, i);
    return true;
  });

  // Global search matching
  const allMatches = ALL_SPRINTS.flatMap((s) =>
    s.tasks.map((t, idx) => ({
      ...t,
      sprintId: s.i,
      sprintName: s.n,
      phaseColor: s.phase.color,
      taskIdx: idx,
      taskKey: `sprint-${s.i}-task-${idx}`
    }))
  ).filter(t =>
    t.t.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.o.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Owner distribution for current sprint
  const ownerCounts: Record<string, { total: number; done: number }> = {};
  sprint.tasks.forEach((task, i) => {
    if (!ownerCounts[task.o]) ownerCounts[task.o] = { total: 0, done: 0 };
    ownerCounts[task.o].total++;
    if (isTaskDone(sprint.i, i)) ownerCounts[task.o].done++;
  });

  return (
    <main className="dash">
      {/* ── Sidebar ──────────────────────────────────── */}
      <aside className={`dash-sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="dash-sidebar-header">
          <span className="dash-sidebar-title">
            {!sidebarCollapsed && 'Sprints'}
          </span>
          <button className="dash-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
            <i className={`ti ti-layout-sidebar-left-${sidebarCollapsed ? 'expand' : 'collapse'}`} aria-hidden="true" />
          </button>
        </div>

        <div className="dash-sidebar-body">
          {PHASES.map((phase) => (
            <div key={phase.id} className="dash-phase-group">
              {!sidebarCollapsed && (
                <div className="dash-phase-label" style={{ color: phase.color }}>
                  <i className={`ti ${phase.icon}`} style={{ fontSize: 12 }} aria-hidden="true" />
                  <span>Phase {phase.id} · {phase.period}</span>
                </div>
              )}
              {phase.sprints.map((s) => {
                const p = getSprintProgress(s.i, s.tasks.length);
                const active = s.i === selectedSprint;
                return (
                  <button
                    key={s.i}
                    className={`dash-sprint-btn${active ? ' active' : ''}`}
                    style={active ? { borderColor: phase.color, background: `${phase.color}10` } : {}}
                    onClick={() => { setSelectedSprint(s.i); setCurrentSprint(s.i, phase.id - 1); }}
                    title={sidebarCollapsed ? `Sprint ${s.i}: ${s.n}` : undefined}
                  >
                    <div className="dash-sprint-num" style={active ? { color: phase.color } : {}}>
                      {sidebarCollapsed ? s.i : `S${s.i}`}
                    </div>
                    {!sidebarCollapsed && (
                      <>
                        <div className="dash-sprint-info">
                          <div className="dash-sprint-name">{s.n}</div>
                          <div className="dash-sprint-meta">{s.w} · {p.done}/{p.total}</div>
                        </div>
                        <div className="dash-sprint-ring">
                          <svg width="20" height="20" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="8" fill="none" stroke="var(--color-border-tertiary)" strokeWidth="2" />
                            <circle
                              cx="10" cy="10" r="8" fill="none"
                              stroke={p.pct === 100 ? phase.color : 'var(--color-text-tertiary)'}
                              strokeWidth="2"
                              strokeDasharray={`${p.pct * 0.5} 50`}
                              strokeLinecap="round"
                              transform="rotate(-90 10 10)"
                            />
                          </svg>
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="dash-main">
        {/* Stats row */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: 'rgba(29,158,117,0.12)', color: '#1D9E75' }}>
              <i className="ti ti-chart-pie" aria-hidden="true" />
            </div>
            <div>
              <div className="dash-stat-value">{overall.pct}%</div>
              <div className="dash-stat-label">Overall progress</div>
            </div>
            <div className="dash-stat-bar">
              <div className="dash-stat-bar-fill" style={{ width: `${overall.pct}%`, background: '#1D9E75' }} />
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: 'rgba(127,119,221,0.12)', color: '#9B93F0' }}>
              <i className="ti ti-checkbox" aria-hidden="true" />
            </div>
            <div>
              <div className="dash-stat-value">{overall.totalDone}<span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 400 }}>/{overall.totalTasks}</span></div>
              <div className="dash-stat-label">Tasks completed</div>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: `${sprint.phase.color}18`, color: sprint.phase.color }}>
              <i className="ti ti-flame" aria-hidden="true" />
            </div>
            <div>
              <div className="dash-stat-value">Sprint {sprint.i}</div>
              <div className="dash-stat-label">{sprint.n}</div>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: 'rgba(186,117,23,0.12)', color: '#BA7517' }}>
              <i className="ti ti-users" aria-hidden="true" />
            </div>
            <div>
              <div className="dash-stat-value">{progress.assignments.length}</div>
              <div className="dash-stat-label">Assigned tasks</div>
            </div>
          </div>
        </div>

        {/* Sprint detail header */}
        <div className="dash-section-header">
          <div>
            <h2 className="dash-section-title">
              <span className="dash-sprint-badge" style={{ background: `${sprint.phase.color}18`, color: sprint.phase.color }}>
                Sprint {sprint.i}
              </span>
              {sprint.n}
            </h2>
            <div className="dash-section-meta">
              {sprint.w} · {sprint.m} · {sprint.t.map((tag) => (
                <span key={tag} className="tag" style={{ marginLeft: 4 }}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="dash-sprint-progress">
            <span className="dash-sprint-pct" style={{ color: sprint.phase.color }}>{sp.pct}%</span>
            <div className="dash-sprint-bar">
              <div className="dash-sprint-bar-fill" style={{ width: `${sp.pct}%`, background: sprint.phase.color }} />
            </div>
            <span className="dash-sprint-count">{sp.done}/{sp.total}</span>
          </div>
        </div>

        {/* Filters & Search row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
          <div className="dash-filters" style={{ marginBottom: 0 }}>
            {(['all', 'todo', 'done'] as const).map((f) => (
              <button
                key={f}
                className={`dash-filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? `All (${sprint.tasks.length})` : f === 'todo' ? `To do (${sprint.tasks.length - sp.done})` : `Done (${sp.done})`}
              </button>
            ))}
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

        {/* Task list */}
        <div className="dash-task-list">
          {searchQuery ? (
            <>
              <div className="search-results-header">
                <span className="search-results-title">Search Results for &ldquo;{searchQuery}&rdquo;</span>
                <span className="search-results-badge">{allMatches.length} matches</span>
              </div>
              {allMatches.map((match) => {
                const done = isTaskDone(match.sprintId, match.taskIdx);
                const notesOpen = activeNotesKey === match.taskKey;
                const assigneeId = getTaskAssignee(match.taskKey);
                const assignee = assigneeId ? TEAM_MEMBERS.find((m) => m.id === assigneeId) : null;
                return (
                  <div key={match.taskKey} className={`dash-task${done ? ' done' : ''}`} style={{ flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: '100%' }}>
                      <button
                        className={`dash-task-check${done ? ' checked' : ''}`}
                        style={done ? { background: match.phaseColor, borderColor: match.phaseColor } : {}}
                        onClick={() => {
                          toggleTask(match.sprintId, match.taskIdx);
                          toast(!done ? 'Task completed!' : 'Task marked incomplete', 'success');
                        }}
                      >
                        {done && (
                          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                      </button>
                      <div className="dash-task-body">
                        <div className="dash-task-text">
                          <span className="search-task-sprint-badge" style={{ background: `${match.phaseColor}20`, color: match.phaseColor, border: `0.5px solid ${match.phaseColor}40` }}>
                            S{match.sprintId}
                          </span>
                          {match.t}
                        </div>
                        <div className="dash-task-tags">
                          <span className="dash-task-owner" style={{ borderColor: `${OWNER_COLORS[match.o] || '#888'}40`, color: OWNER_COLORS[match.o] || '#888' }}>
                            {match.o}
                          </span>
                          {assignee && (
                            <span className="dash-task-assignee">
                              <span className={`dash-task-avatar ${assignee.avatarColor}`}>{assignee.avatar}</span>
                              {assignee.name.split(' ')[0]}
                            </span>
                          )}
                          <TaskNoteIndicator taskKey={match.taskKey} />
                        </div>
                      </div>
                      <TaskAssign taskKey={match.taskKey} />
                      <button
                        className={`task-notes-trigger-btn${notesOpen ? ' active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveNotesKey(notesOpen ? null : match.taskKey); }}
                        title="Edit task notes"
                      >
                        <i className="ti ti-note" aria-hidden="true" />
                      </button>
                    </div>
                    <TaskNotes taskKey={match.taskKey} isOpen={notesOpen} onClose={() => setActiveNotesKey(null)} />
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
            <>
              {filteredTasks.map((task) => {
                const origIdx = sprint.tasks.indexOf(task);
                const done = isTaskDone(sprint.i, origIdx);
                const taskKey = `sprint-${sprint.i}-task-${origIdx}`;
                const assigneeId = getTaskAssignee(taskKey);
                const assignee = assigneeId ? TEAM_MEMBERS.find((m) => m.id === assigneeId) : null;
                const notesOpen = activeNotesKey === taskKey;

                return (
                  <div key={origIdx} className={`dash-task${done ? ' done' : ''}`} style={{ flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: '100%' }}>
                      <button
                        className={`dash-task-check${done ? ' checked' : ''}`}
                        style={done ? { background: sprint.phase.color, borderColor: sprint.phase.color } : {}}
                        onClick={() => {
                          toggleTask(sprint.i, origIdx);
                          toast(!done ? 'Task completed!' : 'Task marked incomplete', 'success');
                        }}
                      >
                        {done && (
                          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                      </button>
                      <div className="dash-task-body">
                        <div className="dash-task-text">{task.t}</div>
                        <div className="dash-task-tags">
                          <span className="dash-task-owner" style={{ borderColor: `${OWNER_COLORS[task.o] || '#888'}40`, color: OWNER_COLORS[task.o] || '#888' }}>
                            {task.o}
                          </span>
                          {assignee && (
                            <span className="dash-task-assignee">
                              <span className={`dash-task-avatar ${assignee.avatarColor}`}>{assignee.avatar}</span>
                              {assignee.name.split(' ')[0]}
                            </span>
                          )}
                          <TaskNoteIndicator taskKey={taskKey} />
                        </div>
                      </div>
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
              {filteredTasks.length === 0 && (
                <div className="dash-empty">
                  <i className="ti ti-checks" style={{ fontSize: 24, color: sprint.phase.color }} aria-hidden="true" />
                  <p>{filter === 'done' ? 'No completed tasks yet' : 'All tasks completed!'}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom panels: Owner breakdown + Team workload */}
        <div className="dash-panels">
          <div className="dash-panel" style={{ gridColumn: 'span 2' }}>
            <h3 className="dash-panel-title"><i className="ti ti-chart-pie" aria-hidden="true" /> Project Status Overview</h3>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
              {/* Radial/Donut Chart */}
              <div style={{ position: 'relative', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, margin: '0 auto' }}>
                <svg width="110" height="110" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="45" fill="none" stroke="var(--color-background-primary)" strokeWidth="10" />
                  <circle
                    cx="55" cy="55" r="45" fill="none"
                    stroke="var(--tf-teal)"
                    strokeWidth="10"
                    strokeDasharray={`${overall.pct * 2.82} 282`}
                    strokeLinecap="round"
                    transform="rotate(-90 55 55)"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{overall.pct}%</div>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complete</div>
                </div>
              </div>

              {/* Phase stats list */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', width: '100%' }}>
                {phaseStats.map((p) => (
                  <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        Phase {p.id}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: p.color }}>
                        {p.pct}%
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'var(--color-background-primary)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                        {p.done} / {p.total} tasks
                      </span>
                      <span style={{ fontSize: '9px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                        {p.period}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dash-panel">
            <h3 className="dash-panel-title"><i className="ti ti-chart-bar" aria-hidden="true" /> Owner Breakdown</h3>
            {Object.entries(ownerCounts).map(([owner, { total, done }]) => (
              <div key={owner} className="dash-owner-row">
                <span className="dash-owner-name" style={{ color: OWNER_COLORS[owner] || '#888' }}>{owner}</span>
                <div className="dash-owner-bar-track">
                  <div className="dash-owner-bar-fill" style={{ width: `${(done / total) * 100}%`, background: OWNER_COLORS[owner] || '#888' }} />
                </div>
                <span className="dash-owner-count">{done}/{total}</span>
              </div>
            ))}
          </div>

          <div className="dash-panel">
            <h3 className="dash-panel-title"><i className="ti ti-users" aria-hidden="true" /> Team Workload</h3>
            {users.map((m) => (
              <div key={m.id} className="dash-team-row">
                <span className={`dash-team-avatar ${m.avatarColor}`}>{m.avatar}</span>
                <span className="dash-team-name">{m.name}</span>
                <span className="dash-team-role">{m.role}</span>
                <span className="dash-team-count">{workload[m.id] || 0} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
