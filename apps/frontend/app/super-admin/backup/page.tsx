'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Input } from '@/components/atoms/Input';
import { 
  Database, 
  ArrowLeft,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Shield,
  Clock,
  HardDrive,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Calendar,
  BarChart3,
  Lock,
  Unlock,
  Zap,
  Activity,
  Server,
  Network,
  Archive,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Info,
  Plus,
  Search,
  Filter,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  FileCheck,
  Database as DatabaseIcon,
  Server as ServerIcon,
  HardDrive as HardDriveIcon,
  Clock as ClockIcon,
  Shield as ShieldIcon,
  Activity as ActivityIcon,
  BarChart3 as BarChart3Icon,
  Calendar as CalendarIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Eye as EyeIcon,
  Trash2 as Trash2Icon,
  RotateCcw as RotateCcwIcon,
  ShieldCheck as ShieldCheckIcon,
  AlertCircle as AlertCircleIcon,
  Info as InfoIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Filter as FilterIcon
} from 'lucide-react';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { useSuperAdmin } from '@/stores/superAdminStore';
import { useSuperAdminLoading } from '@/stores/superAdminStore';
import { useSuperAdminError } from '@/stores/superAdminStore';
import toast from 'react-hot-toast';
import { RBACProtected } from '@/components/security/RBACProtected';
import useRBAC from '@/hooks/useRBAC';

// ===== BACKUP SYSTEM INTERFACES =====

interface BackupFile {
  id: string;
  name: string;
  type: 'git' | 'config' | 'database' | 'full';
  size: number;
  sizeFormatted: string;
  createdAt: string;
  status: 'encrypted' | 'verified' | 'corrupted' | 'pending';
  encryption: 'AES-256-CBC';
  integrity: boolean;
  retentionDays: number;
  path: string;
  checksum?: string;
}

interface BackupStatus {
  lastBackup: string;
  nextScheduledBackup: string;
  totalBackups: number;
  totalSize: number;
  totalSizeFormatted: string;
  systemHealth: 'healthy' | 'warning' | 'critical';
  encryptionStatus: 'active' | 'inactive';
  automationStatus: 'running' | 'stopped' | 'error';
  diskSpace: {
    used: number;
    available: number;
    total: number;
    percentage: number;
  };
}

interface BackupLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'ERROR' | 'SECURITY' | 'WARNING';
  message: string;
  action: string;
  userId?: string;
  backupId?: string;
  duration?: number;
  status: 'success' | 'failed' | 'pending';
}

interface BackupSettings {
  retentionDays: number;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  verificationEnabled: boolean;
  automationEnabled: boolean;
  dailyBackupTime: string;
  weeklyBackupDay: string;
  monthlyBackupDay: number;
  maxBackupSize: number;
  alertThreshold: number;
}

// ===== MOCK DATA =====

const mockBackupFiles: BackupFile[] = [
  {
    id: 'backup-1',
    name: 'c-and-c-crm-git-backup-20250807-212638.tar.gz.enc',
    type: 'git',
    size: 19922944,
    sizeFormatted: '19.0 MB',
    createdAt: '2025-08-07T21:26:38Z',
    status: 'verified',
    encryption: 'AES-256-CBC',
    integrity: true,
    retentionDays: 30,
    path: '/backups/c-and-c-crm-git-backup-20250807-212638.tar.gz.enc',
    checksum: 'sha256:abc123...'
  },
  {
    id: 'backup-2',
    name: 'c-and-c-crm-config-backup-20250807-212640.tar.gz.enc',
    type: 'config',
    size: 483328,
    sizeFormatted: '472 KB',
    createdAt: '2025-08-07T21:26:40Z',
    status: 'verified',
    encryption: 'AES-256-CBC',
    integrity: true,
    retentionDays: 30,
    path: '/backups/c-and-c-crm-config-backup-20250807-212640.tar.gz.enc',
    checksum: 'sha256:def456...'
  },
  {
    id: 'backup-3',
    name: 'c-and-c-crm-db-backup-20250807-212640.sql.enc',
    type: 'database',
    size: 118784,
    sizeFormatted: '116 KB',
    createdAt: '2025-08-07T21:26:40Z',
    status: 'verified',
    encryption: 'AES-256-CBC',
    integrity: true,
    retentionDays: 30,
    path: '/backups/c-and-c-crm-db-backup-20250807-212640.sql.enc',
    checksum: 'sha256:ghi789...'
  }
];

