-- Ajout des champs de catégorie à la table applications
-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Add category fields
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS editors_choice boolean DEFAULT false;

-- Update existing rows
UPDATE applications 
SET featured = false, 
    editors_choice = false 
WHERE featured IS NULL 
   OR editors_choice IS NULL;

-- Create policy to allow read access to everyone
CREATE POLICY "Allow public read access"
ON applications
FOR SELECT
TO public
USING (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated users to update"
ON applications
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
