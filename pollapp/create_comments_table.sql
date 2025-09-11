-- Create the comments table
CREATE TABLE comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id uuid NOT NULL REFERENCES polls(id),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    comment_text TEXT NOT NULL CHECK (char_length(comment_text) > 0 AND char_length(comment_text) <= 1000),
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for the comments table
CREATE POLICY "Allow logged-in users to insert comments" ON comments FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow everyone to read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow users to delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add foreign key to profiles
ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;
