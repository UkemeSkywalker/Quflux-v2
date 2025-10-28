export interface User {
  id: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  age?: number
  occupation?: string
  created_at: string
  updated_at: string
}

export interface BrandProfile {
  id: string
  user_id: string
  brand_name: string
  industry?: string
  target_audience?: string
  brand_voice?: string
  content_themes?: string[]
  posting_frequency?: PostingFrequency
  brand_colors?: string[]
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface PostingFrequency {
  daily?: number
  weekly?: number
  monthly?: number
  optimal_times?: string[]
}

export interface SocialAccount {
  id: string
  user_id: string
  platform: 'x' | 'instagram' | 'linkedin' | 'facebook'
  platform_user_id: string
  username: string
  access_token: string
  refresh_token?: string
  token_expires_at?: string
  is_active: boolean
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  media_urls?: string[]
  link_url?: string
  link_preview?: LinkPreview
  hashtags?: string[]
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  creation_type: 'manual' | 'ai_generated'
  ai_generated_post_id?: string
  created_at: string
  updated_at: string
}

export interface LinkPreview {
  title?: string
  description?: string
  image?: string
  url: string
}

export interface ContentStrategy {
  id: string
  brand_profile_id: string
  objectives: string[]
  content_pillars: ContentPillar[]
  posting_schedule: PostingSchedule
  performance_targets: PerformanceTarget[]
  created_at: string
  updated_at: string
}

export interface ContentPillar {
  name: string
  description: string
  percentage: number
  topics: string[]
}

export interface PostingSchedule {
  frequency: PostingFrequency
  optimal_times: OptimalTime[]
  timezone: string
}

export interface OptimalTime {
  day: string
  times: string[]
}

export interface PerformanceTarget {
  metric: string
  target_value: number
  timeframe: string
}

export interface GeneratedPost {
  id: string
  strategy_id: string
  content: string
  image_prompt?: string
  generated_image_url?: string
  hashtags?: string[]
  platforms: string[]
  suggested_post_time?: string
  content_pillar?: string
  ai_confidence?: number
  status: 'generated' | 'approved' | 'rejected' | 'scheduled' | 'published'
  created_at: string
}

export interface ScheduledJob {
  id: string
  post_id: string
  social_account_id: string
  scheduled_time: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  retry_count: number
  last_attempt?: string
  error_message?: string
  created_at: string
}

export interface PublishedPost {
  id: string
  post_id: string
  social_account_id: string
  platform_post_id?: string
  published_at: string
  status: 'published' | 'failed'
  error_message?: string
}

export interface PostAnalytics {
  id: string
  published_post_id: string
  platform: string
  likes: number
  comments: number
  shares: number
  reach: number
  impressions: number
  click_throughs: number
  collected_at: string
}

// Database service interfaces
export interface DatabaseService {
  // User operations
  createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User>
  getUserById(id: string): Promise<User | null>
  getUserByEmail(email: string): Promise<User | null>
  updateUser(id: string, userData: Partial<User>): Promise<User>
  
  // Brand profile operations
  createBrandProfile(profileData: Omit<BrandProfile, 'id' | 'created_at' | 'updated_at'>): Promise<BrandProfile>
  getBrandProfileByUserId(userId: string): Promise<BrandProfile | null>
  updateBrandProfile(id: string, profileData: Partial<BrandProfile>): Promise<BrandProfile>
  
  // Social account operations
  createSocialAccount(accountData: Omit<SocialAccount, 'id' | 'created_at'>): Promise<SocialAccount>
  getSocialAccountsByUserId(userId: string): Promise<SocialAccount[]>
  updateSocialAccount(id: string, accountData: Partial<SocialAccount>): Promise<SocialAccount>
  deleteSocialAccount(id: string): Promise<void>
  
  // Post operations
  createPost(postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post>
  getPostsByUserId(userId: string): Promise<Post[]>
  getPostById(id: string): Promise<Post | null>
  updatePost(id: string, postData: Partial<Post>): Promise<Post>
  deletePost(id: string): Promise<void>
  
  // Scheduled job operations
  createScheduledJob(jobData: Omit<ScheduledJob, 'id' | 'created_at'>): Promise<ScheduledJob>
  getScheduledJobsByUserId(userId: string): Promise<ScheduledJob[]>
  updateScheduledJob(id: string, jobData: Partial<ScheduledJob>): Promise<ScheduledJob>
  deleteScheduledJob(id: string): Promise<void>
}