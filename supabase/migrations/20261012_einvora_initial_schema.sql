-- ==============================================================================
-- E-INVORA — Complete Supabase PostgreSQL Schema & Migrations
-- Brand: E-INVORA ("Every Celebration Deserves a Beautiful Invitation")
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. APPLICATION SETTINGS & OWNER AUTHORIZATION
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    brand_name TEXT NOT NULL DEFAULT 'E-INVORA',
    tagline TEXT NOT NULL DEFAULT 'Every Celebration Deserves a Beautiful Invitation.',
    whatsapp_number TEXT NOT NULL DEFAULT '+91 98765 43210',
    contact_email TEXT NOT NULL DEFAULT 'hello@e-invora.com',
    primary_phone TEXT NOT NULL DEFAULT '+91 98765 43210',
    upi_id TEXT NOT NULL DEFAULT 'einvora@upi',
    upi_recipient_name TEXT NOT NULL DEFAULT 'E-INVORA Invitations',
    currency_symbol TEXT NOT NULL DEFAULT '₹',
    auto_generate_ai_drafts BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. EVENT CATEGORIES & DESIGN ATTRIBUTES
CREATE TABLE IF NOT EXISTS public.event_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.design_attributes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'style',
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 3. PACKAGES (Basic ₹499, Standard ₹799, Premium ₹1,199)
CREATE TABLE IF NOT EXISTS public.packages (
    id TEXT PRIMARY KEY, -- 'basic', 'standard', 'premium'
    name TEXT NOT NULL,
    price INT NOT NULL, -- In INR (499, 799, 1199)
    currency TEXT NOT NULL DEFAULT 'INR',
    description TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. INVITATION TEMPLATES
CREATE TABLE IF NOT EXISTS public.templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id TEXT NOT NULL REFERENCES public.event_categories(id) ON DELETE RESTRICT,
    style_attributes TEXT[] DEFAULT '{}',
    description TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    hero_image_url TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT '{}',
    theme_colors JSONB NOT NULL DEFAULT '{"primary": "#6E2639", "accent": "#D4B477", "background": "#F8F3EA", "text": "#29221F"}'::jsonb,
    font_family_serif TEXT NOT NULL DEFAULT 'Cormorant Garamond',
    font_family_sans TEXT NOT NULL DEFAULT 'Plus Jakarta Sans',
    is_published_in_gallery BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    available_packages TEXT[] DEFAULT '{"basic", "standard", "premium"}',
    section_config JSONB NOT NULL DEFAULT '{"hero": true, "details": true, "story": true, "schedule": true, "gallery": true, "countdown": true, "rsvp": true, "map": true, "music": true}'::jsonb,
    demo_content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. BOOKING ENQUIRIES (No customer login, validated server-side)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL, -- e.g. EINV-2026-0042
    customer_name TEXT NOT NULL,
    primary_phone TEXT NOT NULL,
    whatsapp_phone TEXT NOT NULL,
    event_category_id TEXT NOT NULL,
    template_id TEXT NOT NULL REFERENCES public.templates(id) ON DELETE RESTRICT,
    package_id TEXT NOT NULL REFERENCES public.packages(id) ON DELETE RESTRICT,
    agreed_price INT NOT NULL, -- Immutable price snapshot
    currency TEXT NOT NULL DEFAULT 'INR',
    celebrant_names TEXT NOT NULL, -- e.g. "Aditya & Meera"
    event_date DATE NOT NULL,
    event_time TEXT,
    venue_name TEXT NOT NULL,
    venue_address TEXT NOT NULL,
    google_maps_url TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'English',
    design_notes TEXT,
    uploaded_photo_urls TEXT[] DEFAULT '{}',
    additional_requirements TEXT,
    privacy_acknowledged BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
        'new', 'under_review', 'awaiting_confirmation', 'payment_pending',
        'payment_verified', 'ready_to_publish', 'published', 'rejected'
    )),
    internal_notes TEXT,
    contact_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. MANUAL PAYMENT RECORDS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    booking_reference TEXT NOT NULL,
    amount INT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_method TEXT NOT NULL DEFAULT 'Direct' CHECK (payment_method IN ('Direct', 'Bank Transfer', 'Card', 'Cash', 'Other')),
    transaction_reference TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'verified', 'failed', 'refunded')),
    verification_notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. PRIVATE AI-ASSISTED INVITATION DRAFTS
CREATE TABLE IF NOT EXISTS public.ai_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    booking_reference TEXT NOT NULL,
    model_used TEXT NOT NULL,
    prompt_used TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('generating', 'completed', 'failed', 'approved', 'rejected')),
    draft_content JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    admin_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PUBLISHED INVITATION SNAPSHOTS (Immutable public snapshot at /invite/:slug)
CREATE TABLE IF NOT EXISTS public.published_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL, -- e.g. aditya-weds-meera-2026
    package_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    snapshot_content JSONB NOT NULL, -- Strictly approved public fields only
    is_active BOOLEAN NOT NULL DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. ADMIN NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN (
        'new_enquiry', 'ai_draft_ready', 'ai_draft_failed',
        'customer_confirmation_required', 'payment_verification_required',
        'ready_to_publish', 'invitation_published'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    booking_reference TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Public can read active event categories
CREATE POLICY "Public can view active event categories"
    ON public.event_categories FOR SELECT
    USING (is_active = true);

-- Public can read active design attributes
CREATE POLICY "Public can view design attributes"
    ON public.design_attributes FOR SELECT
    USING (is_active = true);

-- Public can read active packages
CREATE POLICY "Public can view active packages"
    ON public.packages FOR SELECT
    USING (is_active = true);

-- Public can read gallery-published templates
CREATE POLICY "Public can view published gallery templates"
    ON public.templates FOR SELECT
    USING (is_published_in_gallery = true);

-- Public can read active published invitation snapshots
CREATE POLICY "Public can view active published invitations"
    ON public.published_invitations FOR SELECT
    USING (is_active = true);

-- Public can insert new bookings (validation occurs on server)
CREATE POLICY "Public can submit booking enquiries"
    ON public.bookings FOR INSERT
    WITH CHECK (true);

-- Authenticated Owner / Admin full access policies
CREATE POLICY "Owner has full access to admin_users"
    ON public.admin_users FOR ALL
    USING (auth.uid() = id);

CREATE POLICY "Owner has full access to app_settings"
    ON public.app_settings FOR ALL
    USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Owner has full access to categories"
    ON public.event_categories FOR ALL
    USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Owner has full access to templates"
    ON public.templates FOR ALL
    USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Owner has full access to packages"
    ON public.packages FOR ALL
    USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Owner has full access to bookings"
    ON public.bookings FOR ALL
    USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Owner has full access to payments"
    ON public.payments FOR ALL
    USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Owner has full access to ai_drafts"
    ON public.ai_drafts FOR ALL
    USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Owner has full access to published_invitations"
    ON public.published_invitations FOR ALL
    USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Owner has full access to notifications"
    ON public.admin_notifications FOR ALL
    USING (auth.jwt() ->> 'role' = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(reference);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category_id);
CREATE INDEX IF NOT EXISTS idx_published_invitations_slug ON public.published_invitations(slug);