const mockBackupStatus: BackupStatus = {
  lastBackup: '2025-08-07T21:26:40Z',
  nextScheduledBackup: '2025-08-08T02:00:00Z',
  totalBackups: 3,
  totalSize: 20406016,
  totalSizeFormatted: '19.5 MB',
  systemHealth: 'healthy',
  encryptionStatus: 'active',
  automationStatus: 'running',
  diskSpace: {
    used: 24117248,
    available: 499999999999,
    total: 500000000000,
    percentage: 0.005
  }
};

const mockBackupLogs: BackupLog[] = [
  {
    id: 'log-1',
    timestamp: '2025-08-07T21:26:40Z',
    level: 'INFO',
    message: 'Full backup completed successfully',
    action: 'BACKUP_COMPLETED',
    userId: 'super-admin',
    backupId: 'backup-1',
    duration: 2,
    status: 'success'
  },
  {
    id: 'log-2',
    timestamp: '2025-08-07T21:26:38Z',
    level: 'SECURITY',
    message: 'Backup integrity verified: c-and-c-crm-git-backup-20250807-212638.tar.gz.enc',
    action: 'INTEGRITY_CHECK',
    backupId: 'backup-1',
    status: 'success'
  },
  {
    id: 'log-3',
    timestamp: '2025-08-07T21:26:35Z',
    level: 'INFO',
    message: 'Creating Git backup: c-and-c-crm-git-backup-20250807-212638',
    action: 'BACKUP_STARTED',
    backupId: 'backup-1',
    status: 'success'
  }
];

const mockBackupSettings: BackupSettings = {
  retentionDays: 30,
  encryptionEnabled: true,
  compressionEnabled: true,
  verificationEnabled: true,
  automationEnabled: true,
  dailyBackupTime: '02:00',
  weeklyBackupDay: 'Sunday',
  monthlyBackupDay: 1,
  maxBackupSize: 1073741824, // 1GB
  alertThreshold: 80
};

// ===== MAIN COMPONENT =====

