import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Layout from '../components/Layout';
import AppCard from '../components/AppCard';
import type { Application } from '../types/application';

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;
  const supabase = useSupabaseClient();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function searchApps() {
      if (!q) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('applications')
          .select()
          .ilike('name', `%${q}%`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error searching apps:', error);
          return;
        }

        setApps(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    searchApps();
  }, [q, supabase]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-krapk-text mb-8">
          {loading ? (
            'Recherche en cours...'
          ) : apps.length > 0 ? (
            `${apps.length} résultat${apps.length > 1 ? 's' : ''} pour "${q}"`
          ) : (
            `Aucun résultat pour "${q}"`
          )}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
