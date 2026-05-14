import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'OttoBob.ai — Otto University',
  description: 'Otto University Student & Operations Platform — Manage students, track activity, and grow with Bob the AI agent.',
  keywords: 'Student management, platform, OttoBob.ai, Otto University, AI agent',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
