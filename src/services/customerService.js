import { supabase } from '../lib/supabase';

export class CustomerService {
  // Get all customers for the current user
  static async getCustomers() {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('customers')?.select(`
          *,
          leads:leads(count)
        `)?.eq('created_by', user?.user?.id)?.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match component expectations
      return data?.map(customer => ({
        ...customer,
        leadCount: customer?.leads?.[0]?.count || 0
      })) || [];
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch customers');
    }
  }

  // Get customer by ID
  static async getCustomerById(customerId) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('customers')?.select(`
          *,
          leads:leads(*)
        `)?.eq('id', customerId)?.eq('created_by', user?.user?.id)?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch customer');
    }
  }

  // Create new customer
  static async createCustomer(customerData) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('customers')?.insert({
          ...customerData,
          created_by: user?.user?.id
        })?.select()?.single();

      if (error) throw error;

      // Create activity for new customer
      await this.createCustomerActivity(data?.id, 'customer_added', 'New Customer Added', `${data?.name} was added to the system`);

      return data;
    } catch (error) {
      throw new Error(error?.message || 'Failed to create customer');
    }
  }

  // Update customer
  static async updateCustomer(customerId, updates) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('customers')?.update(updates)?.eq('id', customerId)?.eq('created_by', user?.user?.id)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error?.message || 'Failed to update customer');
    }
  }

  // Delete customer
  static async deleteCustomer(customerId) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase?.from('customers')?.delete()?.eq('id', customerId)?.eq('created_by', user?.user?.id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(error?.message || 'Failed to delete customer');
    }
  }

  // Bulk delete customers
  static async deleteCustomers(customerIds) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase?.from('customers')?.delete()?.in('id', customerIds)?.eq('created_by', user?.user?.id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(error?.message || 'Failed to delete customers');
    }
  }

  // Get customer statistics
  static async getCustomerStats() {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('customers')?.select('status, created_at')?.eq('created_by', user?.user?.id);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        active: data?.filter(c => c?.status === 'active')?.length || 0,
        thisMonth: data?.filter(c => {
          const created = new Date(c?.created_at);
          const now = new Date();
          return created?.getMonth() === now?.getMonth() && 
                 created?.getFullYear() === now?.getFullYear();
        })?.length || 0
      };

      return stats;
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch customer statistics');
    }
  }

  // Create customer activity
  static async createCustomerActivity(customerId, type, title, description) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) return;

      const { error } = await supabase?.from('activities')?.insert({
          type,
          title,
          description,
          customer_id: customerId,
          user_id: user?.user?.id
        });

      if (error) {
        console.warn('Failed to create customer activity:', error?.message);
      }
    } catch (error) {
      console.warn('Failed to create customer activity:', error?.message);
    }
  }

  // Export customers (returns customer data for CSV/Excel export)
  static async exportCustomers(customerIds = null) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      let query = supabase?.from('customers')?.select('*')?.eq('created_by', user?.user?.id);

      if (customerIds && customerIds?.length > 0) {
        query = query?.in('id', customerIds);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(error?.message || 'Failed to export customers');
    }
  }
}