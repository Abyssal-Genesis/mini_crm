import React from 'react';
import Icon from '../../../components/AppIcon';

const LeadSummaryPanel = ({ leads }) => {
  const totalValue = leads?.reduce((sum, lead) => sum + lead?.value, 0);
  const convertedLeads = leads?.filter(lead => lead?.status?.toLowerCase() === 'converted');
  const conversionRate = leads?.length > 0 ? (convertedLeads?.length / leads?.length * 100) : 0;
  
  const statusCounts = leads?.reduce((acc, lead) => {
    const status = lead?.status?.toLowerCase();
    acc[status] = (acc?.[status] || 0) + 1;
    return acc;
  }, {});

  const summaryCards = [
    {
      title: 'Total Lead Value',
      value: `$${totalValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: 'DollarSign',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate?.toFixed(1)}%`,
      icon: 'TrendingUp',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Leads',
      value: leads?.length?.toString(),
      icon: 'Target',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Converted Value',
      value: `$${convertedLeads?.reduce((sum, lead) => sum + lead?.value, 0)?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: 'CheckCircle',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {summaryCards?.map((card, index) => (
        <div key={index} className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary mb-1">
                {card?.title}
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {card?.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${card?.bgColor} flex items-center justify-center`}>
              <Icon name={card?.icon} size={24} className={card?.color} />
            </div>
          </div>
        </div>
      ))}
      {/* Status Distribution */}
      <div className="md:col-span-2 lg:col-span-4 bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusCounts)?.map(([status, count]) => (
            <div key={status} className="text-center">
              <div className="text-2xl font-bold text-foreground">{count}</div>
              <div className="text-sm text-text-secondary capitalize">{status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadSummaryPanel;