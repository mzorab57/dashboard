import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import Button from '../ui/Button';

export default function SubcategoryForm({ subcategory, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: subcategory?.name || '',
    slug: subcategory?.slug || '',
    category_id: subcategory?.category_id || '',
    type: subcategory?.type || 'both',
    image_url: subcategory?.image_url || '',
    is_active: subcategory?.is_active ?? true,
  });

  const [imageFile, setImageFile] = useState(null);

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-dropdown'],
    queryFn: async () => {
      return (await api.get('/categories/get.php', { params: { limit: 100 } })).data;
    }
  });

  const categories = categoriesData?.data || [];

  // Update form data when subcategory changes
  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory?.name || '',
        slug: subcategory?.slug || '',
        category_id: subcategory?.category_id || '',
        type: subcategory?.type || 'both',
        image_url: subcategory?.image || '',
        is_active: subcategory?.is_active ?? true,
      });
    } else {
      // Reset form for new subcategory
      setFormData({
        name: '',
        slug: '',
        category_id: '',
        type: 'both',
        image_url: '',
        is_active: true,
      });
      setImageFile(null);
    }
  }, [subcategory]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('slug', formData.slug);
    submitData.append('category_id', formData.category_id);
    submitData.append('type', formData.type);
    submitData.append('image_url', formData.image_url);
    submitData.append('is_active', formData.is_active ? '1' : '0');
    
    if (imageFile) {
      submitData.append('image', imageFile);
    }
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Subcategory Name */}
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
          placeholder="Subcategory name"
        />
      </div>

      {/* Parent Category */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
          Parent Category *
        </label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          required
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Type *
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
        >
          <option value="both">Both</option>
          <option value="photography">Photography</option>
          <option value="videography">Videography</option>
        </select>
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
          placeholder="subcategory-slug (auto-generated if empty)"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Image
        </label>
        <input
          type="file"
          id="image"
          name="image"
          onChange={handleImageChange}
          accept="image/*"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
        />
        {imageFile && (
          <p className="mt-1 text-sm text-gray-500">
            Selected: {imageFile.name}
          </p>
        )}
      </div>

      {/* Image URL (Alternative) */}
      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
          Image URL <span className="text-xs text-gray-500">(Alternative to file upload)</span>
        </label>
        <input
          type="url"
          id="image_url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
          placeholder="https://example.com/image.jpg"
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
          {isLoading ? 'Saving...' : (subcategory ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
}