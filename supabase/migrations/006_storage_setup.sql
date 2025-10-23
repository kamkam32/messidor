-- Create storage bucket for OPCVM Excel files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'opcvm-archives',
  'opcvm-archives',
  false,  -- Private bucket
  10485760,  -- 10MB max file size
  ARRAY['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage
-- Tout le monde peut lire les fichiers archivés
CREATE POLICY "Public can read OPCVM archives"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'opcvm-archives');

-- Seuls les utilisateurs authentifiés et service_role peuvent uploader
CREATE POLICY "Authenticated users can upload OPCVM archives"
  ON storage.objects
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (bucket_id = 'opcvm-archives');

-- Seuls les admins peuvent supprimer
CREATE POLICY "Admins can delete OPCVM archives"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'opcvm-archives'
    AND auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );
