-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE poll_status AS ENUM ('draft', 'active', 'expired', 'closed');
CREATE TYPE vote_type AS ENUM ('single', 'multiple');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status poll_status DEFAULT 'draft',
  vote_type vote_type DEFAULT 'single',
  is_anonymous BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT description_length CHECK (char_length(description) <= 1000)
);

-- Create poll_options table
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL DEFAULT 0,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT option_text_length CHECK (char_length(option_text) >= 1 AND char_length(option_text) <= 200)
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, option_id, user_id),
  CONSTRAINT anonymous_vote_check CHECK (
    (user_id IS NOT NULL) OR (ip_address IS NOT NULL)
  )
);

-- Create poll_participants table (for tracking who has participated)
CREATE TABLE IF NOT EXISTS poll_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  participated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id),
  UNIQUE(poll_id, ip_address)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_status ON polls(status);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_participants_poll_id ON poll_participants(poll_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_participants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Polls policies
CREATE POLICY "Anyone can view active polls" ON polls
  FOR SELECT USING (status = 'active' OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create polls" ON polls
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "Poll creators can update their own polls" ON polls
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Poll creators can delete their own polls" ON polls
  FOR DELETE USING (auth.uid() = created_by);

-- Poll options policies
CREATE POLICY "Anyone can view options for viewable polls" ON poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_options.poll_id
      AND (polls.status = 'active' OR polls.created_by = auth.uid())
    )
  );

CREATE POLICY "Poll creators can manage their poll options" ON poll_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_options.poll_id
      AND polls.created_by = auth.uid()
    )
  );

-- Votes policies
CREATE POLICY "Users can view votes for polls they created" ON votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = votes.poll_id
      AND polls.created_by = auth.uid()
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Authenticated users can vote" ON votes
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = votes.poll_id
      AND polls.status = 'active'
      AND (polls.expires_at IS NULL OR polls.expires_at > NOW())
    )
  );

CREATE POLICY "Users can update their own votes" ON votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON votes
  FOR DELETE USING (auth.uid() = user_id);

-- Poll participants policies
CREATE POLICY "Poll creators can view participants" ON poll_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_participants.poll_id
      AND polls.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can record their participation" ON poll_participants
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = user_id
  );

-- Function to update poll vote counts
CREATE OR REPLACE FUNCTION update_poll_option_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE poll_options
    SET votes_count = votes_count + 1
    WHERE id = NEW.option_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE poll_options
    SET votes_count = votes_count - 1
    WHERE id = OLD.option_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update vote counts
CREATE TRIGGER update_poll_option_votes_trigger
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_poll_option_votes();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NULL),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if user can vote
CREATE OR REPLACE FUNCTION can_user_vote(poll_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  poll_record polls%ROWTYPE;
  existing_votes INTEGER;
BEGIN
  -- Get poll details
  SELECT * INTO poll_record FROM polls WHERE id = poll_uuid;

  -- Check if poll exists and is active
  IF poll_record.id IS NULL OR poll_record.status != 'active' THEN
    RETURN FALSE;
  END IF;

  -- Check if poll has expired
  IF poll_record.expires_at IS NOT NULL AND poll_record.expires_at <= NOW() THEN
    RETURN FALSE;
  END IF;

  -- For single vote polls, check if user has already voted
  IF poll_record.vote_type = 'single' THEN
    SELECT COUNT(*) INTO existing_votes
    FROM votes
    WHERE poll_id = poll_uuid AND user_id = user_uuid;

    IF existing_votes > 0 THEN
      RETURN FALSE;
    END IF;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get poll results with statistics
CREATE OR REPLACE FUNCTION get_poll_results(poll_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'poll_id', p.id,
    'title', p.title,
    'description', p.description,
    'status', p.status,
    'vote_type', p.vote_type,
    'is_anonymous', p.is_anonymous,
    'total_votes', (SELECT COUNT(*) FROM votes WHERE poll_id = p.id),
    'total_participants', (SELECT COUNT(DISTINCT user_id) FROM votes WHERE poll_id = p.id),
    'options', (
      SELECT json_agg(
        json_build_object(
          'id', po.id,
          'text', po.option_text,
          'votes_count', po.votes_count,
          'percentage', CASE
            WHEN (SELECT COUNT(*) FROM votes WHERE poll_id = p.id) = 0 THEN 0
            ELSE ROUND((po.votes_count::DECIMAL / (SELECT COUNT(*) FROM votes WHERE poll_id = p.id)::DECIMAL) * 100, 2)
          END
        ) ORDER BY po.option_order
      )
      FROM poll_options po WHERE po.poll_id = p.id
    ),
    'created_at', p.created_at,
    'expires_at', p.expires_at
  ) INTO result
  FROM polls p
  WHERE p.id = poll_uuid;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage bucket for avatars (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create storage policy for avatars
-- CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
--   FOR SELECT USING (bucket_id = 'avatars');

-- CREATE POLICY "Anyone can upload an avatar" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- CREATE POLICY "Anyone can update their own avatar" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Sample data (optional - remove in production)
-- INSERT INTO profiles (id, username, display_name) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'demo_user', 'Demo User');

-- INSERT INTO polls (id, title, description, created_by, status) VALUES
--   ('11111111-1111-1111-1111-111111111111', 'Favorite Programming Language', 'What is your favorite programming language for web development?', '00000000-0000-0000-0000-000000000001', 'active');

-- INSERT INTO poll_options (poll_id, option_text, option_order) VALUES
--   ('11111111-1111-1111-1111-111111111111', 'JavaScript', 1),
--   ('11111111-1111-1111-1111-111111111111', 'TypeScript', 2),
--   ('11111111-1111-1111-1111-111111111111', 'Python', 3),
--   ('11111111-1111-1111-1111-111111111111', 'Go', 4);
