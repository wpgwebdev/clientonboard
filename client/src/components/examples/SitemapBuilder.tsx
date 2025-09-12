import { useState } from 'react';
import SitemapBuilder, { type Page } from '../SitemapBuilder';
import { Home, Users, Briefcase, Mail } from 'lucide-react';

export default function SitemapBuilderExample() {
  const [pages, setPages] = useState<Page[]>([
    { id: '1', name: 'Home', path: '/', required: true, icon: Home },
    { id: '2', name: 'About', path: '/about', required: false, icon: Users },
    { id: '3', name: 'Services', path: '/services', required: false, icon: Briefcase },
    { id: '4', name: 'Contact', path: '/contact', required: true, icon: Mail }
  ]);
  
  const suggestedPages: Page[] = [
    { id: 'portfolio', name: 'Portfolio', path: '/portfolio', required: false },
    { id: 'testimonials', name: 'Testimonials', path: '/testimonials', required: false },
    { id: 'blog', name: 'Blog', path: '/blog', required: false },
    { id: 'faq', name: 'FAQ', path: '/faq', required: false },
    { id: 'team', name: 'Team', path: '/team', required: false },
    { id: 'pricing', name: 'Pricing', path: '/pricing', required: false }
  ];
  
  const handlePagesUpdate = (updatedPages: Page[]) => {
    console.log('Pages updated:', updatedPages);
    setPages(updatedPages);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Build Your Site Map</h2>
        <p className="text-muted-foreground">
          Add, remove, and organize the pages for your website. Required pages cannot be removed.
        </p>
      </div>
      <SitemapBuilder
        pages={pages}
        onPagesUpdate={handlePagesUpdate}
        suggestedPages={suggestedPages}
      />
    </div>
  );
}