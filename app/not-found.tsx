'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background radial glows */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(216, 90, 48, 0.08) 0%, rgba(29, 158, 117, 0.05) 50%, transparent 100%)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      <div style={{
        background: 'var(--color-background-secondary)',
        border: '0.5px solid var(--color-border-tertiary)',
        padding: '3rem 2rem',
        borderRadius: 'var(--border-radius-xl)',
        maxWidth: '480px',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          fontSize: '72px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--tf-orange) 0%, var(--tf-amber) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginBottom: '1rem'
        }}>
          404
        </div>
        
        <h1 className="page-title" style={{ fontSize: '20px', marginBottom: '0.75rem' }}>
          Lost in the Marketplace?
        </h1>
        
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: '13px',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          The page you are looking for doesn&apos;t exist or has been moved to another sprint. Let&apos;s get you back on track.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <Link href="/" className="btn btn-primary" style={{
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            padding: '8px 16px',
            borderRadius: 'var(--border-radius-md)',
            fontWeight: 500,
            background: 'var(--tf-orange)',
            color: 'white',
            transition: 'background 0.2s'
          }}>
            <i className="ti ti-home" aria-hidden="true" />
            Home Page
          </Link>
          <Link href="/dashboard" style={{
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            padding: '8px 16px',
            borderRadius: 'var(--border-radius-md)',
            fontWeight: 500,
            background: 'transparent',
            color: 'var(--color-text-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            transition: 'all 0.2s'
          }}
          className="btn-secondary-custom"
          >
            <i className="ti ti-layout-dashboard" aria-hidden="true" />
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
