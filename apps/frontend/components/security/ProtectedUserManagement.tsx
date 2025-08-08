/**
 * Protected User Management Component
 * CISSP Compliant - Demonstrates RBAC protection in action
 */

'use client';

import React from 'react';
import { RBACProtected, RBACProtectedAny } from './RBACProtected';
import useRBAC from '@/hooks/useRBAC';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface ProtectedUserManagementProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
  onEditUser: (user: User) => void;
  onCreateUser: () => void;
}

export const ProtectedUserManagement: React.FC<ProtectedUserManagementProps> = ({
  users,
  onDeleteUser,
  onEditUser,
  onCreateUser
}) => {
  const { hasPermission, hasAnyPermission, userRole } = useRBAC();

  return (
    <div className="space-y-4">
      {/* Header with role-based title */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          User Management {userRole && `(${userRole})`}
        </h2>
        
        {/* Create user button - only for users with write permission */}
        <RBACProtected permission="user:write">
          <button
            onClick={onCreateUser}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create User
          </button>
        </RBACProtected>
      </div>

      {/* User list - only for users with read permission */}
      <RBACProtected permission="user:read">
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex justify-between items-center p-4 border rounded"
            >
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500">Role: {user.role}</p>
              </div>
              
              <div className="flex space-x-2">
                {/* Edit button - only for users with write permission */}
                <RBACProtected permission="user:write">
                  <button
                    onClick={() => onEditUser(user)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                </RBACProtected>
                
                {/* Delete button - only for users with delete permission */}
                <RBACProtected permission="user:delete">
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </RBACProtected>
              </div>
            </div>
          ))}
        </div>
      </RBACProtected>

      {/* No permission message */}
      <RBACProtected 
        permission="user:read" 
        fallback={
          <div className="text-center py-8 text-gray-500">
            <p>You don't have permission to view user management.</p>
            <p className="text-sm">Contact your administrator for access.</p>
          </div>
        }
      >
        <div></div>
      </RBACProtected>

      {/* Advanced permissions example */}
      <RBACProtectedAny permissions={['user:write', 'user:delete']}>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-medium text-blue-800">Advanced User Management</h3>
          <p className="text-sm text-blue-600">
            You have advanced permissions for user management.
          </p>
        </div>
      </RBACProtectedAny>
    </div>
  );
};

export default ProtectedUserManagement;
