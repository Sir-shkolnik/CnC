'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { 
  Upload,
  X,
  Camera,
  Video,
  FileText,
  Image,
  File,
  Trash2,
  Download,
  Eye,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MediaFile {
  id?: string;
  file: File;
  type: 'PHOTO' | 'VIDEO' | 'DOCUMENT';
  preview?: string;
  uploadProgress?: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

interface MediaUploadModalProps {
  journeyId: string;
  journeyTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (uploadedFiles: any[]) => void;
}

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  journeyId,
  journeyTitle,
  isOpen,
  onClose,
  onUploadComplete
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): 'PHOTO' | 'VIDEO' | 'DOCUMENT' => {
    if (file.type.startsWith('image/')) return 'PHOTO';
    if (file.type.startsWith('video/')) return 'VIDEO';
    return 'DOCUMENT';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PHOTO': return <Image className="w-6 h-6 text-primary" />;
      case 'VIDEO': return <Video className="w-6 h-6 text-secondary" />;
      case 'DOCUMENT': return <FileText className="w-6 h-6 text-info" />;
      default: return <File className="w-6 h-6 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PHOTO': return 'bg-primary/20 text-primary border-primary/30';
      case 'VIDEO': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'DOCUMENT': return 'bg-info/20 text-info border-info/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const createPreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const validFiles: MediaFile[] = [];

    for (const file of fileArray) {
      if (file.size > maxSize) {
        toast.error(`File "${file.name}" is too large. Maximum size is 50MB.`);
        continue;
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type "${file.type}" is not supported.`);
        continue;
      }

      const preview = await createPreview(file);
      const mediaFile: MediaFile = {
        file,
        type: getFileType(file),
        preview: preview || undefined,
        status: 'pending'
      };

      validFiles.push(mediaFile);
    }

    setMediaFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (mediaFile: MediaFile, index: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', mediaFile.file);
      formData.append('type', mediaFile.type);
      formData.append('journeyId', journeyId);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setMediaFiles(prev => 
            prev.map((file, i) => 
              i === index 
                ? { ...file, uploadProgress: progress, status: 'uploading' }
                : file
            )
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            setMediaFiles(prev => 
              prev.map((file, i) => 
                i === index 
                  ? { ...file, status: 'completed', id: response.id }
                  : file
              )
            );
            resolve(response);
          } catch (error) {
            setMediaFiles(prev => 
              prev.map((file, i) => 
                i === index 
                  ? { ...file, status: 'error', errorMessage: 'Invalid response' }
                  : file
              )
            );
            reject(error);
          }
        } else {
          const errorMessage = `Upload failed: ${xhr.status}`;
          setMediaFiles(prev => 
            prev.map((file, i) => 
              i === index 
                ? { ...file, status: 'error', errorMessage }
                : file
            )
          );
          reject(new Error(errorMessage));
        }
      };

      xhr.onerror = () => {
        setMediaFiles(prev => 
          prev.map((file, i) => 
            i === index 
              ? { ...file, status: 'error', errorMessage: 'Network error' }
              : file
          )
        );
        reject(new Error('Network error'));
      };

      const token = localStorage.getItem('access_token');
      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/journey/${journeyId}/media`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  };

  const handleUploadAll = async () => {
    const pendingFiles = mediaFiles.filter(file => file.status === 'pending');
    
    if (pendingFiles.length === 0) {
      toast.error('No files to upload');
      return;
    }

    setUploading(true);
    const uploadPromises: Promise<any>[] = [];

    mediaFiles.forEach((file, index) => {
      if (file.status === 'pending') {
        uploadPromises.push(uploadFile(file, index));
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        toast.success(`${successful} file${successful !== 1 ? 's' : ''} uploaded successfully!`);
        onUploadComplete?.(results
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<any>).value)
        );
      }

      if (failed > 0) {
        toast.error(`${failed} file${failed !== 1 ? 's' : ''} failed to upload`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center">
              <Upload className="w-6 h-6 mr-2 text-primary" />
              Upload Media Files
            </h2>
            <p className="text-text-secondary text-sm mt-1">{journeyTitle}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 max-h-[600px] overflow-y-auto">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              Support for images, videos, and documents (max 50MB each)
            </p>
            
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Button onClick={() => fileInputRef.current?.click()}>
                <Plus className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-6 text-xs text-text-secondary">
              <div className="flex items-center space-x-1">
                <Image className="w-4 h-4" />
                <span>Photos</span>
              </div>
              <div className="flex items-center space-x-1">
                <Video className="w-4 h-4" />
                <span>Videos</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>Documents</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* File List */}
          {mediaFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">
                  Selected Files ({mediaFiles.length})
                </h3>
                <Button 
                  onClick={handleUploadAll}
                  disabled={uploading || mediaFiles.every(file => file.status !== 'pending')}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload All ({mediaFiles.filter(file => file.status === 'pending').length})
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mediaFiles.map((mediaFile, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {/* Preview */}
                        <div className="flex-shrink-0">
                          {mediaFile.preview ? (
                            <img 
                              src={mediaFile.preview} 
                              alt={mediaFile.file.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                              {getFileIcon(mediaFile.type)}
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-text-primary truncate">
                                {mediaFile.file.name}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={`text-xs ${getTypeColor(mediaFile.type)}`}>
                                  {mediaFile.type}
                                </Badge>
                                <span className="text-xs text-text-secondary">
                                  {formatFileSize(mediaFile.file.size)}
                                </span>
                              </div>
                            </div>
                            
                            {mediaFile.status === 'pending' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeFile(index)}
                                className="flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          {/* Status */}
                          <div className="mt-2">
                            {mediaFile.status === 'pending' && (
                              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                                <AlertCircle className="w-4 h-4" />
                                <span>Ready to upload</span>
                              </div>
                            )}
                            
                            {mediaFile.status === 'uploading' && (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm text-primary">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Uploading... {mediaFile.uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${mediaFile.uploadProgress || 0}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {mediaFile.status === 'completed' && (
                              <div className="flex items-center space-x-2 text-sm text-success">
                                <CheckCircle className="w-4 h-4" />
                                <span>Uploaded successfully</span>
                              </div>
                            )}
                            
                            {mediaFile.status === 'error' && (
                              <div className="flex items-center space-x-2 text-sm text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                <span>{mediaFile.errorMessage || 'Upload failed'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upload Summary */}
          {mediaFiles.length > 0 && (
            <div className="mt-6 p-4 bg-surface/30 rounded-lg">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-text-primary">
                    {mediaFiles.length}
                  </div>
                  <div className="text-xs text-text-secondary">Total Files</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-warning">
                    {mediaFiles.filter(f => f.status === 'pending').length}
                  </div>
                  <div className="text-xs text-text-secondary">Pending</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-success">
                    {mediaFiles.filter(f => f.status === 'completed').length}
                  </div>
                  <div className="text-xs text-text-secondary">Completed</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-400">
                    {mediaFiles.filter(f => f.status === 'error').length}
                  </div>
                  <div className="text-xs text-text-secondary">Failed</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-text-secondary">
            {mediaFiles.length > 0 && (
              <>
                Total size: {formatFileSize(mediaFiles.reduce((sum, file) => sum + file.file.size, 0))}
              </>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={onClose}>
              {mediaFiles.some(f => f.status === 'completed') ? 'Done' : 'Cancel'}
            </Button>
            {mediaFiles.filter(f => f.status === 'pending').length > 0 && (
              <Button onClick={handleUploadAll} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload All'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};