'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div>
      <nav className="nav">
        <div className="container nav-content">
          <div>
            <Link href="/dashboard" className="nav-link">
              Breezy Yahrzeits
            </Link>
          </div>
          <div className="nav-links">
            {/* <Link href="/dashboard" className="nav-link">
              Dashboard
            </Link> */}
            <button onClick={handleLogout} className="button">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container">
        {children}
      </main>
    </div>
  );
} 