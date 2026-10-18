import { redirect } from 'next/navigation';

export default function AdminTrackingRoute() {
  redirect('/admin?tab=orders');
}
