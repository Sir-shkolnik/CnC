import { redirect } from 'next/navigation';

export default function StatusPage() {
  redirect('https://c-and-c-crm-api.onrender.com/health');
} 