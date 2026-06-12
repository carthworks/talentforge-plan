import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'TalentForge — India\'s Multi-Disciplinary Talent Verification Platform',
  description:
    'Verified skills, real work, verified outcomes. TalentForge connects 8M engineering graduates to employers via AI-powered assessments, blockchain credentials, and gamified skill development.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
