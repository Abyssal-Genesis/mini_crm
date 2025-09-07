import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CustomerTable = ({ 
  customers, 
  selectedCustomers, 
  onSelectCustomer, 
  onSelectAll, 
  onEdit, 
  onDelete, 
  sortField, 
  sortDirection, 
  onSort,
  loading 
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(field, direction);
  };

  const handleDeleteClick = (customer) => {
    setDeleteConfirm(customer);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm?.id);
      setDeleteConfirm(null);
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return 'ArrowUpDown';
    return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-surface rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={customers?.length > 0 && selectedCustomers?.length === customers?.length}
                    onChange={onSelectAll}
                    className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary focus:ring-2"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('name')}
                    className="font-medium text-text-primary hover:text-primary"
                  >
                    Name
                    <Icon name={getSortIcon('name')} size={16} className="ml-1" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('email')}
                    className="font-medium text-text-primary hover:text-primary"
                  >
                    Email
                    <Icon name={getSortIcon('email')} size={16} className="ml-1" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('phone')}
                    className="font-medium text-text-primary hover:text-primary"
                  >
                    Phone
                    <Icon name={getSortIcon('phone')} size={16} className="ml-1" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('company')}
                    className="font-medium text-text-primary hover:text-primary"
                  >
                    Company
                    <Icon name={getSortIcon('company')} size={16} className="ml-1" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="font-medium text-text-primary">Leads</span>
                </th>
                <th className="px-4 py-3 text-right">
                  <span className="font-medium text-text-primary">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers?.map((customer) => (
                <tr key={customer?.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomers?.includes(customer?.id)}
                      onChange={() => onSelectCustomer(customer?.id)}
                      className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary focus:ring-2"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="User" size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{customer?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-text-secondary">{customer?.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-text-secondary">{customer?.phone}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-text-secondary">{customer?.company}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                      {customer?.leadCount} leads
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Link to="/customer-details" state={{ customer }}>
                        <Button variant="ghost" size="sm">
                          <Icon name="Eye" size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(customer)}
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(customer)}
                        className="text-error hover:text-error hover:bg-error/10"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {customers?.map((customer) => (
          <div key={customer?.id} className="bg-surface rounded-lg border border-border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedCustomers?.includes(customer?.id)}
                  onChange={() => onSelectCustomer(customer?.id)}
                  className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary focus:ring-2 mt-1"
                />
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{customer?.name}</h3>
                  <p className="text-sm text-text-secondary">{customer?.company}</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                {customer?.leadCount} leads
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <Icon name="Mail" size={14} className="text-text-secondary" />
                <p className="text-sm text-text-secondary">{customer?.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Phone" size={14} className="text-text-secondary" />
                <p className="text-sm text-text-secondary">{customer?.phone}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Link to="/customer-details" state={{ customer }}>
                <Button variant="outline" size="sm">
                  <Icon name="Eye" size={16} className="mr-2" />
                  View Details
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(customer)}
                >
                  <Icon name="Edit" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(customer)}
                  className="text-error hover:text-error hover:bg-error/10"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg border border-border p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Delete Customer</h3>
                <p className="text-sm text-text-secondary">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? 
              This will also remove all associated leads and data.
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
              >
                Delete Customer
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerTable;