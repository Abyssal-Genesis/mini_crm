import { supabase } from '../lib/supabase';

export class LeadService {
  // Get all leads for the current user
  static async getLeads(filters = {}) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      let query = supabase?.from('leads')?.select(`
          *,
          customer:customers(id, name, email, company),
          assigned_user:user_profiles!leads_assigned_to_fkey(id, full_name, email),
          created_user:user_profiles!leads_created_by_fkey(id, full_name, email)
        `)?.or(`created_by.eq.${user?.user?.id},assigned_to.eq.${user?.user?.id}`);

      // Apply filters
      if (filters?.status && filters?.status !== 'all') {
        query = query?.eq('status', filters?.status);
      }

      if (filters?.search) {
        query = query?.or(`title.ilike.%${filters?.search}%,description.ilike.%${filters?.search}%`);
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'created_desc';
      switch (sortBy) {
        case 'created_desc':
          query = query?.order('created_at', { ascending: false });
          break;
        case 'created_asc':
          query = query?.order('created_at', { ascending: true });
          break;
        case 'value_desc':
          query = query?.order('value', { ascending: false });
          break;
        case 'value_asc':
          query = query?.order('value', { ascending: true });
          break;
        case 'customer_name':
          query = query?.order('customer(name)', { ascending: true });
          break;
        default:
          query = query?.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match component expectations
      return data?.map(lead => ({
        ...lead,
        customerName: lead?.customer?.name || '',
        customerEmail: lead?.customer?.email || '',
        customerCompany: lead?.customer?.company || ''
      })) || [];
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch leads');
    }
  }

  // Get lead by ID
  static async getLeadById(leadId) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('leads')?.select(`
          *,
          customer:customers(*),
          assigned_user:user_profiles!leads_assigned_to_fkey(*),
          created_user:user_profiles!leads_created_by_fkey(*),
          activities:activities(*)
        `)?.eq('id', leadId)?.or(`created_by.eq.${user?.user?.id},assigned_to.eq.${user?.user?.id}`)?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch lead');
    }
  }

  // Create new lead
  static async createLead(leadData) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('leads')?.insert({
          ...leadData,
          created_by: user?.user?.id,
          assigned_to: leadData?.assigned_to || user?.user?.id
        })?.select()?.single();

      if (error) throw error;

      // Create activity for new lead
      await this.createLeadActivity(data?.id, data?.customer_id, 'lead_created', 'New Lead Created', `${data?.title} lead was created`);

      return data;
    } catch (error) {
      throw new Error(error?.message || 'Failed to create lead');
    }
  }

  // Update lead
  static async updateLead(leadId, updates) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      // Get current lead for comparison
      const { data: currentLead } = await supabase?.from('leads')?.select('status, customer_id, title')?.eq('id', leadId)?.single();

      const { data, error } = await supabase?.from('leads')?.update(updates)?.eq('id', leadId)?.or(`created_by.eq.${user?.user?.id},assigned_to.eq.${user?.user?.id}`)?.select()?.single();

      if (error) throw error;

      // Create activity if status changed
      if (updates?.status && currentLead?.status !== updates?.status) {
        await this.createLeadActivity(
          leadId, 
          currentLead?.customer_id,
          'lead_updated', 
          'Lead Status Updated', 
          `${currentLead?.title || 'Lead'} status changed to ${updates?.status}`
        );
      }

      return data;
    } catch (error) {
      throw new Error(error?.message || 'Failed to update lead');
    }
  }

  // Delete lead
  static async deleteLead(leadId) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase?.from('leads')?.delete()?.eq('id', leadId)?.or(`created_by.eq.${user?.user?.id},assigned_to.eq.${user?.user?.id}`);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(error?.message || 'Failed to delete lead');
    }
  }

  // Bulk update lead status
  static async bulkUpdateStatus(leadIds, newStatus) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('leads')?.update({ status: newStatus })?.in('id', leadIds)?.or(`created_by.eq.${user?.user?.id},assigned_to.eq.${user?.user?.id}`)?.select();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error?.message || 'Failed to update lead status');
    }
  }

  // Get lead statistics
  static async getLeadStats() {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('leads')?.select('status, value, created_at')?.or(`created_by.eq.${user?.user?.id},assigned_to.eq.${user?.user?.id}`);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        new: data?.filter(l => l?.status === 'new')?.length || 0,
        contacted: data?.filter(l => l?.status === 'contacted')?.length || 0,
        qualified: data?.filter(l => l?.status === 'qualified')?.length || 0,
        converted: data?.filter(l => l?.status === 'converted')?.length || 0,
        lost: data?.filter(l => l?.status === 'lost')?.length || 0,
        totalValue: data?.reduce((sum, lead) => sum + (parseFloat(lead?.value) || 0), 0) || 0,
        avgValue: data?.length > 0 ? (data?.reduce((sum, lead) => sum + (parseFloat(lead?.value) || 0), 0) / data?.length) : 0,
        conversionRate: data?.length > 0 ? ((data?.filter(l => l?.status === 'converted')?.length || 0) / data?.length * 100) : 0
      };

      return stats;
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch lead statistics');
    }
  }

  // Get lead status distribution for charts
  static async getLeadStatusDistribution() {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('leads')?.select('status')?.or(`created_by.eq.${user?.user?.id},assigned_to.eq.${user?.user?.id}`);

      if (error) throw error;

      const statusCounts = data?.reduce((acc, lead) => {
        acc[lead.status] = (acc?.[lead?.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const total = data?.length || 0;

      return [
        { name: 'New', value: statusCounts?.new || 0, total },
        { name: 'Contacted', value: statusCounts?.contacted || 0, total },
        { name: 'Qualified', value: statusCounts?.qualified || 0, total },
        { name: 'Converted', value: statusCounts?.converted || 0, total },
        { name: 'Lost', value: statusCounts?.lost || 0, total }
      ];
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch lead status distribution');
    }
  }

  // Create lead activity
  static async createLeadActivity(leadId, customerId, type, title, description) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) return;

      const { error } = await supabase?.from('activities')?.insert({
          type,
          title,
          description,
          lead_id: leadId,
          customer_id: customerId,
          user_id: user?.user?.id
        });

      if (error) {
        console.warn('Failed to create lead activity:', error?.message);
      }
    } catch (error) {
      console.warn('Failed to create lead activity:', error?.message);
    }
  }
}