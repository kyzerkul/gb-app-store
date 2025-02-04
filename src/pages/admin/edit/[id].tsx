import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabase';
import Layout from '../../../components/Layout';
import Auth from '../../../components/Auth';
import RichTextEditor from '../../../components/RichTextEditor';
import toast from 'react-hot-toast';
import Image from 'next/image';

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
  featured: boolean;
  editors_choice: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ApplicationFormData {
  name: string;
  description: string;
  long_description: string;
  version: string;
  size: number;
  image_url: string;
  download_url: string;
  featured: boolean;
  editors_choice: boolean;
}

const initialFormData: ApplicationFormData = {
  name: '',
  description: '',
  long_description: '',
  version: '',
  size: 0,
  image_url: '',
  download_url: '',
  featured: false,
  editors_choice: false,
};

export default function EditApplicationPage() {
  const router = useRouter();
  const { id } = router.query;
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newScreenshots, setNewScreenshots] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

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
    if (id && session) {
      fetchApplication();
    }
  }, [id, session]);

  useEffect(() => {
    if (application) {
      setFormData({
        name: application.name,
        description: application.description,
        long_description: application.long_description || '',
        version: application.version,
        size: application.size,
        image_url: application.image_url,
        download_url: application.download_url,
        featured: application.featured,
        editors_choice: application.editors_choice,
      });
      setPreviewImage(application.image_url);
    }
  }, [application]);

  const fetchApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setApplication(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement de l\'application');
    }
  };

  const autoSave = async (data: ApplicationFormData) => {
    try {
      setAutoSaveStatus('Sauvegarde...');
      const { error } = await supabase
        .from('applications')
        .update({
          name: data.name,
          description: data.description,
          long_description: data.long_description,
          version: data.version,
          size: data.size,
          featured: data.featured,
          editors_choice: data.editors_choice,
        })
        .eq('id', id);

      if (error) throw error;
      setAutoSaveStatus('Sauvegardé');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
      setAutoSaveStatus('Erreur de sauvegarde');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(newFormData);
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewFile(e.target.files[0]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewScreenshots(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAutoSaveStatus('');

    try {
      // Préparation des données à mettre à jour
      const updateData = {
        name: formData.name,
        description: formData.description,
        long_description: formData.long_description,
        version: formData.version,
        size: formData.size,
        featured: formData.featured || false,
        editors_choice: formData.editors_choice || false,
        download_url: formData.download_url,
        image_url: formData.image_url
      };

      // Si un nouveau fichier a été sélectionné, on l'upload d'abord
      if (newFile) {
        const fileExt = newFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, newFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        updateData.image_url = publicUrl;
      }

      // Mise à jour de l'application
      console.log('Updating application with data:', updateData);
      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      // Mise à jour des captures d'écran si nécessaire
      if (newScreenshots.length > 0) {
        const screenshotPromises = newScreenshots.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `screenshots/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

          return publicUrl;
        });

        const uploadedUrls = await Promise.all(screenshotPromises);
        
        // Mise à jour des URLs des captures d'écran
        const { error: screenshotsError } = await supabase
          .from('applications')
          .update({
            screenshots: [...(application?.screenshots || []), ...uploadedUrls]
          })
          .eq('id', id);

        if (screenshotsError) {
          console.error('Screenshots update error:', screenshotsError);
          throw screenshotsError;
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'Une erreur est survenue lors de la mise à jour de l\'application.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      const fetchApplication = async () => {
        try {
          const { data: application, error } = await supabase
            .from('applications')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          if (application) {
            setFormData({
              name: application.name || '',
              description: application.description || '',
              long_description: application.long_description || '',
              version: application.version || '',
              size: application.size || 0,
              image_url: application.image_url || '',
              download_url: application.download_url || '',
              featured: application.featured || false,
              editors_choice: application.editors_choice || false,
            });
            setPreviewImage(application.image_url || '');
          }
        } catch (error) {
          console.error('Error fetching application:', error);
          setError('Erreur lors du chargement de l\'application');
        }
      };

      fetchApplication();
    }
  }, [id]);

  if (!session) {
    return <Auth />;
  }

  if (!application) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Modifier {application.name}
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Retour
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6" onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target instanceof HTMLButtonElement) {
            e.preventDefault();
          }
        }}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Image principale
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <div className="relative h-32 w-32">
                  <Image
                    src={previewImage}
                    alt={formData.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded"
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom
              </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Description courte
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Description détaillée
                </label>
                {autoSaveStatus && (
                  <span className="text-sm text-gray-500">{autoSaveStatus}</span>
                )}
              </div>
              <RichTextEditor
                content={formData.long_description || ''}
                onChange={(content) => {
                  const event = {
                    target: {
                      name: 'long_description',
                      value: content
                    }
                  };
                  handleInputChange(event);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Version
              </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Nouveau fichier d'application
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nouvelles captures d'écran
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleScreenshotsChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

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
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
        {success && (
          <div className="mt-4 text-sm text-green-600">
            L'application a été mise à jour avec succès.
          </div>
        )}
        {error && (
          <div className="mt-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </Layout>
  );
}
