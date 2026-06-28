'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',');
      setIsAdmin(!!user && adminEmails.includes(user.email || ''));
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  if (!isAdmin) return (
    <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
      관리자 권한이 필요합니다.
    </div>
  );
  return <>{children}</>;
}
