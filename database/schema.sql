-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brand profiles table
CREATE TABLE brand_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    target_audience TEXT,
    brand_voice VARCHAR(255),
    content_themes TEXT[], -- Array of content themes
    posting_frequency JSONB, -- JSON object for posting schedule
    brand_colors TEXT[], -- Array of hex color codes
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social accounts table
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('x', 'instagram', 'linkedin', 'facebook')),
    platform_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform, platform_user_id)
);

-- Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[], -- Array of media URLs
    link_url TEXT,
    link_preview JSONB, -- JSON object for link preview data
    hashtags TEXT[], -- Array of hashtags
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
    creation_type VARCHAR(50) DEFAULT 'manual' CHECK (creation_type IN ('manual', 'ai_generated')),
    ai_generated_post_id UUID, -- Reference to generated_posts if AI-created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content strategies table
CREATE TABLE content_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_profile_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
    objectives TEXT[],
    content_pillars JSONB, -- Array of content pillar objects
    posting_schedule JSONB, -- JSON object for posting schedule
    performance_targets JSONB, -- JSON object for performance targets
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated posts table (AI-created content)
CREATE TABLE generated_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID NOT NULL REFERENCES content_strategies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_prompt TEXT,
    generated_image_url TEXT,
    hashtags TEXT[],
    platforms TEXT[], -- Array of target platforms
    suggested_post_time TIMESTAMP WITH TIME ZONE,
    content_pillar VARCHAR(255),
    ai_confidence DECIMAL(3,2), -- 0.00 to 1.00
    status VARCHAR(50) DEFAULT 'generated' CHECK (status IN ('generated', 'approved', 'rejected', 'scheduled', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled jobs table
CREATE TABLE scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Published posts table
CREATE TABLE published_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
    platform_post_id VARCHAR(255), -- ID from the social media platform
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('published', 'failed')),
    error_message TEXT
);

-- Post analytics table
CREATE TABLE post_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    published_post_id UUID NOT NULL REFERENCES published_posts(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    click_throughs INTEGER DEFAULT 0,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_scheduled_jobs_scheduled_time ON scheduled_jobs(scheduled_time);
CREATE INDEX idx_scheduled_jobs_status ON scheduled_jobs(status);
CREATE INDEX idx_published_posts_post_id ON published_posts(post_id);
CREATE INDEX idx_post_analytics_published_post_id ON post_analytics(published_post_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON brand_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_strategies_updated_at BEFORE UPDATE ON content_strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for users (users can only access their own data)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- RLS policies for brand_profiles
CREATE POLICY "Users can view own brand profiles" ON brand_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brand profiles" ON brand_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand profiles" ON brand_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand profiles" ON brand_profiles FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for social_accounts
CREATE POLICY "Users can view own social accounts" ON social_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social accounts" ON social_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social accounts" ON social_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social accounts" ON social_accounts FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for posts
CREATE POLICY "Users can view own posts" ON posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables...
CREATE POLICY "Users can view own content strategies" ON content_strategies 
FOR SELECT USING (auth.uid() = (SELECT user_id FROM brand_profiles WHERE id = brand_profile_id));

CREATE POLICY "Users can view own generated posts" ON generated_posts 
FOR SELECT USING (auth.uid() = (SELECT bp.user_id FROM brand_profiles bp JOIN content_strategies cs ON bp.id = cs.brand_profile_id WHERE cs.id = strategy_id));

CREATE POLICY "Users can view own scheduled jobs" ON scheduled_jobs 
FOR SELECT USING (auth.uid() = (SELECT user_id FROM posts WHERE id = post_id));

CREATE POLICY "Users can view own published posts" ON published_posts 
FOR SELECT USING (auth.uid() = (SELECT user_id FROM posts WHERE id = post_id));

CREATE POLICY "Users can view own post analytics" ON post_analytics 
FOR SELECT USING (auth.uid() = (SELECT p.user_id FROM posts p JOIN published_posts pp ON p.id = pp.post_id WHERE pp.id = published_post_id));