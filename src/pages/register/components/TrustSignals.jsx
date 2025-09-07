import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const trustFeatures = [
    {
      icon: 'Shield',
      title: 'Secure Registration',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: 'Lock',
      title: 'Data Protection',
      description: 'We never share your personal information with third parties'
    },
    {
      icon: 'CheckCircle',
      title: 'Verified Platform',
      description: 'Trusted by thousands of businesses worldwide'
    }
  ];

  return (
    <div className="bg-muted/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
        Why Choose Mini CRM?
      </h3>
      <div className="space-y-4">
        {trustFeatures?.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name={feature?.icon} size={16} color="var(--color-success)" />
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">{feature?.title}</h4>
              <p className="text-text-secondary text-xs mt-1">{feature?.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="Shield" size={16} color="var(--color-success)" />
            <span className="text-xs text-text-secondary">SSL Secured</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Database" size={16} color="var(--color-success)" />
            <span className="text-xs text-text-secondary">GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;