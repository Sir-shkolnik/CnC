'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { 
  Truck, 
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Info,
  Clock,
  Users,
  Camera,
  MessageSquare,
  MapPin,
  Calendar,
  UserPlus,
  Upload,
  Settings
} from 'lucide-react';
import { useJourneyStore } from '@/stores/journeyStore';
import { 
  JourneyOverview,
  JourneyTimeline,
  JourneyCrew,
  JourneyMedia,
  JourneyChat
} from '@/components/JourneyManagement/JourneyDetail';
import { CrewAssignmentModal } from '@/components/JourneyManagement/CrewAssignment/CrewAssignmentModal';
import { CrewManagementModal } from '@/components/JourneyManagement/CrewManagement/CrewManagementModal';
import { MediaUploadModal } from '@/components/JourneyManagement/MediaUpload/MediaUploadModal';
import { JourneyEditModal } from '@/components/JourneyManagement/JourneyEdit/JourneyEditModal';
import { SimplifiedJourneyInterface } from '@/components/JourneyManagement/SimplifiedJourneyInterface';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export default function JourneyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const journeyId = params.id as string;
  const { journeys } = useJourneyStore();
  
  const [isTracking, setIsTracking] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [showCrewAssignment, setShowCrewAssignment] = useState(false);
  const [showCrewManagement, setShowCrewManagement] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showJourneyEdit, setShowJourneyEdit] = useState(false);

  // Handle query parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'edit') {
      setShowJourneyEdit(true);
    }
  }, [searchParams]);

  // Find the journey by ID
  const journey = journeys.find(j => j.id === journeyId);

  if (!journey) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Truck className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">Journey not found</h3>
          <p className="text-text-secondary mb-6 text-sm max-w-md mx-auto">
            The journey you're looking for doesn't exist or may have been removed.
          </p>
          <Button onClick={() => router.push('/journeys')} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journeys
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this journey?')) {
      toast.success('Journey deleted');
      router.push('/journeys');
    }
  };

  // Modal handlers
  const handleCrewAssignment = (assignedCrew: any[]) => {
    toast.success(`${assignedCrew.length} crew member${assignedCrew.length !== 1 ? 's' : ''} assigned successfully!`);
    // Refresh journey data or update state as needed
  };

  const handleCrewManagementUpdate = () => {
    toast.success('Crew management updated!');
    // Refresh crew data
  };

  const handleMediaUpload = (uploadedFiles: any[]) => {
    toast.success(`${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''} uploaded successfully!`);
    // Refresh media data
  };

  const handleJourneyUpdate = (updatedJourney: any) => {
    toast.success('Journey updated successfully!');
    // Update journey in store or refresh data
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MORNING_PREP': return 'warning';
      case 'EN_ROUTE': return 'info';
      case 'ONSITE': return 'secondary';
      case 'COMPLETED': return 'success';
      case 'AUDITED': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'MORNING_PREP': return '🕐 Morning Prep';
      case 'EN_ROUTE': return '🚛 En Route';
      case 'ONSITE': return '📍 On Site';
      case 'COMPLETED': return '✅ Completed';
      case 'AUDITED': return '📋 Audited';
      default: return status;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'crew', label: 'Crew', icon: Users },
    { id: 'media', label: 'Media', icon: Camera },
    { id: 'chat', label: 'Chat', icon: MessageSquare }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <JourneyOverview
            journey={journey}
            journeyId={journeyId}
            isTracking={isTracking}
            onTrackingToggle={setIsTracking}
          />
        );

      case 'timeline':
        return <JourneyTimeline journeyId={journeyId} />;

      case 'crew':
        return <JourneyCrew journeyId={journeyId} />;

      case 'media':
        return <JourneyMedia journeyId={journeyId} />;

      case 'chat':
        return <JourneyChat journeyId={journeyId} />;

      default:
        return null;
    }
  };

  // Show simplified interface for drivers and movers
  if (user && ['DRIVER', 'MOVER'].includes(user.role)) {
    return (
      <SimplifiedJourneyInterface
        journeyId={journeyId}
        journey={journey}
        userRole={user.role as 'DRIVER' | 'MOVER'}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header - Improved Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-start space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-text-primary truncate">
                Journey {journey.truckNumber || journey.id}
              </h1>
              <Badge variant={getStatusColor(journey.status)} className="flex-shrink-0">
                {getStatusText(journey.status)}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-text-secondary">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(journey.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Location {journey.id}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0 flex-wrap gap-2">
          <Button variant="secondary" size="sm" className="h-9" onClick={() => setShowJourneyEdit(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Journey
          </Button>
          <Button variant="secondary" size="sm" className="h-9" onClick={() => setShowCrewAssignment(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Assign Crew
          </Button>
          <Button variant="secondary" size="sm" className="h-9" onClick={() => setShowMediaUpload(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Media
          </Button>
          <Button variant="secondary" size="sm" className="h-9" onClick={() => setShowCrewManagement(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Crew
          </Button>
          <Button variant="secondary" size="sm" className="h-9">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            className="h-9"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs - Improved Navigation */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-1 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-3 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0
                  ${activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-600'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Management Modals */}
      <CrewAssignmentModal
        journeyId={journeyId}
        journeyTitle={journey.title || `Journey ${journey.id}`}
        isOpen={showCrewAssignment}
        onClose={() => setShowCrewAssignment(false)}
        onAssignmentComplete={handleCrewAssignment}
      />

      <CrewManagementModal
        isOpen={showCrewManagement}
        onClose={() => setShowCrewManagement(false)}
        onCrewUpdated={handleCrewManagementUpdate}
      />

      <MediaUploadModal
        journeyId={journeyId}
        journeyTitle={journey.title || `Journey ${journey.id}`}
        isOpen={showMediaUpload}
        onClose={() => setShowMediaUpload(false)}
        onUploadComplete={handleMediaUpload}
      />

      <JourneyEditModal
        journeyId={journeyId}
        isOpen={showJourneyEdit}
        onClose={() => setShowJourneyEdit(false)}
        onSaveComplete={handleJourneyUpdate}
      />
    </div>
  );
} 
        isOpen={showMediaUpload}
        onClose={() => setShowMediaUpload(false)}
        onUploadComplete={handleMediaUpload}
      />

      <JourneyEditModal
        journeyId={journeyId}
        isOpen={showJourneyEdit}
        onClose={() => setShowJourneyEdit(false)}
        onSaveComplete={handleJourneyUpdate}
      />
    </div>
  );
} 