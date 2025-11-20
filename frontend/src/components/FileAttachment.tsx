import React, { useRef, useState } from 'react';
import { Paperclip, Image, FileText, X, Download, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface FileAttachment {
  id: number;
  file: string;
  file_name: string;
  file_size: number;
  file_type: 'image' | 'document' | 'video' | 'audio';
  mime_type: string;
  thumbnail?: string;
}

interface FileAttachmentProps {
  attachments?: FileAttachment[];
  onFileSelect?: (files: FileList) => void;
  maxSize?: number; // MB
  allowedTypes?: string[];
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  attachments = [],
  onFileSelect,
  maxSize = 10,
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt']
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && onFileSelect) {
      // Validate file sizes
      const validFiles = Array.from(files).filter(file => {
        if (file.size > maxSize * 1024 * 1024) {
          alert(`File ${file.name} is too large. Max size: ${maxSize}MB`);
          return false;
        }
        return true;
      });
      
      if (validFiles.length > 0) {
        const fileList = new DataTransfer();
        validFiles.forEach(file => fileList.items.add(file));
        onFileSelect(fileList.files);
      }
    }
  };

  const openPreview = (attachment: FileAttachment) => {
    if (attachment.file_type === 'image') {
      setPreview(attachment.file);
    } else {
      window.open(attachment.file, '_blank');
    }
  };

  return (
    <div className="space-y-2">
      {/* File Input */}
      {onFileSelect && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleFileSelect}
            className="gap-2"
          >
            <Paperclip className="h-4 w-4" />
            Attach Files
          </Button>
        </div>
      )}

      {/* Attachments Display */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50"
            >
              {attachment.file_type === 'image' && attachment.thumbnail ? (
                <img
                  src={attachment.thumbnail}
                  alt={attachment.file_name}
                  className="h-10 w-10 object-cover rounded"
                />
              ) : (
                <div className="h-10 w-10 flex items-center justify-center bg-gray-200 rounded">
                  {getFileIcon(attachment.file_type)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {attachment.file_type}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(attachment.file_size)}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openPreview(attachment)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(attachment.file, '_blank')}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-4xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};