'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Plus, Users, UserPlus, Shield } from 'lucide-react';

export default function UsersPage() {
  const mockUsers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@lgm.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      location: 'Toronto',
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike.chen@lgm.com',
      role: 'DISPATCHER',
      status: 'ACTIVE',
      location: 'Mississauga',
      lastActive: '1 hour ago'
    },
    {
      id: '3',
      name: 'David Rodriguez',
      email: 'david.rodriguez@lgm.com',
      role: 'DRIVER',
      status: 'ACTIVE',
      location: 'Vancouver',
      lastActive: '30 minutes ago'
    },
    {
      id: '4',
      name: 'Lisa Thompson',
      email: 'lisa.thompson@lgm.com',
      role: 'MOVER',
      status: 'ACTIVE',
      location: 'Calgary',
      lastActive: '15 minutes ago'
    }
  ];

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: 'destructive',
      DISPATCHER: 'default',
      DRIVER: 'secondary',
      MOVER: 'outline',
      MANAGER: 'default',
      AUDITOR: 'secondary'
    } as const;
    
    return <Badge variant={variants[role as keyof typeof variants] || 'outline'}>{role}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' ? 
      <Badge variant="success">Active</Badge> : 
      <Badge variant="destructive">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-secondary mt-2">Manage system users and their permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            Role Management
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Users</p>
                <p className="text-2xl font-bold text-text-primary">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Active Users</p>
                <p className="text-2xl font-bold text-text-primary">22</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Online Now</p>
                <p className="text-2xl font-bold text-text-primary">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-error" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Pending</p>
                <p className="text-2xl font-bold text-text-primary">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Last Active</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-surface/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-text-primary">{user.name}</p>
                        <p className="text-sm text-text-secondary">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-3 px-4 text-text-primary">
                      {user.location}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {user.lastActive}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 