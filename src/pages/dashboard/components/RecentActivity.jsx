import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'customer_added':
        return 'UserPlus';
      case 'lead_created':
        return 'Target';
      case 'lead_converted':
        return 'CheckCircle';
      case 'lead_updated':
        return 'Edit';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'customer_added':
        return 'text-primary';
      case 'lead_created':
        return 'text-accent';
      case 'lead_converted':
        return 'text-success';
      case 'lead_updated':
        return 'text-warning';
      default:
        return 'text-text-secondary';
    }
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date)?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-subtle border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <Icon name="Clock" size={20} className="text-text-secondary" />
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Activity" size={48} className="text-text-secondary mx-auto mb-2" />
            <p className="text-text-secondary">No recent activity</p>
          </div>
        ) : (
          activities?.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted transition-smooth">
              <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
                <Icon name={getActivityIcon(activity?.type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity?.title}</p>
                <p className="text-sm text-text-secondary mt-1">{activity?.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-text-secondary">{formatDate(activity?.timestamp)}</span>
                  <span className="text-xs text-text-secondary">•</span>
                  <span className="text-xs text-text-secondary">{formatTime(activity?.timestamp)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;