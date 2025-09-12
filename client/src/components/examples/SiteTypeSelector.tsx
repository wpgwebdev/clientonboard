import { useState } from 'react';
import SiteTypeSelector from '../SiteTypeSelector';

export default function SiteTypeSelectorExample() {
  const [selectedType, setSelectedType] = useState<string>('brochure');
  
  const handleTypeSelect = (typeId: string) => {
    console.log('Site type selected:', typeId);
    setSelectedType(typeId);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">What type of website do you need?</h2>
        <p className="text-muted-foreground">
          Select the option that best describes your website requirements.
        </p>
      </div>
      <SiteTypeSelector 
        selectedType={selectedType}
        onTypeSelect={handleTypeSelect}
      />
    </div>
  );
}