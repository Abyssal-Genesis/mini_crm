import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import MetricCard from './components/MetricCard';
import LeadStatusChart from './components/LeadStatusChart';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';
import ConversionTrendChart from './components/ConversionTrendChart';
import LeadValueChart from './components/LeadValueChart';
import { DashboardService } from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [leadStatusData, setLeadStatusData] = useState([]);
  const [conversionTrendData, setConversionTrendData] = useState([]);
  const [leadValueData, setLeadValueData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all dashboard data in parallel
      const [
        metricsData,
        statusData,
        trendData,
        valueData,
        activitiesData
      ] = await Promise.all([
        DashboardService?.getDashboardMetrics(),
        DashboardService?.getLeadStatusDistribution(),
        DashboardService?.getConversionTrend(),
        DashboardService?.getLeadValueByStatus(),
        DashboardService?.getRecentActivities(5)
      ]);

      setDashboardMetrics(metricsData);
      setLeadStatusData(statusData);
      setConversionTrendData(trendData);
      setLeadValueData(valueData);
      setRecentActivities(activitiesData);
    } catch (error) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-6 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userProfile?.full_name || user?.email?.split('@')?.[0] || 'User'}!
          </h1>
          <p className="text-text-secondary">
            Here's what's happening with your CRM today.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Customers"
            value={dashboardMetrics?.totalCustomers?.toLocaleString() || '0'}
            icon="Users"
            trend="up"
            trendValue="+12.5%"
            color="primary"
          />
          <MetricCard
            title="Active Leads"
            value={dashboardMetrics?.activeLeads?.toString() || '0'}
            icon="Target"
            trend="up"
            trendValue="+8.2%"
            color="accent"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${dashboardMetrics?.conversionRate || 0}%`}
            icon="TrendingUp"
            trend="up"
            trendValue="+3.1%"
            color="success"
          />
          <MetricCard
            title="Total Lead Value"
            value={`$${dashboardMetrics?.totalLeadValue?.toLocaleString() || '0'}`}
            icon="DollarSign"
            trend="up"
            trendValue="+15.7%"
            color="warning"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LeadStatusChart data={leadStatusData} />
          <ConversionTrendChart data={conversionTrendData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LeadValueChart data={leadValueData} />
          <QuickActions />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity activities={recentActivities} />
          </div>
          
          {/* Additional Stats Panel */}
          <div className="bg-card rounded-lg p-6 shadow-subtle border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">This Month's Customers</span>
                <span className="text-sm font-medium text-foreground">{dashboardMetrics?.thisMonthCustomers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Average Deal Size</span>
                <span className="text-sm font-medium text-foreground">${dashboardMetrics?.averageDealSize?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Pipeline Value</span>
                <span className="text-sm font-medium text-foreground">${dashboardMetrics?.pipelineValue?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Active Customers</span>
                <span className="text-sm font-medium text-success">{dashboardMetrics?.activeCustomers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Converted Leads</span>
                <span className="text-sm font-medium text-foreground">{dashboardMetrics?.convertedLeads || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;