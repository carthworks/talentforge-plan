'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { TEAM_MEMBERS, User } from '@/lib/auth';
import { useToast } from './Toast';

export default function TaskAssign({ taskKey }: { taskKey: string }) {
  const { getTaskAssignee, assignTask, unassignTask } = useStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const assigneeId = getTaskAssignee(taskKey);
  const assignee = assigneeId ? TEAM_MEMBERS.find((u) => u.id === assigneeId) : null;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleAssign = (user: User) => {
    assignTask(taskKey, user.id);
    toast(`Assigned task to ${user.name}`, 'info');
    setOpen(false);
  };

  const handleUnassign = () => {
    unassignTask(taskKey);
    toast(`Task unassigned`, 'info');
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className={`assign-btn${assignee ? ' assigned' : ''}`}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        title={assignee ? `Assigned to ${assignee.name}` : 'Assign team member'}
      >
        {assignee ? (
          <>
            <span className={`user-bar-avatar ${assignee.avatarColor}`} style={{ width: 16, height: 16, fontSize: 7 }}>
              {assignee.avatar}
            </span>
            {assignee.name.split(' ')[0]}
          </>
        ) : (
          <>
            <i className="ti ti-user-plus" style={{ fontSize: 10 }} aria-hidden="true" />
            Assign
          </>
        )}
      </button>

      {open && (
        <div className="assign-dropdown" onClick={(e) => e.stopPropagation()}>
          {TEAM_MEMBERS.map((user) => (
            <button
              key={user.id}
              className="assign-dropdown-item"
              onClick={() => handleAssign(user)}
            >
              <span className={`user-bar-avatar ${user.avatarColor}`}>{user.avatar}</span>
              <span className="assign-dropdown-name">{user.name}</span>
              <span className="assign-dropdown-role">{user.role}</span>
            </button>
          ))}
          {assignee && (
            <button className="assign-dropdown-unassign" onClick={handleUnassign}>
              <i className="ti ti-x" style={{ fontSize: 12 }} aria-hidden="true" />
              Unassign
            </button>
          )}
        </div>
      )}
    </div>
  );
}
