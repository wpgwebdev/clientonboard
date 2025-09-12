import { useState, useRef } from "react";
import { Upload, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  currentFile?: File | null;
  placeholder?: string;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  acceptedTypes = "image/*",
  maxSize = 10,
  currentFile,
  placeholder = "Drop your file here or click to browse",
  className = ""
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      console.log(`File too large. Maximum size is ${maxSize}MB`);
      return;
    }
    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  if (currentFile) {
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
            onClick={onFileRemove}
            data-testid="button-remove-file"
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
            {acceptedTypes.includes('image') ? 'Images' : 'Files'} up to {maxSize}MB
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
          onChange={handleInputChange}
        />
      </Card>
    </div>
  );
}