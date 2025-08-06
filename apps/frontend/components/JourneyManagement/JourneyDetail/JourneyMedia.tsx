'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Camera, Upload, Download, Eye, FileText, Video, Image, FolderOpen } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';

interface MediaItem {
  id: string;
  type: 'photo' | 'video' | 'document';
  name: string;
  time: string;
  size?: string;
  url?: string;
  thumbnail?: string;
}

interface JourneyMediaProps {
  journeyId: string;
}

export const JourneyMedia: React.FC<JourneyMediaProps> = ({ journeyId }) => {
  // In a real app, this would fetch media data from the API
  const mediaItems: MediaItem[] = [
    { id: '1', type: 'photo', name: 'Loading Photo', time: '09:15 AM', size: '2.3 MB', thumbnail: '/api/placeholder/150/150' },
    { id: '2', type: 'photo', name: 'Route Photo', time: '09:45 AM', size: '1.8 MB', thumbnail: '/api/placeholder/150/150' },
    { id: '3', type: 'video', name: 'Unloading Video', time: '10:30 AM', size: '15.2 MB', thumbnail: '/api/placeholder/150/150' },
    { id: '4', type: 'document', name: 'Delivery Receipt', time: '11:00 AM', size: '0.5 MB' },
    { id: '5', type: 'photo', name: 'Final Inspection', time: '11:30 AM', size: '3.1 MB', thumbnail: '/api/placeholder/150/150' },
    { id: '6', type: 'document', name: 'Customer Signature', time: '11:45 AM', size: '0.8 MB' }
  ];

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'photo':
        return <Image className="w-6 h-6 text-primary" />;
      case 'video':
        return <Video className="w-6 h-6 text-secondary" />;
      case 'document':
        return <FileText className="w-6 h-6 text-info" />;
      default:
        return <Camera className="w-6 h-6 text-primary" />;
    }
  };

  const getMediaTypeColor = (type: string) => {
    switch (type) {
      case 'photo':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'video':
        return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'document':
        return 'bg-info/20 text-info border-info/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  const handleView = (item: MediaItem) => {
    // In a real app, this would open the media in a viewer
    console.log('Viewing:', item.name);
  };

  const handleDownload = (item: MediaItem) => {
    // In a real app, this would download the file
    console.log('Downloading:', item.name);
  };

  const handleUpload = () => {
    // In a real app, this would open file picker
    console.log('Uploading new media');
  };

  const mediaStats = {
    total: mediaItems.length,
    photos: mediaItems.filter(item => item.type === 'photo').length,
    videos: mediaItems.filter(item => item.type === 'video').length,
    documents: mediaItems.filter(item => item.type === 'document').length
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center">
            <Camera className="w-4 h-4 mr-2 text-primary" />
            Media & Documents ({mediaItems.length})
          </CardTitle>
          <Button size="sm" onClick={handleUpload} className="h-8">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Media Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-surface/30 rounded-lg text-center">
            <div className="text-lg font-bold text-primary">{mediaStats.total}</div>
            <div className="text-xs text-text-secondary">Total</div>
          </div>
          <div className="p-3 bg-surface/30 rounded-lg text-center">
            <div className="text-lg font-bold text-primary">{mediaStats.photos}</div>
            <div className="text-xs text-text-secondary">Photos</div>
          </div>
          <div className="p-3 bg-surface/30 rounded-lg text-center">
            <div className="text-lg font-bold text-secondary">{mediaStats.videos}</div>
            <div className="text-xs text-text-secondary">Videos</div>
          </div>
          <div className="p-3 bg-surface/30 rounded-lg text-center">
            <div className="text-lg font-bold text-info">{mediaStats.documents}</div>
            <div className="text-xs text-text-secondary">Documents</div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {mediaItems.map((item) => (
            <div key={item.id} className="group relative">
              <div className="p-3 bg-surface/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg">
                {/* Media Preview */}
                <div className="relative mb-3">
                  {item.thumbnail ? (
                    <div className="w-full h-24 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={item.thumbnail} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center">
                        {getMediaIcon(item.type)}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                      {getMediaIcon(item.type)}
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className={`text-xs ${getMediaTypeColor(item.type)}`}>
                      {item.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Media Info */}
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-text-primary truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <p className="text-xs text-text-secondary">{item.time}</p>
                  {item.size && (
                    <p className="text-xs text-text-secondary">{item.size}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30"
                      onClick={() => handleView(item)}
                      title={`View ${item.name}`}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30"
                      onClick={() => handleDownload(item)}
                      title={`Download ${item.name}`}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mediaItems.length === 0 && (
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-text-secondary mx-auto mb-3" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No media uploaded</h3>
            <p className="text-text-secondary mb-4 text-sm">
              Upload photos, videos, and documents to track this journey.
            </p>
            <Button onClick={handleUpload} size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 