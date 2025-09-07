import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import LeadFilters from './components/LeadFilters';
import LeadSummaryPanel from './components/LeadSummaryPanel';
import LeadTable from './components/LeadTable';
import CreateLeadModal from './components/CreateLeadModal';
import EditLeadModal from './components/EditLeadModal';
import { LeadService } from '../../services/leadService';
import { CustomerService } from '../../services/customerService';
import { useAuth } from '../../contexts/AuthContext';

const LeadManagement = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [leadsData, customersData] = await Promise.all([
        LeadService?.getLeads({ status: statusFilter, search: searchTerm, sortBy }),
        CustomerService?.getCustomers()
      ]);
      
      setLeads(leadsData);
      setCustomers(customersData);
    } catch (error) {
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort leads (local filtering for immediate response)
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads?.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        lead?.customerName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        lead?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        lead?.status?.toLowerCase() === statusFilter?.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    // Sort leads
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'created_desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'created_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'value_desc':
          return (b?.value || 0) - (a?.value || 0);
        case 'value_asc':
          return (a?.value || 0) - (b?.value || 0);
        case 'customer_name':
          return a?.customerName?.localeCompare(b?.customerName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [leads, searchTerm, statusFilter, sortBy]);

  const handleCreateLead = async (leadData) => {
    try {
      const newLead = await LeadService?.createLead(leadData);
      setLeads(prev => [newLead, ...prev]);
      setIsCreateModalOpen(false);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleUpdateLead = async (leadData) => {
    try {
      const updatedLead = await LeadService?.updateLead(selectedLead?.id, leadData);
      setLeads(prev => prev?.map(lead => 
        lead?.id === selectedLead?.id ? updatedLead : lead
      ));
      setIsEditModalOpen(false);
      setSelectedLead(null);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleDeleteLead = async (leadId) => {
    try {
      await LeadService?.deleteLead(leadId);
      setLeads(prev => prev?.filter(lead => lead?.id !== leadId));
    } catch (error) {
      setError('Failed to delete lead: ' + error?.message);
    }
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    try {
      await LeadService?.updateLead(leadId, { status: newStatus });
      setLeads(prev => prev?.map(lead => 
        lead?.id === leadId ? { ...lead, status: newStatus } : lead
      ));
    } catch (error) {
      setError('Failed to update lead status: ' + error?.message);
    }
  };

  const handleBulkAction = async (action, selectedLeadIds, data) => {
    try {
      switch (action) {
        case 'updateStatus':
          await LeadService?.bulkUpdateStatus(selectedLeadIds, data);
          setLeads(prev => prev?.map(lead => 
            selectedLeadIds?.includes(lead?.id) ? { ...lead, status: data } : lead
          ));
          break;
        case 'export':
          // Export leads to CSV
          const exportLeads = leads?.filter(lead => selectedLeadIds?.includes(lead?.id));
          const csvContent = "data:text/csv;charset=utf-8," +"Title,Customer,Status,Value,Created At\n"
            + exportLeads?.map(lead => 
              `"${lead?.title}","${lead?.customerName || ''}","${lead?.status}","${lead?.value || 0}","${new Date(lead.created_at)?.toLocaleDateString()}"`
            )?.join("\n");
          
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link?.setAttribute("href", encodedUri);
          link?.setAttribute("download", `leads_${new Date()?.toISOString()?.split('T')?.[0]}.csv`);
          document.body?.appendChild(link);
          link?.click();
          document.body?.removeChild(link);
          break;
        default:
          break;
      }
    } catch (error) {
      setError('Failed to perform bulk action: ' + error?.message);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('created_desc');
  };

  useEffect(() => {
    if (user) {
      // Reload when filters change
      const timeoutId = setTimeout(() => {
        loadData();
      }, 500); // Debounce

      return () => clearTimeout(timeoutId);
    }
  }, [statusFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-text-secondary">Loading leads...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lead Management</h1>
            <p className="mt-2 text-text-secondary">
              Track and manage your sales opportunities
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              iconName="Plus"
              iconPosition="left"
              className="w-full sm:w-auto"
            >
              Create New Lead
            </Button>
          </div>
        </div>

        {/* Summary Panel */}
        <LeadSummaryPanel leads={filteredAndSortedLeads} />

        {/* Filters */}
        <LeadFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearFilters={handleClearFilters}
          totalLeads={filteredAndSortedLeads?.length}
        />

        {/* Leads Table */}
        {filteredAndSortedLeads?.length > 0 ? (
          <LeadTable
            leads={filteredAndSortedLeads}
            onEdit={handleEditLead}
            onDelete={handleDeleteLead}
            onStatusUpdate={handleStatusUpdate}
            onBulkAction={handleBulkAction}
            userRole={userProfile?.role || 'member'}
          />
        ) : (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <Icon name="Target" size={48} className="text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No leads found</h3>
            <p className="text-text-secondary mb-6">
              {searchTerm || statusFilter !== 'all' ?'Try adjusting your filters to see more results.' :'Get started by creating your first lead.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                iconName="Plus"
                iconPosition="left"
              >
                Create New Lead
              </Button>
            )}
          </div>
        )}

        {/* Modals */}
        <CreateLeadModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateLead}
          customers={customers}
        />

        <EditLeadModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedLead(null);
          }}
          onSubmit={handleUpdateLead}
          lead={selectedLead}
          customers={customers}
        />
      </main>
    </div>
  );
};

export default LeadManagement;