import { useState, useEffect } from 'react';
import Button from '../ui/Button';

export default function UserForm({ user, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    role: user?.role || 'employee',
    is_active: user?.is_active ?? true,
  });

  const [errors, setErrors] = useState({});

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user?.full_name || '',
        // email: user?.email || '',
        phone: user?.phone || '',
        password: '', // Always empty for security
        role: user?.role || 'employee',
        is_active: user?.is_active ?? true,
      });
    } else {
      // Reset form for new user
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'employee',
        is_active: true,
      });
    }
    setErrors({});
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (only for new users or when changing password)
    if (!user && !formData.password) {
      newErrors.password = 'Password is required for new users';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Phone validation (optional but if provided should be valid)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      role: formData.role,
      is_active: formData.is_active,
    };

    // Only include password if it's provided
    if (formData.password) {
      submitData.password = formData.password;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className={`w-full rounded-md border shadow-sm focus:ring-cyan-500 sm:text-sm ${
            errors.full_name 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-300 focus:border-cyan-500'
          }`}
          placeholder="Enter full name"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address <span className="text-red-500">*</span>
          {user && <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>}
        </label>
        {/* <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={!!user} // Disable email editing for existing users
          className={`w-full rounded-md border shadow-sm focus:ring-cyan-500 sm:text-sm ${
            errors.email 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-300 focus:border-cyan-500'
          } ${user ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Enter email address"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )} */}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full rounded-md border shadow-sm focus:ring-cyan-500 sm:text-sm ${
            errors.phone 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-300 focus:border-cyan-500'
          }`}
          placeholder="Enter phone number (optional)"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password 
          {!user && <span className="text-red-500">*</span>}
          {user && <span className="text-xs text-gray-500 ml-2">(Leave empty to keep current password)</span>}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full rounded-md border shadow-sm focus:ring-cyan-500 sm:text-sm ${
            errors.password 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-300 focus:border-cyan-500'
          }`}
          placeholder={user ? "Enter new password (optional)" : "Enter password"}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
          Active (user can login)
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {user ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            user ? '✏️ Update User' : '👥 Create User'
          )}
        </Button>
      </div>
    </form>
  );
}