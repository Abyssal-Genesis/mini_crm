import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const CustomerSearch = ({ 
  searchTerm, 
  onSearchChange, 
  onClearSearch, 
  resultCount, 
  totalCount 
}) => {
  return (
    <div className="bg-surface rounded-lg border border-border p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="Search" size={18} className="text-text-secondary" />
            </div>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSearch}
                className="absolute inset-y-0 right-0 px-3 hover:bg-transparent"
              >
                <Icon name="X" size={16} className="text-text-secondary hover:text-foreground" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {searchTerm && (
            <div className="text-sm text-text-secondary">
              Showing <span className="font-medium text-foreground">{resultCount}</span> of{' '}
              <span className="font-medium text-foreground">{totalCount}</span> customers
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Icon name="Filter" size={16} className="mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>
      {searchTerm && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Search results for: <span className="font-medium text-foreground">"{searchTerm}"</span>
            </p>
            {resultCount === 0 && (
              <p className="text-sm text-text-secondary">
                No customers found. Try adjusting your search terms.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;