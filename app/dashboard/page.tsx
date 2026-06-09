import { getCurrentUser } from '@/lib/utils/session';
import { redirect } from 'next/navigation';
import DashboardClientPage from './DashboardClient';

const DashboardPage = async () => {
  const user = await getCurrentUser();
  console.log(user);
  if (!user) {
    redirect('/sign-in');
  }
  return <DashboardClientPage user={user} />;
};

export default DashboardPage;
