import { useState, useEffect } from 'react';
import Button from '../ui/Button';

export default function ProductImageForm({ image, productId, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    product_id: productId || '',
    display_order: image?.display_order || 0,
    is_primary: image?.is_primary || 0,
    image_file: null,
    image_url: image?.image_url || ''
  });

  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(image?.image_full_url || image?.image_url || '');
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'

  // Update form data when image changes
  useEffect(() => {
    if (image) {
      setFormData({
        product_id: productId || '',
        display_order: image.display_order || 0,
        is_primary: image.is_primary || 0,
        image_file: null,
        image_url: image.image_url || ''
      });
      setPreviewUrl(image.image_full_url || image.image_url || '');
    } else {
      // Reset form for new image
      setFormData({
        product_id: productId || '',
        display_order: 0,
        is_primary: 0,
        image_file: null,
        image_url: ''
      });
      setPreviewUrl('');
    }
    setErrors({});
  }, [image, productId]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      
      // Create preview URL
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
      }));
      
      // Update preview for URL input
      if (name === 'image_url' && value) {
        setPreviewUrl(value);
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleUploadMethodChange = (method) => {
    setUploadMethod(method);
    setFormData(prev => ({
      ...prev,
      image_file: null,
      image_url: ''
    }));
    setPreviewUrl('');
    setErrors({});
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Product ID validation
    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    }

    // Image validation (only for new images)
    if (!image) {
      if (uploadMethod === 'file' && !formData.image_file) {
        newErrors.image_file = 'Image file is required';
      } else if (uploadMethod === 'url' && !formData.image_url) {
        newErrors.image_url = 'Image URL is required';
      } else if (uploadMethod === 'url' && formData.image_url && !isValidUrl(formData.image_url)) {
        newErrors.image_url = 'Please enter a valid URL';
      }
    }

    // Display order validation
    if (formData.display_order < 0) {
      newErrors.display_order = 'Display order cannot be negative';
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
    if (image) {
      // For updates, only send changed fields
      const submitData = {
        display_order: parseInt(formData.display_order),
        is_primary: formData.is_primary
      };
      onSubmit(submitData);
    } else {
      // For new images
      if (uploadMethod === 'file') {
        // Use FormData for file upload
        const submitData = new FormData();
        submitData.append('product_id', formData.product_id);
        submitData.append('display_order', formData.display_order);
        submitData.append('is_primary', formData.is_primary);
        if (formData.image_file) {
          submitData.append('image', formData.image_file);
        }
        onSubmit(submitData);
      } else {
        // Use regular object for URL
        const submitData = {
          product_id: formData.product_id,
          display_order: parseInt(formData.display_order),
          is_primary: formData.is_primary,
          image_url: formData.image_url
        };
        onSubmit(submitData);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Preview */}
      {previewUrl && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Image
          </label>
          <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
              }}
            />
          </div>
        </div>
      )}

      {/* Upload Method Selection (only for new images) */}
      {!image && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Method <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="file"
                  checked={uploadMethod === 'file'}
                  onChange={(e) => handleUploadMethodChange(e.target.value)}
                  className="mr-2 text-cyan-600 focus:ring-cyan-500"
                />
                📁 Upload File
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="url"
                  checked={uploadMethod === 'url'}
                  onChange={(e) => handleUploadMethodChange(e.target.value)}
                  className="mr-2 text-cyan-600 focus:ring-cyan-500"
                />
                🔗 Image URL
              </label>
            </div>
          </div>

          {/* File Upload */}
          {uploadMethod === 'file' && (
            <div>
              <label htmlFor="image_file" className="block text-sm font-medium text-gray-700 mb-1">
                Image File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="image_file"
                name="image_file"
                accept="image/*"
                onChange={handleChange}
                className={`w-full rounded-md border shadow-sm focus:ring-cyan-500 sm:text-sm ${
                  errors.image_file 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-cyan-500'
                }`}
              />
              {errors.image_file && (
                <p className="mt-1 text-sm text-red-600">{errors.image_file}</p>
              )}
            </div>
          )}

          {/* URL Input */}
          {uploadMethod === 'url' && (
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className={`w-full rounded-md border shadow-sm focus:ring-cyan-500 sm:text-sm ${
                  errors.image_url 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-cyan-500'
                }`}
              />
              {errors.image_url && (
                <p className="mt-1 text-sm text-red-600">{errors.image_url}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Display Order */}
      <div>
        <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-1">
          Display Order
        </label>
        <input
          type="number"
          id="display_order"
          name="display_order"
          value={formData.display_order}
          onChange={handleChange}
          min="0"
          className={`w-full rounded-md border shadow-sm focus:ring-cyan-500 sm:text-sm ${
            errors.display_order 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-300 focus:border-cyan-500'
          }`}
          placeholder="Enter display order (0 for first)"
        />
        {errors.display_order && (
          <p className="mt-1 text-sm text-red-600">{errors.display_order}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Lower numbers appear first. Leave as 0 to auto-assign.
        </p>
      </div>

      {/* Is Primary */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="is_primary"
            checked={formData.is_primary === 1}
            onChange={handleChange}
            className="rounded border-gray-300 text-cyan-600 shadow-sm focus:border-cyan-300 focus:ring focus:ring-cyan-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            Set as Primary Image
          </span>
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Primary images are displayed first and used as the main product image.
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {image ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            image ? 'Update Image' : 'Create Image'
          )}
        </Button>
      </div>
    </form>
  );
}