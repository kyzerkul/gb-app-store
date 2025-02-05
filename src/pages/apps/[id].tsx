import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import Image from 'next/image';
import toast from 'react-hot-toast';
import StarRating from '../../components/StarRating';
import SocialShare from '../../components/SocialShare';
import ImageModal from '../../components/ImageModal';
import RichTextContent from '../../components/RichTextContent';

interface Application {
  id: string;
  name: string;
  description: string;
  long_description: string;
  version: string;
  size: number;
  image_url: string;
  download_url: string;
  screenshots: string[];
  created_at: string;
  rating: number;
  votes_count: number;
  publisher: string;
}

export default function ApplicationPage() {
  const router = useRouter();
  const { id } = router.query;
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const fetchApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setApp(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement de l\'application');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)}M`;
  };

  const handleDownload = async () => {
    if (!app) return;
    try {
      window.open(app.download_url, '_blank');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleRatingChange = async (newRating: number) => {
    // TODO: Implémenter la mise à jour de la note
    console.log('Nouvelle note:', newRating);
  };

  const handleShare = (platform: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Télécharger ${app.name}`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'x':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
        break;
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const openLightbox = (index: number) => {
    setCurrentImage(index);
    setLightboxOpen(true);
  };

  if (loading || !app) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Image principale avec titre */}
        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden mb-6">
          <Image
            src={app.image_url}
            alt={app.name}
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
            <h1 className="text-3xl font-bold text-white mb-2">{app.name}</h1>
          </div>
        </div>

        {/* Brève description */}
        <div className="bg-gray-100 p-4 rounded mb-6 italic text-gray-600 border border-gray-300">
          <p>{app.name}: {app.description}</p>
        </div>

        {/* Informations de l'application */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8 divide-y divide-gray-200 border-2 border-gray-300">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-krapk-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
              </svg>
              <span className="text-krapk-text/60">Nom de l'app</span>
            </div>
            <div className="font-medium">{app.name}</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-100">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-krapk-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              <span className="text-krapk-text/60">Version</span>
            </div>
            <div className="font-medium">{app.version}</div>
          </div>

          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-krapk-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7l-5-5zM6 20V4h8v4h4v12H6zm7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              <span className="text-krapk-text/60">Taille</span>
            </div>
            <div className="font-medium">{formatFileSize(app.size)}</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-100">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-krapk-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.88-11.71L10 14.17l-1.88-1.88a.996.996 0 1 0-1.41 1.41l2.59 2.59c.39.39 1.02.39 1.41 0L17.3 9.7a.996.996 0 0 0 0-1.41c-.39-.39-1.03-.39-1.42 0z"/>
              </svg>
              <span className="text-krapk-text/60">Bookmaker</span>
            </div>
            <div className="font-medium">{app.publisher}</div>
          </div>
        </div>

        {/* Section étoiles et partage */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <StarRating 
                initialRating={app.rating} 
                readOnly={true}
              />
              <span className="text-sm text-gray-500">({app.votes_count} notes)</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                className="social-btn facebook"
                onClick={() => handleShare('facebook')}
                aria-label="Partager sur Facebook"
              >
                <svg className="w-5 h-5" viewBox="0 0 320 512">
                  <path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                </svg>
              </button>
              <button 
                className="social-btn x"
                onClick={() => handleShare('x')}
                aria-label="Partager sur X"
              >
                <svg className="w-5 h-5" viewBox="0 0 512 512">
                  <path fill="currentColor" d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
                </svg>
              </button>
              <button 
                className="social-btn linkedin"
                onClick={() => handleShare('linkedin')}
                aria-label="Partager sur LinkedIn"
              >
                <svg className="w-5 h-5" viewBox="0 0 448 512">
                  <path fill="currentColor" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
                </svg>
              </button>
              <button 
                className="social-btn email"
                onClick={() => handleShare('email')}
                aria-label="Partager par email"
              >
                <svg className="w-5 h-5" viewBox="0 0 512 512">
                  <path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Bouton de téléchargement supérieur */}
        <div className="mb-8">
          <a
            href={app.download_url}
            className="block w-full md:w-2/3 mx-auto bg-krapk-accent hover:bg-krapk-accent/90 text-white text-center font-semibold py-4 px-6 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Télécharger {app.name}</span>
            </div>
          </a>
        </div>

        {/* Galerie d'images */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {app.screenshots?.map((screenshot, index) => (
            <button
              key={index}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer bg-black shadow-lg hover:scale-105 transition-transform"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={screenshot}
                alt={`Capture d'écran ${index + 1} de ${app.name}`}
                layout="fill"
                objectFit="cover"
                className="rounded-xl"
              />
            </button>
          ))}
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div 
              className="relative max-h-[90vh] aspect-[9/16] rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={app.screenshots[currentImage]}
                alt={`Capture d'écran ${currentImage + 1} de ${app.name}`}
                layout="fill"
                objectFit="cover"
                quality={100}
              />
            </div>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImage((prev) => (prev === 0 ? app.screenshots.length - 1 : prev - 1));
              }}
              aria-label="Image précédente"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImage((prev) => (prev === app.screenshots.length - 1 ? 0 : prev + 1));
              }}
              aria-label="Image suivante"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Description détaillée */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Description détaillée</h2>
          <div className="prose max-w-none mb-8">
            <RichTextContent content={app.long_description || ''} />
          </div>

          {/* Second bouton de téléchargement */}
          <div className="mt-8 flex justify-center">
            <a
              href={app.download_url}
              className="block w-full md:w-2/3 mx-auto bg-krapk-accent hover:bg-krapk-accent/90 text-white text-center font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Télécharger {app.name}</span>
              </div>
            </a>
          </div>
        </div>

        {/* Modal des captures d'écran */}
        {/* <ImageModal
          images={app.screenshots || []}
          initialIndex={0}
          isOpen={false}
          onClose={() => {}}
        /> */}
      </div>
    </Layout>
  );
}
