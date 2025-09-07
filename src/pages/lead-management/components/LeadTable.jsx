import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import StatusBadge from './StatusBadge';
import Icon from '../../../components/AppIcon';

const LeadTable = ({ leads, onEdit, onDelete, onStatusUpdate, onBulkAction, userRole }) => {
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' }
  ];

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedLeads(leads?.map(lead => lead?.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId, checked) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads?.filter(id => id !== leadId));
    }
  };

  const handleDelete = (leadId) => {
    onDelete(leadId);
    setShowDeleteConfirm(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US');
  };

  const formatCurrency = (value) => {
    return `$${value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Bulk Actions */}
      {selectedLeads?.length > 0 && userRole === 'admin' && (
        <div className="bg-blue-50 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedLeads?.length} lead{selectedLeads?.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('export', selectedLeads)}
                iconName="Download"
                iconPosition="left"
              >
                Export
              </Button>
              <Select
                options={statusOptions}
                placeholder="Update Status"
                onChange={(status) => onBulkAction('updateStatus', selectedLeads, status)}
                className="w-40"
              />
            </div>
          </div>
        </div>
      )}
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              {userRole === 'admin' && (
                <th className="w-12 px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLeads?.length === leads?.length && leads?.length > 0}
                    onChange={(e) => handleSelectAll(e?.target?.checked)}
                    className="rounded border-border"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Lead Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads?.map((lead) => (
              <tr key={lead?.id} className="hover:bg-muted/50">
                {userRole === 'admin' && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads?.includes(lead?.id)}
                      onChange={(e) => handleSelectLead(lead?.id, e?.target?.checked)}
                      className="rounded border-border"
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <Icon name="User" size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {lead?.customerName}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {lead?.customerEmail}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-foreground">
                    {lead?.title}
                  </div>
                  <div className="text-sm text-text-secondary line-clamp-2">
                    {lead?.description}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Select
                    options={statusOptions}
                    value={lead?.status?.toLowerCase()}
                    onChange={(newStatus) => onStatusUpdate(lead?.id, newStatus)}
                    className="w-32"
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  {formatCurrency(lead?.value)}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {formatDate(lead?.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(lead)}
                      iconName="Edit"
                      iconPosition="left"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(lead?.id)}
                      iconName="Trash2"
                      className="text-error hover:text-error"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden">
        {leads?.map((lead) => (
          <div key={lead?.id} className="border-b border-border p-4 last:border-b-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <Icon name="User" size={16} className="text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {lead?.customerName}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {lead?.customerEmail}
                  </div>
                </div>
              </div>
              <StatusBadge status={lead?.status} size="sm" />
            </div>
            
            <div className="mb-3">
              <div className="text-sm font-medium text-foreground mb-1">
                {lead?.title}
              </div>
              <div className="text-sm text-text-secondary line-clamp-2">
                {lead?.description}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="text-sm">
                <span className="text-text-secondary">Value: </span>
                <span className="font-medium text-foreground">
                  {formatCurrency(lead?.value)}
                </span>
              </div>
              <div className="text-xs text-text-secondary">
                {formatDate(lead?.createdAt)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Select
                options={statusOptions}
                value={lead?.status?.toLowerCase()}
                onChange={(newStatus) => onStatusUpdate(lead?.id, newStatus)}
                className="w-32"
              />
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(lead)}
                  iconName="Edit"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(lead?.id)}
                  iconName="Trash2"
                  className="text-error"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <Icon name="AlertTriangle" size={24} className="text-warning mr-3" />
              <h3 className="text-lg font-semibold text-foreground">
                Confirm Delete
              </h3>
            </div>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete this lead? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadTable;