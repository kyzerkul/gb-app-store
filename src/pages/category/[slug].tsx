import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import Link from 'next/link';
import Image from 'next/image';

interface Application {
  id: string;
  name: string;
  description: string;
  version: string;
  size: number;
  image_url: string;
  featured: boolean;
  editors_choice: boolean;
}

const categoryTitles: { [key: string]: string } = {
  'new': 'Nouvelles applications',
  'featured': 'En vedette cette semaine',
  'editors-choice': 'Notre sélection'
};

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchApplications();
    }
  }, [slug]);

  const fetchApplications = async () => {
    try {
      let query = supabase.from('applications').select('*');

      switch (slug) {
        case 'new':
          query = query.order('created_at', { ascending: false });
          break;
        case 'featured':
          query = query.eq('featured', true);
          break;
        case 'editors-choice':
          query = query.eq('editors_choice', true);
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  const title = categoryTitles[slug as string] || 'Applications';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <div key={app.id} className="app-card">
              <Link href={`/apps/${app.id}`} className="block">
                <div className="app-image">
                  <Image
                    src={app.image_url}
                    alt={app.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="app-info">
                  <h3 className="app-title">{app.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{app.description}</p>
                  <div className="app-meta">
                    <span>{app.version}</span>
                    <span>•</span>
                    <span>{formatFileSize(app.size)}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900">Aucune application disponible</h3>
            <p className="mt-2 text-gray-500">Aucune application n'est disponible dans cette catégorie pour le moment.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
