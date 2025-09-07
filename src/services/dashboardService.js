import { supabase } from '../lib/supabase';

export class DashboardService {
  // Get comprehensive dashboard metrics
  static async getDashboardMetrics() {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      // Get customer count
      const { data: customers, error: customersError } = await supabase?.from('customers')?.select('id, status, created_at')?.eq('created_by', user?.user?.id);

      if (customersError) throw customersError;

      // Get leads data  
      const { data: leads, error: leadsError } = await supabase?.from('leads')?.select('id, status, value, created_at')?.or(`created_by.eq.${user?.user?.id},assigned_to.eq.${user?.user?.id}`);

      if (leadsError) throw leadsError;

      // Calculate metrics
      const totalCustomers = customers?.length || 0;
      const activeCustomers = customers?.filter(c => c?.status === 'active')?.length || 0;
      const activeLeads = leads?.filter(l => ['new', 'contacted', 'qualified']?.includes(l?.status))?.length || 0;
      const convertedLeads = leads?.filter(l => l?.status === 'converted')?.length || 0;
      const totalLeadValue = leads?.reduce((sum, lead) => sum + (parseFloat(lead?.value) || 0), 0) || 0;
      const conversionRate = leads?.length > 0 ? (convertedLeads / leads?.length * 100) : 0;

      // Calculate monthly trends (simplified)
      const currentMonth = new Date()?.getMonth();
      const currentYear = new Date()?.getFullYear();
      
      const thisMonthCustomers = customers?.filter(c => {
        const created = new Date(c?.created_at);
        return created?.getMonth() === currentMonth && created?.getFullYear() === currentYear;
      })?.length || 0;

      return {
        totalCustomers,
        activeCustomers,
        activeLeads,
        convertedLeads,
        totalLeadValue,
        conversionRate: Math.round(conversionRate * 10) / 10,
        thisMonthCustomers,
        // Additional calculated metrics
        averageDealSize: leads?.length > 0 ? Math.round(totalLeadValue / leads?.length) : 0,
        pipelineValue: leads?.filter(l => ['new', 'contacted', 'qualified']?.includes(l?.status))
          ?.reduce((sum, lead) => sum + (parseFloat(lead?.value) || 0), 0) || 0
      };
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch dashboard metrics');
    }
  }

  // Get lead status distribution for chart
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

  // Get conversion trend data (simplified monthly data)
  static async getConversionTrend() {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      // Get leads from last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo?.setMonth(sixMonthsAgo?.getMonth() - 6);

      const { data, error } = await supabase?.from('leads')?.select('status, created_at')?.or(`created_by.eq.${user?.user?.id},assigned_to.eq.${user?.user?.id}`)?.gte('created_at', sixMonthsAgo?.toISOString());

      if (error) throw error;

      // Group by month and calculate conversion rates
      const monthlyData = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      data?.forEach(lead => {
        const date = new Date(lead.created_at);
        const monthKey = months?.[date?.getMonth()];
        
        if (!monthlyData?.[monthKey]) {
          monthlyData[monthKey] = { total: 0, converted: 0 };
        }
        
        monthlyData[monthKey].total++;
        if (lead?.status === 'converted') {
          monthlyData[monthKey].converted++;
        }
      });

      // Convert to chart format
      const trendData = Object.keys(monthlyData)?.map(month => ({
        month,
        conversionRate: monthlyData?.[month]?.total > 0 
          ? Math.round((monthlyData?.[month]?.converted / monthlyData?.[month]?.total) * 100 * 10) / 10
          : 0
      }));

      return trendData;
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch conversion trend');
    }
  }

  // Get lead value by status for chart
  static async getLeadValueByStatus() {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('leads')?.select('status, value')?.or(`created_by.eq.${user?.user?.id},assigned_to.eq.${user?.user?.id}`);

      if (error) throw error;

      const valueByStatus = data?.reduce((acc, lead) => {
        const status = lead?.status;
        const value = parseFloat(lead?.value) || 0;
        acc[status] = (acc?.[status] || 0) + value;
        return acc;
      }, {}) || {};

      return [
        { status: 'New', value: Math.round(valueByStatus?.new || 0) },
        { status: 'Contacted', value: Math.round(valueByStatus?.contacted || 0) },
        { status: 'Qualified', value: Math.round(valueByStatus?.qualified || 0) },
        { status: 'Converted', value: Math.round(valueByStatus?.converted || 0) },
        { status: 'Lost', value: Math.round(valueByStatus?.lost || 0) }
      ];
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch lead value by status');
    }
  }

  // Get recent activities for dashboard
  static async getRecentActivities(limit = 5) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('activities')?.select(`
          *,
          customer:customers(name, company),
          lead:leads(title)
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
}