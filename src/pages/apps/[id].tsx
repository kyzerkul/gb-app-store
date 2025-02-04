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
}

export default function ApplicationPage() {
  const router = useRouter();
  const { id } = router.query;
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
        {/* Image et titre */}
        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden mb-8">
          <Image
            src={app.image_url}
            alt={app.name}
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
            <h1 className="text-3xl font-bold text-white">{app.name}</h1>
            <p className="text-gray-200 mt-2">
              {new Date(app.created_at).toLocaleDateString('fr-FR', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Description courte */}
        <div className="bg-gray-100 p-4 rounded-lg mb-8">
          <p className="text-gray-700 italic">{app.description}</p>
        </div>

        {/* Note et partage */}
        <div className="flex justify-between items-center mb-8">
          <StarRating rating={app.rating || 0} totalVotes={app.votes_count || 0} />
          <SocialShare
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title={`Télécharger ${app.name}`}
          />
        </div>

        {/* Informations de l'application */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-sm font-medium text-gray-500">Nom de l'application</h2>
            <p className="mt-1 text-lg font-semibold text-gray-900">{app.name}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-sm font-medium text-gray-500">Genre</h2>
            <p className="mt-1 text-lg font-semibold text-green-600">Application</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-sm font-medium text-gray-500">Taille</h2>
            <p className="mt-1 text-lg font-semibold text-gray-900">{formatFileSize(app.size)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-sm font-medium text-gray-500">Dernière version</h2>
            <p className="mt-1 text-lg font-semibold text-gray-900">{app.version}</p>
          </div>
        </div>

        {/* Bouton de téléchargement */}
        <button
          onClick={handleDownload}
          className="w-full bg-green-500 text-white py-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 mb-8"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span className="text-lg font-medium">Télécharger ({formatFileSize(app.size)})</span>
        </button>

        {/* Captures d'écran */}
        {app.screenshots && app.screenshots.length > 0 && (
          <div className="mb-8">
            <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
              {app.screenshots.map((screenshot, index) => (
                <button
                  key={screenshot}
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setModalOpen(true);
                  }}
                  className="flex-none w-64 md:w-80 relative aspect-[9/16] rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Image
                    src={screenshot}
                    alt={`Capture d'écran ${index + 1} de ${app.name}`}
                    layout="fill"
                    objectFit="cover"
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal des captures d'écran */}
        <ImageModal
          images={app.screenshots || []}
          initialIndex={selectedImageIndex}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />

        {/* Description détaillée */}
        {app.long_description && (
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mb-4">Description détaillée</h2>
            <RichTextContent content={app.long_description} />
          </div>
        )}
      </div>
    </Layout>
  );
}
