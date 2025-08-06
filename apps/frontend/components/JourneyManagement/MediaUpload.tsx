'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/atoms/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { 
  Upload,
  Camera,
  Video,
  FileText,
  Shield,
  X,
  CheckCircle,
  AlertTriangle,
  Image,
  File,
  Trash2,
  Download,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Media {
  id: string
  type: 'PHOTO' | 'VIDEO' | 'DOCUMENT' | 'SIGNATURE'
  url: string
  filename: string
  size: number
  mimeType: string
  uploadedBy: string
  uploadedAt: string
  tags: string[]
  metadata?: {
    width?: number
    height?: number
    duration?: number
    location?: {
      lat: number
      lng: number
    }
  }
}

interface MediaUploadProps {
  journeyId: string
  entryId?: string
  allowedTypes: ('PHOTO' | 'VIDEO' | 'DOCUMENT' | 'SIGNATURE')[]
  maxFileSize: number // in MB
  onUploadComplete: (media: Media[]) => void
  onUploadProgress?: (progress: number) => void
  existingMedia?: Media[]
}

export default function MediaUpload({
  journeyId,
  entryId,
  allowedTypes,
  maxFileSize,
  onUploadComplete,
  onUploadProgress,
  existingMedia = []
}: MediaUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Array<{
    file: File
    progress: number
    status: 'uploading' | 'success' | 'error'
    error?: string
  }>>([])
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>(existingMedia)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileType = (file: File): 'PHOTO' | 'VIDEO' | 'DOCUMENT' | 'SIGNATURE' => {
    if (file.type.startsWith('image/')) return 'PHOTO'
    if (file.type.startsWith('video/')) return 'VIDEO'
    if (file.type === 'application/pdf' || file.type.includes('document')) return 'DOCUMENT'
    return 'SIGNATURE'
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`
    }

    // Check file type
    const fileType = getFileType(file)
    if (!allowedTypes.includes(fileType)) {
      return `File type ${fileType} is not allowed`
    }

    // Additional validation for images
    if (fileType === 'PHOTO') {
      if (!file.type.startsWith('image/')) {
        return 'Invalid image file'
      }
    }

    // Additional validation for videos
    if (fileType === 'VIDEO') {
      if (!file.type.startsWith('video/')) {
        return 'Invalid video file'
      }
    }

    return null
  }

  const handleFiles = useCallback(async (files: FileList) => {
    const validFiles: File[] = []
    const errors: string[] = []

    Array.from(files).forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
    }

    if (validFiles.length === 0) return

    // Add files to uploading state
    const newUploadingFiles = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }))
    setUploadingFiles(prev => [...prev, ...newUploadingFiles])

    // Simulate upload for each file
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      await simulateFileUpload(file, i)
    }
  }, [allowedTypes, maxFileSize])

  const simulateFileUpload = async (file: File, index: number) => {
    const fileType = getFileType(file)
    
    // Simulate progress updates
    for (let progress = 0; progress <= 100; progress += 10) {
      setUploadingFiles(prev => 
        prev.map((item, i) => 
          item.file === file 
            ? { ...item, progress }
            : item
        )
      )
      
      if (onUploadProgress) {
        onUploadProgress(progress)
      }
      
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Create mock media object
    const media: Media = {
      id: `media_${Date.now()}_${index}`,
      type: fileType,
      url: URL.createObjectURL(file),
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString(),
      tags: [],
      metadata: fileType === 'PHOTO' ? {
        width: 1920,
        height: 1080
      } : undefined
    }

    // Update uploading status to success
    setUploadingFiles(prev => 
      prev.map(item => 
        item.file === file 
          ? { ...item, status: 'success' as const }
          : item
      )
    )

    // Add to uploaded media
    setUploadedMedia(prev => [...prev, media])
    onUploadComplete([media])

    // Remove from uploading after a delay
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(item => item.file !== file))
    }, 2000)

    toast.success(`${file.name} uploaded successfully`)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const handleRemoveMedia = (mediaId: string) => {
    setUploadedMedia(prev => prev.filter(media => media.id !== mediaId))
    toast.success('Media removed')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PHOTO': return <Camera className="w-4 h-4" />
      case 'VIDEO': return <Video className="w-4 h-4" />
      case 'DOCUMENT': return <FileText className="w-4 h-4" />
      case 'SIGNATURE': return <Shield className="w-4 h-4" />
      default: return <File className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PHOTO': return 'primary'
      case 'VIDEO': return 'secondary'
      case 'DOCUMENT': return 'info'
      case 'SIGNATURE': return 'success'
      default: return 'default'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-text-secondary mb-4">
              Supported types: {allowedTypes.join(', ')} • Max size: {maxFileSize}MB
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Camera className="w-4 h-4 mr-2" />
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={allowedTypes.map(type => {
                switch (type) {
                  case 'PHOTO': return 'image/*'
                  case 'VIDEO': return 'video/*'
                  case 'DOCUMENT': return '.pdf,.doc,.docx'
                  case 'SIGNATURE': return 'image/*,.pdf'
                  default: return '*'
                }
              }).join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploading Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadingFiles.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-surface rounded-lg">
                  <div className="flex-shrink-0">
                    {item.status === 'uploading' && (
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    {item.status === 'success' && (
                      <CheckCircle className="w-8 h-8 text-success" />
                    )}
                    {item.status === 'error' && (
                      <AlertTriangle className="w-8 h-8 text-error" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatFileSize(item.file.size)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getTypeColor(getFileType(item.file))}>
                      {getFileType(item.file)}
                    </Badge>
                    {item.status === 'uploading' && (
                      <span className="text-sm text-text-secondary">
                        {item.progress}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Media */}
      {uploadedMedia.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Media ({uploadedMedia.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedMedia.map((media) => (
                <div key={media.id} className="bg-surface rounded-lg p-4">
                  <div className="aspect-square bg-border rounded-lg mb-3 flex items-center justify-center">
                    {media.type === 'PHOTO' && (
                      <Image className="w-8 h-8 text-primary" />
                    )}
                    {media.type === 'VIDEO' && (
                      <Video className="w-8 h-8 text-secondary" />
                    )}
                    {media.type === 'DOCUMENT' && (
                      <FileText className="w-8 h-8 text-info" />
                    )}
                    {media.type === 'SIGNATURE' && (
                      <Shield className="w-8 h-8 text-success" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={getTypeColor(media.type)} className="text-xs">
                        {media.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMedia(media.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <p className="text-sm font-medium text-text-primary truncate">
                      {media.filename}
                    </p>
                    
                    <div className="text-xs text-text-secondary space-y-1">
                      <p>{formatFileSize(media.size)}</p>
                      <p>Uploaded {formatDate(media.uploadedAt)}</p>
                      <p>by {media.uploadedBy}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 