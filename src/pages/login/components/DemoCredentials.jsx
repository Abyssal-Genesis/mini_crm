import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DemoCredentials = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const credentials = [
    {
      role: 'Admin',
      email: 'admin@minicrm.com',
      password: 'Admin123!',
      description: 'Full access to all features and user management',
      color: 'text-primary'
    },
    {
      role: 'Sales Manager',
      email: 'manager@minicrm.com',
      password: 'Manager123!',
      description: 'Access to customer and lead management',
      color: 'text-success'
    },
    {
      role: 'Sales Rep',
      email: 'sales@minicrm.com',
      password: 'Sales123!',
      description: 'Basic access to assigned customers and leads',
      color: 'text-accent'
    }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="Info" size={16} color="var(--color-accent)" />
          <span className="text-sm font-medium text-accent">Demo Credentials</span>
        </div>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setIsExpanded(!isExpanded)}
          iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
          iconPosition="right"
        >
          {isExpanded ? 'Hide' : 'Show'}
        </Button>
      </div>
      {isExpanded && (
        <div className="space-y-3">
          {credentials?.map((cred, index) => (
            <div key={index} className="p-3 bg-surface rounded-md border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${cred?.color}`}>
                  {cred?.role}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => copyToClipboard(cred?.email)}
                    className="p-1 hover:bg-muted rounded transition-smooth"
                    title="Copy email"
                  >
                    <Icon name="Copy" size={12} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-text-secondary w-16">Email:</span>
                  <code className="bg-muted px-2 py-1 rounded text-foreground">
                    {cred?.email}
                  </code>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-text-secondary w-16">Password:</span>
                  <code className="bg-muted px-2 py-1 rounded text-foreground">
                    {cred?.password}
                  </code>
                </div>
              </div>
              
              <p className="text-xs text-text-secondary mt-2">
                {cred?.description}
              </p>
            </div>
          ))}
          
          <div className="text-xs text-text-secondary text-center pt-2 border-t border-border">
            Click on any credential to copy it to your clipboard
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoCredentials;