import { useState, useEffect } from 'react';
import Button from '../ui/Button';

export default function BrandForm({ brand, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: brand?.name || '',
    slug: brand?.slug || '',
    description: brand?.description || '',
    logo_url: brand?.logo_url || '',
    is_active: brand?.is_active ?? true,
  });

  const [logoFile, setLogoFile] = useState(null);

  // Update form data when brand changes
  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand?.name || '',
        slug: brand?.slug || '',
        description: brand?.description || '',
        logo_url: brand?.logo || '',
        is_active: brand?.is_active ?? true,
      });
    } else {
      // Reset form for new brand
      setFormData({
        name: '',
        slug: '',
        description: '',
        logo_url: '',
        is_active: true,
      });
      setLogoFile(null);
    }
  }, [brand]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('slug', formData.slug);
    submitData.append('description', formData.description);
    submitData.append('logo_url', formData.logo_url);
    submitData.append('is_active', formData.is_active ? '1' : '0');
    
    if (logoFile) {
      submitData.append('logo', logoFile);
    }
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Brand Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          placeholder="Brand name"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
          Slug <span className="text-xs text-gray-500">(Optional - Auto-generated)</span>
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          placeholder="brand-slug (auto-generated if empty)"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          placeholder="Brand description (optional)"
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
          Logo
        </label>
        <input
          type="file"
          id="logo"
          name="logo"
          onChange={handleLogoChange}
          accept="image/*"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
        />
        {logoFile && (
          <p className="mt-1 text-sm text-gray-500">
            Selected: {logoFile.name}
          </p>
        )}
      </div>

      {/* Logo URL (Alternative) */}
      <div>
        <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
          Logo URL <span className="text-xs text-gray-500">(Alternative to file upload)</span>
        </label>
        <input
          type="url"
          id="logo_url"
          name="logo_url"
          value={formData.logo_url}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          placeholder="https://example.com/logo.jpg"
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
          Active
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
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
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (brand ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
}