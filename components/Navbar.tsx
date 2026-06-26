'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  // { href: '/', label: 'Home', icon: 'ti-home' },
  { href: '/dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
  { href: '/sprints', label: 'Sprints', icon: 'ti-list-check' },
  { href: '/users', label: 'Users', icon: 'ti-users' },
  { href: '/reports', label: 'Reports', icon: 'ti-chart-bar' },
  { href: '/settings', label: 'Settings', icon: 'ti-settings' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      <Link href="/dashboard" className="nav-logo">
        <i className="ti ti-flame" aria-hidden="true" />
        <span>TalentForge</span>
      </Link>

      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

        <ThemeToggle />

        <button
          className="nav-hamburger"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <i className={`ti ${open ? 'ti-x' : 'ti-menu-2'}`} />
        </button>
      </div>
    </nav>
  );
}
