-- R1CF CMS schema migration (additive; safe to re-run)
CREATE TABLE IF NOT EXISTS public.cms_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('page','post','programme','story','event')),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','scheduled','published','archived')),
  featured_media_id uuid,
  seo jsonb NOT NULL DEFAULT '{}'::jsonb,
  scheduled_at timestamptz,
  published_at timestamptz,
  created_by text,
  updated_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cms_entries_type_status_updated_idx ON public.cms_entries(content_type,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS cms_entries_published_idx ON public.cms_entries(content_type,published_at DESC) WHERE status='published';

CREATE TABLE IF NOT EXISTS public.cms_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.cms_entries(id) ON DELETE CASCADE,
  snapshot jsonb NOT NULL,
  revision_note text NOT NULL DEFAULT '',
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cms_revisions_entry_created_idx ON public.cms_revisions(entry_id,created_at DESC);

CREATE TABLE IF NOT EXISTS public.cms_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  mime_type text NOT NULL,
  byte_size integer NOT NULL,
  data bytea NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  folder text NOT NULL DEFAULT 'Uncategorised',
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cms_media_folder_created_idx ON public.cms_media(folder,created_at DESC);

CREATE TABLE IF NOT EXISTS public.cms_settings (
  setting_key text PRIMARY KEY,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_navigation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_team_members (
  email text PRIMARY KEY,
  display_name text NOT NULL DEFAULT '',
  access_role text NOT NULL CHECK (access_role IN ('editor','author')),
  is_active boolean NOT NULL DEFAULT true,
  invited_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
