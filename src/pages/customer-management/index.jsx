import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import CustomerTable from './components/CustomerTable';
import CustomerSearch from './components/CustomerSearch';
import CustomerPagination from './components/CustomerPagination';
import AddCustomerModal from './components/AddCustomerModal';
import EditCustomerModal from './components/EditCustomerModal';
import BulkActions from './components/BulkActions';
import { CustomerService } from '../../services/customerService';
import { useAuth } from '../../contexts/AuthContext';

const CustomerManagement = () => {
  const { user } = useAuth();
  const [allCustomers, setAllCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerStats, setCustomerStats] = useState({ total: 0, active: 0, thisMonth: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 8;

  useEffect(() => {
    if (user) {
      loadCustomers();
      loadCustomerStats();
    }
  }, [user]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CustomerService.getCustomers();
      setAllCustomers(data);
      setCustomers(data);
    } catch (error) {
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerStats = async () => {
    try {
      const stats = await CustomerService.getCustomerStats();
      setCustomerStats(stats);
    } catch (error) {
      console.warn('Failed to load customer statistics:', error.message);
    }
  };

  // Filter and search customers
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    
    return customers?.filter(customer =>
      customer?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      customer?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      customer?.company?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );
  }, [customers, searchTerm]);

  // Sort customers
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers]?.sort((a, b) => {
      let aValue = a?.[sortField];
      let bValue = b?.[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase();
        bValue = bValue?.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredCustomers, sortField, sortDirection]);

  // Paginate customers
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCustomers?.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCustomers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedCustomers?.length / itemsPerPage);

  // Event handlers
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setSelectedCustomers([]);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev => {
      if (prev?.includes(customerId)) {
        return prev?.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCustomers?.length === paginatedCustomers?.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(paginatedCustomers?.map(customer => customer?.id));
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedCustomers([]);
  };

  const handleAddCustomer = async (newCustomerData) => {
    try {
      const newCustomer = await CustomerService.createCustomer(newCustomerData);
      setAllCustomers(prev => [newCustomer, ...prev]);
      setCustomers(prev => [newCustomer, ...prev]);
      loadCustomerStats(); // Refresh stats
      setIsAddModalOpen(false);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleUpdateCustomer = async (customerId, updates) => {
    try {
      const updatedCustomer = await CustomerService.updateCustomer(customerId, updates);
      setCustomers(prev =>
        prev?.map(customer =>
          customer?.id === customerId ? updatedCustomer : customer
        )
      );
      setAllCustomers(prev =>
        prev?.map(customer =>
          customer?.id === customerId ? updatedCustomer : customer
        )
      );
      setIsEditModalOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await CustomerService.deleteCustomer(customerId);
      setCustomers(prev => prev?.filter(customer => customer?.id !== customerId));
      setAllCustomers(prev => prev?.filter(customer => customer?.id !== customerId));
      setSelectedCustomers(prev => prev?.filter(id => id !== customerId));
      loadCustomerStats(); // Refresh stats
    } catch (error) {
      setError('Failed to delete customer: ' + error.message);
    }
  };

  const handleBulkDelete = async (customerIds) => {
    try {
      await CustomerService.deleteCustomers(customerIds);
      setCustomers(prev => prev?.filter(customer => !customerIds?.includes(customer?.id)));
      setAllCustomers(prev => prev?.filter(customer => !customerIds?.includes(customer?.id)));
      setSelectedCustomers([]);
      loadCustomerStats(); // Refresh stats
    } catch (error) {
      setError('Failed to delete customers: ' + error.message);
    }
  };

  const handleBulkExport = async (customerIds) => {
    try {
      const exportData = await CustomerService.exportCustomers(customerIds);
      // Convert to CSV and trigger download
      const csvContent = "data:text/csv;charset=utf-8," + "Name,Email,Phone,Company,Status,Created At\n"
        + exportData?.map(customer => 
          `"${customer.name}","${customer.email || ''}","${customer.phone || ''}","${customer.company || ''}","${customer.status}","${new Date(customer.created_at).toLocaleDateString()}"`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `customers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError('Failed to export customers: ' + error.message);
    }
  };

  const handleClearSelection = () => {
    setSelectedCustomers([]);
  };

  // Reset page when filters change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading customers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="w-full">
        <div className="px-4 lg:px-6 py-6">
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">Customer Management</h1>
              <p className="text-text-secondary mt-1">
                Manage your customer relationships and track interactions
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => window.print()}
              >
                <Icon name="Printer" size={18} className="mr-2" />
                Print
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <Icon name="Plus" size={18} />
                <span>Add Customer</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Total Customers</p>
                  <p className="text-2xl font-semibold text-foreground">{customerStats?.total || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Users" size={24} className="text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Active Customers</p>
                  <p className="text-2xl font-semibold text-foreground">{customerStats?.active || 0}</p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <Icon name="Target" size={24} className="text-success" />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">New This Month</p>
                  <p className="text-2xl font-semibold text-foreground">{customerStats?.thisMonth || 0}</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Icon name="UserPlus" size={24} className="text-accent" />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Avg Leads/Customer</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {customerStats?.total > 0 ? 
                      Math.round((allCustomers?.reduce((sum, customer) => sum + (customer?.leadCount || 0), 0) / customerStats.total) * 10) / 10 
                      : 0
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} className="text-warning" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <CustomerSearch
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            resultCount={filteredCustomers?.length}
            totalCount={customers?.length}
          />

          {/* Bulk Actions */}
          <BulkActions
            selectedCustomers={selectedCustomers}
            onBulkDelete={handleBulkDelete}
            onBulkExport={handleBulkExport}
            onClearSelection={handleClearSelection}
          />

          {/* Customer Table */}
          <CustomerTable
            customers={paginatedCustomers}
            selectedCustomers={selectedCustomers}
            onSelectCustomer={handleSelectCustomer}
            onSelectAll={handleSelectAll}
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            loading={false}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <CustomerPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedCustomers?.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {/* Empty State */}
          {filteredCustomers?.length === 0 && !loading && (
            <div className="bg-surface rounded-lg border border-border p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Users" size={32} className="text-text-secondary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? 'No customers found' : 'No customers yet'}
              </h3>
              <p className="text-text-secondary mb-6">
                {searchTerm 
                  ? `No customers match your search for "${searchTerm}". Try adjusting your search terms.`
                  : 'Get started by adding your first customer to the system.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Add Your First Customer
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddCustomer}
      />
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={(updates) => handleUpdateCustomer(editingCustomer?.id, updates)}
        customer={editingCustomer}
      />
    </div>
  );
};

export default CustomerManagement;