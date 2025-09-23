import { useState, useRef } from "react";
import { Upload, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  onFilesSelect?: (files: File[]) => void;
  onFileRemoveAt?: (index: number) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  currentFile?: File | null;
  currentFiles?: File[];
  placeholder?: string;
  className?: string;
  multiple?: boolean;
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  onFilesSelect,
  onFileRemoveAt,
  acceptedTypes = "image/*",
  maxSize = 10,
  currentFile,
  currentFiles,
  placeholder = "Drop your file here or click to browse",
  className = "",
  multiple = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      if (multiple) {
        const files = Array.from(e.dataTransfer.files);
        handleMultipleFileSelect(files);
      } else if (e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      console.log(`File too large. Maximum size is ${maxSize}MB`);
      return;
    }
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleMultipleFileSelect = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        console.log(`File ${file.name} too large. Maximum size is ${maxSize}MB`);
        return false;
      }
      return true;
    });
    
    if (onFilesSelect && validFiles.length > 0) {
      onFilesSelect(validFiles);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (multiple) {
        const files = Array.from(e.target.files);
        handleMultipleFileSelect(files);
      } else if (e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    }
  };

  const openFileDialog = () => {
    // Reset input value to allow re-selecting the same files
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    inputRef.current?.click();
  };

  // Render multiple files mode
  if (multiple && currentFiles && currentFiles.length > 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        {currentFiles.map((file, index) => (
          <Card key={`${file.name}-${index}`} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileImage className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemoveAt && onFileRemoveAt(index);
                }}
                data-testid={`button-remove-file-${index}`}
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {/* Add more files button */}
        <Card
          className="relative border-2 border-dashed transition-colors hover-elevate border-border hover:border-primary/50 cursor-pointer"
          onClick={openFileDialog}
        >
          <div className="p-4 text-center" data-testid="button-add-more-files">
            <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Add More Files</p>
          </div>
        </Card>
      </div>
    );
  }

  // Render single file mode
  if (!multiple && currentFile) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileImage className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium">{currentFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(currentFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onFileRemove && onFileRemove();
            }}
            data-testid="button-remove-file"
            aria-label={`Remove ${currentFile.name}`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card
        className={`relative border-2 border-dashed transition-colors hover-elevate ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div
          className="p-8 text-center cursor-pointer"
          onClick={openFileDialog}
          data-testid="button-upload-file"
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">{placeholder}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Files up to {maxSize}MB
          </p>
          <Button variant="outline">
            Choose File
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={handleInputChange}
        />
      </Card>
    </div>
  );
}