export default function SuperAdminBackupPage() {
  const router = useRouter();
  const superAdmin = useSuperAdmin();
  const isLoading = useSuperAdminLoading();
  const error = useSuperAdminError();
  const { hasPermission } = useRBAC();

  // State management
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>(mockBackupFiles);
  const [backupStatus, setBackupStatus] = useState<BackupStatus>(mockBackupStatus);
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>(mockBackupLogs);
  const [backupSettings, setBackupSettings] = useState<BackupSettings>(mockBackupSettings);
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'logs' | 'settings' | 'restore'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and has permissions
    if (!superAdmin) {
      router.push('/auth/login');
      return;
    }

    if (!hasPermission('MANAGE_SYSTEM_SETTINGS')) {
      router.push('/super-admin/dashboard');
      toast.error('Insufficient permissions to access backup management');
      return;
    }

    // Load backup data
    loadBackupData();
  }, [superAdmin, router, hasPermission]);

  const loadBackupData = async () => {
    try {
      // TODO: Replace with actual API calls
      // const response = await fetch('/api/super-admin/backup/status');
      // const data = await response.json();
      // setBackupStatus(data);
      
      console.log('Loading backup data...');
    } catch (error) {
      console.error('Error loading backup data:', error);
      toast.error('Failed to load backup data');
    }
  };

  // ===== BACKUP ACTIONS =====

  const handleManualBackup = async () => {
    if (!hasPermission('MANAGE_SYSTEM_SETTINGS')) {
      toast.error('Insufficient permissions to perform backup');
      return;
    }

    setIsPerformingAction(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/super-admin/backup/manual', { method: 'POST' });
      
      toast.success('Manual backup initiated successfully');
      setTimeout(() => {
        loadBackupData();
        setIsPerformingAction(false);
      }, 2000);
    } catch (error) {
      console.error('Error initiating manual backup:', error);
      toast.error('Failed to initiate manual backup');
      setIsPerformingAction(false);
    }
  };

  const handleToggleAutomation = async () => {
    if (!hasPermission('MANAGE_SYSTEM_SETTINGS')) {
      toast.error('Insufficient permissions to modify backup automation');
      return;
    }

    setIsPerformingAction(true);
    try {
      const newSettings = {
        ...backupSettings,
        automationEnabled: !backupSettings.automationEnabled
      };
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/super-admin/backup/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newSettings)
      // });
      
      setBackupSettings(newSettings);
      toast.success(`Backup automation ${newSettings.automationEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling backup automation:', error);
      toast.error('Failed to toggle backup automation');
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!hasPermission('MANAGE_SYSTEM_SETTINGS')) {
      toast.error('Insufficient permissions to delete backups');
      return;
    }

    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    setIsPerformingAction(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/super-admin/backup/files/${backupId}`, { method: 'DELETE' });
      
      setBackupFiles(prev => prev.filter(backup => backup.id !== backupId));
      toast.success('Backup deleted successfully');
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast.error('Failed to delete backup');
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleVerifyBackup = async (backupId: string) => {
    if (!hasPermission('VIEW_AUDIT_LOGS')) {
      toast.error('Insufficient permissions to verify backups');
      return;
    }

    setIsPerformingAction(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/super-admin/backup/files/${backupId}/verify`, { method: 'POST' });
      
      toast.success('Backup verification completed');
      loadBackupData();
    } catch (error) {
      console.error('Error verifying backup:', error);
      toast.error('Failed to verify backup');
    } finally {
      setIsPerformingAction(false);
    }
  };

  // ===== UTILITY FUNCTIONS =====

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified': return 'success';
      case 'encrypted': return 'primary';
      case 'pending': return 'warning';
      case 'corrupted': return 'error';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'encrypted': return <Lock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'corrupted': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'secondary';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // ===== FILTERED DATA =====

  const filteredBackupFiles = backupFiles.filter(backup => {
    const matchesSearch = backup.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || backup.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || backup.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-surface rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-surface rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-surface rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/super-admin/dashboard')}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-text-primary">Backup Management</h1>
            </div>
            <p className="text-text-secondary text-sm">
              Manage system backups, monitor health, and control backup automation
            </p>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <RBACProtected permission="MANAGE_SYSTEM_SETTINGS">
              <Button 
                onClick={handleManualBackup} 
                size="sm" 
                className="h-9"
                disabled={isPerformingAction}
              >
                <Database className="w-4 h-4 mr-2" />
                {isPerformingAction ? 'Creating...' : 'Manual Backup'}
              </Button>
            </RBACProtected>
            
            <RBACProtected permission="MANAGE_SYSTEM_SETTINGS">
              <Button 
                onClick={handleToggleAutomation} 
                variant={backupSettings.automationEnabled ? "outline" : "default"}
                size="sm" 
                className="h-9"
                disabled={isPerformingAction}
              >
                {backupSettings.automationEnabled ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Automation
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Automation
                  </>
                )}
              </Button>
            </RBACProtected>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">System Health</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getHealthBadgeVariant(backupStatus.systemHealth)}>
                      {getHealthIcon(backupStatus.systemHealth)}
                      {backupStatus.systemHealth.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Total Backups</p>
                  <p className="text-lg font-semibold text-text-primary">{backupStatus.totalBackups}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Total Size</p>
                  <p className="text-lg font-semibold text-text-primary">{backupStatus.totalSizeFormatted}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Automation</p>
                  <Badge variant={backupSettings.automationEnabled ? 'success' : 'secondary'}>
                    {backupSettings.automationEnabled ? 'RUNNING' : 'STOPPED'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'files', label: 'Backup Files', icon: Database },
              { id: 'logs', label: 'Logs', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'restore', label: 'Restore', icon: RotateCcw }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-700'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Backup Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Backup Schedule</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-surface/50 rounded-lg">
                      <h4 className="font-medium text-text-primary mb-2">Daily Backup</h4>
                      <p className="text-sm text-text-secondary">{backupSettings.dailyBackupTime}</p>
                    </div>
                    <div className="p-4 bg-surface/50 rounded-lg">
                      <h4 className="font-medium text-text-primary mb-2">Weekly Backup</h4>
                      <p className="text-sm text-text-secondary">{backupSettings.weeklyBackupDay} 03:00</p>
                    </div>
                    <div className="p-4 bg-surface/50 rounded-lg">
                      <h4 className="font-medium text-text-primary mb-2">Monthly Backup</h4>
                      <p className="text-sm text-text-secondary">{backupSettings.monthlyBackupDay}st 04:00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {backupLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant={log.status === 'success' ? 'success' : 'error'}>
                            {log.level}
                          </Badge>
                          <span className="text-sm text-text-primary">{log.message}</span>
                        </div>
                        <span className="text-xs text-text-secondary">{formatDate(log.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search backup files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                <div className="flex space-x-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 bg-surface border border-gray-700 rounded-lg text-sm"
                  >
                    <option value="ALL">All Types</option>
                    <option value="git">Git</option>
                    <option value="config">Config</option>
                    <option value="database">Database</option>
                    <option value="full">Full</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-surface border border-gray-700 rounded-lg text-sm"
                  >
                    <option value="ALL">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="encrypted">Encrypted</option>
                    <option value="pending">Pending</option>
                    <option value="corrupted">Corrupted</option>
                  </select>
                </div>
              </div>

              {/* Backup Files List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>Backup Files ({filteredBackupFiles.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredBackupFiles.map((backup) => (
                      <div key={backup.id} className="flex items-center justify-between p-4 bg-surface/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-text-primary">{backup.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-text-secondary">
                              <span>{backup.type.toUpperCase()}</span>
                              <span>{backup.sizeFormatted}</span>
                              <span>{formatDate(backup.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusBadgeVariant(backup.status)}>
                            {getStatusIcon(backup.status)}
                            {backup.status.toUpperCase()}
                          </Badge>
                          
                          <RBACProtected permission="VIEW_AUDIT_LOGS">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerifyBackup(backup.id)}
                              disabled={isPerformingAction}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </RBACProtected>
                          
                          <RBACProtected permission="MANAGE_SYSTEM_SETTINGS">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBackup(backup.id)}
                              disabled={isPerformingAction}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </RBACProtected>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'logs' && (
            <RBACProtected permission="VIEW_AUDIT_LOGS">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Backup Logs</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {backupLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant={log.status === 'success' ? 'success' : 'error'}>
                            {log.level}
                          </Badge>
                          <span className="text-sm text-text-primary">{log.message}</span>
                          {log.duration && (
                            <span className="text-xs text-text-secondary">({log.duration}s)</span>
                          )}
                        </div>
                        <span className="text-xs text-text-secondary">{formatDate(log.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </RBACProtected>
          )}

          {activeTab === 'settings' && (
            <RBACProtected permission="MANAGE_SYSTEM_SETTINGS">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Backup Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-text-primary">General Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Retention Period</span>
                          <span className="text-sm text-text-primary">{backupSettings.retentionDays} days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Encryption</span>
                          <Badge variant={backupSettings.encryptionEnabled ? 'success' : 'secondary'}>
                            {backupSettings.encryptionEnabled ? 'ENABLED' : 'DISABLED'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Compression</span>
                          <Badge variant={backupSettings.compressionEnabled ? 'success' : 'secondary'}>
                            {backupSettings.compressionEnabled ? 'ENABLED' : 'DISABLED'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Verification</span>
                          <Badge variant={backupSettings.verificationEnabled ? 'success' : 'secondary'}>
                            {backupSettings.verificationEnabled ? 'ENABLED' : 'DISABLED'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium text-text-primary">Schedule Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Daily Backup Time</span>
                          <span className="text-sm text-text-primary">{backupSettings.dailyBackupTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Weekly Backup Day</span>
                          <span className="text-sm text-text-primary">{backupSettings.weeklyBackupDay}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Monthly Backup Day</span>
                          <span className="text-sm text-text-primary">{backupSettings.monthlyBackupDay}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Max Backup Size</span>
                          <span className="text-sm text-text-primary">{(backupSettings.maxBackupSize / 1024 / 1024 / 1024).toFixed(1)} GB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </RBACProtected>
          )}

          {activeTab === 'restore' && (
            <RBACProtected permission="MANAGE_SYSTEM_SETTINGS">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <RotateCcw className="w-5 h-5" />
                    <span>Restore & Recovery</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                        <h4 className="font-medium text-warning">Restore Warning</h4>
                      </div>
                      <p className="text-sm text-text-secondary">
                        Restoring from backup will overwrite current data. This action cannot be undone. 
                        Please ensure you have a current backup before proceeding.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-20">
                        <Upload className="w-6 h-6 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Upload Backup</div>
                          <div className="text-sm text-text-secondary">Restore from external backup file</div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="h-20">
                        <Database className="w-6 h-6 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Select Backup</div>
                          <div className="text-sm text-text-secondary">Choose from existing backups</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </RBACProtected>
          )}
        </div>
      </div>
    </div>
  );
}
