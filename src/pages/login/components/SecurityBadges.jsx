import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      text: 'SSL Encrypted',
      description: 'Your data is protected with 256-bit SSL encryption'
    },
    {
      icon: 'Lock',
      text: 'Secure Login',
      description: 'Multi-factor authentication available'
    },
    {
      icon: 'Eye',
      text: 'Privacy Protected',
      description: 'We never share your personal information'
    }
  ];

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="text-center mb-4">
        <h3 className="text-sm font-medium text-text-secondary">Your Security Matters</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {securityFeatures?.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50"
          >
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center mb-2">
              <Icon 
                name={feature?.icon} 
                size={16} 
                color="var(--color-success)" 
              />
            </div>
            <span className="text-xs font-medium text-foreground mb-1">
              {feature?.text}
            </span>
            <span className="text-xs text-text-secondary leading-tight">
              {feature?.description}
            </span>
          </div>
        ))}
      </div>
      <div className="text-center mt-4">
        <p className="text-xs text-text-secondary">
          Protected by industry-standard security protocols
        </p>
      </div>
    </div>
  );
};

export default SecurityBadges;