import { createClient } from '@supabase/supabase-js';

export type Application = {
  id: string;
  name: string;
  description: string;
  version: string;
  size: number;
  image_url: string;
  download_url: string;
  screenshots: string[];
  created_at: string;
  updated_at: string;
};

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
