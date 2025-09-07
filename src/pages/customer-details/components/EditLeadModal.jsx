import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const EditLeadModal = ({ isOpen, onClose, onUpdateLead, lead }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: '',
    status: 'New'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = ['New', 'Contacted', 'Converted', 'Lost'];

  useEffect(() => {
    if (lead) {
      setFormData({
        title: lead?.title || '',
        description: lead?.description || '',
        value: lead?.value?.toString() || '',
        status: lead?.status || 'New'
      });
    }
  }, [lead]);

  const handleInputChange = (field, value) => {
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.title?.trim()) {
      newErrors.title = 'Lead title is required';
    }
    
    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData?.value || formData?.value <= 0) {
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
      const updatedLead = {
        ...lead,
        title: formData?.title?.trim(),
        description: formData?.description?.trim(),
        value: parseFloat(formData?.value),
        status: formData?.status,
        updatedDate: new Date()?.toISOString()
      };
      
      await onUpdateLead(updatedLead);
      onClose();
    } catch (error) {
      console.error('Error updating lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Lead</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Lead Title"
            type="text"
            placeholder="Enter lead title"
            value={formData?.title}
            onChange={(e) => handleInputChange('title', e?.target?.value)}
            error={errors?.title}
            required
            disabled={isSubmitting}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              placeholder="Enter lead description"
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
              disabled={isSubmitting}
            />
            {errors?.description && (
              <p className="text-red-600 text-sm mt-1">{errors?.description}</p>
            )}
          </div>

          <Input
            label="Lead Value (USD)"
            type="number"
            placeholder="0.00"
            value={formData?.value}
            onChange={(e) => handleInputChange('value', e?.target?.value)}
            error={errors?.value}
            required
            min="0"
            step="0.01"
            disabled={isSubmitting}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData?.status}
              onChange={(e) => handleInputChange('status', e?.target?.value)}
              disabled={isSubmitting}
            >
              {statusOptions?.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              iconName="Save"
              iconPosition="left"
            >
              Update Lead
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadModal;