import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ProfileClient from './page.client';

export default async function ProfileServer() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <ProfileClient user={session.user} />;
}
