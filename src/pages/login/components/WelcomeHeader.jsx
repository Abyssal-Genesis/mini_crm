import React from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-modal">
          <Icon name="Building2" size={32} color="white" />
        </div>
      </div>

      {/* Welcome Text */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">
          Welcome Back
        </h1>
        <p className="text-text-secondary text-base">
          Sign in to your Mini CRM account to manage your customers and leads
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold text-primary">500+</div>
          <div className="text-xs text-text-secondary">Active Users</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-success">99.9%</div>
          <div className="text-xs text-text-secondary">Uptime</div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;