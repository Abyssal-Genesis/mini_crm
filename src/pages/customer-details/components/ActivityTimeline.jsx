import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityTimeline = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'lead_created':
        return 'Plus';
      case 'lead_updated':
        return 'Edit';
      case 'lead_converted':
        return 'CheckCircle';
      case 'lead_lost':
        return 'XCircle';
      case 'customer_updated':
        return 'User';
      case 'note_added':
        return 'MessageSquare';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'lead_created':
        return 'bg-blue-100 text-blue-600';
      case 'lead_updated':
        return 'bg-yellow-100 text-yellow-600';
      case 'lead_converted':
        return 'bg-green-100 text-green-600';
      case 'lead_lost':
        return 'bg-red-100 text-red-600';
      case 'customer_updated':
        return 'bg-purple-100 text-purple-600';
      case 'note_added':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date?.toLocaleDateString('en-US');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Activity Timeline</h2>
      {activities?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Clock" size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
          <p className="text-gray-500">Customer activity will appear here as it happens.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activities?.map((activity, index) => (
            <div key={activity?.id} className="relative">
              {/* Timeline line */}
              {index !== activities?.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-200"></div>
              )}
              
              <div className="flex items-start space-x-4">
                {/* Activity icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getActivityColor(activity?.type)}`}>
                  <Icon name={getActivityIcon(activity?.type)} size={20} />
                </div>
                
                {/* Activity content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">{activity?.title}</h3>
                    <div className="text-xs text-gray-500">
                      <span>{formatDate(activity?.timestamp)}</span>
                      <span className="ml-2">{formatTime(activity?.timestamp)}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{activity?.description}</p>
                  
                  {activity?.details && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <p className="text-xs text-gray-500">{activity?.details}</p>
                    </div>
                  )}
                  
                  {activity?.user && (
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Icon name="User" size={12} className="mr-1" />
                      <span>by {activity?.user}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;