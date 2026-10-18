'use client';

import AdminDashboardView from '@/components/admin/AdminDashboardView';

export default function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const tab = typeof searchParams?.tab === 'string' ? (searchParams.tab as any) : 'overview';
  return <AdminDashboardView initialTab={tab} />;
}
