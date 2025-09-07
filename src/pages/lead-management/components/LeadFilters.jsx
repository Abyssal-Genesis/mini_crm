import React from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';


const LeadFilters = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange, 
  sortBy, 
  onSortChange,
  onClearFilters,
  totalLeads 
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' }
  ];

  const sortOptions = [
    { value: 'created_desc', label: 'Newest First' },
    { value: 'created_asc', label: 'Oldest First' },
    { value: 'value_desc', label: 'Highest Value' },
    { value: 'value_asc', label: 'Lowest Value' },
    { value: 'customer_name', label: 'Customer Name' }
  ];

  return (
    <div className="bg-surface border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <Input
            type="search"
            placeholder="Search by customer name or lead title..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e?.target?.value)}
            className="w-full"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-48">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={onStatusFilterChange}
            placeholder="Filter by status"
          />
        </div>

        {/* Sort Options */}
        <div className="w-full lg:w-48">
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={onSortChange}
            placeholder="Sort by"
          />
        </div>

        {/* Clear Filters Button */}
        <Button
          variant="outline"
          onClick={onClearFilters}
          iconName="X"
          iconPosition="left"
          className="whitespace-nowrap"
        >
          Clear
        </Button>
      </div>
      {/* Results Count */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Showing {totalLeads} lead{totalLeads !== 1 ? 's' : ''}
          {statusFilter !== 'all' && (
            <span className="ml-1">
              with status: <span className="font-medium capitalize">{statusFilter}</span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default LeadFilters;