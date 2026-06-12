'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: 'ti-home' },
  { href: '/dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
  { href: '/sprints', label: 'Sprints', icon: 'ti-list-check' },
  { href: '/sprint-1', label: 'Sprint 1', icon: 'ti-server' },
  { href: '/sprint-15', label: 'Sprint 15', icon: 'ti-certificate' },
  { href: '/phase-1', label: 'Phase 1', icon: 'ti-microscope' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      <Link href="/" className="nav-logo">
        <i className="ti ti-flame" aria-hidden="true" />
        <span>TalentForge</span>
      </Link>

      <button
        className="nav-hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
        aria-expanded={open}
      >
        <i className={`ti ${open ? 'ti-x' : 'ti-menu-2'}`} />
      </button>

      <ul className={`nav-links${open ? ' open' : ''}`}>
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={pathname === item.href ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              <i className={`ti ${item.icon}`} aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
