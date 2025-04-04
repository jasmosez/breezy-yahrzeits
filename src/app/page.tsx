import { redirect } from 'next/navigation';
import { getCurrentOrganization } from '@/lib/auth';

export default async function Home() {
  const organization = await getCurrentOrganization();
  
  if (organization) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
} 