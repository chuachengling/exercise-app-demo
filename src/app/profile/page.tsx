'use client';

import { useRequireAuth } from '@/lib/contexts/AuthContext';
import { ProfilePage as ProfilePageComponent } from './_components/ProfilePage';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, isLoading, shouldRedirect, redirectTo } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (shouldRedirect) {
      router.push(`${redirectTo}?redirect=/profile`);
    }
  }, [shouldRedirect, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <ProfilePageComponent />;
}