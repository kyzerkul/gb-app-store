export interface Application {
  id: string;
  name: string;
  brief_description: string;
  description_html: string;
  thumbnail: string;
  version: string;
  size: number;
  download_url: string;
  created_at: string;
  updated_at: string;
  screenshots?: string[];
  category?: string;
  is_featured?: boolean;
  is_editors_choice?: boolean;
}
