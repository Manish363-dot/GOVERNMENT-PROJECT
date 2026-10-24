import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogGalleryModal } from '@/landing-page/BlogGalleryModal';

export function MediaGalleryPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-navy-950">
      <BlogGalleryModal isOpen={true} onClose={handleClose} />
    </div>
  );
}

export default MediaGalleryPage;
