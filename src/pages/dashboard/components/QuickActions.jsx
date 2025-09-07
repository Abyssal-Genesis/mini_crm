import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const navigate = useNavigate();

  const handleAddCustomer = () => {
    navigate('/customer-management');
  };

  const handleCreateLead = () => {
    navigate('/lead-management');
  };

  const handleViewCustomers = () => {
    navigate('/customer-management');
  };

  const handleViewLeads = () => {
    navigate('/lead-management');
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-subtle border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="default"
          iconName="UserPlus"
          iconPosition="left"
          onClick={handleAddCustomer}
          className="justify-start"
        >
          Add Customer
        </Button>
        <Button
          variant="outline"
          iconName="Target"
          iconPosition="left"
          onClick={handleCreateLead}
          className="justify-start"
        >
          Create Lead
        </Button>
        <Button
          variant="secondary"
          iconName="Users"
          iconPosition="left"
          onClick={handleViewCustomers}
          className="justify-start"
        >
          View Customers
        </Button>
        <Button
          variant="ghost"
          iconName="BarChart3"
          iconPosition="left"
          onClick={handleViewLeads}
          className="justify-start"
        >
          View Leads
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;