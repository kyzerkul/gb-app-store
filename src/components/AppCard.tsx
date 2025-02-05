import Image from 'next/image';
import Link from 'next/link';
import { Application } from '../types/application';

interface AppCardProps {
  app: Application;
}

export default function AppCard({ app }: AppCardProps) {
  return (
    <Link href={`/apps/${app.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative aspect-video">
          <Image
            src={app.thumbnail || '/placeholder.png'}
            alt={app.name}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-krapk-text mb-2 line-clamp-1">
            {app.name}
          </h3>
          <p className="text-sm text-krapk-text/60 line-clamp-2">
            {app.brief_description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-krapk-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.88-11.71L10 14.17l-1.88-1.88a.996.996 0 1 0-1.41 1.41l2.59 2.59c.39.39 1.02.39 1.41 0L17.3 9.7a.996.996 0 0 0 0-1.41c-.39-.39-1.03-.39-1.42 0z"/>
              </svg>
              <span className="text-sm text-krapk-text/60">
                {app.version}
              </span>
            </div>
            <div className="text-sm text-krapk-accent font-medium">
              En savoir plus
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
