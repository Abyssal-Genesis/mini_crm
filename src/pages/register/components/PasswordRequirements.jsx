import React from 'react';
import Icon from '../../../components/AppIcon';

const PasswordRequirements = ({ password }) => {
  const requirements = [
    {
      text: 'At least 8 characters',
      met: password?.length >= 8
    },
    {
      text: 'One uppercase letter',
      met: /[A-Z]/?.test(password)
    },
    {
      text: 'One lowercase letter',
      met: /[a-z]/?.test(password)
    },
    {
      text: 'One number',
      met: /\d/?.test(password)
    },
    {
      text: 'One special character (optional)',
      met: /[^A-Za-z0-9]/?.test(password),
      optional: true
    }
  ];

  if (!password) return null;

  return (
    <div className="bg-muted/30 rounded-md p-3 mt-2">
      <h4 className="text-sm font-medium text-foreground mb-2">Password Requirements:</h4>
      <div className="space-y-1">
        {requirements?.map((req, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Icon 
              name={req?.met ? "CheckCircle" : "Circle"} 
              size={14} 
              color={req?.met ? "var(--color-success)" : "var(--color-text-secondary)"} 
            />
            <span 
              className={`text-xs ${
                req?.met ? 'text-success' : 'text-text-secondary'
              } ${req?.optional ? 'opacity-75' : ''}`}
            >
              {req?.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordRequirements;