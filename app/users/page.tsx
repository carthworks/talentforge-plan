'use client';

import { useState } from 'react';
import { useAuth, User } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/Toast';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  developer: 'Developer',
  designer: 'Designer',
  pm: 'Project Manager',
  devops: 'DevOps',
  qa: 'QA Engineer',
};

const ROLE_BADGES: Record<string, string> = {
  admin: 'badge-orange',
  developer: 'badge-teal',
  designer: 'badge-purple',
  pm: 'badge-amber',
  devops: 'badge-blue',
  qa: 'badge-green',
};

export default function UsersPage() {
  const { user: currentUser, users, addUser, updateUser, deleteUser } = useAuth();
  const { progress, unassignTask } = useStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<User['role']>('developer');
  const [formPassword, setFormPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Filters & Search logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getTaskCount = (userId: string) => {
    return progress.assignments.filter((a) => a.assigneeId === userId).length;
  };

  const handleOpenAddModal = () => {
    if (!isAdmin) return;
    setFormName('');
    setFormEmail('');
    setFormRole('developer');
    setFormPassword('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    if (!isAdmin) return;
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormPassword(''); // blank means do not change
    setFormError('');
  };

  const handleOpenDeleteModal = (u: User) => {
    if (!isAdmin) return;
    if (u.id === 'u1') {
      toast('Cannot delete default administrator account', 'error');
      return;
    }
    setUserToDelete(u);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const res = await addUser(formName, formEmail, formRole, formPassword || undefined);
    setIsSubmitting(false);

    if (res.success) {
      toast(`User ${formName} added successfully`, 'success');
      setIsAddModalOpen(false);
    } else {
      setFormError(res.error || 'Failed to add user');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError('');
    setIsSubmitting(true);

    const res = await updateUser(
      editingUser.id,
      formName,
      formEmail,
      formRole,
      formPassword || undefined
    );
    setIsSubmitting(false);

    if (res.success) {
      toast(`User ${formName} updated successfully`, 'success');
      setEditingUser(null);
    } else {
      setFormError(res.error || 'Failed to update user');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);

    const res = await deleteUser(userToDelete.id);
    setIsSubmitting(false);

    if (res.success) {
      // Relational cleanup: Unassign tasks assigned to deleted user
      const deletedUserAssignments = progress.assignments.filter(
        (a) => a.assigneeId === userToDelete.id
      );
      deletedUserAssignments.forEach((a) => {
        unassignTask(a.taskKey);
      });

      toast(`User ${userToDelete.name} deleted and tasks unassigned`, 'success');
      setUserToDelete(null);
    } else {
      toast(res.error || 'Failed to delete user', 'error');
    }
  };

  return (
    <main className="page">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="page-tag" style={{ background: 'rgba(216, 90, 48, 0.12)', color: 'var(--tf-orange)', border: '0.5px solid rgba(216, 90, 48, 0.2)' }}>
            User Management Roster
          </div>
          <h1 className="page-title"> Roster · {users.length} Team Members</h1>
          <p className="page-subtitle">
            Manage roles, view task workloads, and handle user credentials for the TalentForge project boards.
          </p>
        </div>

        {isAdmin && (
          <button className="theme-btn" style={{ background: 'var(--tf-orange)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: 'var(--border-radius-md)', padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }} onClick={handleOpenAddModal}>
            <i className="ti ti-user-plus" style={{ fontSize: 14 }} aria-hidden="true" />
            Add Team Member
          </button>
        )}
      </div>

      {/* Role Protection Banner */}
      {!isAdmin && (
        <div style={{ background: 'rgba(186, 117, 23, 0.1)', border: '1px solid rgba(186, 117, 23, 0.25)', color: 'var(--tf-amber)', borderRadius: 'var(--border-radius-lg)', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
          <i className="ti ti-eye" style={{ fontSize: 16 }} aria-hidden="true" />
          <span><strong>View-Only Mode:</strong> Only administrators can add, edit, or delete team members.</span>
        </div>
      )}

      {/* Filters Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="dash-filters" style={{ marginBottom: 0 }}>
          {['all', 'admin', 'developer', 'designer', 'pm', 'devops', 'qa'].map((role) => (
            <button
              key={role}
              className={`dash-filter-btn${roleFilter === role ? ' active' : ''}`}
              onClick={() => setRoleFilter(role)}
            >
              {role === 'all' ? 'All Roles' : ROLE_LABELS[role] || role}
            </button>
          ))}
        </div>

        <div className="search-container" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <i className="ti ti-search search-icon-left" aria-hidden="true" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or email..."
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

      {/* Team Roster Grid */}
      <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filteredUsers.map((u) => {
          const tasksCount = getTaskCount(u.id);
          return (
            <div key={u.id} className="team-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: '170px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className={`team-avatar ${u.avatarColor}`} style={{ width: 42, height: 42, fontSize: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {u.avatar}
                  </div>
                  
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', padding: 6, cursor: 'pointer', borderRadius: 'var(--border-radius-sm)', transition: 'background 0.2s' }}
                        title="Edit member"
                        className="action-hover-bg"
                      >
                        <i className="ti ti-edit" style={{ fontSize: 14 }} />
                      </button>
                      {u.id !== 'u1' && (
                        <button
                          onClick={() => handleOpenDeleteModal(u)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', padding: 6, cursor: 'pointer', borderRadius: 'var(--border-radius-sm)', transition: 'background 0.2s' }}
                          title="Delete member"
                          className="action-hover-bg"
                        >
                          <i className="ti ti-trash" style={{ fontSize: 14 }} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 10 }}>
                  <div className="team-name" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{u.name}</div>
                  <div className="team-role" style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{u.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: 10, marginTop: 12 }}>
                <span className={`badge ${ROLE_BADGES[u.role] || 'badge-blue'}`} style={{ margin: 0 }}>
                  {ROLE_LABELS[u.role] || u.role}
                </span>
                
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="ti ti-checkbox" style={{ color: tasksCount > 0 ? 'var(--tf-teal)' : 'var(--color-text-tertiary)' }} />
                  {tasksCount} active {tasksCount === 1 ? 'task' : 'tasks'}
                </span>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="dash-empty" style={{ gridColumn: '1 / -1', padding: '40px 0' }}>
            <i className="ti ti-users" style={{ fontSize: 32, color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
            <p style={{ marginTop: 10 }}>No team members match your criteria</p>
          </div>
        )}
      </div>

      {/* ADD MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="modal-content" style={{ background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-lg)', width: '100%', maxWidth: '420px', padding: '24px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-user-plus" style={{ color: 'var(--tf-orange)' }} /> Add New Team Member
            </h3>

            <form onSubmit={handleAddSubmit}>
              {formError && (
                <div style={{ color: '#E06060', fontSize: 12, background: 'rgba(163,45,45,0.08)', border: '1px solid rgba(163,45,45,0.2)', borderRadius: 'var(--border-radius-sm)', padding: '8px 10px', marginBottom: 12 }}>
                  {formError}
                </div>
              )}

              <div className="login-field" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Full Name</label>
                <div className="login-input-wrap">
                  <i className="ti ti-user" />
                  <input type="text" placeholder="John Doe" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                </div>
              </div>

              <div className="login-field" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Email Address</label>
                <div className="login-input-wrap">
                  <i className="ti ti-mail" />
                  <input type="email" placeholder="john@talentforge.in" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
                </div>
              </div>

              <div className="login-field" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Role Designation</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as User['role'])}
                  style={{ width: '100%', height: '36px', background: 'var(--color-background-tertiary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-primary)', padding: '0 10px', fontSize: 13, outline: 'none' }}
                >
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="login-field" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Password (Login Credentials)</label>
                <div className="login-input-wrap">
                  <i className="ti ti-lock" />
                  <input type="password" placeholder="••••••••" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="theme-btn" style={{ background: 'var(--color-background-tertiary)', color: 'var(--color-text-secondary)', border: 'none', borderRadius: 'var(--border-radius-md)', padding: '8px 14px', cursor: 'pointer', fontSize: 12 }} onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="theme-btn" style={{ background: 'var(--tf-orange)', color: '#fff', border: 'none', borderRadius: 'var(--border-radius-md)', padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 500 }} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {editingUser && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="modal-content" style={{ background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-lg)', width: '100%', maxWidth: '420px', padding: '24px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-edit" style={{ color: 'var(--tf-orange)' }} /> Edit Team Member Profile
            </h3>

            <form onSubmit={handleEditSubmit}>
              {formError && (
                <div style={{ color: '#E06060', fontSize: 12, background: 'rgba(163,45,45,0.08)', border: '1px solid rgba(163,45,45,0.2)', borderRadius: 'var(--border-radius-sm)', padding: '8px 10px', marginBottom: 12 }}>
                  {formError}
                </div>
              )}

              <div className="login-field" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Full Name</label>
                <div className="login-input-wrap">
                  <i className="ti ti-user" />
                  <input type="text" placeholder="John Doe" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                </div>
              </div>

              <div className="login-field" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Email Address</label>
                <div className="login-input-wrap">
                  <i className="ti ti-mail" />
                  <input type="email" placeholder="john@talentforge.in" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
                </div>
              </div>

              <div className="login-field" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Role Designation</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as User['role'])}
                  style={{ width: '100%', height: '36px', background: 'var(--color-background-tertiary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-primary)', padding: '0 10px', fontSize: 13, outline: 'none' }}
                >
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="login-field" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Change Password (Optional)</label>
                <div className="login-input-wrap">
                  <i className="ti ti-lock" />
                  <input type="password" placeholder="Leave blank to keep current" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="theme-btn" style={{ background: 'var(--color-background-tertiary)', color: 'var(--color-text-secondary)', border: 'none', borderRadius: 'var(--border-radius-md)', padding: '8px 14px', cursor: 'pointer', fontSize: 12 }} onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="theme-btn" style={{ background: 'var(--tf-orange)', color: '#fff', border: 'none', borderRadius: 'var(--border-radius-md)', padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 500 }} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="modal-content" style={{ background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-lg)', width: '100%', maxWidth: '380px', padding: '24px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-alert-triangle" style={{ color: '#E06060' }} /> Delete Team Member?
            </h3>

            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
              Are you sure you want to delete <strong>{userToDelete.name}</strong> from the roster? This action is permanent and will automatically unassign them from any active tasks.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="theme-btn" style={{ background: 'var(--color-background-tertiary)', color: 'var(--color-text-secondary)', border: 'none', borderRadius: 'var(--border-radius-md)', padding: '8px 14px', cursor: 'pointer', fontSize: 12 }} onClick={() => setUserToDelete(null)}>
                Cancel
              </button>
              <button type="button" className="theme-btn" style={{ background: '#E06060', color: '#fff', border: 'none', borderRadius: 'var(--border-radius-md)', padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 500 }} onClick={handleDeleteConfirm} disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Delete Roster'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
