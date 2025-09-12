import { useState } from 'react';
import FileUpload from '../FileUpload';

export default function FileUploadExample() {
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileSelect = (selectedFile: File) => {
    console.log('File selected:', selectedFile.name);
    setFile(selectedFile);
  };
  
  const handleFileRemove = () => {
    console.log('File removed');
    setFile(null);
  };
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h3 className="text-lg font-semibold mb-4">Upload Your Logo</h3>
      <FileUpload
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        currentFile={file}
        acceptedTypes="image/*"
        maxSize={5}
        placeholder="Drop your logo here or click to browse"
      />
    </div>
  );
}