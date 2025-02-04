import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Auth from '../../components/Auth';
import Layout from '../../components/Layout';
import Image from 'next/image';
import Link from 'next/link';

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
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    long_description: '',
    version: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchApplications();
    }
  }, [session]);

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
      toast.error('Erreur lors du chargement des applications');
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'app' | 'image' | 'screenshots') => {
    if (!e.target.files?.length) return;

    if (type === 'app') {
      setFile(e.target.files[0]);
    } else if (type === 'image') {
      setImage(e.target.files[0]);
    } else if (type === 'screenshots') {
      setScreenshots(Array.from(e.target.files));
    }
  };

  const sanitizeFileName = (fileName: string) => {
    return fileName.toLowerCase().replace(/[^a-z0-9.]/g, '-');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!file || !image) {
        throw new Error('Veuillez sélectionner un fichier d\'application et une image');
      }

      if (!formData.name || !formData.version) {
        throw new Error('Le nom et la version sont requis');
      }

      // Créer les dossiers nécessaires
      console.log('Creating necessary folders...');
      const folders = ['apps', 'images', 'screenshots'];
      for (const folder of folders) {
        try {
          await supabase.storage
            .from('applications')
            .upload(`${folder}/.keep`, new Blob([''], { type: 'text/plain' }), {
              upsert: true
            });
        } catch (error) {
          console.log(`Folder ${folder} might already exist:`, error);
        }
      }

      // Préparer les noms de fichiers sécurisés
      const timestamp = Date.now();
      const appFileName = `${timestamp}-${sanitizeFileName(file.name)}`;
      const imageFileName = `${timestamp}-${sanitizeFileName(image.name)}`;

      console.log('Uploading application file...');
      const { error: appError } = await supabase.storage
        .from('applications')
        .upload(`apps/${appFileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (appError) throw appError;

      console.log('Uploading main image...');
      const { error: imageError } = await supabase.storage
        .from('applications')
        .upload(`images/${imageFileName}`, image, {
          cacheControl: '3600',
          upsert: true
        });

      if (imageError) throw imageError;

      // Get public URLs
      const { data: { publicUrl: downloadUrl } } = supabase.storage
        .from('applications')
        .getPublicUrl(`apps/${appFileName}`);

      const { data: { publicUrl: imageUrl } } = supabase.storage
        .from('applications')
        .getPublicUrl(`images/${imageFileName}`);

      console.log('Uploading screenshots...');
      const screenshotUrls = await Promise.all(
        screenshots.map(async (screenshot, index) => {
          const screenshotFileName = `${timestamp}-${index}-${sanitizeFileName(screenshot.name)}`;
          const { error: screenshotError } = await supabase.storage
            .from('applications')
            .upload(`screenshots/${screenshotFileName}`, screenshot, {
              cacheControl: '3600',
              upsert: true
            });

          if (screenshotError) throw screenshotError;

          const { data: { publicUrl } } = supabase.storage
            .from('applications')
            .getPublicUrl(`screenshots/${screenshotFileName}`);

          return publicUrl;
        })
      );

      console.log('Creating database record...');
      const { error: dbError } = await supabase
        .from('applications')
        .insert([{
          name: formData.name,
          description: formData.description,
          long_description: formData.long_description,
          version: formData.version,
          size: file.size,
          image_url: imageUrl,
          download_url: downloadUrl,
          screenshots: screenshotUrls
        }]);

      if (dbError) throw dbError;

      toast.success('Application ajoutée avec succès !');
      router.push('/');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de l\'ajout de l\'application: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Administration des applications</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showAddForm ? 'Voir la liste' : 'Ajouter une application'}
          </button>
        </div>

        {showAddForm ? (
          <div className="mt-8">
            <div className="max-w-2xl mx-auto py-8 px-4">
              <h1 className="text-2xl font-bold mb-6">Ajouter une application</h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description courte</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brève description qui apparaîtra sur la carte de l'application"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description détaillée</label>
                  <textarea
                    name="long_description"
                    value={formData.long_description}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Description détaillée de l'application, ses fonctionnalités, etc."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Version</label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fichier d'application</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'app')}
                    required
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Image principale</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'image')}
                    required
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Captures d'écran</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileChange(e, 'screenshots')}
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                  >
                    {loading ? 'Ajout en cours...' : 'Ajouter l\'application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Application
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Version
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Taille
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Date d'ajout
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 relative">
                                <Image
                                  src={app.image_url}
                                  alt={app.name}
                                  layout="fill"
                                  objectFit="cover"
                                  className="rounded"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">{app.name}</div>
                                <div className="text-gray-500 truncate max-w-xs">{app.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {app.version}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatFileSize(app.size)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(app.created_at)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Link
                              href={`/admin/edit/${app.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Modifier
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
