'use client';

import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  developer: 'Developer',
  designer: 'Designer',
  pm: 'Project Manager',
  devops: 'DevOps',
  qa: 'QA Engineer',
};

export default function UserBar() {
  const { user, logout } = useAuth();
  const { progress, getOverallProgress } = useStore();

  if (!user) return null;

  const overall = getOverallProgress();

  return (
    <div className="user-bar">
      <div className="user-bar-left">
        <div className={`user-bar-avatar ${user.avatarColor}`}>{user.avatar}</div>
        <div>
          <div className="user-bar-name">{user.name}</div>
          <div className="user-bar-role">{ROLE_LABELS[user.role] || user.role}</div>
        </div>
      </div>

      <div className="user-bar-center">
        <div className="user-bar-stat">
          <span className="user-bar-stat-label">Current Sprint</span>
          <span className="user-bar-stat-value">#{progress.currentSprintId}</span>
        </div>
        <div className="user-bar-divider" />
        <div className="user-bar-stat">
          <span className="user-bar-stat-label">Tasks Done</span>
          <span className="user-bar-stat-value">{overall.totalDone}/{overall.totalTasks}</span>
        </div>
        <div className="user-bar-divider" />
        <div className="user-bar-stat">
          <span className="user-bar-stat-label">Progress</span>
          <div className="user-bar-progress">
            <div className="user-bar-progress-track">
              <div className="user-bar-progress-fill" style={{ width: `${overall.pct}%` }} />
            </div>
            <span className="user-bar-stat-value">{overall.pct}%</span>
          </div>
        </div>
      </div>

      <button className="user-bar-logout" onClick={logout} title="Sign out">
        <i className="ti ti-logout" aria-hidden="true" />
      </button>
    </div>
  );
}
