import { useState } from 'react';
import CreativeBriefReview, { type CreativeBriefData } from '../CreativeBriefReview';

export default function CreativeBriefReviewExample() {
  const [briefData] = useState<CreativeBriefData>({
    businessName: 'Acme Design Studio',
    businessDescription: 'Creative design studio specializing in branding and web design for small businesses.',
    colors: ['#3B82F6', '#10B981', '#F59E0B'],
    fonts: ['Inter', 'Playfair Display'],
    siteType: 'service',
    pages: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
      { name: 'Services', path: '/services' },
      { name: 'Portfolio', path: '/portfolio' },
      { name: 'Contact', path: '/contact' }
    ],
    pageContent: {
      'Home': 'Welcome to Acme Design Studio. We create beautiful, functional designs that help your business stand out.',
      'About': 'Our team of experienced designers is passionate about creating impactful visual solutions.',
      'Services': 'We offer comprehensive design services including branding, web design, and marketing materials.'
    },
    images: [],
    designStyle: 'modern',
    inspirationLinks: ['https://www.apple.com', 'https://www.stripe.com'],
    designNotes: 'Clean, professional design with emphasis on typography and whitespace.'
  });
  
  const handleExportPDF = () => {
    console.log('Exporting creative brief as PDF...');
  };
  
  const handleEditSection = (section: string) => {
    console.log('Editing section:', section);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <CreativeBriefReview
        briefData={briefData}
        onExportPDF={handleExportPDF}
        onEditSection={handleEditSection}
      />
    </div>
  );
}