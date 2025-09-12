import { useState } from 'react';
import DesignStyleSelector, { type DesignPreferences } from '../DesignStyleSelector';

export default function DesignStyleSelectorExample() {
  const [preferences, setPreferences] = useState<DesignPreferences>({
    selectedStyle: 'modern',
    inspirationLinks: [
      'https://www.apple.com',
      'https://www.stripe.com'
    ],
    additionalNotes: 'We want something clean and professional that builds trust with our clients.'
  });
  
  const handlePreferencesUpdate = (updatedPreferences: DesignPreferences) => {
    console.log('Design preferences updated:', updatedPreferences);
    setPreferences(updatedPreferences);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Design Preferences</h2>
        <p className="text-muted-foreground">
          Help us understand your visual preferences and design requirements.
        </p>
      </div>
      <DesignStyleSelector
        preferences={preferences}
        onPreferencesUpdate={handlePreferencesUpdate}
      />
    </div>
  );
}