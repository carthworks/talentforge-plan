'use client';

import { STATIC_USERS, useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect (in effect, not during render)
  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  if (user) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Simulate small delay for UX
    setTimeout(() => {
      const err = login(email, password);
      if (err) {
        setError(err);
        setIsSubmitting(false);
      } else {
        router.replace('/');
      }
    }, 400);
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <i className="ti ti-flame" aria-hidden="true" />
            <span>TalentForge</span>
          </div>
          <h1 className="login-title">Sign in to your account</h1>
          <p className="login-subtitle">Project management &amp; sprint tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <i className="ti ti-alert-circle" aria-hidden="true" />
              {error}
            </div>
          )}

          <div className="login-field">
            <label htmlFor="email">Email</label>
            <div className="login-input-wrap">
              <i className="ti ti-mail" aria-hidden="true" />
              <input
                id="email"
                type="email"
                placeholder="admin@talentforge.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <i className="ti ti-lock" aria-hidden="true" />
              <input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <><i className="ti ti-loader-2 spin" aria-hidden="true" /> Signing in…</>
            ) : (
              <><i className="ti ti-login" aria-hidden="true" /> Sign in</>
            )}
          </button>
        </form>

        <div className="login-demo" style={{ display: 'none' }}>
          <p className="login-demo-title">
            <i className="ti ti-info-circle" aria-hidden="true" /> Demo accounts
          </p>
          <div className="login-demo-grid">
            {Object.entries(STATIC_USERS).map(([email, { user: u }]) => (
              <button
                key={email}
                className="login-demo-user"
                onClick={() => { setEmail(email); setPassword('tf2025'); setError(''); }}
                type="button"
              >
                <div className={`login-demo-avatar ${u.avatarColor}`}>{u.avatar}</div>
                <div>
                  <div className="login-demo-name">{u.name}</div>
                  <div className="login-demo-role">{u.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
