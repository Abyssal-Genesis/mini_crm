-- Location: supabase/migrations/20250907055154_crm_system_init.sql
-- Schema Analysis: Fresh project - no existing schema
-- Integration Type: Complete CRM/Lead Management system
-- Dependencies: New schema creation with authentication

-- 1. Types and Enums
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'sales_rep', 'member');
CREATE TYPE public.customer_status AS ENUM ('active', 'inactive', 'prospect');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
CREATE TYPE public.lead_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'task', 'customer_added', 'lead_created', 'lead_updated', 'lead_converted');

-- 2. Core Tables (no foreign keys)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'member'::public.user_role,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Business Tables (with foreign keys)
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    address TEXT,
    status public.customer_status DEFAULT 'prospect'::public.customer_status,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(10,2) DEFAULT 0,
    status public.lead_status DEFAULT 'new'::public.lead_status,
    priority public.lead_priority DEFAULT 'medium'::public.lead_priority,
    assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type public.activity_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_company ON public.customers(company);
CREATE INDEX idx_customers_status ON public.customers(status);
CREATE INDEX idx_customers_created_by ON public.customers(created_by);
CREATE INDEX idx_leads_customer_id ON public.leads(customer_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_priority ON public.leads(priority);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_created_by ON public.leads(created_by);
CREATE INDEX idx_activities_customer_id ON public.activities(customer_id);
CREATE INDEX idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_type ON public.activities(type);

-- 5. Functions (MUST BE BEFORE RLS POLICIES)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'member'::text)::public.user_role
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 6. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Pattern 1: Core user table (user_profiles) - Simple only, no functions
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple user ownership for customers
CREATE POLICY "users_manage_own_customers"
ON public.customers
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Pattern 2: Simple user ownership for leads
CREATE POLICY "users_manage_own_leads"
ON public.leads
FOR ALL
TO authenticated
USING (created_by = auth.uid() OR assigned_to = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Pattern 2: Simple user ownership for activities
CREATE POLICY "users_manage_own_activities"
ON public.activities
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 8. Triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 9. Mock Data
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    manager_uuid UUID := gen_random_uuid();
    sales_uuid UUID := gen_random_uuid();
    customer1_id UUID := gen_random_uuid();
    customer2_id UUID := gen_random_uuid();
    customer3_id UUID := gen_random_uuid();
    lead1_id UUID := gen_random_uuid();
    lead2_id UUID := gen_random_uuid();
    lead3_id UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@company.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (manager_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'manager@company.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Sales Manager", "role": "manager"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (sales_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'sales@company.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Sales Rep", "role": "sales_rep"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create customers
    INSERT INTO public.customers (id, name, email, phone, company, address, status, notes, created_by) VALUES
        (customer1_id, 'Sarah Johnson', 'sarah.johnson@techcorp.com', '+1 (555) 123-4567', 'TechCorp Solutions', '123 Business Ave, San Francisco, CA 94105', 'active', 'Key decision maker for enterprise solutions', admin_uuid),
        (customer2_id, 'Michael Chen', 'm.chen@innovatetech.com', '+1 (555) 234-5678', 'InnovateTech Inc', '456 Innovation Blvd, Austin, TX 78701', 'active', 'Interested in cloud migration services', manager_uuid),
        (customer3_id, 'Emily Rodriguez', 'emily.r@digitalfirst.com', '+1 (555) 345-6789', 'Digital First Agency', '789 Creative St, New York, NY 10001', 'active', 'Looking for comprehensive digital transformation', sales_uuid);

    -- Create leads
    INSERT INTO public.leads (id, customer_id, title, description, value, status, priority, assigned_to, created_by) VALUES
        (lead1_id, customer1_id, 'Enterprise Software Solution', 'Potential client interested in our enterprise CRM solution for their 500+ employee company. They are looking for advanced reporting and integration capabilities.', 25000.00, 'contacted', 'high', sales_uuid, admin_uuid),
        (lead2_id, customer2_id, 'Cloud Migration Services', 'Tech startup needs help migrating their infrastructure to cloud. They have a tight timeline and budget constraints but high growth potential.', 15000.00, 'new', 'medium', manager_uuid, manager_uuid),
        (lead3_id, customer3_id, 'Digital Transformation Project', 'Retail company looking to upgrade their e-commerce platform. They need better inventory management and customer analytics features.', 35000.00, 'qualified', 'urgent', sales_uuid, sales_uuid);

    -- Create activities
    INSERT INTO public.activities (type, title, description, customer_id, lead_id, user_id) VALUES
        ('customer_added', 'New Customer Added', 'Sarah Johnson from TechCorp was added to the system', customer1_id, null, admin_uuid),
        ('lead_created', 'New Lead Created', 'Enterprise Software Solution lead created for TechCorp', customer1_id, lead1_id, admin_uuid),
        ('lead_updated', 'Lead Status Updated', 'Lead status changed to contacted after initial call', customer1_id, lead1_id, sales_uuid),
        ('customer_added', 'New Customer Added', 'Michael Chen from InnovateTech added as prospect', customer2_id, null, manager_uuid),
        ('call', 'Discovery Call', 'Initial discovery call with Digital First Agency', customer3_id, lead3_id, sales_uuid),
        ('meeting', 'Requirements Meeting', 'Detailed requirements gathering session', customer1_id, lead1_id, sales_uuid),
        ('email', 'Follow-up Email', 'Sent proposal and timeline to client', customer2_id, lead2_id, manager_uuid),
        ('note', 'Client Notes', 'Client very interested in our AI-powered analytics features', customer3_id, lead3_id, sales_uuid);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;