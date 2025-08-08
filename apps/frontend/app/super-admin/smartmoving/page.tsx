import React from 'react';
import SmartMovingDashboard from '@/components/SmartMovingManagement/SmartMovingDashboard';
import { SuperAdminGuard } from '@/components/guards/SuperAdminGuard';

export default function SmartMovingManagementPage() {
  return (
    <SuperAdminGuard>
      <div className="container mx-auto px-4 py-8">
        <SmartMovingDashboard />
      </div>
    </SuperAdminGuard>
  );
}
