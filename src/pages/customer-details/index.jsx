import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import CustomerProfile from './components/CustomerProfile';
import LeadsTable from './components/LeadsTable';
import ActivityTimeline from './components/ActivityTimeline';
import AddLeadModal from './components/AddLeadModal';
import EditLeadModal from './components/EditLeadModal';

const CustomerDetails = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Mock customer data
  const [customer, setCustomer] = useState({
    id: "CUST-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    phone: "+1 (555) 123-4567",
    company: "TechCorp Solutions",
    position: "Marketing Director",
    address: "123 Business Ave, San Francisco, CA 94105",
    status: "Active",
    totalLeads: 8,
    totalValue: 125000,
    convertedLeads: 3,
    createdDate: "2024-01-15T10:30:00Z"
  });

  // Mock leads data
  const [leads, setLeads] = useState([
    {
      id: 1,
      customerId: "CUST-001",
      title: "Enterprise Software License",
      description: "Annual software licensing for 500+ users",
      value: 45000,
      status: "Converted",
      createdDate: "2024-08-15T09:00:00Z"
    },
    {
      id: 2,
      customerId: "CUST-001",
      title: "Cloud Migration Project",
      description: "Complete infrastructure migration to cloud platform",
      value: 75000,
      status: "Contacted",
      createdDate: "2024-08-20T14:30:00Z"
    },
    {
      id: 3,
      customerId: "CUST-001",
      title: "Security Audit Services",
      description: "Comprehensive security assessment and recommendations",
      value: 15000,
      status: "New",
      createdDate: "2024-09-01T11:15:00Z"
    },
    {
      id: 4,
      customerId: "CUST-001",
      title: "Training Program",
      description: "Staff training for new software implementation",
      value: 8500,
      status: "Lost",
      createdDate: "2024-07-10T16:45:00Z"
    },
    {
      id: 5,
      customerId: "CUST-001",
      title: "Mobile App Development",
      description: "Custom mobile application for customer portal",
      value: 32000,
      status: "Contacted",
      createdDate: "2024-08-25T13:20:00Z"
    }
  ]);

  // Mock activity timeline data
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "lead_created",
      title: "New Lead Created",
      description: "Security Audit Services lead was created",
      details: "Lead value: $15,000 | Status: New",
      user: "John Smith",
      timestamp: "2024-09-01T11:15:00Z"
    },
    {
      id: 2,
      type: "lead_updated",
      title: "Lead Status Updated",
      description: "Cloud Migration Project status changed to Contacted",
      details: "Previous status: New | New status: Contacted",
      user: "Sarah Wilson",
      timestamp: "2024-08-28T10:30:00Z"
    },
    {
      id: 3,
      type: "lead_converted",
      title: "Lead Converted",
      description: "Enterprise Software License successfully converted",
      details: "Final value: $45,000 | Conversion date: 08/25/2024",
      user: "Mike Johnson",
      timestamp: "2024-08-25T15:45:00Z"
    },
    {
      id: 4,
      type: "customer_updated",
      title: "Customer Information Updated",
      description: "Contact information and company details updated",
      details: "Updated phone number and address",
      user: "Admin",
      timestamp: "2024-08-20T09:15:00Z"
    },
    {
      id: 5,
      type: "note_added",
      title: "Note Added",
      description: "Follow-up meeting scheduled for next week",
      details: "Meeting scheduled for 09/10/2024 at 2:00 PM",
      user: "Sarah Wilson",
      timestamp: "2024-08-18T14:20:00Z"
    }
  ]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleUpdateCustomer = (updatedData) => {
    setCustomer(prev => ({
      ...prev,
      ...updatedData
    }));
    
    // Add activity
    const newActivity = {
      id: Date.now(),
      type: "customer_updated",
      title: "Customer Information Updated",
      description: "Customer profile information was modified",
      details: "Contact and company information updated",
      user: "Current User",
      timestamp: new Date()?.toISOString()
    };
    
    setActivities(prev => [newActivity, ...prev]);
  };

  const handleAddLead = (newLead) => {
    setLeads(prev => [newLead, ...prev]);
    
    // Update customer stats
    setCustomer(prev => ({
      ...prev,
      totalLeads: prev?.totalLeads + 1,
      totalValue: prev?.totalValue + newLead?.value
    }));
    
    // Add activity
    const newActivity = {
      id: Date.now(),
      type: "lead_created",
      title: "New Lead Created",
      description: `${newLead?.title} lead was created`,
      details: `Lead value: $${newLead?.value?.toLocaleString()} | Status: ${newLead?.status}`,
      user: "Current User",
      timestamp: new Date()?.toISOString()
    };
    
    setActivities(prev => [newActivity, ...prev]);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setShowEditLeadModal(true);
  };

  const handleUpdateLead = (updatedLead) => {
    setLeads(prev => prev?.map(lead => 
      lead?.id === updatedLead?.id ? updatedLead : lead
    ));
    
    // Update customer stats if value changed
    const oldLead = leads?.find(l => l?.id === updatedLead?.id);
    if (oldLead && oldLead?.value !== updatedLead?.value) {
      const valueDifference = updatedLead?.value - oldLead?.value;
      setCustomer(prev => ({
        ...prev,
        totalValue: prev?.totalValue + valueDifference
      }));
    }
    
    // Update converted leads count
    if (updatedLead?.status === 'Converted' && oldLead?.status !== 'Converted') {
      setCustomer(prev => ({
        ...prev,
        convertedLeads: prev?.convertedLeads + 1
      }));
    } else if (updatedLead?.status !== 'Converted' && oldLead?.status === 'Converted') {
      setCustomer(prev => ({
        ...prev,
        convertedLeads: prev?.convertedLeads - 1
      }));
    }
    
    // Add activity
    const newActivity = {
      id: Date.now(),
      type: "lead_updated",
      title: "Lead Updated",
      description: `${updatedLead?.title} was modified`,
      details: `Status: ${updatedLead?.status} | Value: $${updatedLead?.value?.toLocaleString()}`,
      user: "Current User",
      timestamp: new Date()?.toISOString()
    };
    
    setActivities(prev => [newActivity, ...prev]);
  };

  const handleDeleteLead = (leadId) => {
    const leadToDelete = leads?.find(lead => lead?.id === leadId);
    if (leadToDelete) {
      setLeads(prev => prev?.filter(lead => lead?.id !== leadId));
      
      // Update customer stats
      setCustomer(prev => ({
        ...prev,
        totalLeads: prev?.totalLeads - 1,
        totalValue: prev?.totalValue - leadToDelete?.value,
        convertedLeads: leadToDelete?.status === 'Converted' 
          ? prev?.convertedLeads - 1 
          : prev?.convertedLeads
      }));
      
      // Add activity
      const newActivity = {
        id: Date.now(),
        type: "lead_updated",
        title: "Lead Deleted",
        description: `${leadToDelete?.title} was removed`,
        details: `Deleted lead value: $${leadToDelete?.value?.toLocaleString()}`,
        user: "Current User",
        timestamp: new Date()?.toISOString()
      };
      
      setActivities(prev => [newActivity, ...prev]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading customer details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/dashboard" className="hover:text-primary">
            Dashboard
          </Link>
          <Icon name="ChevronRight" size={16} />
          <Link to="/customer-management" className="hover:text-primary">
            Customers
          </Link>
          <Icon name="ChevronRight" size={16} />
          <span className="text-gray-900">{customer?.name}</span>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/customer-management')}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Back to Customers
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Profile */}
            <CustomerProfile 
              customer={customer}
              onUpdateCustomer={handleUpdateCustomer}
            />

            {/* Leads Table */}
            <LeadsTable
              leads={leads}
              onEditLead={handleEditLead}
              onDeleteLead={handleDeleteLead}
              onAddLead={() => setShowAddLeadModal(true)}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>
      {/* Modals */}
      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onAddLead={handleAddLead}
        customerId={customer?.id}
      />
      <EditLeadModal
        isOpen={showEditLeadModal}
        onClose={() => setShowEditLeadModal(false)}
        onUpdateLead={handleUpdateLead}
        lead={selectedLead}
      />
    </div>
  );
};

export default CustomerDetails;