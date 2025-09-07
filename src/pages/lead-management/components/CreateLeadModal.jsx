import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const CreateLeadModal = ({ isOpen, onClose, onSubmit, customers }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    title: '',
    description: '',
    value: '',
    status: 'new'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' }
  ];

  const customerOptions = customers?.map(customer => ({
    value: customer?.id,
    label: `${customer?.name} (${customer?.email})`
  }));

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.customerId) {
      newErrors.customerId = 'Please select a customer';
    }
    if (!formData?.title?.trim()) {
      newErrors.title = 'Lead title is required';
    }
    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData?.value || parseFloat(formData?.value) <= 0) {
      newErrors.value = 'Please enter a valid lead value';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedCustomer = customers?.find(c => c?.id === formData?.customerId);
      const leadData = {
        ...formData,
        value: parseFloat(formData?.value),
        customerName: selectedCustomer?.name,
        customerEmail: selectedCustomer?.email,
        createdAt: new Date()?.toISOString()
      };
      
      await onSubmit(leadData);
      
      // Reset form
      setFormData({
        customerId: '',
        title: '',
        description: '',
        value: '',
        status: 'new'
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg shadow-modal max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create New Lead</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <Icon name="X" size={16} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Selection */}
          <Select
            label="Customer"
            description="Select the customer for this lead"
            options={customerOptions}
            value={formData?.customerId}
            onChange={(value) => handleChange('customerId', value)}
            error={errors?.customerId}
            required
            searchable
            placeholder="Choose a customer..."
          />

          {/* Lead Title */}
          <Input
            label="Lead Title"
            type="text"
            placeholder="Enter lead title..."
            value={formData?.title}
            onChange={(e) => handleChange('title', e?.target?.value)}
            error={errors?.title}
            required
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description <span className="text-error">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
              placeholder="Describe the lead opportunity..."
              value={formData?.description}
              onChange={(e) => handleChange('description', e?.target?.value)}
            />
            {errors?.description && (
              <p className="mt-1 text-sm text-error">{errors?.description}</p>
            )}
          </div>

          {/* Lead Value */}
          <Input
            label="Lead Value (USD)"
            type="number"
            placeholder="0.00"
            value={formData?.value}
            onChange={(e) => handleChange('value', e?.target?.value)}
            error={errors?.value}
            required
            min="0"
            step="0.01"
          />

          {/* Status */}
          <Select
            label="Initial Status"
            options={statusOptions}
            value={formData?.status}
            onChange={(value) => handleChange('status', value)}
            placeholder="Select status..."
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              iconName="Plus"
              iconPosition="left"
            >
              Create Lead
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeadModal;