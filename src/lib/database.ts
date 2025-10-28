import { supabase, supabaseAdmin } from './supabase'
import type {
  User,
  BrandProfile,
  SocialAccount,
  Post,
  ScheduledJob,
  DatabaseService
} from '@/types/database'

export class SupabaseDatabaseService implements DatabaseService {
  // User operations
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) throw new Error(`Failed to create user: ${error.message}`)
    return data
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw new Error(`Failed to get user: ${error.message}`)
    }
    return data
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw new Error(`Failed to get user: ${error.message}`)
    }
    return data
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update user: ${error.message}`)
    return data
  }

  // Brand profile operations
  async createBrandProfile(profileData: Omit<BrandProfile, 'id' | 'created_at' | 'updated_at'>): Promise<BrandProfile> {
    const { data, error } = await supabase
      .from('brand_profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) throw new Error(`Failed to create brand profile: ${error.message}`)
    return data
  }

  async getBrandProfileByUserId(userId: string): Promise<BrandProfile | null> {
    const { data, error } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw new Error(`Failed to get brand profile: ${error.message}`)
    }
    return data
  }

  async updateBrandProfile(id: string, profileData: Partial<BrandProfile>): Promise<BrandProfile> {
    const { data, error } = await supabase
      .from('brand_profiles')
      .update(profileData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update brand profile: ${error.message}`)
    return data
  }

  // Social account operations
  async createSocialAccount(accountData: Omit<SocialAccount, 'id' | 'created_at'>): Promise<SocialAccount> {
    const { data, error } = await supabase
      .from('social_accounts')
      .insert(accountData)
      .select()
      .single()

    if (error) throw new Error(`Failed to create social account: ${error.message}`)
    return data
  }

  async getSocialAccountsByUserId(userId: string): Promise<SocialAccount[]> {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get social accounts: ${error.message}`)
    return data || []
  }

  async updateSocialAccount(id: string, accountData: Partial<SocialAccount>): Promise<SocialAccount> {
    const { data, error } = await supabase
      .from('social_accounts')
      .update(accountData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update social account: ${error.message}`)
    return data
  }

  async deleteSocialAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('social_accounts')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw new Error(`Failed to delete social account: ${error.message}`)
  }

  // Post operations
  async createPost(postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single()

    if (error) throw new Error(`Failed to create post: ${error.message}`)
    return data
  }

  async getPostsByUserId(userId: string): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get posts: ${error.message}`)
    return data || []
  }

  async getPostById(id: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw new Error(`Failed to get post: ${error.message}`)
    }
    return data
  }

  async updatePost(id: string, postData: Partial<Post>): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update post: ${error.message}`)
    return data
  }

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete post: ${error.message}`)
  }

  // Scheduled job operations
  async createScheduledJob(jobData: Omit<ScheduledJob, 'id' | 'created_at'>): Promise<ScheduledJob> {
    const { data, error } = await supabase
      .from('scheduled_jobs')
      .insert(jobData)
      .select()
      .single()

    if (error) throw new Error(`Failed to create scheduled job: ${error.message}`)
    return data
  }

  async getScheduledJobsByUserId(userId: string): Promise<ScheduledJob[]> {
    const { data, error } = await supabase
      .from('scheduled_jobs')
      .select(`
        *,
        posts!inner(user_id)
      `)
      .eq('posts.user_id', userId)
      .order('scheduled_time', { ascending: true })

    if (error) throw new Error(`Failed to get scheduled jobs: ${error.message}`)
    return data || []
  }

  async updateScheduledJob(id: string, jobData: Partial<ScheduledJob>): Promise<ScheduledJob> {
    const { data, error } = await supabase
      .from('scheduled_jobs')
      .update(jobData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update scheduled job: ${error.message}`)
    return data
  }

  async deleteScheduledJob(id: string): Promise<void> {
    const { error } = await supabase
      .from('scheduled_jobs')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete scheduled job: ${error.message}`)
  }
}

// Export singleton instance
export const db = new SupabaseDatabaseService()