import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function TagForm({ tag, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#3B82F6'
  });

  // Update form data when tag prop changes
  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name || '',
        slug: tag.slug || '',
        color: tag.color || '#3B82F6'
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        color: '#3B82F6'
      });
    }
  }, [tag]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from name if slug is empty
    if (name === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    // Create form data object
    const submitData = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || formData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
      color: formData.color
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6">
        {/* Name Field */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ri focus:border-transparent"
            placeholder="Enter tag name"
            required
          />
        </div>

        {/* Slug Field */}
        <div className="mb-4">
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            Slug
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ri focus:border-transparent"
            placeholder="Auto-generated from name"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to auto-generate from name
          </p>
        </div>

        {/* Color Field */}
        <div className="mb-6">
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ri focus:border-transparent"
              placeholder="#3B82F6"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className=" text-white "
        >
          {isLoading ? 'Saving...' : (tag ? 'Update Tag' : 'Create Tag')}
        </Button>
      </div>
    </form>
  );
}