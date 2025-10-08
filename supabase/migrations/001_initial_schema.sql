-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create funds table (OPCVM/OPCI)
CREATE TABLE IF NOT EXISTS public.funds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('OPCVM', 'OPCI')),
  category TEXT,
  description TEXT,
  risk_level INTEGER CHECK (risk_level BETWEEN 1 AND 7),
  minimum_investment DECIMAL(15, 2),
  management_fees DECIMAL(5, 2),
  performance_fees DECIMAL(5, 2),
  current_value DECIMAL(15, 2) NOT NULL,
  ytd_performance DECIMAL(10, 4),
  one_year_performance DECIMAL(10, 4),
  three_year_performance DECIMAL(10, 4),
  inception_date DATE,
  is_active BOOLEAN DEFAULT true,
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investments table (user portfolios)
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  fund_id UUID REFERENCES public.funds(id) ON DELETE CASCADE,
  shares DECIMAL(15, 6) NOT NULL,
  initial_investment DECIMAL(15, 2) NOT NULL,
  purchase_date DATE NOT NULL,
  purchase_price DECIMAL(15, 2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_fund_id ON public.investments(fund_id);
CREATE INDEX IF NOT EXISTS idx_funds_type ON public.funds(type);
CREATE INDEX IF NOT EXISTS idx_funds_is_active ON public.funds(is_active);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for funds (everyone can view active funds)
CREATE POLICY "Anyone can view active funds" ON public.funds
  FOR SELECT USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can insert funds" ON public.funds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update funds" ON public.funds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for investments
CREATE POLICY "Users can view their own investments" ON public.investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments" ON public.investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments" ON public.investments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all investments" ON public.investments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_funds BEFORE UPDATE ON public.funds
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_investments BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
