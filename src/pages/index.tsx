import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import Link from 'next/link';
import Image from 'next/image';
import Categories from '../components/Categories';

interface Application {
  id: string;
  name: string;
  description: string;
  version: string;
  size: number;
  image_url: string;
  download_url: string;
  created_at: string;
  category?: string;
  featured?: boolean;
  editors_choice?: boolean;
}

export default function Home() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

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

  const AppCard = ({ app }: { app: Application }) => (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/apps/${app.id}`} className="block">
        <div className="relative aspect-video">
          <Image
            src={app.image_url}
            alt={app.name}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900">{app.name}</h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{app.description}</p>
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <span>{app.version}</span>
            <span className="mx-2">•</span>
            <span>{formatFileSize(app.size)}</span>
          </div>
        </div>
      </Link>
    </div>
  );

  const Section = ({ title, apps, viewAllLink = "#" }: { title: string; apps: Application[]; viewAllLink?: string }) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <Link href={viewAllLink} className="text-green-600 hover:text-green-700 text-sm font-medium">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  const newApps = applications.slice(0, 3);
  const featuredApps = applications.filter(app => app.featured).slice(0, 6);
  const editorsChoice = applications.filter(app => app.editors_choice).slice(0, 6);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Section 
          title="Nouvelles applications" 
          apps={newApps} 
          viewAllLink="/category/new"
        />
        
        <Section 
          title="En vedette cette semaine" 
          apps={featuredApps} 
          viewAllLink="/category/featured"
        />
        
        <Section 
          title="Notre sélection" 
          apps={editorsChoice} 
          viewAllLink="/category/editors-choice"
        />

        {applications.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900">Aucune application disponible</h3>
            <p className="mt-2 text-gray-500">Les applications apparaîtront ici une fois ajoutées.</p>
          </div>
        )}

        <div className="border-t border-gray-200 mt-12">
          <Categories />
        </div>
      </div>
    </Layout>
  );
}
