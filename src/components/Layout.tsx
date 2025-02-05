import React from 'react';
import Head from 'next/head';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>KRAPK</title>
        <meta name="description" content="KRAPK - Votre source d'applications de confiance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <header className="header">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-white hover:text-opacity-90">
                KRAPK
              </Link>
              
              <div className="flex items-center space-x-6">
                <form className="relative" onSubmit={(e) => {
                  e.preventDefault();
                  const searchInput = e.currentTarget.querySelector('input');
                  if (searchInput?.value) {
                    router.push(`/search?q=${encodeURIComponent(searchInput.value)}`);
                  }
                }}>
                  <input
                    type="search"
                    placeholder="Rechercher une application..."
                    className="w-64 py-2 pl-10 pr-4 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/25"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </form>

                {user && (
                  <>
                    <Link href="/admin" className="nav-link">
                      Administration
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="nav-link"
                    >
                      Déconnexion
                    </button>
                  </>
                )}
              </div>
            </div>
          </nav>
        </header>

        <main className="flex-grow bg-krapk-background">
          {children}
        </main>

        <footer className="bg-krapk-secondary text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">KRAPK</h3>
                <p className="text-sm opacity-90">
                  Votre source d'applications de confiance
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Liens utiles</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/category/new" className="text-sm opacity-90 hover:opacity-100">
                      Nouvelles applications
                    </Link>
                  </li>
                  <li>
                    <Link href="/category/featured" className="text-sm opacity-90 hover:opacity-100">
                      En vedette
                    </Link>
                  </li>
                  <li>
                    <Link href="/category/editors-choice" className="text-sm opacity-90 hover:opacity-100">
                      Notre sélection
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Contact</h3>
                <div className="flex space-x-4">
                  <a href="#" className="social-btn facebook">
                    <span className="sr-only">Facebook</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/>
                    </svg>
                  </a>
                  <a href="#" className="social-btn linkedin">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,3H5C3.895,3,3,3.895,3,5v14c0,1.105,0.895,2,2,2h14c1.105,0,2-0.895,2-2V5C21,3.895,20.105,3,19,3z M9,17H6.477v-7H9 V17z M7.694,8.717c-0.771,0-1.286-0.514-1.286-1.2s0.514-1.2,1.371-1.2c0.771,0,1.286,0.514,1.286,1.2S8.551,8.717,7.694,8.717z M18,17h-2.442v-3.826c0-1.058-0.651-1.302-0.895-1.302s-1.058,0.163-1.058,1.302c0,0.163,0,3.826,0,3.826h-2.523v-7h2.523v0.977 C13.93,10.407,14.581,10,15.802,10C17.023,10,18,10.977,18,13.174V17z"/>
                    </svg>
                  </a>
                  <a href="mailto:contact@krapk.com" className="social-btn email">
                    <span className="sr-only">Email</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20,4H4C2.895,4,2,4.895,2,6v12c0,1.105,0.895,2,2,2h16c1.105,0,2-0.895,2-2V6C22,4.895,21.105,4,20,4z M20,8.236l-8,4.882 L4,8.236V6h16V8.236z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm opacity-90">
              <p>&copy; {new Date().getFullYear()} KRAPK. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
