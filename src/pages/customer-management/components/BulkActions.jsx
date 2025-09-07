import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActions = ({ selectedCustomers, onBulkDelete, onBulkExport, onClearSelection }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      await onBulkDelete(selectedCustomers);
      setShowDeleteConfirm(false);
      onClearSelection();
    } catch (error) {
      console.error('Error deleting customers:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkExport = async () => {
    setIsProcessing(true);
    try {
      await onBulkExport(selectedCustomers);
    } catch (error) {
      console.error('Error exporting customers:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedCustomers?.length === 0) return null;

  return (
    <>
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="CheckSquare" size={16} className="text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {selectedCustomers?.length} customer{selectedCustomers?.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-text-secondary">
                Choose an action to apply to selected customers
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkExport}
              disabled={isProcessing}
              loading={isProcessing}
            >
              <Icon name="Download" size={16} className="mr-2" />
              Export Selected
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isProcessing}
              className="text-error hover:text-error hover:bg-error/10 hover:border-error/20"
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              Delete Selected
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={isProcessing}
            >
              <Icon name="X" size={16} className="mr-2" />
              Clear Selection
            </Button>
          </div>
        </div>
      </div>
      {/* Bulk Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg border border-border p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Delete Multiple Customers</h3>
                <p className="text-sm text-text-secondary">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-text-secondary mb-3">
                Are you sure you want to delete <strong>{selectedCustomers?.length}</strong> selected customer{selectedCustomers?.length !== 1 ? 's' : ''}?
              </p>
              <div className="bg-error/5 border border-error/20 rounded-md p-3">
                <div className="flex items-start space-x-2">
                  <Icon name="AlertCircle" size={16} className="text-error mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-error">
                    <p className="font-medium mb-1">Warning:</p>
                    <p>This will permanently delete all selected customers and their associated leads, notes, and activity history.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                loading={isProcessing}
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : `Delete ${selectedCustomers?.length} Customer${selectedCustomers?.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;