import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function ProductTagForm({ 
  productTag, 
  onSubmit, 
  onCancel, 
  isLoading, 
  products = [], 
  tags = [] 
}) {
  const [formData, setFormData] = useState({
    product_id: '',
    tag_id: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (productTag) {
      setFormData({
        product_id: productTag.product_id || '',
        tag_id: productTag.tag_id || '',
      });
    } else {
      setFormData({
        product_id: '',
        tag_id: '',
      });
    }
  }, [productTag]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    }

    if (!formData.tag_id) {
      newErrors.tag_id = 'Tag is required';
    }

    // Check if this combination already exists (for create mode)
    if (!productTag && formData.product_id && formData.tag_id) {
      // This would ideally be checked on the server side
      // but we can add client-side validation if needed
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Product Selection */}
        <div>
          <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 mb-2">
            Product *
          </label>
          <select
            id="product_id"
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.product_id ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} {product.price && `- $${product.price}`}
              </option>
            ))}
          </select>
          {errors.product_id && (
            <p className="mt-1 text-sm text-red-600">{errors.product_id}</p>
          )}
        </div>

        {/* Tag Selection */}
        <div>
          <label htmlFor="tag_id" className="block text-sm font-medium text-gray-700 mb-2">
            Tag *
          </label>
          <select
            id="tag_id"
            name="tag_id"
            value={formData.tag_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.tag_id ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          >
            <option value="">Select a tag</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          {errors.tag_id && (
            <p className="mt-1 text-sm text-red-600">{errors.tag_id}</p>
          )}
        </div>

        {/* Selected Product and Tag Preview */}
        {formData.product_id && formData.tag_id && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Product: </span>
                <span className="text-sm font-medium">
                  {products.find(p => p.id == formData.product_id)?.name || 'Unknown Product'}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Tag: </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {tags.find(t => t.id == formData.tag_id)?.name || 'Unknown Tag'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {productTag ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            productTag ? 'Update Product Tag' : 'Create Product Tag'
          )}
        </Button>
      </div>
    </form>
  );
}