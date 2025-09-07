import { supabase } from '../lib/supabase';

export class ActivityService {
  // Get recent activities for dashboard
  static async getRecentActivities(limit = 10) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('activities')?.select(`
          *,
          customer:customers(id, name, company),
          lead:leads(id, title),
          user:user_profiles(id, full_name)
        `)?.eq('user_id', user?.user?.id)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;

      return data?.map(activity => ({
        ...activity,
        timestamp: new Date(activity.created_at)
      })) || [];
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch recent activities');
    }
  }

  // Get activities for a specific customer
  static async getCustomerActivities(customerId, limit = 50) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('activities')?.select(`
          *,
          lead:leads(id, title),
          user:user_profiles(id, full_name)
        `)?.eq('customer_id', customerId)?.eq('user_id', user?.user?.id)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;

      return data?.map(activity => ({
        ...activity,
        timestamp: new Date(activity.created_at)
      })) || [];
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch customer activities');
    }
  }

  // Get activities for a specific lead
  static async getLeadActivities(leadId, limit = 50) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('activities')?.select(`
          *,
          customer:customers(id, name, company),
          user:user_profiles(id, full_name)
        `)?.eq('lead_id', leadId)?.eq('user_id', user?.user?.id)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;

      return data?.map(activity => ({
        ...activity,
        timestamp: new Date(activity.created_at)
      })) || [];
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch lead activities');
    }
  }

  // Create new activity
  static async createActivity(activityData) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('activities')?.insert({
          ...activityData,
          user_id: user?.user?.id
        })?.select(`
          *,
          customer:customers(id, name, company),
          lead:leads(id, title),
          user:user_profiles(id, full_name)
        `)?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error?.message || 'Failed to create activity');
    }
  }

  // Update activity
  static async updateActivity(activityId, updates) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('activities')?.update(updates)?.eq('id', activityId)?.eq('user_id', user?.user?.id)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error?.message || 'Failed to update activity');
    }
  }

  // Delete activity
  static async deleteActivity(activityId) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase?.from('activities')?.delete()?.eq('id', activityId)?.eq('user_id', user?.user?.id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(error?.message || 'Failed to delete activity');
    }
  }

  // Get activity summary for dashboard metrics
  static async getActivitySummary(days = 30) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const cutoffDate = new Date();
      cutoffDate?.setDate(cutoffDate?.getDate() - days);

      const { data, error } = await supabase?.from('activities')?.select('type, created_at')?.eq('user_id', user?.user?.id)?.gte('created_at', cutoffDate?.toISOString());

      if (error) throw error;

      const summary = {
        total: data?.length || 0,
        calls: data?.filter(a => a?.type === 'call')?.length || 0,
        emails: data?.filter(a => a?.type === 'email')?.length || 0,
        meetings: data?.filter(a => a?.type === 'meeting')?.length || 0,
        notes: data?.filter(a => a?.type === 'note')?.length || 0,
        tasks: data?.filter(a => a?.type === 'task')?.length || 0
      };

      return summary;
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch activity summary');
    }
  }
}