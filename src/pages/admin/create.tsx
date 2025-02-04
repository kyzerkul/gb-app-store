import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import RichTextEditor from '../../components/RichTextEditor';

export default function CreateApplication() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '',
    size: 0,
    image_url: '',
    download_url: '',
    featured: false,
    editors_choice: false,
    long_description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      router.push(`/admin/edit/${data.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Une erreur est survenue lors de la création de l\'application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Nouvelle application
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
              {/* Nom */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Description courte */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description courte
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Version */}
              <div>
                <label htmlFor="version" className="block text-sm font-medium text-gray-700">
                  Version
                </label>
                <input
                  type="text"
                  name="version"
                  id="version"
                  required
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Taille */}
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                  Taille (en octets)
                </label>
                <input
                  type="number"
                  name="size"
                  id="size"
                  required
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
                  className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* URL de l'image */}
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                  URL de l'image
                </label>
                <input
                  type="url"
                  name="image_url"
                  id="image_url"
                  required
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* URL de téléchargement */}
              <div>
                <label htmlFor="download_url" className="block text-sm font-medium text-gray-700">
                  URL de téléchargement
                </label>
                <input
                  type="url"
                  name="download_url"
                  id="download_url"
                  required
                  value={formData.download_url}
                  onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                  className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Options de catégorie */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                    En vedette cette semaine
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editors_choice"
                    name="editors_choice"
                    checked={formData.editors_choice}
                    onChange={(e) => setFormData({ ...formData, editors_choice: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editors_choice" className="ml-2 block text-sm text-gray-900">
                    Notre sélection
                  </label>
                </div>
              </div>

              {/* Description longue */}
              <div>
                <label htmlFor="long_description" className="block text-sm font-medium text-gray-700">
                  Description détaillée
                </label>
                <div className="mt-1">
                  <RichTextEditor
                    content={formData.long_description}
                    onChange={(content) => setFormData({ ...formData, long_description: content })}
                  />
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {loading ? 'Création...' : 'Créer l\'application'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
