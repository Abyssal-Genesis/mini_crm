import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CustomerProfile = ({ customer, onUpdateCustomer }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: customer?.name,
    email: customer?.email,
    phone: customer?.phone,
    company: customer?.company,
    position: customer?.position,
    address: customer?.address
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: customer?.name,
      email: customer?.email,
      phone: customer?.phone,
      company: customer?.company,
      position: customer?.position,
      address: customer?.address
    });
  };

  const handleSave = () => {
    onUpdateCustomer(editForm);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Icon name="User" size={32} color="white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{customer?.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer?.status)}`}>
                {customer?.status}
              </span>
              <span className="text-sm text-gray-500">Customer ID: {customer?.id}</span>
            </div>
          </div>
        </div>
        
        {!isEditing ? (
          <Button variant="outline" onClick={handleEdit} iconName="Edit" iconPosition="left">
            Edit Customer
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} iconName="Save" iconPosition="left">
              Save Changes
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          
          {isEditing ? (
            <>
              <Input
                label="Full Name"
                type="text"
                value={editForm?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={editForm?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={editForm?.phone}
                onChange={(e) => handleInputChange('phone', e?.target?.value)}
              />
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <Icon name="Mail" size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{customer?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="Phone" size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{customer?.phone}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
          
          {isEditing ? (
            <>
              <Input
                label="Company"
                type="text"
                value={editForm?.company}
                onChange={(e) => handleInputChange('company', e?.target?.value)}
              />
              <Input
                label="Position"
                type="text"
                value={editForm?.position}
                onChange={(e) => handleInputChange('position', e?.target?.value)}
              />
              <Input
                label="Address"
                type="text"
                value={editForm?.address}
                onChange={(e) => handleInputChange('address', e?.target?.value)}
              />
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <Icon name="Building2" size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="text-gray-900">{customer?.company}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="Briefcase" size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="text-gray-900">{customer?.position}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="MapPin" size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900">{customer?.address}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-primary">{customer?.totalLeads}</p>
            <p className="text-sm text-gray-500">Total Leads</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-green-600">${customer?.totalValue?.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Value</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-blue-600">{customer?.convertedLeads}</p>
            <p className="text-sm text-gray-500">Converted</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;